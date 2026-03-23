import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../packages/debounce';

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
});
