-- =========== ENUMS ===========
CREATE TYPE public.app_role AS ENUM ('super_admin','ops_manager','accountant','driver','passenger');
CREATE TYPE public.vehicle_status AS ENUM ('available','on_trip','maintenance','grounded');
CREATE TYPE public.driver_status AS ENUM ('active','off_duty','suspended');
CREATE TYPE public.trip_status AS ENUM ('scheduled','boarding','in_transit','completed','cancelled');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled','expired');
CREATE TYPE public.payment_status AS ENUM ('pending','processing','success','failed','cancelled');
CREATE TYPE public.payment_provider AS ENUM ('mpesa','card','cash');

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========== USER ROLES (separate table for security) ===========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','ops_manager','accountant')
  );
$$;

-- Auto-create profile + default passenger role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'passenger');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== DRIVERS ===========
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_no TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  status public.driver_status NOT NULL DEFAULT 'active',
  rating NUMERIC(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drivers staff all" ON public.drivers FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "drivers self read" ON public.drivers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== VEHICLES ===========
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_no TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 100),
  status public.vehicle_status NOT NULL DEFAULT 'available',
  insurance_expiry DATE,
  inspection_expiry DATE,
  current_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT SELECT ON public.vehicles TO anon;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles public read" ON public.vehicles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vehicles staff write" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "vehicles staff update" ON public.vehicles FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "vehicles staff delete" ON public.vehicles FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== ROUTES ===========
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(6,2),
  duration_min INT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.routes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT ALL ON public.routes TO service_role;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes public read" ON public.routes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "routes staff write" ON public.routes FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "routes staff update" ON public.routes FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "routes staff delete" ON public.routes FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- =========== ROUTE STOPS ===========
CREATE TABLE public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sequence INT NOT NULL,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  UNIQUE(route_id, sequence)
);
GRANT SELECT ON public.route_stops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_stops TO authenticated;
GRANT ALL ON public.route_stops TO service_role;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stops public read" ON public.route_stops FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "stops staff write" ON public.route_stops FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- =========== TRIPS ===========
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  arrival_at TIMESTAMPTZ,
  base_fare NUMERIC(10,2) NOT NULL CHECK (base_fare >= 0),
  status public.trip_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_trips_departure ON public.trips(departure_at);
CREATE INDEX idx_trips_route ON public.trips(route_id);
GRANT SELECT ON public.trips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips public read" ON public.trips FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trips staff write" ON public.trips FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "trips staff update" ON public.trips FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR (driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = trips.driver_id AND d.user_id = auth.uid())));
CREATE POLICY "trips staff delete" ON public.trips NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  arrival_at TIMESTAMPTZ,
  base_fare NUMERIC(10,2) NOT NULL CHECK (base_fare >= 0),
  status public.trip_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips public read" ON public.trips FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trips staff write" ON public.trips FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "trips staff update" ON public.trips FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR (driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = trips.driver_id AND d.user_id = auth.uid())));
CREATE POLICY "trips staff delete" ON public.trips FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_trips_updated BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== BOOKINGS ===========
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seat_numbers INT[] NOT NULL CHECK (array_length(seat_numbers,1) > 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  status public.booking_status NOT NULL DEFAULT 'pending',
  booking_code TEXT NOT NULL UNIQUE,
  passenger_phone TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_passenger ON public.bookings(passenger_id);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings own read" ON public.bookings FOR SELECT TO authenticated
  USING (passenger_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings own update" ON public.bookings FOR UPDATE TO authenticated
  USING (passenger_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Atomic seat booking function: prevents double-booking via row lock
CREATE OR REPLACE FUNCTION public.book_seats(
  _trip_id UUID,
  _seats INT[],
  _phone TEXT
) RETURNS TABLE(booking_id UUID, booking_code TEXT, total NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_fare NUMERIC;
  v_capacity INT;
  v_taken INT[];
  v_code TEXT;
  v_id UUID;
  v_total NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  -- Lock the trip row
  SELECT t.base_fare, v.capacity INTO v_fare, v_capacity
  FROM public.trips t
  JOIN public.vehicles v ON v.id = t.vehicle_id
  WHERE t.id = _trip_id AND t.status = 'scheduled'
  FOR UPDATE OF t;
  IF v_fare IS NULL THEN RAISE EXCEPTION 'TRIP_UNAVAILABLE'; END IF;

  -- Validate seat numbers
  IF EXISTS (SELECT 1 FROM unnest(_seats) s WHERE s < 1 OR s > v_capacity) THEN
    RAISE EXCEPTION 'INVALID_SEAT';
  END IF;

  -- Collect taken seats (active bookings only)
  SELECT COALESCE(array_agg(DISTINCT s), ARRAY[]::INT[])
  INTO v_taken
  FROM public.bookings b, unnest(b.seat_numbers) s
  WHERE b.trip_id = _trip_id
    AND (b.status = 'confirmed'
         OR (b.status = 'pending' AND b.expires_at > now()));

  IF EXISTS (SELECT 1 FROM unnest(_seats) s WHERE s = ANY(v_taken)) THEN
    RAISE EXCEPTION 'SEAT_TAKEN';
  END IF;

  v_total := v_fare * array_length(_seats, 1);
  v_code := 'TMS-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  INSERT INTO public.bookings (trip_id, passenger_id, seat_numbers, total_amount, booking_code, passenger_phone)
  VALUES (_trip_id, auth.uid(), _seats, v_total, v_code, _phone)
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_code, v_total;
END; $$;

GRANT EXECUTE ON FUNCTION public.book_seats(UUID, INT[], TEXT) TO authenticated;

-- =========== TICKETS ===========
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  qr_payload TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets own read" ON public.tickets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = tickets.booking_id AND (b.passenger_id = auth.uid() OR public.is_staff(auth.uid())))
);

-- =========== PAYMENTS ===========
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider public.payment_provider NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  phone TEXT,
  mpesa_checkout_id TEXT,
  mpesa_receipt TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_checkout ON public.payments(mpesa_checkout_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments own read" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payments.booking_id AND (b.passenger_id = auth.uid() OR public.is_staff(auth.uid())))
);
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== GPS PINGS ===========
CREATE TABLE public.gps_pings (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  speed NUMERIC(6,2),
  heading NUMERIC(6,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gps_trip_time ON public.gps_pings(trip_id, recorded_at DESC);
GRANT SELECT, INSERT ON public.gps_pings TO authenticated;
GRANT USAGE ON SEQUENCE public.gps_pings_id_seq TO authenticated;
GRANT ALL ON public.gps_pings TO service_role;
ALTER TABLE public.gps_pings ENABLE ROW LEVEL SECURITY;
-- Any authenticated user can read pings for a trip they have a booking on, or staff, or the driver
CREATE POLICY "pings read" ON public.gps_pings FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.trip_id = gps_pings.trip_id AND b.passenger_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.drivers d JOIN public.trips t ON t.driver_id = d.id WHERE t.id = gps_pings.trip_id AND d.user_id = auth.uid())
);
CREATE POLICY "pings driver insert" ON public.gps_pings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers d JOIN public.trips t ON t.driver_id = d.id WHERE t.id = trip_id AND d.user_id = auth.uid())
);

-- Enable Realtime on booking status, payments, and gps
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_pings;

-- =========== AUDIT LOGS ===========
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit staff read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
