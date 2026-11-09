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
 * @example
 * const search = debouncedSignal(
 *   () => state.query,
 *   (v) => (state.query = v),
 *   { ms: 500 }
 * );
 * // Usage in UI:
 * search("new query");
 * console.log(search.isPending); // true
 */
export function debouncedSignal<T>(
  getter: () => T,
  setter: (val: T) => void,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions = {}
): DebouncedSignal<T> {
  let _isPending = false;
  let _pendingValue: T = getter();
  const isLeading = options.behavior === 'leading';

  const runUpdate = debounce(
    (newVal: T) => {
      _isPending = false;
      setter(newVal);
    },
    wait,
    options
  );

  // The external signal drops the scheduled update, so it is no longer pending.
  options.signal?.addEventListener(
    'abort',
    () => {
      _isPending = false;
    },
    { once: true }
  );

  const debouncedSignal = function (nextValue: T) {
    if (options.signal?.aborted) return;
    _pendingValue = nextValue;
    _isPending = true;
    try {
      runUpdate(nextValue);
    } finally {
      // Leading mode either applies the value synchronously or drops it inside the window;
      // either way nothing is left scheduled.
      if (isLeading) _isPending = false;
    }
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
          const value = _pendingValue;
          debouncedSignal.cancel();
          setter(value);
        }
      },
    },
  });

  return debouncedSignal;
}
