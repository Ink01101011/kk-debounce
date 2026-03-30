import React from 'react';
import { debounce } from '../debounce';
import {
  DebouncedFunction,
  AnyFunction,
  DebounceOptions,
  DebounceTemporalObjectType,
} from '../types';

/**
 * React hook that returns a debounced callback with automatic cleanup on unmount.
 *
 * @template T - Callback type.
 * @param {T} callback - Function to debounce.
 * @param {number | DebounceTemporalObjectType} wait - Delay in milliseconds or temporal object.
 * @param {DebounceOptions} [options] - Debounce behavior options.
 * @returns {DebouncedFunction<T>} Debounced function with `.cancel()`.
 */
function useDebounce<T extends AnyFunction>(
  callback: T,
  wait: number | DebounceTemporalObjectType,
  options?: DebounceOptions
): DebouncedFunction<T> {
  const cbRef = React.useRef(callback);

  React.useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const {
    hours = 0,
    minutes = 0,
    seconds = 0,
    ms = 0,
  } = typeof wait === 'number' ? { ms: wait } : wait;

  const debouncedFn = React.useMemo(
    () => debounce((...args) => cbRef.current(...args), wait, options),
    [
      hours,
      minutes,
      seconds,
      ms,
      options?.autoAbort,
      options?.signal,
      options?.behavior,
    ]
  );

  React.useEffect(() => {
    return () => debouncedFn.cancel();
  }, [debouncedFn]);

  return debouncedFn;
}

export default useDebounce;
