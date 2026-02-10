'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Apartment, ApartmentWithHierarchy } from '@/types';

export function useApartment() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [currentApartmentId, setCurrentApartmentId] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<ApartmentWithHierarchy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApartments = useCallback(async () => {
    const res = await fetch('/api/apartments');
    if (res.ok) {
      const data: Apartment[] = await res.json();
      setApartments(data);
      if (data.length > 0 && !currentApartmentId) {
        setCurrentApartmentId(data[0].id);
      }
    }
    setLoading(false);
  }, [currentApartmentId]);

  const fetchHierarchy = useCallback(async (apartmentId: string) => {
    const res = await fetch(`/api/apartments/${apartmentId}`);
    if (res.ok) {
      const data: ApartmentWithHierarchy = await res.json();
      setHierarchy(data);
    }
  }, []);

  const switchApartment = useCallback(
    (apartmentId: string) => {
      setCurrentApartmentId(apartmentId);
      fetchHierarchy(apartmentId);
    },
    [fetchHierarchy],
  );

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    if (currentApartmentId) {
      fetchHierarchy(currentApartmentId);
    }
  }, [currentApartmentId, fetchHierarchy]);

  return {
    apartments,
    currentApartmentId,
    hierarchy,
    loading,
    switchApartment,
    refresh: fetchApartments,
    refreshHierarchy: () => currentApartmentId && fetchHierarchy(currentApartmentId),
  };
}
