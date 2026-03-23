# kk-debounce

Type-safe debounce utilities for modern JavaScript and TypeScript applications.

[![npm version](https://img.shields.io/npm/v/kk-debounce.svg)](https://www.npmjs.com/package/kk-debounce)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kk-debounce)](https://bundlephobia.com/result?p=kk-debounce)
[![CI](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml/badge.svg)](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml)

## Highlights

- Temporal-style duration objects (`{ hours, minutes, seconds, ms }`).
- Built-in cancellation support via `AbortSignal`.
- `createDebouncedSignal` helper for reactive state workflows.
- ESM + CJS outputs with tree-shakeable packaging.

## Comparison with Popular Alternatives

| Feature                                     | kk-debounce |      lodash.debounce      |        underscore         |       just-debounce-it        |
| :------------------------------------------ | :---------: | :-----------------------: | :-----------------------: | :---------------------------: |
| Numeric delay (ms)                          |     ✅      |            ✅             |            ✅             |              ✅               |
| Readable duration object (`{ minutes: 1 }`) |     ✅      |            ❌             |            ❌             |              ❌               |
| `AbortSignal` integration                   |     ✅      |            ❌             |            ❌             |              ❌               |
| Reactive helper (`createDebouncedSignal`)   |     ✅      |            ❌             |            ❌             |              ❌               |
| Type declarations bundled                   |     ✅      | ❌ (via `@types` package) | ❌ (via `@types` package) | ❌ (depends on version/setup) |
| ESM + CJS output                            |     ✅      |            ✅             |            ✅             |              ✅               |

This table is intended for migration planning and feature fit, not benchmark results.

## Installation

```bash
pnpm add kk-debounce
```

Alternative package managers:

```bash
npm install kk-debounce
yarn add kk-debounce
```

## Requirements

- Node.js >= 18

## Quick Start

```ts
import { debounce, createDebouncedSignal } from 'kk-debounce';

const saveDraft = debounce(
  (payload: string) => console.log('Saved:', payload),
  { seconds: 1 }
);

let text = '';
const textSignal = createDebouncedSignal(
  () => text,
  (next) => {
    text = next;
  },
  { ms: 300 }
);

saveDraft('hello');
textSignal('world');
```

## API

### debounce(func, wait, options?)

Creates a debounced function that delays execution until `wait` has elapsed since the last call.

Parameters:

- `func`: callback to debounce.
- `wait`: `number | DebounceTemporalObjectType`.
- `options.autoAbort?`: when `true`, aborts previous internal controller on new calls.
- `options.signal?`: external `AbortSignal` to link cancellation.

Returns:

- Debounced callable with `cancel(): void`.

### createDebouncedSignal(getter, setter, wait, options?)

Creates a debounced state controller for reactive flows.

Returns an object/function with:

- `value`: latest pending or committed value.
- `isPending`: whether an update is waiting.
- `cancel()`: cancel pending update.
- `flush()`: immediately apply pending value.

## Migration from lodash.debounce

Use these patterns to migrate incrementally with minimal refactor risk.

### 1) Basic debounce

```ts
// lodash.debounce
import debounce from 'lodash.debounce';

const onResize = debounce(() => {
  console.log('resize');
}, 250);
```

```ts
// kk-debounce
import { debounce } from 'kk-debounce';

const onResize = debounce(() => {
  console.log('resize');
}, 250);
```

### 2) Replace magic milliseconds with readable duration objects

```ts
// lodash.debounce
const saveDraft = debounce(save, 90000);
```

```ts
// kk-debounce
const saveDraft = debounce(save, { minutes: 1, seconds: 30 });
```

### 3) Cancel behavior parity

Both libraries expose `.cancel()` on the returned debounced function.

```ts
const job = debounce(runTask, 300);
job();
job.cancel();
```

### 4) Optional upgrades during migration

- Enable `autoAbort` to cancel previous pending cycles on rapid calls.
- Link external cancellation with `options.signal`.
- Move state-heavy input flows to `createDebouncedSignal` for pending-state visibility.

### 5) Common import update checklist

- Replace `import debounce from 'lodash.debounce'` with `import { debounce } from 'kk-debounce'`.
- Remove `lodash.debounce` from dependencies after migration is complete.
- Run tests to confirm call timing assumptions in critical paths.

### Migration Cost by Library

| From library             | Migration cost | Why                                                                                                                                                             |
| :----------------------- | :------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lodash.debounce`        |      Low       | API shape is very similar for basic usage. Most changes are import replacement plus optional duration-object adoption.                                          |
| `underscore`             |     Medium     | Similar debounce behavior, but projects often have mixed underscore utility usage and older module patterns that need cleanup during migration.                 |
| `just-debounce-it`       |     Medium     | Core debounce usage is simple to migrate, but teams usually need to add missing capabilities (`AbortSignal`, reactive helper, richer typing) in adoption phase. |
| Custom in-house debounce |      High      | Behavior differences (leading/trailing semantics, cancellation contracts, edge cases) require explicit test verification before rollout.                        |

Cost criteria: estimated by API delta, refactor scope, and risk of behavioral regression in existing call paths.

## Usage Examples

### Search Input

```ts
import { debounce } from 'kk-debounce';

const search = debounce(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    console.log('Latest result:', result);
  },
  { ms: 500 },
  { autoAbort: true }
);

search('rea');
search('react');
search('react 19');
```

### Reactive State

```ts
import { createDebouncedSignal } from 'kk-debounce';

let state = '';

const signal = createDebouncedSignal(
  () => state,
  (value) => {
    state = value;
  },
  { seconds: 1 }
);

signal('next value');

if (signal.isPending) {
  console.log('Waiting...');
}

signal.flush();
```

Additional examples:

- `src/example/debounce.example.ts`
- `src/example/createDebounceSignal.example.ts`

## Compatibility

- JavaScript: supported (ESM and CommonJS).
- TypeScript: supported with bundled declarations.

## Development

For maintainers and release process, see `DEVELOP.md`.

## License

MIT
