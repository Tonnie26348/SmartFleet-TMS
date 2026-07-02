import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/route";

export const routesQO = queryOptions({
  queryKey: ["routes"],
  queryFn: async () => {
    const { data, error } = await supabase.from("routes").select("*");
    if (error) throw error;
    return (data ?? []) as Route[];
  },
});

export const useRoutes = () => {
  const queryClient = useQueryClient();
  const query = useQuery(routesQO);

  const addRouteMutation = useMutation({
    mutationFn: async (route: Omit<Route, "id" | "created_at">) => {
      const { error } = await supabase.from("routes").insert([route]);
      if (error) throw error;
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return {
    routes: query.data ?? [],
    loading: query.isLoading,
    addRoute: addRouteMutation.mutateAsync,
    isAdding: addRouteMutation.isPending,
  };
};
