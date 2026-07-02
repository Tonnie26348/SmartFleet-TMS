import { useState, useEffect } from "react";
import { subscribeToTripLocation } from "@/utils/integrations-api";

export function useTripLocation(tripId: string | undefined) {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
  } | null>(null);

  useEffect(() => {
    if (!tripId) return;

    const subscription = subscribeToTripLocation(tripId, (newLocation) => {
      setLocation(newLocation);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [tripId]);

  return { location };
}
