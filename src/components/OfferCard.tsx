import { useState } from 'react';
import type { Offer } from '../types';
import { logEvent } from '../utils/analytics';

interface OfferCardProps {
  offer: Offer;
  rank: number;
}

export function OfferCard({ offer, rank }: OfferCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  const handleCtaClick = () => {
    if (isRedirecting) return;

    logEvent('cta_click', {
      offerId: offer.id,
      offerName: offer.name,
      apr: offer.apr,
    });

    setIsRedirecting(true);
    setTimeout(() => {
      setRedirectMessage(`Przekierowano do partnera: ${offer.name}`);
      setIsRedirecting(false);
      setTimeout(() => setRedirectMessage(''), 3000);
    }, 600);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(offer.rating / 20);
    const hasHalfStar = (offer.rating % 20) >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`half-${offer.id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${offer.id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
      aria-label={`Oferta ${offer.name}`}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start gap-4 md:w-48 flex-shrink-0">
            <div
              tabIndex={0}
              role="img"
              aria-label={`Logo banku ${offer.name}`}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              <img
                src={offer.logo}
                alt={`${offer.name} logo`}
                className="h-16 object-contain"
                loading="lazy"
              />
            </div>

            <div
              className="flex flex-col items-center md:items-start focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
              tabIndex={0}
              role="group"
              aria-label={`Ocena ${offer.rating} na 100`}
            >
              <div className="flex items-center gap-1 mb-1" role="img" aria-hidden="true">
                {renderStars()}
              </div>
              <div className="text-sm text-gray-600">
                Ocena: <span className="font-semibold text-gray-900">{offer.rating}/100</span>
              </div>
            </div>

            {offer.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full" role="list" aria-label="Cechy oferty">
                {offer.tags.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    tabIndex={0}
                    className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={`Cecha: ${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3
              className="text-xl font-bold text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              tabIndex={0}
            >
              {offer.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                tabIndex={0}
                role="group"
                aria-label={`Decyzja: ${offer.decision}`}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2"
              >
                <div className="text-sm text-gray-600 mb-1">Decyzja:</div>
                <div className="font-semibold text-gray-900">{offer.decision}</div>
              </div>

              <div
                tabIndex={0}
                role="group"
                aria-label={`RRSO: od ${offer.apr.toFixed(2)}%`}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2"
              >
                <div className="text-sm text-gray-600 mb-1">RRSO:</div>
                <div className="font-semibold text-gray-900">od {offer.apr.toFixed(2)}%</div>
              </div>

              <div
                tabIndex={0}
                role="group"
                aria-label={`Kwota: ${offer.minAmount.toLocaleString()} - ${offer.maxAmount.toLocaleString()} złotych`}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2"
              >
                <div className="text-sm text-gray-600 mb-1">Kwota:</div>
                <div className="font-semibold text-gray-900">
                  {offer.minAmount.toLocaleString()} - {offer.maxAmount.toLocaleString()} zł
                </div>
              </div>

              <div
                tabIndex={0}
                role="group"
                aria-label={`Okres: ${offer.minPeriod === offer.maxPeriod ? `${offer.minPeriod} miesięcy` : `${offer.minPeriod}-${offer.maxPeriod} miesięcy`}`}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2"
              >
                <div className="text-sm text-gray-600 mb-1">Okres:</div>
                <div className="font-semibold text-gray-900">
                  {offer.minPeriod === offer.maxPeriod
                    ? `${offer.minPeriod} mies.`
                    : `${offer.minPeriod}-${offer.maxPeriod} mies.`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <button
            onClick={handleCtaClick}
            disabled={isRedirecting}
            data-testid="cta-button"
            className="w-[100%] px-8 py-3 bg-blue-800 hover:bg-blue-900 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Sprawdź ofertę ${offer.name}`}
          >
            {isRedirecting ? 'Przekierowywanie...' : 'Sprawdź ofertę'}
          </button>

          {redirectMessage && (
            <div
              tabIndex={0}
              className="w-[100%] p-3 bg-green-100 text-green-900 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={redirectMessage}
            >
              {redirectMessage}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
