# ⏳ kk-debounce

**The Next-Generation Debounce Library for 2026.** Built for the modern web with native **Temporal API** support, **AbortSignal** integration, and **Fine-grained Reactivity**.

[![npm version](https://img.shields.io/npm/v/kk-debounce.svg)](https://www.npmjs.com/package/kk-debounce)
[![bundle size](https://img.shields.io/bundlephobia/minzip/kk-debounce)](https://bundlephobia.com/result?p=kk-debounce)
[![CI](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml/badge.svg)](https://github.com/Ink01101011/kk-debounce/actions/workflows/ci.yml)

---

## 🚀 Why kk-debounce?

Traditional debounce libraries belong to the past. **kk-debounce** is designed to solve today's async and reactivity challenges with a minimal, tree-shakable API.

### 1. Temporal API Support (Type-Safe Durations)

Stop guessing milliseconds. Use human-readable durations.

```typescript
import { debounce } from 'kk-debounce';

// Old way: debounce(fn, 5400000) -> What is this?
// Modern way:
const save = debounce(saveData, { hours: 1, minutes: 30 });
```

### 2. Built-in AbortSignal (No more Zombies)

Prevent stale scheduled work by cancelling previous debounce cycles when a new call arrives.

```typescript
const search = debounce(
  async (query) => {
    const response = await fetch(`/api?q=${encodeURIComponent(query)}`);
    return response.json();
  },
  500,
  { autoAbort: true }
);
```

### 3. Signal-Ready (Reactivity Guard)

Perfect for React 19, Svelte 5, and SolidJS. Prevent "Reactivity Snowballs" with `isPending` state.

```typescript
const debounced = createDebouncedSignal(
  () => state.value,
  (v) => (state.value = v),
  { ms: 300 }
);

console.log(debounced.isPending); // Track loading states easily
```

---

## 📦 Installation

```bash
pnpm add kk-debounce
# or
npm install kk-debounce
# or
yarn add kk-debounce
```

## ⚡ Quick Start

```typescript
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

## 📖 API Reference

### `debounce(func, wait, options)`

Standard debounce with superpowers.

- `wait`: `number | DebounceTemporalObjectType`
- `options.autoAbort`: `boolean` (Aborts previous controller on new calls)
- `options.signal`: `AbortSignal` (External signal to link)

### `createDebouncedSignal(getter, setter, wait, options)`

Reactive state debounce.

- Returns an object with `.value`, `.isPending`, `.cancel()`, and `.flush()`.

---

## 🧪 Example Use Cases

### Search Box (debounce + autoAbort)

```typescript
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

### Reactive Form Input (createDebouncedSignal)

```typescript
import { createDebouncedSignal } from 'kk-debounce';

let internalSearchState = '';

const fakeApi = {
  search(query: string) {
    console.log('Searching:', query);
  },
};

const searchAction = createDebouncedSignal(
  () => internalSearchState,
  (val) => {
    internalSearchState = val;
    fakeApi.search(val);
  },
  { seconds: 1 }
);

searchAction('กะเพรา');

if (searchAction.isPending) {
  console.log('Waiting for user to stop typing...');
}

searchAction.flush();
```

### More Example Files

- See `src/example/debounce.example.ts`
- See `src/example/createDebounceSignal.example.ts`

---

## ℹ️ Consumer Notes

- `autoAbort` cancels previous debounce cycles before execution.
- `options.signal` allows linking an external AbortSignal to cancel pending execution.
- The package is tree-shakable (`sideEffects: false`) and ships both ESM and CJS builds.
- Looking for dev workflow, test, release, and security process? See `DEVELOP.md`.

---

## 🛠️ Comparison

| Feature                  | Lodash | kk-debounce |
| :----------------------- | :----: | :---------: |
| Temporal Duration        |   ❌   |     ✅      |
| Native AbortSignal       |   ❌   |     ✅      |
| Auto-Abort Async         |   ❌   |     ✅      |
| Reactivity Pending State |   ❌   |     ✅      |
| Tree-shakable / < 1kb    |   ⚠️   |     ✅      |

---

## 📜 License

MIT © YourName
