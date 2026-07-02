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
      // 1. Create the profile first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            full_name: driverData.full_name,
            phone: driverData.phone,
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Create the driver linked to the profile
      const { error: driverError } = await supabase.from("drivers").insert([
        {
          user_id: profile.id,
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
