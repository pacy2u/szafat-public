'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { SearchResult } from '@/types';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
}

const typeIcons: Record<SearchResult['type'], string> = {
  item: '📦',
  room: '🏠',
  storage_unit: '🗄️',
  shelf: '📚',
  drawer: '🗃️',
};

function getResultHref(result: SearchResult): string {
  switch (result.type) {
    case 'item':
      return `/items/${result.id}`;
    case 'room':
      return `/rooms/${result.id}`;
    case 'storage_unit':
      return `/storage/${result.id}`;
    case 'shelf':
    case 'drawer':
      return `/storage/${result.id}`; // Link to parent unit context
    default:
      return '#';
  }
}

export function SearchResults({ results, loading }: SearchResultsProps) {
  const t = useTranslations('search');

  if (loading) {
    return <p className="text-sm text-gray-500 text-center py-4">{t('searching')}</p>;
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">🔍</span>
        <p className="empty-state-text">{t('noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={getResultHref(result)}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {result.thumbnailUrl ? (
            <img
              src={result.thumbnailUrl}
              alt=""
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          ) : (
            <span className="text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {typeIcons[result.type]}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{result.name}</p>
            <p className="text-xs text-gray-500 truncate">{result.locationPath}</p>
            <span className="text-xs text-gray-400">{t(`type_${result.type}`)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
