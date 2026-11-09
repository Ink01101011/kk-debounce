import { resolveDelay } from '../../utils';
import {
  AnyFunction,
  ThrottledFunction,
  ThrottleTemporalObjectType,
} from '../types';

/**
 * Creates a throttled version of the provided callback.
 * The callback runs immediately on first call, then ignores calls
 * until the given wait window has elapsed.
 *
 * @template T - The function type to throttle.
 * @param {T} callback - The function to throttle.
 * @param {number | ThrottleTemporalObjectType} wait - Delay in milliseconds or temporal object.
 * @returns {ThrottledFunction<T>} The throttled function.
 * @throws {RangeError} If `wait` resolves to a negative, non-finite or over-2^31-1 ms delay.
 */
export function throttle<T extends AnyFunction>(
  callback: T,
  wait: number | ThrottleTemporalObjectType
): ThrottledFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingCall: (() => void) | null = null;

  const waitMs = resolveDelay(wait);

  // Each window is scheduled before the callback runs, so a callback that throws cannot leave
  // a stale timer behind and lock the throttle.
  const timeoutHandler = () => {
    if (pendingCall) {
      const call = pendingCall;
      pendingCall = null;
      timer = setTimeout(timeoutHandler, waitMs);
      call();
    } else {
      timer = null;
    }
  };

  const throttledFunction = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    if (timer) {
      pendingCall = () => callback.apply(this, args);
      return;
    }

    timer = setTimeout(timeoutHandler, waitMs);
    callback.apply(this, args);
  };

  throttledFunction.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingCall = null;
  };

  return throttledFunction;
}
