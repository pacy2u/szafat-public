'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchResult } from '@/types';

export function useSearch(apartmentId: string | null) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (!apartmentId || q.trim().length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    const res = await fetch(
      `/api/apartments/${apartmentId}/search?q=${encodeURIComponent(q.trim())}`,
    );
    if (res.ok) {
      const data = await res.json();
      setResults(data);
    }
    setLoading(false);
  }, [apartmentId]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  return { query, setQuery, results, loading };
}
