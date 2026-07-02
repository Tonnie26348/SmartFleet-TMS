-- Migration to resolve Trip-Vehicle-Driver Triangle conflict
-- Remove current_driver_id from vehicles as the source of truth is the trips table

ALTER TABLE public.vehicles DROP COLUMN IF EXISTS current_driver_id;
