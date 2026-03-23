import { convertTemporalToMs } from "../../utils";
import type {
  AnyFunction,
  DebounceOptions,
  DebounceTemporalObjectType,
} from "../types";

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
  options: DebounceOptions = {},
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  const delay = typeof wait === "number" ? wait : convertTemporalToMs(wait);

  const debouncedFunction = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    if (options.autoAbort && controller) {
      controller.abort("Debounced: New call initiated");
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    controller = new AbortController();

    const internalSignal = controller.signal;
    const combinedSignal =
      options.signal && "any" in AbortSignal
        ? AbortSignal.any([options.signal, internalSignal])
        : internalSignal;

    timeoutId = setTimeout(() => {
      if (combinedSignal.aborted) {
        controller = null;
        return;
      }

      func.apply(this, args);

      timeoutId = null;
      controller = null;
    }, delay);
  };

  debouncedFunction.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (controller) controller.abort("Debounced: Manually cancelled");
    timeoutId = null;
    controller = null;
  };

  return debouncedFunction;
}
