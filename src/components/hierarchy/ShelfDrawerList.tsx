'use client';

import type { Shelf, Drawer } from '@/types';

interface ShelfDrawerListProps {
  shelves: Shelf[];
  drawers: Drawer[];
  onRefresh: () => void;
}

export function ShelfDrawerList({ shelves, drawers }: ShelfDrawerListProps) {
  if (shelves.length === 0 && drawers.length === 0) return null;

  return (
    <div className="text-xs text-gray-600 space-y-0.5 mt-1">
      {shelves.map((shelf) => (
        <div key={shelf.id} className="flex items-center gap-1">
          <span className="text-gray-400">├</span>
          <span>{shelf.name}</span>
        </div>
      ))}
      {drawers.map((drawer) => (
        <div key={drawer.id} className="flex items-center gap-1">
          <span className="text-gray-400">├</span>
          <span>{drawer.name}</span>
        </div>
      ))}
    </div>
  );
}
