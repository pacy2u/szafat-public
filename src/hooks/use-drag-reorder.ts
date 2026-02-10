'use client';

import { useState, useCallback } from 'react';
import type { Item } from '@/types';

export function useDragReorder(initialItems: Item[]) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

  const handleReorder = useCallback(async (reorderedItems: Item[]) => {
    const previous = items;
    setItems(reorderedItems);
    setSaving(true);

    const payload = reorderedItems.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));

    const res = await fetch('/api/items/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload }),
    });

    if (!res.ok) {
      // Rollback on failure
      setItems(previous);
    }
    setSaving(false);
  }, [items]);

  return { items, setItems, handleReorder, saving };
}
