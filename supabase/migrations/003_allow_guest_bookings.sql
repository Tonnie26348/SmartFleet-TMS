-- Migration to allow guest bookings
-- 1. Make passenger_id nullable in bookings table
ALTER TABLE public.bookings ALTER COLUMN passenger_id DROP NOT NULL;

-- 2. Update book_seats function to allow NULL passenger_id for guests
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
  v_user_id UUID;
BEGIN
  -- Get current user if authenticated, otherwise NULL
  v_user_id := auth.uid();

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
  VALUES (_trip_id, v_user_id, _seats, v_total, v_code, _phone)
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_code, v_total;
END; $$;
