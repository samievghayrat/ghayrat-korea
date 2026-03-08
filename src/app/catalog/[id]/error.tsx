'use client';

export default function CarDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-500 mb-8">
        Failed to load car details. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/" className="btn-outline inline-block">
          Back to catalog
        </a>
      </div>
    </div>
  );
}
