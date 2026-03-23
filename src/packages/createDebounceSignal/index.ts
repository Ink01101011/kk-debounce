import { debounce } from '../debounce';
import type {
  DebouncedSignal,
  DebounceOptions,
  DebounceTemporalObjectType,
} from '../types';

/**
 * Creates a reactive controller that debounces state updates.
 * Designed for modern UI frameworks (React, Svelte, Solid) to reduce computational overhead.
 *
 * @template T - The type of the state value.
 * @param {() => T} getter - Function to retrieve the current source state.
 * @param {(val: T) => void} setter - Function to update the source state.
 * @param {number | DebounceTemporalObjectType} wait - The delay duration.
 * @param {DebounceOptions} [options] - Optional configurations.
 * @returns {DebouncedSignal<T>} A control object with .isPending and .value properties.
 * * @example
 * const search = createDebouncedSignal(
 * () => state.query,
 * (v) => (state.query = v),
 * { ms: 500 }
 * );
 * * // Usage in UI:
 * search("new query");
 * console.log(search.isPending); // true
 */
export function createDebouncedSignal<T>(
  getter: () => T,
  setter: (val: T) => void,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions = {}
): DebouncedSignal<T> {
  let _isPending = false;
  let _pendingValue: T = getter();

  const runUpdate = debounce(
    (newVal: T) => {
      setter(newVal);
      _isPending = false;
    },
    wait,
    options
  );

  const debouncedSignal = function (nextValue: T) {
    _pendingValue = nextValue;
    _isPending = true;
    runUpdate(nextValue);
  } as DebouncedSignal<T>;

  Object.defineProperties(debouncedSignal, {
    value: { get: () => (_isPending ? _pendingValue : getter()) },
    isPending: { get: () => _isPending },
    cancel: {
      value: () => {
        runUpdate.cancel();
        _isPending = false;
      },
    },
    flush: {
      value: () => {
        if (_isPending) {
          setter(_pendingValue);
          debouncedSignal.cancel();
        }
      },
    },
  });

  return debouncedSignal;
}
