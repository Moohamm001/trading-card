import { useState, useCallback } from 'react';

export type CollectionStatus = 'owned' | 'wanted' | null;

const STORAGE_KEY = 'cardmarket_collection';

function loadCollection(): Record<string, CollectionStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCollection(col: Record<string, CollectionStatus>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(col));
  } catch {}
}

export function useCollection() {
  const [collection, setCollection] = useState<Record<string, CollectionStatus>>(loadCollection);

  const setStatus = useCallback((cardId: string, status: CollectionStatus) => {
    setCollection((prev) => {
      const next = { ...prev };
      if (status === null) {
        delete next[cardId];
      } else {
        next[cardId] = status;
      }
      saveCollection(next);
      return next;
    });
  }, []);

  const toggle = useCallback((cardId: string, status: 'owned' | 'wanted') => {
    setCollection((prev) => {
      const next = { ...prev };
      if (next[cardId] === status) {
        delete next[cardId];
      } else {
        next[cardId] = status;
      }
      saveCollection(next);
      return next;
    });
  }, []);

  const getStatus = useCallback((cardId: string): CollectionStatus => {
    return collection[cardId] ?? null;
  }, [collection]);

  const counts = {
    owned: Object.values(collection).filter((s) => s === 'owned').length,
    wanted: Object.values(collection).filter((s) => s === 'wanted').length,
  };

  return { collection, setStatus, toggle, getStatus, counts };
}
