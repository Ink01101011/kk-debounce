import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../debounce';
import { debouncedSignal } from '../debounceSignal';
import { throttle } from '../throttle';
import {
  convertTemporalToMs,
  createAbortError,
  resolveDelay,
} from '../../utils';

// Regression tests for the review findings in issue #31.

const pending = () => new Promise<void>(() => {});

type Listener = (...args: unknown[]) => void;
const proc = (
  globalThis as unknown as {
    process: {
      listeners(event: string): Listener[];
      removeAllListeners(event: string): void;
      on(event: string, listener: Listener): void;
    };
  }
).process;

describe('issue #31: debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('aborts with a DOMException named AbortError on autoAbort', async () => {
    const signals: AbortSignal[] = [];
    const debounced = debounce(
      (signal: AbortSignal) => {
        signals.push(signal);
        return pending();
      },
      20,
      { autoAbort: true, withSignal: true }
    );

    debounced();
    await vi.advanceTimersByTimeAsync(20);
    debounced();

    const reason = signals[0].reason as Error;
    expect(reason).toBeInstanceOf(Error);
    expect(reason.name).toBe('AbortError');
  });

  it('aborts with a DOMException named AbortError on cancel()', async () => {
    let seen: AbortSignal | undefined;
    const debounced = debounce(
      (signal: AbortSignal) => {
        seen = signal;
        return pending();
      },
      20,
      { withSignal: true }
    );

    debounced();
    await vi.advanceTimersByTimeAsync(20);
    debounced.cancel();

    expect((seen?.reason as Error).name).toBe('AbortError');
  });

  it('leading + autoAbort: a call inside the window does not abort the running execution', async () => {
    const signals: AbortSignal[] = [];
    const debounced = debounce(
      (signal: AbortSignal) => {
        signals.push(signal);
        return pending();
      },
      50,
      { behavior: 'leading', autoAbort: true, withSignal: true }
    );

    debounced();
    await vi.advanceTimersByTimeAsync(10);
    debounced();

    expect(signals).toHaveLength(1);
    expect(signals[0].aborted).toBe(false);
  });

  it('leading: cancel() still aborts the running execution after calls inside the window', async () => {
    const signals: AbortSignal[] = [];
    const debounced = debounce(
      (signal: AbortSignal) => {
        signals.push(signal);
        return pending();
      },
      50,
      { behavior: 'leading', withSignal: true }
    );

    debounced();
    await vi.advanceTimersByTimeAsync(10);
    debounced();
    debounced.cancel();

    expect(signals[0].aborted).toBe(true);
  });

  it('leading: does not invoke when the external signal is already aborted', () => {
    const fn = vi.fn();
    const external = new AbortController();
    external.abort();
    const debounced = debounce(fn, 20, {
      behavior: 'leading',
      signal: external.signal,
    });

    debounced();
    vi.advanceTimersByTime(20);

    expect(fn).not.toHaveBeenCalled();
  });

  it('honours the external signal without AbortSignal.any', () => {
    const fn = vi.fn();
    const originalAny = AbortSignal.any;

    try {
      delete (AbortSignal as { any?: unknown }).any;

      const external = new AbortController();
      const debounced = debounce(fn, 50, { signal: external.signal });

      debounced('x');
      external.abort();
      vi.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(AbortSignal, 'any', {
        configurable: true,
        value: originalAny,
      });
    }
  });

  it('does not build a combined signal per call, and releases the external listener when idle', () => {
    const external = new AbortController();
    const anySpy = vi.spyOn(AbortSignal, 'any');
    const add = vi.spyOn(external.signal, 'addEventListener');
    const remove = vi.spyOn(external.signal, 'removeEventListener');
    const debounced = debounce(vi.fn(), 20, { signal: external.signal });

    for (let i = 0; i < 1000; i++) debounced(i);
    vi.advanceTimersByTime(20);

    expect(anySpy).not.toHaveBeenCalled();
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('external abort aborts the in-flight execution with the external reason', async () => {
    let seen: AbortSignal | undefined;
    const external = new AbortController();
    const debounced = debounce(
      (signal: AbortSignal) => {
        seen = signal;
        return pending();
      },
      20,
      { signal: external.signal, withSignal: true }
    );

    debounced();
    await vi.advanceTimersByTimeAsync(20);
    const reason = new Error('stop');
    external.abort(reason);

    expect(seen?.aborted).toBe(true);
    expect(seen?.reason).toBe(reason);
  });

  it('leading: a synchronous throw still opens the debounce window', () => {
    const fn = vi.fn(() => {
      throw new Error('boom');
    });
    const debounced = debounce(fn, 50, { behavior: 'leading' });

    for (let i = 0; i < 5; i++) {
      try {
        debounced();
      } catch {
        // expected from the first call
      }
    }

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it.each([-1, NaN, Infinity, 2 ** 31, { hours: 600 }])(
    'rejects an unusable wait: %s',
    (wait) => {
      expect(() => debounce(vi.fn(), wait)).toThrow(RangeError);
    }
  );

  it('rejects a non-numeric temporal unit', () => {
    expect(() =>
      debounce(vi.fn(), { ms: '100' } as unknown as { ms: number })
    ).toThrow(TypeError);
  });

  it('accepts a zero wait', () => {
    const fn = vi.fn();
    debounce(fn, 0)();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('issue #31: rejections caused by our own abort', () => {
  it('are not reported as unhandled', async () => {
    const unhandled = vi.fn();
    const listeners = proc.listeners('unhandledRejection');
    proc.removeAllListeners('unhandledRejection');
    proc.on('unhandledRejection', unhandled);

    try {
      const debounced = debounce(
        (signal: AbortSignal) =>
          new Promise<void>((_, reject) =>
            signal.addEventListener('abort', () => reject(signal.reason))
          ),
        1,
        { autoAbort: true, withSignal: true }
      );

      debounced();
      await new Promise((r) => setTimeout(r, 10));
      debounced();
      debounced.cancel();
      await new Promise((r) => setTimeout(r, 10));

      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      proc.removeAllListeners('unhandledRejection');
      listeners.forEach((l) => proc.on('unhandledRejection', l));
    }
  });
});

describe('issue #31: throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps working after a trailing call throws', () => {
    let calls = 0;
    const throttled = throttle(() => {
      calls++;
      if (calls === 2) throw new Error('boom');
    }, 20);

    throttled();
    throttled(); // queued trailing call, throws when flushed
    expect(() => vi.advanceTimersByTime(20)).toThrow('boom');

    vi.advanceTimersByTime(20); // window after the failed call closes
    throttled();

    expect(calls).toBe(3);
  });

  it('a throwing first call still opens the window', () => {
    const fn = vi.fn(() => {
      throw new Error('boom');
    });
    const throttled = throttle(fn, 20);

    expect(() => throttled()).toThrow('boom');
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('rejects an unusable wait', () => {
    expect(() => throttle(vi.fn(), -5)).toThrow(RangeError);
  });
});

describe('issue #31: debouncedSignal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('leading: isPending clears when a call inside the window is dropped', () => {
    let source = 0;
    const s = debouncedSignal(
      () => source,
      (v) => (source = v),
      20,
      { behavior: 'leading' }
    );

    s(1);
    s(2);
    vi.advanceTimersByTime(50);

    expect(source).toBe(1);
    expect(s.isPending).toBe(false);
    expect(s.value).toBe(1);
  });

  it('clears isPending when the external signal aborts', () => {
    let source = 0;
    const external = new AbortController();
    const s = debouncedSignal(
      () => source,
      (v) => (source = v),
      20,
      { signal: external.signal }
    );

    s(5);
    external.abort();

    expect(s.isPending).toBe(false);
    expect(s.value).toBe(0);
  });

  it('ignores updates once the external signal is aborted', () => {
    const external = new AbortController();
    external.abort();
    const s = debouncedSignal(
      () => 0,
      () => {},
      20,
      { signal: external.signal }
    );

    s(5);

    expect(s.isPending).toBe(false);
  });

  it('clears isPending when the setter throws', () => {
    const s = debouncedSignal(
      () => 0,
      () => {
        throw new Error('boom');
      },
      20
    );

    s(5);
    expect(() => vi.advanceTimersByTime(20)).toThrow('boom');

    expect(s.isPending).toBe(false);
  });

  it('flush clears isPending even when the setter throws', () => {
    const s = debouncedSignal(
      () => 0,
      () => {
        throw new Error('boom');
      },
      20
    );

    s(5);
    expect(() => s.flush()).toThrow('boom');

    expect(s.isPending).toBe(false);
  });
});

describe('issue #31: convertTemporalToMs', () => {
  it('ignores inherited properties', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.hours = 1;
    try {
      expect(convertTemporalToMs({ ms: 5 })).toBe(5);
    } finally {
      delete proto.hours;
    }
  });
});

describe('issue #31: utils', () => {
  it('rejects a wait that is neither a number nor an object', () => {
    expect(() => resolveDelay(null as unknown as number)).toThrow(TypeError);
  });

  it('builds an AbortError without DOMException', () => {
    const original = globalThis.DOMException;
    try {
      delete (globalThis as { DOMException?: unknown }).DOMException;
      const error = createAbortError('stop');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AbortError');
      expect(error.message).toBe('stop');
    } finally {
      globalThis.DOMException = original;
    }
  });
});
