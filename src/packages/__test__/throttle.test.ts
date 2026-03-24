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

  it('calls callback immediately and ignores calls during throttle window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');

    vi.advanceTimersByTime(100);
    throttled('third');

    expect(fn).toHaveBeenCalledTimes(2);
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
    throttled.call(obj, 'c');

    expect(calls).toEqual(['ctx:a', 'ctx:c']);
  });
});
