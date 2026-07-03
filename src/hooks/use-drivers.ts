import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Driver } from "@/types/driver";

export const driversQO = queryOptions({
  queryKey: ["drivers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("drivers").select(`*`);
    if (error) throw error;
    return (data ?? []) as any[];
  },
});

export const useDrivers = () => {
  const queryClient = useQueryClient();
  const query = useQuery(driversQO);

  const addDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      // Insert driver directly. A profile is not required unless the driver needs to log in.
      const { error: driverError } = await supabase.from("drivers").insert([
        {
          full_name: driverData.full_name,
          phone: driverData.phone,
          license_no: driverData.license_no,
          license_expiry: driverData.license_expiry,
        },
      ]);

      if (driverError) throw driverError;

      return driverData;
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
