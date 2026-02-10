'use client';

import type { Item } from '@/types';
import { ItemTile } from './ItemTile';

interface ItemGridProps {
  items: Item[];
}

export function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📦</span>
        <p className="empty-state-text">No items yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <ItemTile key={item.id} item={item} />
      ))}
    </div>
  );
}
