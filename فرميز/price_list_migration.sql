-- ===================================================
-- Migration: Add image_url column to price_list table
-- Run this in Supabase SQL Editor
-- ===================================================

ALTER TABLE price_list 
ADD COLUMN IF NOT EXISTS image_url TEXT;
