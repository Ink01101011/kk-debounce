# kk-debounce

Type-safe debounce and throttle utilities for modern JavaScript and TypeScript apps.

[![npm version](https://img.shields.io/npm/v/kk-debounce.svg)](https://www.npmjs.com/package/kk-debounce)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kk-debounce)](https://bundlephobia.com/result?p=kk-debounce)

## Features

- Debounce with numeric delay or temporal objects (`{ hours, minutes, seconds, ms }`).
- Debounced signal controller for reactive state flows.
- Throttle utility with trailing behavior and cancellation support.
- React hooks for debounce, debounced signal, and throttle.
- ESM + CJS builds with subpath exports for better tree-shaking.
- Strict type-only subpath export for `kk-debounce/types`.

## Compare Table

| Feature                                  | kk-debounce | lodash.debounce | underscore  | just-debounce-it |
| :--------------------------------------- | :---------: | :-------------: | :---------: | :--------------: |
| Numeric delay (ms)                       |     ✅      |       ✅        |     ✅      |        ✅        |
| Temporal delay object (`{ minutes: 1 }`) |     ✅      |       ❌        |     ❌      |        ❌        |
| Debounced signal controller              |     ✅      |       ❌        |     ❌      |        ❌        |
| Throttle with cancellation               |     ✅      |  ❌ (separate)  | ✅ (simple) |        ❌        |
| React hooks included                     |     ✅      |       ❌        |     ❌      |        ❌        |
| Type-only subpath export (`/types`)      |     ✅      |       ❌        |     ❌      |        ❌        |
| ESM + CJS outputs                        |     ✅      |       ✅        |     ✅      |        ✅        |

## Installation

```bash
pnpm add kk-debounce
npm install kk-debounce
yarn add kk-debounce
```

## Requirements

- Node.js >= 18

## Quick Start

```ts
import { debounce, debouncedSignal, throttle } from 'kk-debounce';

const saveDraft = debounce((value: string) => console.log('saved:', value), {
  ms: 300,
});

let state = '';
const signal = debouncedSignal(
  () => state,
  (next) => {
    state = next;
  },
  { seconds: 1 }
);

const throttledLog = throttle((value: string) => {
  console.log('throttled:', value);
}, 500);

saveDraft('hello');
signal('world');
throttledLog('A');
```

## Subpath Imports (Recommended)

Use subpaths to import only what you need:

```ts
import { debounce } from 'kk-debounce/debounce';
import { debouncedSignal } from 'kk-debounce/debounceSignal';
import { throttle } from 'kk-debounce/throttle';
import {
  useDebounce,
  useDebounceSignal,
  useThrottled,
} from 'kk-debounce/react';
import type { DebounceOptions, ThrottledFunction } from 'kk-debounce/types';
```

## Type-Only Subpath

`kk-debounce/types` is exported as a strict type-only subpath.

- Valid:

```ts
import type { DebounceOptions } from 'kk-debounce/types';
```

- Invalid runtime import (will fail by design):

```ts
import 'kk-debounce/types';
```

## API

### `debounce(func, wait, options?)`

Creates a debounced function.

- `func`: callback to debounce.
- `wait`: `number | DebounceTemporalObjectType`.
- `options.autoAbort?`: abort previous internal cycle when a new call starts.
- `options.signal?`: external `AbortSignal` linked to internal cancellation.
- Returns: callable with `.cancel()`.

### `debouncedSignal(getter, setter, wait, options?)`

Creates a debounced state controller.

- Returns callable with:
- `value` (latest pending or committed value)
- `isPending`
- `cancel()`
- `flush()`

### `throttle(callback, wait)`

Creates a throttled callback.

- Immediate first call.
- While active, keeps latest pending arguments.
- Replays latest pending call when the current window ends.
- Returns callable with `.cancel()`.

### React hooks (`kk-debounce/react`)

- `useDebounce(callback, wait, options?)`
- `useDebounceSignal(getter, setter, wait, options?)`
- `useThrottled(callback, wait)`

## Migration Notes

### From lodash.debounce

```ts
// before
import debounce from 'lodash.debounce';

// after
import { debounce } from 'kk-debounce/debounce';
```

### Replace magic milliseconds with readable durations

```ts
const save = debounce(handler, { minutes: 1, seconds: 30 });
```

## Examples

- `src/example/debounce.example.ts`
- `src/example/createDebounceSignal.example.ts`
- `src/example/react/index.tsx`

## Development

See `DEVELOP.md`.

## License

MIT
