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

  const debouncedFn = React.useMemo(
    () => debounce((...args) => cbRef.current(...args), wait, options),
    [wait, options?.autoAbort, options?.signal, options?.behavior]
  );

  React.useEffect(() => {
    return () => debouncedFn.cancel();
  }, [debouncedFn]);

  return debouncedFn;
}

export default useDebounce;
