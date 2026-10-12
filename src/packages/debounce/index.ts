import { convertTemporalToMs } from '../../utils';
import type {
  AnyFunction,
  DebouncedFunction,
  DebounceOptions,
  DebounceTemporalObjectType,
  WithoutSignal,
} from '../types';

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === 'function';

/**
 * Creates a debounced version of the provided function that delays execution
 * until after 'wait' duration has elapsed since the last time it was invoked.
 *
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce.
 * @param {number | DebounceTemporalObjectType} wait - The delay duration (ms or Temporal object).
 * @param {DebounceOptions} [options={}] - Optional configuration for AbortSignal and Auto-abort.
 * @returns {DebouncedFunction<T>} A new debounced function with a .cancel() method.
 * * @example
 * const log = debounce((msg: string) => console.log(msg), { seconds: 2 });
 * log("Hello"); // Will print "Hello" after 2 seconds of inactivity.
 *
 * @example
 * // withSignal appends the execution's AbortSignal; autoAbort cancels the in-flight request.
 * const search = debounce(
 *   (q: string, signal: AbortSignal) => fetch(`/api?q=${q}`, { signal }),
 *   300,
 *   { autoAbort: true, withSignal: true }
 * );
 * search("hello"); // callers never pass the signal
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions & { withSignal: true }
): DebouncedFunction<WithoutSignal<T>>;
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number | DebounceTemporalObjectType,
  options?: DebounceOptions
): DebouncedFunction<T>;
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // Controller of the most recent call. It stays set while that call's execution is in flight
  // (its returned promise has not settled), so autoAbort and .cancel() can still abort it.
  let controller: AbortController | null = null;

  const {
    behavior = 'trailing',
    autoAbort = false,
    withSignal = false,
    signal,
  } = options;
  const delay = typeof wait === 'number' ? wait : convertTemporalToMs(wait);

  const debouncedFunction = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    if (autoAbort && controller) {
      controller.abort('Debounced: New call initiated');
    }

    const isLeading = behavior === 'leading';
    const canInvokeNow = isLeading && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const callController = new AbortController();
    controller = callController;

    const internalSignal = callController.signal;
    // AbortSignal.any() merges the external signal with the internal one so that either can
    // cancel the pending call. It is available in all modern browsers since mid-2023 (Chrome 116,
    // Firefox 118, Safari 17.4). In environments that lack it the external `signal` option is
    // silently ignored — only autoAbort and .cancel() will cancel pending calls in those runtimes.
    const combinedSignal =
      signal && 'any' in AbortSignal
        ? AbortSignal.any([signal, internalSignal])
        : internalSignal;

    let inFlight = false;
    const release = () => {
      if (controller === callController) controller = null;
    };

    const invoke = () => {
      const result = func.apply(
        this,
        withSignal ? [...args, combinedSignal] : args
      );

      if (isPromiseLike(result)) {
        inFlight = true;
        // Re-throw so a rejection the caller does not handle is still reported as unhandled.
        result.then(
          () => {
            inFlight = false;
            release();
          },
          (error: unknown) => {
            inFlight = false;
            release();
            throw error;
          }
        );
      }
    };

    if (canInvokeNow) {
      invoke();
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;

      if (combinedSignal.aborted) {
        release();
        return;
      }

      if (!isLeading) {
        invoke();
      }

      if (!inFlight) release();
    }, delay);
  };

  debouncedFunction.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (controller) controller.abort('Debounced: Manually cancelled');
    timeoutId = null;
    controller = null;
  };

  return debouncedFunction;
}
