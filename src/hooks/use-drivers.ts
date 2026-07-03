import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      // Call the RPC function to bypass SDK schema cache
      const { error } = await supabase.rpc("add_driver_rpc", {
        p_full_name: driverData.full_name,
        p_phone: driverData.phone,
        p_license_no: driverData.license_no,
        p_license_expiry: driverData.license_expiry,
      });

      if (error) throw error;
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
