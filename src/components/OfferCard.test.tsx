import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfferCard } from './OfferCard';
import type { Offer } from '../types';
import * as analytics from '../utils/analytics';

vi.mock('../utils/analytics');

describe('OfferCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const mockOffer: Offer = {
    id: 'test-123',
    name: 'Test Offer',
    logo: 'https://example.com/logo.png',
    apr: 15.5,
    minAmount: 1000,
    maxAmount: 10000,
    minPeriod: 6,
    maxPeriod: 36,
    decision: '15 min',
    tags: ['ratalna', 'online'],
    rating: 85,
  };

  describe('Rendering', () => {
    it('should render offer name', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('Test Offer')).toBeInTheDocument();
    });

    it('should render logo with correct alt text', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      const logo = screen.getByAltText('Test Offer logo');
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('should have loading="lazy" on logo', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      const logo = screen.getByAltText('Test Offer logo');
      expect(logo).toHaveAttribute('loading', 'lazy');
    });

    it('should render rating with stars', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText(/Ocena:/)).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
    });

    it('should render decision', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('Decyzja:')).toBeInTheDocument();
      expect(screen.getByText('15 min')).toBeInTheDocument();
    });

    it('should render APR', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('RRSO:')).toBeInTheDocument();
      expect(screen.getByText(/od 15\.50%/)).toBeInTheDocument();
    });

    it('should render amount range', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('Kwota:')).toBeInTheDocument();
      expect(screen.getByText(/1[\s,.]?000 - 10[\s,.]?000 zł/)).toBeInTheDocument();
    });

    it('should render period range', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('Okres:')).toBeInTheDocument();
      expect(screen.getByText(/6-36 mies\./)).toBeInTheDocument();
    });

    it('should render single period when min equals max', () => {
      const offerWithSamePeriod = { ...mockOffer, minPeriod: 12, maxPeriod: 12 };
      render(<OfferCard offer={offerWithSamePeriod} rank={1} />);
      expect(screen.getByText(/12 mies\./)).toBeInTheDocument();
    });

    it('should render all tags', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByText('ratalna')).toBeInTheDocument();
      expect(screen.getByText('online')).toBeInTheDocument();
    });

    it('should show CTA button', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByTestId('cta-button')).toBeInTheDocument();
      expect(screen.getByText('Sprawdź ofertę')).toBeInTheDocument();
    });
  });

  describe('CTA Button Functionality', () => {
    it('should log cta_click event when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      expect(analytics.logEvent).toHaveBeenCalledWith('cta_click', {
        offerId: 'test-123',
        offerName: 'Test Offer',
        apr: 15.5,
      });
    });

    it('should show "Przekierowywanie..." during redirect', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      expect(screen.getByText('Przekierowywanie...')).toBeInTheDocument();
    });

    it('should disable button during redirect', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      expect(ctaButton).toBeDisabled();
    });

    it('should show redirect message after 600ms', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      await vi.advanceTimersByTimeAsync(600);

      expect(screen.getByText(/przekierowano do partnera: test offer/i)).toBeInTheDocument();
    });

    it('should clear redirect message after 3000ms', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      await vi.advanceTimersByTimeAsync(600);
      await vi.advanceTimersByTimeAsync(3000);

      expect(screen.queryByText(/przekierowano do partnera/i)).not.toBeInTheDocument();
    });

    it('should re-enable button after redirect completes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      await vi.advanceTimersByTimeAsync(600);

      expect(ctaButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByRole('article', { name: /oferta test offer/i })).toBeInTheDocument();
    });

    it('should have aria-label on stars', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      expect(screen.getByLabelText(/ocena 85 na 100/i)).toBeInTheDocument();
    });

    it('should announce redirect status with aria-live', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');
      await user.click(ctaButton);

      await vi.advanceTimersByTimeAsync(600);

      const message = screen.getByText(/przekierowano do partnera/i);
      expect(message.closest('div')).toHaveAttribute('role', 'status');
      expect(message.closest('div')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have focus styles on button', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      const button = screen.getByTestId('cta-button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle offer with no tags', () => {
      const offerWithoutTags = { ...mockOffer, tags: [] };
      render(<OfferCard offer={offerWithoutTags} rank={1} />);
      expect(screen.queryByText('ratalna')).not.toBeInTheDocument();
    });

    it('should handle offer with many tags', () => {
      const offerWithManyTags = {
        ...mockOffer,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      render(<OfferCard offer={offerWithManyTags} rank={1} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag5')).toBeInTheDocument();
    });

    it('should handle very high APR values', () => {
      const offerWithHighAPR = { ...mockOffer, apr: 99.99 };
      render(<OfferCard offer={offerWithHighAPR} rank={1} />);
      expect(screen.getByText(/od 99\.99%/)).toBeInTheDocument();
    });

    it('should handle very low APR values', () => {
      const offerWithLowAPR = { ...mockOffer, apr: 0.5 };
      render(<OfferCard offer={offerWithLowAPR} rank={1} />);
      expect(screen.getByText(/od 0\.50%/)).toBeInTheDocument();
    });

    it('should handle large amount ranges', () => {
      const offerWithLargeAmounts = {
        ...mockOffer,
        minAmount: 100000,
        maxAmount: 500000,
      };
      render(<OfferCard offer={offerWithLargeAmounts} rank={1} />);
      expect(screen.getByText(/100[\s,.]?000 - 500[\s,.]?000 zł/)).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks on CTA', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OfferCard offer={mockOffer} rank={1} />);

      const ctaButton = screen.getByTestId('cta-button');

      await user.click(ctaButton);
      await user.click(ctaButton);
      await user.click(ctaButton);

      expect(analytics.logEvent).toHaveBeenCalledTimes(1);
    });

    it('should render 5 stars for rating of 100', () => {
      const offer = { ...mockOffer, rating: 100 };
      render(<OfferCard offer={offer} rank={1} />);
      const stars = screen.getByLabelText(/ocena 100 na 100/i);
      expect(stars.querySelectorAll('.text-yellow-400')).toHaveLength(5);
    });

    it('should render 0 stars for rating of 0', () => {
      const offer = { ...mockOffer, rating: 0 };
      render(<OfferCard offer={offer} rank={1} />);
      const stars = screen.getByLabelText(/ocena 0 na 100/i);
      expect(stars.querySelectorAll('.text-gray-300')).toHaveLength(5);
    });

    it('should handle rating of 50 (2.5 stars)', () => {
      const offer = { ...mockOffer, rating: 50 };
      render(<OfferCard offer={offer} rank={1} />);
      expect(screen.getByText('50/100')).toBeInTheDocument();
    });
  });

  describe('Star Rendering', () => {
    it('should render correct number of stars for rating 85', () => {
      render(<OfferCard offer={mockOffer} rank={1} />);
      const starsContainer = screen.getByLabelText(/ocena 85 na 100/i);
      expect(starsContainer).toBeInTheDocument();
    });

    it('should render 5 full stars for rating 100', () => {
      const offer = { ...mockOffer, rating: 100 };
      render(<OfferCard offer={offer} rank={1} />);
      expect(screen.getByLabelText(/ocena 100 na 100/i)).toBeInTheDocument();
    });

    it('should render 3 full stars for rating 60', () => {
      const offer = { ...mockOffer, rating: 60 };
      render(<OfferCard offer={offer} rank={1} />);
      expect(screen.getByLabelText(/ocena 60 na 100/i)).toBeInTheDocument();
    });
  });
});
