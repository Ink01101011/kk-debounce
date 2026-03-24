import { convertTemporalToMs } from '../../utils';
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
 */
export function throttle<T extends AnyFunction>(
  callback: T,
  wait: number | ThrottleTemporalObjectType
): ThrottledFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingCall: (() => void) | null = null;

  const waitMs = typeof wait === 'number' ? wait : convertTemporalToMs(wait);

  const throttledFunction = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    if (timer) {
      pendingCall = () => callback.apply(this, args);
      return;
    }

    callback.apply(this, args);

    const timeoutHandler = () => {
      if (pendingCall) {
        const call = pendingCall;
        pendingCall = null;
        call();
        timer = setTimeout(timeoutHandler, waitMs);
      } else {
        timer = null;
      }
    };

    timer = setTimeout(timeoutHandler, waitMs);
  };

  throttledFunction.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingCall = null;
  };

  return throttledFunction;
}
