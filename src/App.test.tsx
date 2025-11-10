import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './utils/api';
import * as analytics from './utils/analytics';
import type { Offer } from './types';

vi.mock('./utils/api', async () => {
  const actual = await vi.importActual<typeof api>('./utils/api');
  return {
    ...actual,
    fetchOffers: vi.fn(),
  };
});
vi.mock('./utils/analytics');

const mockOffers: Offer[] = [
  {
    id: '1',
    name: 'Test Offer A',
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
    name: 'Test Offer B',
    logo: 'logo-b.png',
    apr: 89.9,
    minAmount: 200,
    maxAmount: 5000,
    minPeriod: 1,
    maxPeriod: 12,
    decision: 'online',
    tags: ['chwilówka', '30 dni'],
    rating: 70,
  },
];

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchOffers).mockResolvedValue(mockOffers);
  });

  describe('Initial Loading', () => {
    it('should show loading skeleton on mount', () => {
      render(<App />);

      expect(screen.getByLabelText(/ładowanie ofert/i)).toBeInTheDocument();
    });

    it('should fetch offers on mount', () => {
      render(<App />);

      expect(api.fetchOffers).toHaveBeenCalledTimes(1);
    });

    it('should log view_list event after successful load', async () => {
      render(<App />);

      await waitFor(() => {
        expect(analytics.logEvent).toHaveBeenCalledWith('view_list', {
          count: 2,
        });
      });
    });

    it('should display offers after loading', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
        expect(screen.getByText('Test Offer B')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when fetch fails', async () => {
      vi.mocked(api.fetchOffers).mockRejectedValue(new Error('Network error'));
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/wystąpił błąd/i)).toBeInTheDocument();
      });
    });

    it('should show error message', async () => {
      vi.mocked(api.fetchOffers).mockRejectedValue(new Error('Custom error message'));
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(api.fetchOffers).mockRejectedValue(new Error('Error'));
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/spróbuj ponownie/i)).toBeInTheDocument();
      });
    });

    it('should retry fetching when retry button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.fetchOffers)
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockOffers);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/wystąpił błąd/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByText(/spróbuj ponownie/i);
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(api.fetchOffers).mockRejectedValue('String error');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/nie udało się pobrać ofert/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering Integration', () => {
    it('should filter offers when amount changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      await user.clear(amountInput);
      await user.type(amountInput, '500');

      await waitFor(() => {
        expect(screen.queryByText('Test Offer A')).not.toBeInTheDocument();
        expect(screen.getByText('Test Offer B')).toBeInTheDocument();
      });
    });

    it('should filter offers when period changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });
      await user.clear(periodInput);
      await user.type(periodInput, '1');

      await waitFor(() => {
        expect(screen.queryByText('Test Offer A')).not.toBeInTheDocument();
        expect(screen.getByText('Test Offer B')).toBeInTheDocument();
      });
    });

    it('should update offers count when filtering', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/znaleziono/i)).toBeInTheDocument();
        expect(screen.getByText((_content, element) => {
          return element?.textContent === 'Znaleziono 2 oferty';
        })).toBeInTheDocument();
      });

      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });
      await user.clear(periodInput);
      await user.type(periodInput, '1');

      await waitFor(() => {
        expect(screen.getByText((_content, element) => {
          return element?.textContent === 'Znaleziono 1 ofertę';
        })).toBeInTheDocument();
      });
    });
  });

  describe('Tag Filtering Integration', () => {
    it('should filter by selected tags', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      await user.click(screen.getByText(/filtry/i));

      await user.click(screen.getByRole('button', { name: 'chwilówka' }));

      await waitFor(() => {
        expect(screen.queryByText('Test Offer A')).not.toBeInTheDocument();
        expect(screen.getByText('Test Offer B')).toBeInTheDocument();
      });
    });

    it('should show all offers when no tags selected', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText(/test offer/i)).toHaveLength(2);
      });
    });
  });

  describe('Sorting Integration', () => {
    it('should sort offers by rating by default', async () => {
      render(<App />);

      await waitFor(() => {
        const offers = screen.getAllByText(/test offer/i);
        expect(offers[0]).toHaveTextContent('Test Offer A');
        expect(offers[1]).toHaveTextContent('Test Offer B');
      });
    });

    it('should update sort when sort button clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Najniższe RRSO'));

      const offers = screen.getAllByText(/test offer/i);
      expect(offers[0]).toHaveTextContent('Test Offer A');
      expect(offers[1]).toHaveTextContent('Test Offer B');
    });
  });

  describe('Form State Management', () => {
    it('should maintain form values across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i }) as HTMLInputElement;
      await user.clear(amountInput);
      await user.type(amountInput, '3000');

      rerender(<App />);

      expect(amountInput.value).toBe('3000');
    });

    it('should start with default values', async () => {
      render(<App />);

      await waitFor(() => {
        const amountInput = screen.getByRole('spinbutton', { name: /kwota/i }) as HTMLInputElement;
        const periodInput = screen.getByRole('spinbutton', { name: /okres/i }) as HTMLInputElement;

        expect(amountInput.value).toBe('5000');
        expect(periodInput.value).toBe('12');
      });
    });
  });

  describe('Full User Journey', () => {
    it('should complete full filtering and sorting flow', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText(/test offer/i)).toHaveLength(2);
      });

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      await user.clear(amountInput);
      await user.type(amountInput, '2000');

      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });
      await user.clear(periodInput);
      await user.type(periodInput, '12');

      await user.click(screen.getByText(/filtry/i));

      await user.click(screen.getByRole('button', { name: 'ratalna' }));

      await user.click(screen.getByText('Najniższe RRSO'));

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
        expect(screen.queryByText('Test Offer B')).not.toBeInTheDocument();
      });
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });

      await user.clear(amountInput);
      await user.type(amountInput, '1000');
      await user.clear(amountInput);
      await user.type(amountInput, '2000');
      await user.clear(amountInput);
      await user.type(amountInput, '3000');

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ranking ofert pożyczek/i })).toBeInTheDocument();
      });
    });

    it('should have header, main, and footer landmarks', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument(); // header
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      });
    });

    it('should show form above offers list', async () => {
      render(<App />);

      await waitFor(() => {
        const form = screen.getByRole('spinbutton', { name: /kwota/i }).closest('div');
        const list = screen.getAllByRole('list')[0];

        expect(form?.compareDocumentPosition(list)).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty offers array', async () => {
      vi.mocked(api.fetchOffers).mockResolvedValue([]);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/nie znaleziono ofert/i)).toBeInTheDocument();
      });
    });

    it('should handle offers with invalid data gracefully', async () => {
      const invalidOffers = [
        {
          ...mockOffers[0],
          minAmount: -1,
          maxAmount: -1,
        },
      ];
      vi.mocked(api.fetchOffers).mockResolvedValue(invalidOffers as Offer[]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should handle very large number of offers', async () => {
      const manyOffers = Array.from({ length: 100 }, (_, i) => ({
        ...mockOffers[0],
        id: `offer-${i}`,
        name: `Offer ${i}`,
      }));

      vi.mocked(api.fetchOffers).mockResolvedValue(manyOffers);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText((_content, element) => {
          return element?.textContent === 'Znaleziono 100 ofert';
        })).toBeInTheDocument();
      });
    });

    it('should not crash when filter results in no matches', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      await user.clear(amountInput);
      await user.type(amountInput, '999999');

      await waitFor(() => {
        expect(screen.getByText(/nie znaleziono ofert/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-fetch on filter changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Offer A')).toBeInTheDocument();
      });

      vi.clearAllMocks();

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      await user.clear(amountInput);
      await user.type(amountInput, '2000');

      expect(api.fetchOffers).not.toHaveBeenCalled();
    });
  });
});
