export type CarDestination = 'russia' | 'tajikistan';

/** An explicit country choice wins; otherwise select the car's year-based default. */
export function getCarDeliveryDestination(
  year: number | undefined,
  requestedDestination?: string | null,
): CarDestination {
  if (requestedDestination === 'russia' || requestedDestination === 'tajikistan') {
    return requestedDestination;
  }

  if (year !== undefined && year >= 2014 && year < 2021) return 'tajikistan';

  // Keep the existing fallback for older cars and cars whose year is unavailable.
  return 'russia';
}
