import React from 'react';
import { debouncedSignal } from '../debounceSignal';
import {
  AnyFunction,
  DebouncedSignal,
  DebounceOptions,
  DebounceTemporalObjectType,
} from '../types';

/**
 * React hook that creates a debounced signal controller and cancels pending
 * work when the component unmounts.
 *
 * @template T - Signal value type.
 * @param {() => T} getter - Getter for the latest source value.
 * @param {AnyFunction<T>} setter - Setter invoked with debounced value.
 * @param {number | DebounceTemporalObjectType} wait - Delay in milliseconds or temporal object.
 * @param {DebounceOptions} [options={ autoAbort: true }] - Debounce behavior options.
 * @returns {DebouncedSignal<T>} Signal controller with `isPending`, `flush`, and `cancel`.
 */
function useDebounceSignal<T>(
  getter: () => T,
  setter: AnyFunction<T>,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions = { autoAbort: true }
): DebouncedSignal<T> {
  const setterRef = React.useRef(setter);
  const getterRef = React.useRef(getter);

  React.useEffect(() => {
    setterRef.current = setter;
    getterRef.current = getter;
  }, [setter, getter]);

  const searchController = React.useMemo(
    () =>
      debouncedSignal(
        () => getterRef.current(),
        (v) => setterRef.current(v),
        wait,
        options
      ),
    [wait, options?.autoAbort, options?.signal, options?.behavior]
  );

  React.useEffect(() => {
    return () => searchController.cancel();
  }, [searchController]);

  return searchController;
}

export default useDebounceSignal;
