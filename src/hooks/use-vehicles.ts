import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";

export const vehiclesQO = queryOptions({
  queryKey: ["vehicles"],
  queryFn: async () => {
    const { data, error } = await supabase.from("vehicles").select("*");
    if (error) throw error;
    return (data ?? []) as Vehicle[];
  },
});

export const useVehicles = () => {
  const queryClient = useQueryClient();
  const query = useQuery(vehiclesQO);

  const addVehicleMutation = useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, "id" | "created_at">) => {
      const { error } = await supabase.from("vehicles").insert([vehicle]);
      if (error) throw error;
      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  return {
    vehicles: query.data ?? [],
    loading: query.isLoading,
    addVehicle: addVehicleMutation.mutateAsync,
    isAdding: addVehicleMutation.isPending,
  };
};
