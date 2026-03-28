import { convertTemporalToMs } from '../../utils';
import type {
  AnyFunction,
  DebouncedFunction,
  DebounceOptions,
  DebounceTemporalObjectType,
} from '../types';

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
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number | DebounceTemporalObjectType,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  const { behavior = 'trailing', autoAbort = false, signal } = options;
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

    controller = new AbortController();

    const internalSignal = controller.signal;
    const combinedSignal =
      signal && 'any' in AbortSignal
        ? AbortSignal.any([signal, internalSignal])
        : internalSignal;

    if (canInvokeNow) {
      func.apply(this, args);
    }

    timeoutId = setTimeout(() => {
      if (combinedSignal.aborted) {
        controller = null;
        timeoutId = null;
        return;
      }

      if (!isLeading) {
        func.apply(this, args);
      }

      timeoutId = null;
      controller = null;
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
