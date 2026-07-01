import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) throw error;
      setVehicles(data as Vehicle[]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('vehicles').insert([vehicle]);
    if (error) throw error;
    fetchVehicles();
  };

  return { vehicles, loading, addVehicle };
};
