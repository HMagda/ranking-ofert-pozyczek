import { useState, useEffect, useRef } from 'react';
import { logEvent } from '../utils/analytics';

interface InputFormProps {
  amount: number;
  period: number;
  onAmountChange: (amount: number) => void;
  onPeriodChange: (period: number) => void;
}

const MIN_AMOUNT = 200;
const MAX_AMOUNT = 150000;
const MIN_PERIOD = 1;
const MAX_PERIOD = 60;

export function InputForm({
  amount,
  period,
  onAmountChange,
  onPeriodChange,
}: InputFormProps) {
  const [amountError, setAmountError] = useState<string>('');
  const [periodError, setPeriodError] = useState<string>('');
  const amountLiveRef = useRef<HTMLDivElement>(null);
  const periodLiveRef = useRef<HTMLDivElement>(null);
  const previousAmountRef = useRef<number>(amount);
  const previousPeriodRef = useRef<number>(period);

  useEffect(() => {
    if (previousAmountRef.current === amount && previousAmountRef.current !== undefined) {
      return;
    }

    if (amountLiveRef.current) {
      amountLiveRef.current.textContent = '';
      void amountLiveRef.current.offsetHeight;
      setTimeout(() => {
        if (amountLiveRef.current) {
          amountLiveRef.current.textContent = `${amount}`;
        }
      }, 50);
    }

    previousAmountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    if (previousPeriodRef.current === period && previousPeriodRef.current !== undefined) {
      return;
    }

    if (periodLiveRef.current) {
      periodLiveRef.current.textContent = '';
      void periodLiveRef.current.offsetHeight;
      setTimeout(() => {
        if (periodLiveRef.current) {
          periodLiveRef.current.textContent = `${period}`;
        }
      }, 50);
    }

    previousPeriodRef.current = period;
  }, [period]);

  useEffect(() => {
    if (amount < MIN_AMOUNT) {
      setAmountError(`Minimalna kwota to ${MIN_AMOUNT} zł`);
    } else if (amount > MAX_AMOUNT) {
      setAmountError(`Maksymalna kwota to ${MAX_AMOUNT} zł`);
    } else {
      setAmountError('');
    }
  }, [amount]);

  useEffect(() => {
    if (period < MIN_PERIOD) {
      setPeriodError(`Minimalny okres to ${MIN_PERIOD} miesiąc`);
    } else if (period > MAX_PERIOD) {
      setPeriodError(`Maksymalny okres to ${MAX_PERIOD} miesięcy`);
    } else {
      setPeriodError('');
    }
  }, [period]);

  const handleAmountChange = (value: number) => {
    onAmountChange(value);
    logEvent('filter_change', { amount: value, period });
  };

  const handlePeriodChange = (value: number) => {
    onPeriodChange(value);
    logEvent('filter_change', { amount, period: value });
  };

  const incrementAmount = () => {
    const newAmount = Math.min(amount + 500, MAX_AMOUNT);
    handleAmountChange(newAmount);
  };

  const decrementAmount = () => {
    const newAmount = Math.max(amount - 500, MIN_AMOUNT);
    handleAmountChange(newAmount);
  };

  const incrementPeriod = () => {
    const newPeriod = Math.min(period + 1, MAX_PERIOD);
    handlePeriodChange(newPeriod);
  };

  const decrementPeriod = () => {
    const newPeriod = Math.max(period - 1, MIN_PERIOD);
    handlePeriodChange(newPeriod);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2
        className="text-xl font-semibold mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black rounded"
        tabIndex={0}
      >
        Ile potrzebujesz?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2 focus:outline-none focus:ring-2 focus:ring-black rounded"
            tabIndex={0}
          >
            Kwota (zł)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementAmount}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Zmniejsz kwotę"
            >
              −
            </button>
            <input
              id="amount"
              type="number"
              role="spinbutton"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="100"
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                amountError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-label="Kwota w złotych"
              aria-valuenow={amount}
              aria-valuemin={MIN_AMOUNT}
              aria-valuemax={MAX_AMOUNT}
              aria-valuetext={`${amount} złotych`}
              aria-invalid={!!amountError}
              aria-describedby={amountError ? 'amount-error amount-live' : 'amount-live'}
            />
            <button
              type="button"
              onClick={incrementAmount}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Zwiększ kwotę"
            >
              +
            </button>
          </div>
          <div
            id="amount-live"
            ref={amountLiveRef}
            className="sr-only"
            role="status"
            aria-live="assertive"
            aria-atomic="true"
          />
          {amountError && (
            <p id="amount-error" className="mt-1 text-sm text-red-600" role="alert">
              {amountError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700 mb-2 focus:outline-none focus:ring-2 focus:ring-black rounded"
            tabIndex={0}
          >
            Okres (miesięcy)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementPeriod}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Zmniejsz okres"
            >
              −
            </button>
            <input
              id="period"
              type="number"
              role="spinbutton"
              min={MIN_PERIOD}
              max={MAX_PERIOD}
              value={period}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
              className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                periodError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-label="Okres w miesiącach"
              aria-valuenow={period}
              aria-valuemin={MIN_PERIOD}
              aria-valuemax={MAX_PERIOD}
              aria-valuetext={`${period} miesięcy`}
              aria-invalid={!!periodError}
              aria-describedby={periodError ? 'period-error period-live' : 'period-live'}
            />
            <button
              type="button"
              onClick={incrementPeriod}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Zwiększ okres"
            >
              +
            </button>
          </div>
          <div
            id="period-live"
            ref={periodLiveRef}
            className="sr-only"
            role="status"
            aria-live="assertive"
            aria-atomic="true"
          />
          {periodError && (
            <p id="period-error" className="mt-1 text-sm text-red-600" role="alert">
              {periodError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
