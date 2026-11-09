import type { DebounceTemporalObjectType } from '../packages/types';

/** Largest delay `setTimeout` honours; larger values fire almost immediately. */
export const MAX_DELAY_MS = 2 ** 31 - 1;

const UNIT_MS: ReadonlyArray<[keyof DebounceTemporalObjectType, number]> = [
  ['hours', 3600000],
  ['minutes', 60000],
  ['seconds', 1000],
  ['ms', 1],
];

const hasOwn = (obj: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

export function convertTemporalToMs(
  temporal: DebounceTemporalObjectType
): number {
  let total = 0;
  for (const [unit, factor] of UNIT_MS) {
    // Own properties only, so a polluted Object.prototype cannot change delays.
    const value = hasOwn(temporal, unit) ? temporal[unit] : undefined;
    if (value === undefined) continue;
    if (typeof value !== 'number') {
      throw new TypeError(
        `kk-debounce: "${unit}" must be a number, got ${typeof value}`
      );
    }
    total += value * factor;
  }
  return total;
}

/**
 * Resolves a wait argument to milliseconds and rejects values `setTimeout` cannot honour
 * (negative, NaN, Infinity, or above ~24.8 days), which would otherwise fire after ~1 ms.
 */
export function resolveDelay(
  wait: number | DebounceTemporalObjectType
): number {
  if (typeof wait !== 'number' && (typeof wait !== 'object' || wait === null)) {
    throw new TypeError(
      'kk-debounce: wait must be a number or a temporal object'
    );
  }
  const delay = typeof wait === 'number' ? wait : convertTemporalToMs(wait);
  if (!Number.isFinite(delay) || delay < 0 || delay > MAX_DELAY_MS) {
    throw new RangeError(
      `kk-debounce: wait must be between 0 and ${MAX_DELAY_MS} ms, got ${delay}`
    );
  }
  return delay;
}

/** Abort reason that `fetch` and friends surface as a standard `AbortError`. */
export function createAbortError(message: string): Error {
  if (typeof DOMException === 'function') {
    return new DOMException(message, 'AbortError');
  }
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}
