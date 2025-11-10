interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <svg
        className="mx-auto h-16 w-16 text-red-600 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Wystąpił błąd
      </h3>

      <p className="text-gray-600 mb-6">{message}</p>

      <button
        onClick={onRetry}
        className="px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
