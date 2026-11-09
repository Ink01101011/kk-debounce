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
  const { signal } = options;

  // The external signal drops the scheduled update. Its listener is attached only while an update
  // is pending, so a long-lived signal does not retain idle controllers (e.g. from React re-renders).
  const onExternalAbort = () => setPending(false);
  const setPending = (pending: boolean) => {
    if (pending === _isPending) return;
    _isPending = pending;
    if (pending) signal?.addEventListener('abort', onExternalAbort);
    else signal?.removeEventListener('abort', onExternalAbort);
  };

  const runUpdate = debounce(
    (newVal: T) => {
      setPending(false);
      setter(newVal);
    },
    wait,
    options
  );

  const debouncedSignal = function (nextValue: T) {
    if (signal?.aborted) return;
    _pendingValue = nextValue;
    setPending(true);
    try {
      runUpdate(nextValue);
    } finally {
      // Leading mode either applies the value synchronously or drops it inside the window;
      // either way nothing is left scheduled.
      if (isLeading) setPending(false);
    }
  } as DebouncedSignal<T>;

  Object.defineProperties(debouncedSignal, {
    value: { get: () => (_isPending ? _pendingValue : getter()) },
    isPending: { get: () => _isPending },
    cancel: {
      value: () => {
        runUpdate.cancel();
        setPending(false);
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
