import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Driver } from "@/types/driver";

export const driversQO = queryOptions({
  queryKey: ["drivers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("drivers").select("*");
    if (error) throw error;
    return (data ?? []) as Driver[];
  },
});

export const useDrivers = () => {
  const queryClient = useQueryClient();
  const query = useQuery(driversQO);

  const addDriverMutation = useMutation({
    mutationFn: async (driver: Omit<Driver, "id" | "created_at">) => {
      const { error } = await supabase.from("drivers").insert([driver]);
      if (error) throw error;
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  return {
    drivers: query.data ?? [],
    loading: query.isLoading,
    addDriver: addDriverMutation.mutateAsync,
    isAdding: addDriverMutation.isPending,
  };
};
