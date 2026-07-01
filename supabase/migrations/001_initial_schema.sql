-- TMS Database Schema
-- Generated for Transport Management System

-- 1. Users & Roles
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text default 'passenger' check (role in ('super_admin', 'ops_manager', 'accountant', 'driver', 'passenger')),
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Drivers
create table drivers (
  id uuid references users(id) primary key,
  license_number text unique not null,
  license_expiry date not null,
  status text default 'available' check (status in ('available', 'on_trip', 'maintenance', 'grounded', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Vehicles
create table vehicles (
  id uuid default uuid_generate_v4() primary key,
  plate_number text unique not null,
  model text,
  capacity integer not null,
  status text default 'available' check (status in ('available', 'on_trip', 'maintenance', 'grounded')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Routes
create table routes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  origin text not null,
  destination text not null,
  distance_km numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Trips
create table trips (
  id uuid default uuid_generate_v4() primary key,
  route_id uuid references routes(id),
  driver_id uuid references drivers(id),
  vehicle_id uuid references vehicles(id),
  departure_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Bookings
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id),
  passenger_id uuid references users(id),
  seat_number text not null,
  status text default 'booked' check (status in ('booked', 'paid', 'cancelled', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table drivers enable row level security;
alter table vehicles enable row level security;
alter table routes enable row level security;
alter table trips enable row level security;
alter table bookings enable row level security;
