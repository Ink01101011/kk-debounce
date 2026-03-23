import type { DebounceTemporalObjectType } from '../packages/types';

export function convertTemporalToMs(
  temporal: DebounceTemporalObjectType
): number {
  return (
    (temporal.hours ?? 0) * 3600000 +
    (temporal.minutes ?? 0) * 60000 +
    (temporal.seconds ?? 0) * 1000 +
    (temporal.ms ?? 0)
  );
}
