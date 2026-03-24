import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock('react');
  vi.unmock('../debounce');
  vi.unmock('../debounceSignal');
});

describe('package exports', () => {
  it('exports runtime APIs from package index', async () => {
    const pkg = await import('../index');

    expect(typeof pkg.debounce).toBe('function');
    expect(typeof pkg.debouncedSignal).toBe('function');
  });

  it('re-exports useDebounce from react index', async () => {
    const reactPkg = await import('../react');
    const useDebounceModule = await import('../react/useDebounce');

    expect(reactPkg.useDebounce).toBe(useDebounceModule.default);
  });
});

describe('react hooks internals', () => {
  it('useDebounce wires callback and runs cleanup cancel', async () => {
    const cleanups: Array<() => void> = [];

    vi.doMock('react', () => {
      const reactMock = {
        useRef: <T>(value: T) => ({ current: value }),
        useEffect: (effect: () => void | (() => void)) => {
          const cleanup = effect();
          if (typeof cleanup === 'function') cleanups.push(cleanup);
        },
        useMemo: <T>(factory: () => T) => factory(),
      };

      return { default: reactMock };
    });

    const cancel = vi.fn();
    const debounceImpl = vi.fn((cb: (...args: unknown[]) => unknown) => {
      const wrapped = (...args: unknown[]) => cb(...args);
      return Object.assign(wrapped, { cancel });
    });

    vi.doMock('../debounce', () => ({
      debounce: debounceImpl,
    }));

    const { default: useDebounce } = await import('../react/useDebounce');
    const callback = vi.fn((value: string) => value.toUpperCase());

    const debounced = useDebounce(callback, 120, { autoAbort: true });
    debounced('abc');

    expect(callback).toHaveBeenCalledWith('abc');
    expect(debounceImpl).toHaveBeenCalledTimes(1);
    expect(debounceImpl).toHaveBeenCalledWith(expect.any(Function), 120, {
      autoAbort: true,
    });

    cleanups.forEach((cleanup) => cleanup());
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('useCreateDebounceSignal passes default options and cleanup cancel', async () => {
    const cleanups: Array<() => void> = [];

    vi.doMock('react', () => {
      const reactMock = {
        useRef: <T>(value: T) => ({ current: value }),
        useEffect: (effect: () => void | (() => void)) => {
          const cleanup = effect();
          if (typeof cleanup === 'function') cleanups.push(cleanup);
        },
        useMemo: <T>(factory: () => T) => factory(),
      };

      return { default: reactMock };
    });

    const cancel = vi.fn();
    const controller = Object.assign(vi.fn(), { cancel });
    const debouncedSignalImpl = vi.fn((..._args: unknown[]) => controller);

    vi.doMock('../debounceSignal', () => ({
      debouncedSignal: debouncedSignalImpl,
    }));

    const { default: useCreateDebounceSignal } =
      await import('../react/useDebounceSignal');

    let state = 'initial';
    const getter = () => state;
    const setter = vi.fn((value: string) => {
      state = value;
      return value;
    });

    const signal = useCreateDebounceSignal(getter, setter, 250);

    expect(signal).toBe(controller);
    expect(debouncedSignalImpl).toHaveBeenCalledTimes(1);
    expect(debouncedSignalImpl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      250,
      { autoAbort: true }
    );

    const firstCall = debouncedSignalImpl.mock.calls[0] as unknown[];
    const wrappedGetter = firstCall[0] as () => string;
    const wrappedSetter = firstCall[1] as (value: string) => void;

    expect(wrappedGetter()).toBe('initial');
    wrappedSetter('next');
    expect(setter).toHaveBeenCalledWith('next');

    cleanups.forEach((cleanup) => cleanup());
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
