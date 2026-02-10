'use client';

import { useTranslations } from 'next-intl';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/use-search';
import { useApartment } from '@/hooks/use-apartment';

export default function SearchPage() {
  const t = useTranslations('search');
  const { currentApartmentId } = useApartment();
  const { query, setQuery, results, loading } = useSearch(currentApartmentId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{t('title')}</h1>
      <SearchBar value={query} onChange={setQuery} />
      {query.trim().length > 0 && (
        <SearchResults results={results} loading={loading} />
      )}
    </div>
  );
}
