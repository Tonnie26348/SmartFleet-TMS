-- Migration to remove redundant fields from drivers and cleanup
-- This should be run against the database

ALTER TABLE public.drivers DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.drivers DROP COLUMN IF EXISTS phone;
