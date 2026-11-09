import { createAbortError, resolveDelay } from '../../utils';
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
 * @throws {RangeError} If `wait` resolves to a negative, non-finite or over-2^31-1 ms delay.
 * @example
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
  const {
    behavior = 'trailing',
    autoAbort = false,
    withSignal = false,
    signal,
  } = options;
  const delay = resolveDelay(wait);
  const isLeading = behavior === 'leading';

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // Controllers of executions whose returned promise has not settled yet. Only created with
  // `withSignal`, since nothing else can observe the signal.
  const inFlight = new Set<AbortController>();
  // The external signal gets one listener, attached only while a call is pending or in flight,
  // so a long-lived signal does not accumulate listeners or retain idle debounced functions.
  let listening = false;

  const clearTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  // `reason` is a factory so the AbortError (and its stack trace) is only built when needed.
  const abortInFlight = (reason: () => unknown) => {
    if (inFlight.size === 0) return;
    const controllers = [...inFlight];
    inFlight.clear();
    const abortReason = reason();
    controllers.forEach((controller) => controller.abort(abortReason));
  };

  const onExternalAbort = () => {
    clearTimer();
    abortInFlight(() => signal?.reason);
    syncListener();
  };

  const syncListener = () => {
    if (!signal) return;
    const busy = timeoutId !== null || inFlight.size > 0;
    if (busy && !listening) {
      signal.addEventListener('abort', onExternalAbort);
      listening = true;
    } else if (!busy && listening) {
      signal.removeEventListener('abort', onExternalAbort);
      listening = false;
    }
  };

  const execute = (thisArg: ThisParameterType<T>, args: Parameters<T>) => {
    const controller = withSignal ? new AbortController() : null;
    if (controller) inFlight.add(controller);

    const release = () => {
      if (controller && inFlight.delete(controller)) syncListener();
    };

    let result: unknown;
    try {
      result = func.apply(
        thisArg,
        controller ? [...args, controller.signal] : args
      );
    } catch (error) {
      release();
      throw error;
    }

    if (controller && isPromiseLike(result)) {
      result.then(release, (error: unknown) => {
        release();
        // A rejection caused by our own abort is expected, not a failure.
        if (controller.signal.aborted && error === controller.signal.reason) {
          return;
        }
        // Re-throw so a rejection the caller does not handle is still reported as unhandled.
        throw error;
      });
    } else {
      release();
    }
  };

  const debouncedFunction = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    if (signal?.aborted) return;

    const invokeNow = isLeading && timeoutId === null;

    // Only a call that will start an execution replaces the running one; in leading mode a call
    // inside the window runs nothing, so it must not abort the execution that is still running.
    if (autoAbort && (!isLeading || invokeNow)) {
      abortInFlight(() => createAbortError('Debounced: New call initiated'));
    }

    clearTimer();
    // The window is scheduled before invoking, so a callback that throws still opens it.
    timeoutId = setTimeout(() => {
      timeoutId = null;
      try {
        if (!isLeading) execute(this, args);
      } finally {
        syncListener();
      }
    }, delay);
    syncListener();

    if (invokeNow) execute(this, args);
  };

  debouncedFunction.cancel = () => {
    clearTimer();
    abortInFlight(() => createAbortError('Debounced: Manually cancelled'));
    syncListener();
  };

  return debouncedFunction;
}
