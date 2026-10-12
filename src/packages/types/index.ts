/**
 * Represents any standard function that accepts any arguments and returns any value.
 */
export type AnyFunction<T = any> = (...args: any[]) => T;

/**
 * A Temporal-like object for defining durations.
 * Provides better readability than raw milliseconds.
 * * @example { seconds: 1, ms: 500 } // Evaluates to 1500ms
 */
export type DebounceTemporalObjectType = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  ms?: number;
};

export type ThrottleTemporalObjectType = DebounceTemporalObjectType; // Reuse the same structure for throttle durations

export type DebounceOptionsBehavior = 'leading' | 'trailing';

/**
 * Configuration options for the debounce behavior.
 */
export interface DebounceOptions {
  /**
   * If true, aborts the previous execution's signal immediately when a new call is made,
   * including an execution whose returned promise has not settled yet.
   * Combine with `withSignal: true` so the callback can pass the signal to `fetch` or other
   * signal-aware work; ideal for preventing "race conditions" in async tasks like API fetching.
   * @default false
   */
  autoAbort?: boolean;

  /**
   * If true, the execution's `AbortSignal` is appended as the last argument of the callback.
   * The signal is aborted by `autoAbort`, `.cancel()`, or the external `signal`, and stays live
   * until the callback's returned promise settles.
   * @default false
   */
  withSignal?: boolean;

  /**
   * An external AbortSignal to be linked with the internal debounce lifecycle.
   * Allows manual cancellation from parent controllers (e.g., React's useEffect cleanup).
   */
  signal?: AbortSignal;

  /**
   * "trailing": Execute after the delay (Default).
   * "leading": Execute immediately on the first call, then silence for the delay.
   */
  behavior?: DebounceOptionsBehavior;
}

/**
 * Strips a trailing `AbortSignal` parameter from a function type, so a callback written for
 * `withSignal: true` is exposed to callers without it.
 */
export type WithoutSignal<T extends AnyFunction> = T extends (
  ...args: [...infer A, AbortSignal]
) => infer R
  ? (...args: A) => R
  : T extends (...args: [...infer A, (AbortSignal | undefined)?]) => infer R
    ? (...args: A) => R
    : T;

/**
 * The interface for a function wrapped with debounce logic.
 */
export interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  /**
   * Cancels any scheduled execution and aborts pending signals.
   */
  cancel(): void;
}

/**
 * The interface for a function wrapped with throttle logic.
 */
export interface ThrottledFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  /**
   * Cancellation capability.
   */
  cancel(): void;
}

/**
 * The interface for a debounced reactive state controller.
 */
export interface DebouncedSignal<T> {
  /** Updates the internal pending value and triggers the debounced timer. */
  (nextValue: T): void;
  /** Returns the current pending value if waiting, otherwise returns the source value. */
  readonly value: T;
  /** Whether a debounced execution is currently scheduled. */
  readonly isPending: boolean;
  /** Cancels the scheduled update. */
  cancel(): void;
  /** Immediately triggers the update with the latest pending value. */
  flush(): void;
}
