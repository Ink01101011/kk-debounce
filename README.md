# kk-debounce

[![CI](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml/badge.svg)](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/kk-debounce.svg)](https://www.npmjs.com/package/kk-debounce)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kk-debounce)](https://bundlephobia.com/result?p=kk-debounce)
[![license](https://img.shields.io/npm/l/kk-debounce.svg)](https://github.com/Ink01101011/kk-debounce/blob/main/LICENSE)

A **lightweight**, **zero-dependency** debounce and throttle library for JavaScript, TypeScript, and React — with built-in AbortSignal support and reactive signal control.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Subpath Imports](#subpath-imports)
  - [debounce](#debounce)
  - [throttle](#throttle)
  - [debouncedSignal](#debouncedsignal)
  - [React Hooks](#react-hooks)
- [API Reference](#api-reference)
- [Bundle Size](#bundle-size)
- [Why kk-debounce?](#why-kk-debounce)
- [License](#license)

## Features

- **Debounce** — delay execution until calls stop for a configured wait time
- **Throttle** — cap how frequently a callback can run (scroll, resize, mouse events)
- **Debounced Signal** — reactive state controller with `value`, `isPending`, `cancel()`, and `flush()`
- **AbortSignal support** — cancel pending debounced calls without extra boilerplate
- **React hooks** — `useDebounce`, `useDebounceSignal`, `useThrottled` with stable refs
- **Temporal wait objects** — express delays as `{ minutes: 1, seconds: 30 }` instead of raw ms
- **Dual format** — ships as ESM and CJS
- **Zero runtime dependencies**

## Requirements

| Environment        | Version    |
| ------------------ | ---------- |
| Node.js            | 18.18.0+   |
| React _(optional)_ | 18+ or 19+ |

React is only needed when importing from `kk-debounce/react`.

## Installation

```bash
npm install kk-debounce
# or
pnpm add kk-debounce
# or
yarn add kk-debounce
```

## Quick Start

```ts
import { debounce } from 'kk-debounce';

const search = debounce((query: string) => {
  console.log('Searching for:', query);
}, 500);

search('Hello');
search('Hello World'); // Only this call fires, 500ms after the last.
```

## Usage

### Subpath Imports

Import only what you need to keep bundles small:

```ts
import { debounce } from 'kk-debounce/debounce';
import { throttle } from 'kk-debounce/throttle';
import { debouncedSignal } from 'kk-debounce/debounceSignal';
import {
  useDebounce,
  useDebounceSignal,
  useThrottled,
} from 'kk-debounce/react';
```

### debounce

```ts
import { debounce } from 'kk-debounce';

const handleSearch = debounce(
  async (query: string) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      console.log('Results:', data);
    } catch (error) {
      // autoAbort aborts the previous call; AbortError is expected, not a failure.
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Search failed:', error);
    }
  },
  500,
  { autoAbort: true }
);

handleSearch('Hello');
handleSearch('Hello World'); // Previous call is aborted automatically.
```

> **Note on async callbacks:** Always wrap `fetch` (or any async operation) in a `try/catch` and
> check for `AbortError` when using `autoAbort: true` or an external `signal`. Unhandled rejections
> from aborted requests will surface as uncaught errors in the console.

### throttle

```ts
import { throttle } from 'kk-debounce';

const handleScroll = throttle((scrollY: number) => {
  console.log('Scroll position:', scrollY);
}, 200);

window.addEventListener('scroll', () => handleScroll(window.scrollY));
```

### debouncedSignal

A reactive state controller for use outside React (plain JS/TS, Svelte, Solid, etc.).

```ts
import { debouncedSignal } from 'kk-debounce';

let searchTerm = '';

const updateSearch = debouncedSignal(
  () => searchTerm,
  (next) => {
    searchTerm = next;
    console.log('Committed:', next);
  },
  { seconds: 1 }
);

updateSearch('rea');
updateSearch('react');

console.log(updateSearch.isPending); // true
console.log(updateSearch.value); // 'react' (optimistic pending value)

updateSearch.flush(); // Apply immediately without waiting.
```

### React Hooks

#### `useDebounce` and `useThrottled`

```tsx
import { useState } from 'react';
import { useDebounce, useThrottled } from 'kk-debounce/react';

export function SearchBox() {
  const [query, setQuery] = useState('');

  const saveDraft = useDebounce((value: string) => {
    console.log('Saving draft:', value);
  }, 300);

  const trackTyping = useThrottled((value: string) => {
    console.log('Typing:', value);
  }, 500);

  return (
    <input
      value={query}
      onChange={(e) => {
        const next = e.target.value;
        setQuery(next);
        saveDraft(next);
        trackTyping(next);
      }}
      placeholder="Search..."
    />
  );
}
```

#### `useDebounceSignal`

```tsx
import { useState } from 'react';
import { useDebounceSignal } from 'kk-debounce/react';

export function ProfileEditor() {
  const [name, setName] = useState('John Doe');
  const [draft, setDraft] = useState(name);

  const debouncedUpdate = useDebounceSignal(
    () => name,
    (value) => setName(value),
    800,
    { autoAbort: true }
  );

  return (
    <div>
      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          debouncedUpdate(e.target.value);
        }}
      />
      {debouncedUpdate.isPending && <p>Saving...</p>}
      <button onClick={() => debouncedUpdate.flush()}>Save now</button>
    </div>
  );
}
```

## API Reference

### `debounce(callback, wait, options?)`

| Parameter           | Type                       | Default      | Description                                              |
| ------------------- | -------------------------- | ------------ | -------------------------------------------------------- |
| `callback`          | `Function`                 | —            | The function to debounce                                 |
| `wait`              | `number \| TemporalObject` | —            | Delay in ms or `{ minutes?, seconds?, ms? }`             |
| `options.behavior`  | `'trailing' \| 'leading'`  | `'trailing'` | When to invoke: after the wait or on the first call      |
| `options.autoAbort` | `boolean`                  | `false`      | Abort the previous call's signal when a new call arrives |
| `options.signal`    | `AbortSignal`              | —            | External signal to cancel all pending calls              |

Returns the debounced function with `.cancel()`.

> **Browser compatibility — `AbortSignal.any()`:** When an external `signal` is provided, kk-debounce
> uses `AbortSignal.any()` to merge it with the internal abort controller so that either can cancel
> the pending call. `AbortSignal.any()` is available in all modern browsers since mid-2023 (Chrome 116,
> Firefox 118, Safari 17.4). In environments that lack it the external `signal` option is silently
> ignored — only `autoAbort` and `.cancel()` will cancel pending calls in those runtimes.

### `throttle(callback, wait)`

| Parameter  | Type                       | Description                         |
| ---------- | -------------------------- | ----------------------------------- |
| `callback` | `Function`                 | The function to throttle            |
| `wait`     | `number \| TemporalObject` | Minimum interval between executions |

Returns the throttled function with `.cancel()`.

### `debouncedSignal(getter, setter, wait, options?)`

| Member       | Type         | Description                                           |
| ------------ | ------------ | ----------------------------------------------------- |
| `.value`     | `T`          | Optimistic pending value, or the last committed value |
| `.isPending` | `boolean`    | Whether an update is queued                           |
| `.cancel()`  | `() => void` | Discard the pending update                            |
| `.flush()`   | `() => void` | Commit the pending value immediately                  |

### React Hooks

| Hook                                                | Description                                  |
| --------------------------------------------------- | -------------------------------------------- |
| `useDebounce(callback, wait, options?)`             | Stable debounced callback ref across renders |
| `useThrottled(callback, wait)`                      | Stable throttled callback ref across renders |
| `useDebounceSignal(getter, setter, wait, options?)` | Reactive debounced signal for React state    |

### Temporal wait objects

Instead of raw milliseconds, pass a temporal object:

```ts
debounce(fn, { minutes: 1, seconds: 30 }); // 90 000 ms
debounce(fn, { ms: 500 }); //    500 ms
```

## Bundle Size

Measured from the published `dist/` output (minified + gzip):

| Entry point                  | ESM (raw) | ESM (gzip) |
| ---------------------------- | --------: | ---------: |
| `kk-debounce`                |    1.2 kB |     ~620 B |
| `kk-debounce/debounce`       |     641 B |     ~404 B |
| `kk-debounce/throttle`       |     386 B |     ~260 B |
| `kk-debounce/debounceSignal` |     916 B |     ~537 B |
| `kk-debounce/react`          |    2.1 kB |     ~921 B |

Live tracking: [bundlephobia.com/result?p=kk-debounce](https://bundlephobia.com/result?p=kk-debounce)

## Why kk-debounce?

|                         | kk-debounce                    |
| ----------------------- | ------------------------------ |
| Runtime dependencies    | 0                              |
| AbortSignal integration | Native                         |
| React hooks             | Built-in                       |
| Tree-shaking            | Per-entrypoint subpath exports |
| TypeScript              | Full types included            |

- **Zero dependencies** — nothing extra to audit or upgrade
- **AbortSignal-native** — cancel `fetch` / async work without wrapper utilities
- **Flexible timing** — plain numbers or human-readable temporal objects
- **Stable React hooks** — refs survive re-renders without stale-closure bugs
- **Tree-shakeable** — subpath imports let bundlers drop what you don't use

## License

MIT © [Ink01101011](https://github.com/Ink01101011)
