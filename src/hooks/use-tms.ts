import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Driver, Route, Trip } from "@/types/tms";

// Driver Hook with safe SSR handling
export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('drivers').select('*');
        if (error) throw error;
        setDrivers(data as Driver[]);
      } catch (err) {
        console.error("SSR Safe Error (drivers):", err);
      }
    };
    fetchData();
  }, []);
  return { drivers };
};

// Route Hook with safe SSR handling
export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('routes').select('*');
        if (error) throw error;
        setRoutes(data as Route[]);
      } catch (err) {
        console.error("SSR Safe Error (routes):", err);
      }
    };
    fetchData();
  }, []);
  return { routes };
};

// Trip Hook with safe SSR handling
export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('trips').select('*');
        if (error) throw error;
        setTrips(data as Trip[]);
      } catch (err) {
        console.error("SSR Safe Error (trips):", err);
      }
    };
    fetchData();
  }, []);
  return { trips };
};
