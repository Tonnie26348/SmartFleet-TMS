import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trip";

export const tripsQO = queryOptions({
  queryKey: ["trips"],
  queryFn: async () => {
    const { data, error } = await supabase.from("trips").select("*");
    if (error) throw error;
    return (data ?? []) as Trip[];
  },
});

export const useTrips = () => {
  const queryClient = useQueryClient();
  const query = useQuery(tripsQO);

  const addTripMutation = useMutation({
    mutationFn: async (trip: Omit<Trip, "id" | "created_at">) => {
      const { error } = await supabase.from("trips").insert([trip]);
      if (error) throw error;
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  return {
    trips: query.data ?? [],
    loading: query.isLoading,
    addTrip: addTripMutation.mutateAsync,
    isAdding: addTripMutation.isPending,
  };
};
