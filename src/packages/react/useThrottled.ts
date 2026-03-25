import React from 'react';
import { throttle } from '../throttle';
import {
  AnyFunction,
  ThrottledFunction,
  ThrottleTemporalObjectType,
} from '../types';

/**
 * React hook that returns a throttled callback.
 * The latest callback implementation is always used while preserving
 * throttle timing behavior.
 *
 * @template T - Callback type.
 * @param {T} callback - Function to throttle.
 * @param {number | ThrottleTemporalObjectType} wait - Delay in milliseconds or temporal object.
 * @returns {ThrottledFunction<T>} Throttled callback.
 */
export default function useThrottled<T extends AnyFunction>(
  callback: T,
  wait: number | ThrottleTemporalObjectType
): ThrottledFunction<T> {
  const cbRef = React.useRef(callback);

  React.useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const throttledFunction = React.useMemo(
    () => throttle((...args: Parameters<T>) => cbRef.current(...args), wait),
    [wait]
  );

  React.useEffect(() => {
    return () => {
      throttledFunction.cancel();
    };
  }, [throttledFunction]);

  return throttledFunction;
}
