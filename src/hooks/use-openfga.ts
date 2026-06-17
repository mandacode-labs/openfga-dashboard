"use client";

import type {
  AuthorizationModel as AuthModel,
  ReadRequestTupleKey,
  Store,
  Tuple,
} from "@openfga/sdk";
import { useCallback, useEffect, useState } from "react";
import { useConnectionStore } from "@/lib/store/connection-store";
import type { TupleKey } from "@/types";

function useClient() {
  return useConnectionStore((s) => s.client);
}

export function useStores() {
  const client = useClient();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const allStores: Store[] = [];
      let continuationToken: string | undefined;
      do {
        const res = await client.listStores({
          pageSize: 50,
          continuationToken,
        });
        allStores.push(...res.stores);
        continuationToken = res.continuation_token;
      } while (continuationToken);
      setStores(allStores);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, error, refetch: fetchStores };
}

export function useAuthorizationModels(storeId: string | null) {
  const client = useClient();
  const [models, setModels] = useState<AuthModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!client || !storeId) return;
    setLoading(true);
    setError(null);
    try {
      const allModels: AuthModel[] = [];
      let continuationToken: string | undefined;
      do {
        const res = await client.readAuthorizationModels({
          storeId,
          pageSize: 50,
          continuationToken,
        });
        allModels.push(...res.authorization_models);
        continuationToken = res.continuation_token;
      } while (continuationToken);
      setModels(allModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, [client, storeId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, loading, error, refetch: fetchModels };
}

export function useTuples(storeId: string | null) {
  const client = useClient();
  const [tuples, setTuples] = useState<Tuple[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuationToken, setContinuationToken] = useState<
    string | undefined
  >();

  const fetchTuples = useCallback(
    async (filters?: ReadRequestTupleKey) => {
      if (!client || !storeId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.read(filters || {}, {
          storeId,
          pageSize: 50,
          continuationToken,
        });
        setTuples(res.tuples);
        setContinuationToken(res.continuation_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tuples");
      } finally {
        setLoading(false);
      }
    },
    [client, storeId, continuationToken],
  );

  const loadMore = useCallback(async () => {
    if (!client || !storeId || !continuationToken) return;
    setLoading(true);
    try {
      const res = await client.read(
        {},
        { storeId, pageSize: 50, continuationToken },
      );
      setTuples((prev) => [...prev, ...res.tuples]);
      setContinuationToken(res.continuation_token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more tuples",
      );
    } finally {
      setLoading(false);
    }
  }, [client, storeId, continuationToken]);

  const addTuples = useCallback(
    async (tupleKeys: TupleKey[]) => {
      if (!client || !storeId) return;
      await client.write({ writes: tupleKeys }, { storeId });
      setContinuationToken(undefined);
      await fetchTuples();
    },
    [client, storeId, fetchTuples],
  );

  const deleteTuples = useCallback(
    async (tupleKeys: TupleKey[]) => {
      if (!client || !storeId) return;
      await client.write({ deletes: tupleKeys }, { storeId });
      setContinuationToken(undefined);
      await fetchTuples();
    },
    [client, storeId, fetchTuples],
  );

  useEffect(() => {
    fetchTuples();
  }, [fetchTuples]);

  return {
    tuples,
    loading,
    error,
    refetch: fetchTuples,
    loadMore,
    addTuples,
    deleteTuples,
    hasMore: !!continuationToken,
  };
}
