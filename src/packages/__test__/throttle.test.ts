import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from '../throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls callback immediately and flushes latest pending call per window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');

    throttled('third');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith('third');
  });

  it('supports temporal object duration and preserves this context', () => {
    const calls: string[] = [];
    const obj = {
      tag: 'ctx',
      record(this: { tag: string }, value: string) {
        calls.push(`${this.tag}:${value}`);
      },
    };

    const throttled = throttle(obj.record, { ms: 50 });

    throttled.call(obj, 'a');
    throttled.call({ tag: 'other' }, 'b');

    expect(calls).toEqual(['ctx:a']);

    vi.advanceTimersByTime(50);
    expect(calls).toEqual(['ctx:a', 'other:b']);

    throttled.call(obj, 'c');
    vi.advanceTimersByTime(50);

    expect(calls).toEqual(['ctx:a', 'other:b', 'ctx:c']);
  });

  it('cancel clears timer and pending trailing call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    throttled('second');
    throttled.cancel();

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });
});
