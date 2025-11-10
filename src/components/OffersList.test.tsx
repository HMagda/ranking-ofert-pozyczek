import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OffersList } from './OffersList';
import type { Offer } from '../types';
import * as analytics from '../utils/analytics';

vi.mock('../utils/analytics');

vi.mock('./OfferCard', () => ({
  OfferCard: ({ offer, rank }: { offer: Offer; rank: number }) => (
    <div data-testid={`offer-card-${offer.id}`}>
      {offer.name} - Rank: {rank} - APR: {offer.apr} - Rating: {offer.rating}
    </div>
  ),
}));

describe('OffersList', () => {
  const mockOffers: Offer[] = [
    {
      id: '1',
      name: 'Offer A',
      logo: 'logo-a.png',
      apr: 15.5,
      minAmount: 1000,
      maxAmount: 10000,
      minPeriod: 6,
      maxPeriod: 36,
      decision: 'online',
      tags: ['ratalna', 'online'],
      rating: 85,
    },
    {
      id: '2',
      name: 'Offer B',
      logo: 'logo-b.png',
      apr: 89.9,
      minAmount: 200,
      maxAmount: 5000,
      minPeriod: 1,
      maxPeriod: 1,
      decision: 'online',
      tags: ['chwilówka', '30 dni'],
      rating: 70,
    },
    {
      id: '3',
      name: 'Offer C',
      logo: 'logo-c.png',
      apr: 12.0,
      minAmount: 5000,
      maxAmount: 50000,
      minPeriod: 12,
      maxPeriod: 60,
      decision: 'do 24h',
      tags: ['ratalna', 'offline'],
      rating: 90,
    },
  ];

  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    offers: mockOffers,
    availableTags: ['ratalna', 'chwilówka', 'online', 'offline', '30 dni'],
    selectedTags: [] as string[],
    onTagsChange: mockOnTagsChange,
  };

  describe('Rendering', () => {
    it('should render all offers', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByTestId('offer-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('offer-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('offer-card-3')).toBeInTheDocument();
    });

    it('should show offers count', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByText(/znaleziono/i)).toBeInTheDocument();
      expect(screen.getByText((_content, element) => {
        return element?.textContent === 'Znaleziono 3 oferty';
      })).toBeInTheDocument();
    });

    it('should use correct plural form for 1 offer', () => {
      render(<OffersList {...defaultProps} offers={[mockOffers[0]]} />);

      expect(screen.getByText(/ofertę/i)).toBeInTheDocument();
    });

    it('should use correct plural form for 2-4 offers', () => {
      render(<OffersList {...defaultProps} offers={mockOffers.slice(0, 2)} />);

      expect(screen.getByText(/oferty/i)).toBeInTheDocument();
    });

    it('should use correct plural form for 5+ offers', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByText(/ofert/i)).toBeInTheDocument();
    });

    it('should render sort buttons', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByText('Najwyżej oceniane')).toBeInTheDocument();
      expect(screen.getByText('Najniższe RRSO')).toBeInTheDocument();
    });

    it('should render filter button with count', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByText(/filtry \(0\)/i)).toBeInTheDocument();
    });

    it('should update filter button count', () => {
      render(<OffersList {...defaultProps} selectedTags={['ratalna', 'online']} />);

      expect(screen.getByText(/filtry \(2\)/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by rating (descending) by default', () => {
      render(<OffersList {...defaultProps} />);

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards[0]).toHaveTextContent('Offer C'); // Rating 90
      expect(cards[1]).toHaveTextContent('Offer A'); // Rating 85
      expect(cards[2]).toHaveTextContent('Offer B'); // Rating 70
    });

    it('should sort by APR ascending when clicked', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const aprButton = screen.getByText('Najniższe RRSO');
      await user.click(aprButton);

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards[0]).toHaveTextContent('Offer C'); // APR 12.0
      expect(cards[1]).toHaveTextContent('Offer A'); // APR 15.5
      expect(cards[2]).toHaveTextContent('Offer B'); // APR 89.9
    });

    it('should highlight active sort button', () => {
      render(<OffersList {...defaultProps} />);

      const ratingButton = screen.getByText('Najwyżej oceniane');
      expect(ratingButton).toHaveClass('bg-gray-800');
    });

    it('should update active sort button when clicked', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const aprButton = screen.getByText('Najniższe RRSO');
      await user.click(aprButton);

      expect(aprButton).toHaveClass('bg-gray-800');
    });

    it('should log sort_change event', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const aprButton = screen.getByText('Najniższe RRSO');
      await user.click(aprButton);

      expect(analytics.logEvent).toHaveBeenCalledWith('sort_change', {
        sortBy: 'apr-asc',
      });
    });

    it('should assign correct ranks after sorting', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const aprButton = screen.getByText('Najniższe RRSO');
      await user.click(aprButton);

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards[0]).toHaveTextContent('Rank: 1');
      expect(cards[1]).toHaveTextContent('Rank: 2');
      expect(cards[2]).toHaveTextContent('Rank: 3');
    });
  });

  describe('Tag Filtering', () => {
    it('should not show tag filter panel by default', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.queryByText('ratalna')).not.toBeInTheDocument();
    });

    it('should show tag filter panel when button clicked', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const filterButton = screen.getByText(/filtry/i);
      await user.click(filterButton);

      expect(screen.getByText('ratalna')).toBeInTheDocument();
      expect(screen.getByText('chwilówka')).toBeInTheDocument();
    });

    it('should hide tag filter panel when button clicked again', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      const filterButton = screen.getByText(/filtry/i);
      await user.click(filterButton);
      await user.click(filterButton);

      expect(screen.queryByRole('button', { name: 'ratalna' })).not.toBeInTheDocument();
    });

    it('should render all available tags', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      await user.click(screen.getByText(/filtry/i));

      expect(screen.getByRole('button', { name: 'ratalna' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'chwilówka' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'online' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'offline' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '30 dni' })).toBeInTheDocument();
    });

    it('should call onTagsChange when tag is selected', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      await user.click(screen.getByText(/filtry/i));
      await user.click(screen.getByRole('button', { name: 'ratalna' }));

      expect(mockOnTagsChange).toHaveBeenCalledWith(['ratalna']);
    });

    it('should add multiple tags', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} selectedTags={['ratalna']} />);

      await user.click(screen.getByText(/filtry/i));
      await user.click(screen.getByRole('button', { name: 'online' }));

      expect(mockOnTagsChange).toHaveBeenCalledWith(['ratalna', 'online']);
    });

    it('should remove tag when already selected', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} selectedTags={['ratalna', 'online']} />);

      await user.click(screen.getByText(/filtry/i));
      await user.click(screen.getByRole('button', { name: 'ratalna' }));

      expect(mockOnTagsChange).toHaveBeenCalledWith(['online']);
    });

    it('should highlight selected tags', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} selectedTags={['ratalna']} />);

      await user.click(screen.getByText(/filtry/i));

      const ratalnaButton = screen.getByRole('button', { name: 'ratalna' });
      expect(ratalnaButton).toHaveClass('bg-gray-800');
    });

    it('should show clear filters button when tags are selected', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} selectedTags={['ratalna']} />);

      await user.click(screen.getByText(/filtry/i));

      expect(screen.getByText(/wyczyść filtry/i)).toBeInTheDocument();
    });

    it('should not show clear filters button when no tags selected', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      await user.click(screen.getByText(/filtry/i));

      expect(screen.queryByText(/wyczyść filtry/i)).not.toBeInTheDocument();
    });

    it('should clear all tags when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} selectedTags={['ratalna', 'online']} />);

      await user.click(screen.getByText(/filtry/i));
      await user.click(screen.getByText(/wyczyść filtry/i));

      expect(mockOnTagsChange).toHaveBeenCalledWith([]);
    });

    it('should log filter_change event when tag is toggled', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} />);

      await user.click(screen.getByText(/filtry/i));
      await user.click(screen.getByRole('button', { name: 'ratalna' }));

      expect(analytics.logEvent).toHaveBeenCalledWith('filter_change', {
        amount: 0,
        period: 0,
        tags: ['ratalna'],
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no offers', () => {
      render(<OffersList {...defaultProps} offers={[]} />);

      expect(screen.getByText(/nie znaleziono ofert/i)).toBeInTheDocument();
    });

    it('should show helpful message in empty state', () => {
      render(<OffersList {...defaultProps} offers={[]} />);

      expect(screen.getByText(/spróbuj zmienić kryteria wyszukiwania/i)).toBeInTheDocument();
    });

    it('should not show offers list when empty', () => {
      render(<OffersList {...defaultProps} offers={[]} />);

      expect(screen.queryByTestId(/offer-card-/)).not.toBeInTheDocument();
    });

    it('should show zero count', () => {
      render(<OffersList {...defaultProps} offers={[]} />);

      expect(screen.getByText((_content, element) => {
        return element?.textContent === 'Znaleziono 0 oferty';
      })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have list role', () => {
      render(<OffersList {...defaultProps} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should have listitem roles for offers', () => {
      render(<OffersList {...defaultProps} />);

      const listitems = screen.getAllByRole('listitem');
      expect(listitems).toHaveLength(3);
    });

    it('should have focus states on buttons', () => {
      render(<OffersList {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single offer', () => {
      render(<OffersList {...defaultProps} offers={[mockOffers[0]]} />);

      expect(screen.getAllByTestId(/offer-card-/)).toHaveLength(1);
      expect(screen.getByText((_content, element) => {
        return element?.textContent === 'Znaleziono 1 ofertę';
      })).toBeInTheDocument();
    });

    it('should handle large number of offers', () => {
      const manyOffers = Array.from({ length: 50 }, (_, i) => ({
        ...mockOffers[0],
        id: `offer-${i}`,
        name: `Offer ${i}`,
      }));

      render(<OffersList {...defaultProps} offers={manyOffers} />);

      expect(screen.getByText((_content, element) => {
        return element?.textContent === 'Znaleziono 50 ofert';
      })).toBeInTheDocument();
    });

    it('should handle offers with same rating', () => {
      const sameRatingOffers = mockOffers.map((offer) => ({
        ...offer,
        rating: 80,
      }));

      render(<OffersList {...defaultProps} offers={sameRatingOffers} />);

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards).toHaveLength(3);
    });

    it('should handle offers with same APR', () => {
      const sameAPROffers = mockOffers.map((offer) => ({
        ...offer,
        apr: 15.5,
      }));

      render(<OffersList {...defaultProps} offers={sameAPROffers} />);

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards).toHaveLength(3);
    });

    it('should handle no available tags', async () => {
      const user = userEvent.setup();
      render(<OffersList {...defaultProps} availableTags={[]} />);

      await user.click(screen.getByText(/filtry/i));

      expect(screen.queryByRole('button', { name: /ratalna/i })).not.toBeInTheDocument();
    });

    it('should handle all tags selected', () => {
      render(<OffersList {...defaultProps} selectedTags={defaultProps.availableTags} />);

      expect(screen.getByText(/filtry \(5\)/i)).toBeInTheDocument();
    });

    it('should maintain sort order when tags change', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<OffersList {...defaultProps} />);

      await user.click(screen.getByText('Najniższe RRSO'));

      rerender(
        <OffersList
          {...defaultProps}
          selectedTags={['ratalna']}
        />
      );

      const cards = screen.getAllByTestId(/offer-card-/);
      expect(cards[0]).toHaveTextContent('APR: 12');
    });
  });

  describe('Performance', () => {
    it('should not re-sort when props do not change', () => {
      const { rerender } = render(<OffersList {...defaultProps} />);

      const initialCards = screen.getAllByTestId(/offer-card-/);
      const initialOrder = initialCards.map((card) => card.textContent);

      rerender(<OffersList {...defaultProps} />);

      const newCards = screen.getAllByTestId(/offer-card-/);
      const newOrder = newCards.map((card) => card.textContent);

      expect(newOrder).toEqual(initialOrder);
    });
  });
});
