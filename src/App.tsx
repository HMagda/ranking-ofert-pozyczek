import { useState, useEffect, useMemo } from 'react';
import type { Offer } from './types';
import { InputForm } from './components/InputForm';
import { OffersList } from './components/OffersList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { fetchOffers, filterOffers, getAllTags } from './utils/api';
import { logEvent } from './utils/analytics';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function App() {
  const [amount, setAmount] = useState(5000);
  const [period, setPeriod] = useState(12);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoadingState('loading');
    setErrorMessage('');

    try {
      const offers = await fetchOffers();
      setAllOffers(offers);
      setLoadingState('success');

      logEvent('view_list', { count: offers.length });
    } catch (error) {
      setLoadingState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać ofert. Spróbuj ponownie.'
      );
    }
  };

  const filteredOffers = useMemo(() => {
    if (loadingState !== 'success') return [];
    return filterOffers(allOffers, amount, period, selectedTags);
  }, [allOffers, amount, period, selectedTags, loadingState]);

  const availableTags = useMemo(() => {
    if (loadingState !== 'success') return [];
    return getAllTags(allOffers);
  }, [allOffers, loadingState]);

  const handleRetry = () => {
    loadOffers();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Przejdź do treści
      </a>

      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm shadow-sm" role="banner">
        <div className="w-full lg:max-w-[80vw] sm:mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1
            className="text-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black rounded"
            tabIndex={0}
          >
            Ranking Ofert Pożyczek
          </h1>
          <p
            className="mt-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black rounded"
            tabIndex={0}
          >
            Znajdź najlepszą ofertę dopasowaną do Twoich potrzeb
          </p>
        </div>
      </header>

      <main id="main-content" className="w-full lg:max-w-[80vw] sm:mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <InputForm
          amount={amount}
          period={period}
          onAmountChange={setAmount}
          onPeriodChange={setPeriod}
        />

        {loadingState === 'loading' && <LoadingSkeleton />}

        {loadingState === 'error' && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}

        {loadingState === 'success' && (
          <OffersList
            offers={filteredOffers}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
        <div className="w-full lg:max-w-[80vw] sm:mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p
            className="text-center text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black rounded"
            tabIndex={0}
          >
            Ranking Ofert Pożyczek
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
