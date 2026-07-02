-- Migration to implement Fare Matrix, Maintenance Logs, and Manifest enhancements

-- =========== FARE MATRIX ===========
CREATE TYPE public.fare_category AS ENUM ('standard', 'peak', 'holiday');

CREATE TABLE public.fare_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  category public.fare_category NOT NULL DEFAULT 'standard',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(route_id, category, day_of_week, start_time)
);

GRANT SELECT ON public.fare_matrix TO anon, authenticated;
GRANT ALL ON public.fare_matrix TO service_role;
ALTER TABLE public.fare_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fares public read" ON public.fare_matrix FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "fares staff write" ON public.fare_matrix FOR ALL TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_fares_updated BEFORE UPDATE ON public.fare_matrix FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== VEHICLE MAINTENANCE ===========
CREATE TABLE public.vehicle_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  cost NUMERIC(10,2),
  notes TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_maintenance TO authenticated;
GRANT ALL ON public.vehicle_maintenance TO service_role;
ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance staff all" ON public.vehicle_maintenance FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- =========== TRIP MANIFEST ENHANCEMENTS ===========
-- Add a status to tickets to differentiate between just 'checked in' and 'boarded'
ALTER TABLE public.tickets ADD COLUMN status TEXT DEFAULT 'issued';
-- Possible values: 'issued', 'boarded', 'no-show', 'cancelled'

-- Update RLS for tickets to allow drivers to update check-in status
CREATE POLICY "tickets driver update" ON public.tickets FOR UPDATE TO authenticated
  USING (
    public.is_staff(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM public.trips t 
      JOIN public.drivers d ON t.driver_id = d.id 
      WHERE t.id = (SELECT trip_id FROM public.bookings WHERE id = tickets.booking_id) 
      AND d.user_id = auth.uid()
    )
  );
