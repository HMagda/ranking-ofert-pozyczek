import { useState } from 'react';
import type { Offer, SortOption } from '../types';
import { OfferCard } from './OfferCard';
import { logEvent } from '../utils/analytics';

interface OffersListProps {
  offers: Offer[];
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function OffersList({
  offers,
  availableTags,
  selectedTags,
  onTagsChange,
}: OffersListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [showTagFilter, setShowTagFilter] = useState(false);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    logEvent('sort_change', { sortBy: newSortBy });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    onTagsChange(newTags);
    logEvent('filter_change', {
      amount: 0,
      period: 0,
      tags: newTags,
    });
  };

  const sortedOffers = [...(offers || [])].sort((a, b) => {
    if (sortBy === 'apr-asc') {
      return a.apr - b.apr;
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-black rounded"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={0}
          >
            Znaleziono <strong>{offers?.length || 0}</strong> {(offers?.length || 0) === 1
              ? 'ofertę'
              : (offers?.length || 0) < 5
              ? 'oferty'
              : 'ofert'}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="text-sm text-gray-600">Sortuj:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('rating-desc')}
                aria-pressed={sortBy === 'rating-desc'}
                aria-label={`Sortuj według oceny${sortBy === 'rating-desc' ? ' (aktywne)' : ''}`}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                  sortBy === 'rating-desc'
                    ? 'bg-gray-800 text-white'
                    : 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Najwyżej oceniane
              </button>
              <button
                onClick={() => handleSortChange('apr-asc')}
                aria-pressed={sortBy === 'apr-asc'}
                aria-label={`Sortuj według RRSO${sortBy === 'apr-asc' ? ' (aktywne)' : ''}`}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                  sortBy === 'apr-asc'
                    ? 'bg-gray-800 text-white'
                    : 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Najniższe RRSO
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            aria-expanded={showTagFilter}
            aria-controls="tag-filter-panel"
            aria-label={`${showTagFilter ? 'Ukryj' : 'Pokaż'} filtry tagów (${selectedTags.length} wybranych)`}
            className="px-4 py-1.5 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black"
          >
            Filtry ({selectedTags.length})
          </button>
        </div>

        {showTagFilter && (
          <div
            id="tag-filter-panel"
            className="mt-4 pt-4 border-t border-gray-200"
            role="region"
            aria-label="Filtry według tagów"
          >
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    aria-pressed={isSelected}
                    aria-label={tag}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                      isSelected
                        ? 'bg-gray-800 text-white'
                        : 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => onTagsChange([])}
                className="mt-2 text-sm text-blue-800 hover:text-blue-900 underline focus:outline-none focus:ring-2 focus:ring-black rounded"
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        )}
      </div>

      {(offers?.length || 0) === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 text-lg mb-2 font-semibold">
            Nie znaleziono ofert
          </p>
          <p className="text-gray-600 text-sm">
            Spróbuj zmienić kryteria wyszukiwania
          </p>
        </div>
      ) : (
        <div className="space-y-4" role="list">
          {sortedOffers.map((offer, index) => (
            <div key={offer.id} role="listitem">
              <OfferCard offer={offer} rank={index + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
