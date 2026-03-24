import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls the wrapped function once with the latest args', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('second');

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('supports temporal object durations', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { seconds: 1, ms: 50 });

    debounced('payload');
    vi.advanceTimersByTime(1049);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancels pending execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('x');
    debounced.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it('aborts previous controller when autoAbort is enabled', () => {
    const fn = vi.fn();
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const debounced = debounce(fn, 100, { autoAbort: true });

    debounced('first');
    debounced('second');

    expect(abortSpy).toHaveBeenCalledTimes(1);
    expect(abortSpy).toHaveBeenCalledWith('Debounced: New call initiated');
  });

  it('does not execute when external signal is aborted before delay', () => {
    const fn = vi.fn();
    const externalController = new AbortController();
    const debounced = debounce(fn, 100, { signal: externalController.signal });

    debounced('payload');
    externalController.abort('external cancel');

    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it('falls back to internal signal when AbortSignal.any is unavailable', () => {
    const fn = vi.fn();
    const originalAny = AbortSignal.any;

    try {
      delete (AbortSignal as { any?: unknown }).any;

      const externalController = new AbortController();
      const debounced = debounce(fn, 50, { signal: externalController.signal });

      debounced('still-runs');
      externalController.abort('external cancel');
      vi.advanceTimersByTime(50);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('still-runs');
    } finally {
      Object.defineProperty(AbortSignal, 'any', {
        configurable: true,
        value: originalAny,
      });
    }
  });
});
