import type { Offer } from '../types';

const FAILURE_RATE = 0.1;
const SIMULATED_DELAY = 500;

export async function fetchOffers(): Promise<Offer[]> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));

  if (Math.random() < FAILURE_RATE) {
    throw new Error('Nie udało się pobrać ofert. Spróbuj ponownie później.');
  }

  try {
    const response = await fetch('/offers.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Offer[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching offers.');
  }
}

export function filterOffers(
  offers: Offer[],
  amount: number,
  period: number,
  selectedTags: string[]
): Offer[] {
  return offers.filter((offer) => {
    const amountMatch =
      amount >= offer.minAmount && amount <= offer.maxAmount;

    const periodMatch =
      period >= offer.minPeriod && period <= offer.maxPeriod;

    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => offer.tags.includes(tag));

    return amountMatch && periodMatch && tagMatch;
  });
}

export function sortOffers(
  offers: Offer[],
  sortBy: 'apr-asc' | 'rating-desc'
): Offer[] {
  const sorted = [...offers];

  if (sortBy === 'apr-asc') {
    return sorted.sort((a, b) => a.apr - b.apr);
  } else {
    return sorted.sort((a, b) => b.rating - a.rating);
  }
}

export function getAllTags(offers: Offer[]): string[] {
  const tagsSet = new Set<string>();
  offers.forEach((offer) => {
    offer.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}
