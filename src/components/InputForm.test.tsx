import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from './InputForm';
import * as analytics from '../utils/analytics';

vi.mock('../utils/analytics');

describe('InputForm', () => {
  const mockOnAmountChange = vi.fn();
  const mockOnPeriodChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    amount: 5000,
    period: 12,
    onAmountChange: mockOnAmountChange,
    onPeriodChange: mockOnPeriodChange,
  };

  describe('Rendering', () => {
    it('should render form with initial values', () => {
      render(<InputForm {...defaultProps} />);

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });

      expect(amountInput).toHaveValue(5000);
      expect(periodInput).toHaveValue(12);
    });

    it('should render heading', () => {
      render(<InputForm {...defaultProps} />);

      expect(screen.getByText(/ile potrzebujesz/i)).toBeInTheDocument();
    });

    it('should render increment and decrement buttons', () => {
      render(<InputForm {...defaultProps} />);

      const incrementButtons = screen.getAllByRole('button', { name: /zwiększ/i });
      const decrementButtons = screen.getAllByRole('button', { name: /zmniejsz/i });

      expect(incrementButtons).toHaveLength(2); // Amount and period
      expect(decrementButtons).toHaveLength(2);
    });
  });

  describe('Amount Input', () => {
    it('should call onAmountChange when amount input changes', () => {
      render(<InputForm {...defaultProps} />);

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      fireEvent.change(amountInput, { target: { value: '10000' } });

      expect(mockOnAmountChange).toHaveBeenCalledWith(10000);
    });

    it('should increment amount by 500 when + button clicked', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ kwotę/i })[0];
      await user.click(incrementButton);

      expect(mockOnAmountChange).toHaveBeenCalledWith(5500);
    });

    it('should decrement amount by 500 when - button clicked', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const decrementButton = screen.getByRole('button', { name: /zmniejsz kwotę/i });
      await user.click(decrementButton);

      expect(mockOnAmountChange).toHaveBeenCalledWith(4500);
    });

    it('should not decrement below minimum amount (200)', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} amount={200} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const decrementButton = screen.getByRole('button', { name: /zmniejsz kwotę/i });
      await user.click(decrementButton);

      expect(mockOnAmountChange).toHaveBeenCalledWith(200);
    });

    it('should not increment above maximum amount (150000)', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} amount={150000} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ kwotę/i })[0];
      await user.click(incrementButton);

      expect(mockOnAmountChange).toHaveBeenCalledWith(150000);
    });

    it('should log filter_change event when amount changes', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ kwotę/i })[0];
      await user.click(incrementButton);

      expect(analytics.logEvent).toHaveBeenCalledWith('filter_change', {
        amount: 5500,
        period: 12,
      });
    });
  });

  describe('Period Input', () => {
    it('should call onPeriodChange when period input changes', () => {
      render(<InputForm {...defaultProps} />);

      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });
      fireEvent.change(periodInput, { target: { value: '24' } });

      expect(mockOnPeriodChange).toHaveBeenCalledWith(24);
    });

    it('should increment period by 1 when + button clicked', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ okres/i })[0];
      await user.click(incrementButton);

      expect(mockOnPeriodChange).toHaveBeenCalledWith(13);
    });

    it('should decrement period by 1 when - button clicked', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const decrementButton = screen.getByRole('button', { name: /zmniejsz okres/i });
      await user.click(decrementButton);

      expect(mockOnPeriodChange).toHaveBeenCalledWith(11);
    });

    it('should not decrement below minimum period (1)', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} amount={5000} period={1} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const decrementButton = screen.getByRole('button', { name: /zmniejsz okres/i });
      await user.click(decrementButton);

      expect(mockOnPeriodChange).toHaveBeenCalledWith(1);
    });

    it('should not increment above maximum period (60)', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} amount={5000} period={60} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ okres/i })[0];
      await user.click(incrementButton);

      expect(mockOnPeriodChange).toHaveBeenCalledWith(60);
    });

    it('should log filter_change event when period changes', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const incrementButton = screen.getAllByRole('button', { name: /zwiększ okres/i })[0];
      await user.click(incrementButton);

      expect(analytics.logEvent).toHaveBeenCalledWith('filter_change', {
        amount: 5000,
        period: 13,
      });
    });
  });

  describe('Validation', () => {
    it('should show error when amount is below 200', () => {
      render(<InputForm {...defaultProps} amount={100} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      expect(screen.getByText(/minimalna kwota to 200 zł/i)).toBeInTheDocument();
    });

    it('should show error when amount is above 150000', () => {
      render(<InputForm {...defaultProps} amount={200000} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      expect(screen.getByText(/maksymalna kwota to 150000 zł/i)).toBeInTheDocument();
    });

    it('should show error when period is below 1', () => {
      render(<InputForm {...defaultProps} amount={5000} period={0} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      expect(screen.getByText(/minimalny okres to 1 miesiąc/i)).toBeInTheDocument();
    });

    it('should show error when period is above 60', () => {
      render(<InputForm {...defaultProps} amount={5000} period={70} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      expect(screen.getByText(/maksymalny okres to 60 miesięcy/i)).toBeInTheDocument();
    });

    it('should not show error when values are valid', () => {
      render(<InputForm {...defaultProps} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should set aria-invalid when amount is invalid', () => {
      render(<InputForm {...defaultProps} amount={100} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const amountInput = screen.getByLabelText(/kwota/i);
      expect(amountInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-invalid when period is invalid', () => {
      render(<InputForm {...defaultProps} amount={5000} period={100} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const periodInput = screen.getByRole('spinbutton', { name: /okres/i });
      expect(periodInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<InputForm {...defaultProps} />);

      expect(screen.getByLabelText(/kwota \(zł\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/okres \(miesięcy\)/i)).toBeInTheDocument();
    });

    it('should have aria-describedby when error is shown', () => {
      render(<InputForm {...defaultProps} amount={100} period={12} onAmountChange={mockOnAmountChange} onPeriodChange={mockOnPeriodChange} />);

      const amountInput = screen.getByLabelText(/kwota/i);
      expect(amountInput).toHaveAttribute('aria-describedby', 'amount-error amount-live');
    });

    it('should have aria-labels for stepper buttons', () => {
      render(<InputForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /zmniejsz kwotę/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /zwiększ kwotę/i })[0]).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zmniejsz okres/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /zwiększ okres/i })[0]).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-numeric input gracefully', () => {
      render(<InputForm {...defaultProps} />);

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      fireEvent.change(amountInput, { target: { value: '' } });

      expect(mockOnAmountChange).toHaveBeenCalledWith(0);
    });

    it('should handle decimal values in amount', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const amountInput = screen.getByLabelText(/kwota/i);
      await user.clear(amountInput);
      await user.type(amountInput, '5000.50');

      expect(mockOnAmountChange).toHaveBeenCalledWith(5000.5);
    });

    it('should handle very large numbers', () => {
      render(<InputForm {...defaultProps} />);

      const amountInput = screen.getByRole('spinbutton', { name: /kwota/i });
      fireEvent.change(amountInput, { target: { value: '999999999' } });

      expect(mockOnAmountChange).toHaveBeenCalledWith(999999999);
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      render(<InputForm {...defaultProps} />);

      const incrementButton = screen.getByRole('button', { name: /zwiększ kwotę/i });

      await user.click(incrementButton);
      await user.click(incrementButton);
      await user.click(incrementButton);

      expect(mockOnAmountChange).toHaveBeenCalledTimes(3);
      expect(mockOnAmountChange).toHaveBeenLastCalledWith(5500);
    });
  });
});
