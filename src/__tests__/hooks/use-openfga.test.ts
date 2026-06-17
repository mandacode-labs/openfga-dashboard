import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStores, useTuples } from "@/hooks/use-openfga";

// Mock the connection store
vi.mock("@/lib/store/connection-store", () => ({
  useConnectionStore: vi.fn(),
}));

import { useConnectionStore } from "@/lib/store/connection-store";

const mockUseConnectionStore = vi.mocked(useConnectionStore);

describe("useStores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty stores when client is null", () => {
    mockUseConnectionStore.mockReturnValue(null as any);
    const { result } = renderHook(() => useStores());
    expect(result.current.stores).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetches stores successfully", async () => {
    const mockStores = [
      {
        id: "1",
        name: "Store 1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Store 2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockClient = {
      listStores: vi.fn().mockResolvedValue({
        stores: mockStores,
        continuation_token: undefined,
      }),
    };

    mockUseConnectionStore.mockReturnValue(mockClient as any);

    const { result } = renderHook(() => useStores());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stores).toEqual(mockStores);
    expect(result.current.error).toBeNull();
  });

  it("handles errors", async () => {
    const mockClient = {
      listStores: vi.fn().mockRejectedValue(new Error("Network error")),
    };

    mockUseConnectionStore.mockReturnValue(mockClient as any);

    const { result } = renderHook(() => useStores());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });
});

describe("useTuples", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty tuples when client is null", () => {
    mockUseConnectionStore.mockReturnValue(null as any);
    const { result } = renderHook(() => useTuples("store-1"));
    expect(result.current.tuples).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetches tuples successfully", async () => {
    const mockTuples = [
      {
        key: { user: "user:1", relation: "viewer", object: "doc:1" },
        timestamp: new Date().toISOString(),
      },
    ];

    const mockClient = {
      read: vi.fn().mockResolvedValue({
        tuples: mockTuples,
        continuation_token: undefined,
      }),
    };

    mockUseConnectionStore.mockReturnValue(mockClient as any);

    const { result } = renderHook(() => useTuples("store-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tuples).toEqual(mockTuples);
    expect(result.current.hasMore).toBe(false);
  });

  it("adds tuples and refetches", async () => {
    const mockTuples = [
      {
        key: { user: "user:1", relation: "viewer", object: "doc:1" },
        timestamp: new Date().toISOString(),
      },
    ];

    const mockClient = {
      read: vi.fn().mockResolvedValue({
        tuples: mockTuples,
        continuation_token: undefined,
      }),
      write: vi.fn().mockResolvedValue(undefined),
    };

    mockUseConnectionStore.mockReturnValue(mockClient as any);

    const { result } = renderHook(() => useTuples("store-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTuples([
        { user: "user:1", relation: "viewer", object: "doc:1" },
      ]);
    });

    expect(mockClient.write).toHaveBeenCalled();
  });
});
