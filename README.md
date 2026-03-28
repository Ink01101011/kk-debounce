# kk-debounce 🚀

[![CI](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml/badge.svg)](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kk-debounce)](https://bundlephobia.com/result?p=kk-debounce)
[![npm version](https://img.shields.io/npm/v/kk-debounce.svg)](https://www.npmjs.com/package/kk-debounce)
[![license](https://img.shields.io/npm/l/kk-debounce.svg)](https://github.com/Ink01101011/kk-debounce/blob/main/LICENSE)
[![install size](https://img.shields.io/badge/install%20size-lightweight-green)](https://www.npmjs.com/package/kk-debounce)

A **lightweight**, **zero-dependency** utility for **debounce** and **throttle** in JavaScript and TypeScript apps, with built-in React hooks for common UI workflows.

## Features

- Debounce callbacks with numeric delays or temporal objects
- Throttle frequent events like scroll, resize, and mouse movement
- Debounced signal controller with `value`, `isPending`, `cancel()`, and `flush()`
- React hooks for debounce, debounced signals, and throttled callbacks
- ESM and CJS package exports
- Zero runtime dependencies

## Requirements

- Node.js 18+
- React 18+ for `kk-debounce/react`

## 📦 Installation

Install with your preferred package manager:

```bash
npm install kk-debounce
```

```bash
pnpm add kk-debounce
```

```bash
yarn add kk-debounce
```

## Supported Environments

- JavaScript and TypeScript projects
- React applications via `kk-debounce/react`
- Browser applications using ESM or CJS builds
- Node.js runtimes

## Subpath Imports

Import only what you need:

```ts
import { debounce } from 'kk-debounce/debounce';
import { debouncedSignal } from 'kk-debounce/debounceSignal';
import { throttle } from 'kk-debounce/throttle';
import {
  useDebounce,
  useDebounceSignal,
  useThrottled,
} from 'kk-debounce/react';
```

## 🚀 Usage

### Debounce

```javascript
import { debounce } from 'kk-debounce';

const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 500);

// This will only fire once, 500ms after the last call.
handleSearch('Hello');
handleSearch('Hello World');
```

### Throttle

```javascript
import { throttle } from 'kk-debounce';

const handleScroll = throttle((position) => {
  console.log('Scroll position:', position);
}, 200);

window.addEventListener('scroll', () => {
  handleScroll(window.scrollY);
});
```

### Debounced Signal

```ts
import { debouncedSignal } from 'kk-debounce';

let searchTerm = '';

const updateSearch = debouncedSignal(
  () => searchTerm,
  (nextValue) => {
    searchTerm = nextValue;
    console.log('Searching for:', nextValue);
  },
  { ms: 400 }
);

updateSearch('rea');
updateSearch('react');

if (updateSearch.isPending) {
  console.log('Waiting for typing to stop...');
}

updateSearch.flush();
```

### React: `useDebounce` and `useThrottled`

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
      onChange={(event) => {
        const nextValue = event.target.value;
        setQuery(nextValue);
        saveDraft(nextValue);
        trackTyping(nextValue);
      }}
      placeholder="Search..."
    />
  );
}
```

### React: `useDebounceSignal`

```tsx
import { useState } from 'react';
import { useDebounceSignal } from 'kk-debounce/react';

export function ProfileEditor() {
  const [name, setName] = useState('John Doe');
  const [draftName, setDraftName] = useState(name);

  const debouncedUpdate = useDebounceSignal(
    () => name,
    (value) => setName(value),
    800,
    { autoAbort: true } // autoAbort defaults to true; shown here for clarity
  );

  return (
    <div>
      <input
        value={draftName}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraftName(nextValue);
          debouncedUpdate(nextValue);
        }}
      />

      {debouncedUpdate.isPending && <p>Saving...</p>}

      <button onClick={() => debouncedUpdate.flush()}>Save now</button>
    </div>
  );
}
```

## API

### `debounce(callback, wait, options?)`

Creates a debounced function that delays execution until calls stop for the configured wait time.

- Supports `number` or temporal objects like `{ ms: 300 }`
- Returns a callable function with `.cancel()`

### `throttle(callback, wait)`

Creates a throttled function that runs immediately, then limits how often subsequent calls can execute.

- Supports `number` or temporal objects
- Returns a callable function with `.cancel()`

### `debouncedSignal(getter, setter, wait, options?)`

Creates a debounced controller for state-like values.

- `value`: current committed or pending value
- `isPending`: whether an update is waiting to run
- `cancel()`: clear the pending update
- `flush()`: apply the pending value immediately

### React Hooks

- `useDebounce(callback, wait, options?)`
- `useDebounceSignal(getter, setter, wait, options?)`
- `useThrottled(callback, wait)`

### Why use kk-debounce?

- **Small footprint:** Zero dependencies.
- **Easy to use:** Simple API for debounce, throttle, and React hooks.
- **Framework-friendly:** Works in plain JavaScript/TypeScript and ships custom hooks for React.
- **Performance:** Ideal for search inputs, window resizing, scroll events, and autosave flows.

## License

MIT © [Ink01101011](https://github.com/Ink01101011)
