'use client';

import type { Item } from '@/types';
import Link from 'next/link';
import { ExpirationBadge } from '@/components/fridge/ExpirationBadge';

interface ItemTileProps {
  item: Item;
  showExpiration?: boolean;
}

export function ItemTile({ item, showExpiration = false }: ItemTileProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl text-gray-300">📦</span>
        )}
        {showExpiration && item.expirationDate && (
          <div className="absolute top-1 right-1">
            <ExpirationBadge expirationDate={item.expirationDate} />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium truncate">{item.name}</p>
        {item.archived && (
          <span className="text-xs text-red-500">Archived</span>
        )}
      </div>
    </Link>
  );
}
