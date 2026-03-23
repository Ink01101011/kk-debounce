import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createDebouncedSignal } from "../packages/createDebounceSignal";

describe("createDebouncedSignal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tracks pending state and updates on delay", () => {
    let source = "";
    const setter = vi.fn((v: string) => {
      source = v;
    });

    const signal = createDebouncedSignal(
      () => source,
      setter,
      200,
    );

    signal("hello");
    expect(signal.isPending).toBe(true);
    expect(signal.value).toBe("hello");

    vi.advanceTimersByTime(200);
    expect(setter).toHaveBeenCalledWith("hello");
    expect(signal.isPending).toBe(false);
    expect(signal.value).toBe("hello");
  });

  it("cancel clears pending state without applying value", () => {
    let source = "old";
    const setter = vi.fn((v: string) => {
      source = v;
    });

    const signal = createDebouncedSignal(
      () => source,
      setter,
      150,
    );

    signal("new");
    signal.cancel();
    vi.advanceTimersByTime(150);

    expect(signal.isPending).toBe(false);
    expect(setter).not.toHaveBeenCalled();
    expect(signal.value).toBe("old");
  });

  it("flush applies latest pending value immediately", () => {
    let source = "before";
    const setter = vi.fn((v: string) => {
      source = v;
    });

    const signal = createDebouncedSignal(
      () => source,
      setter,
      300,
    );

    signal("after");
    signal.flush();

    expect(setter).toHaveBeenCalledWith("after");
    expect(signal.isPending).toBe(false);
    expect(signal.value).toBe("after");

    vi.advanceTimersByTime(300);
    expect(setter).toHaveBeenCalledTimes(1);
  });
});
