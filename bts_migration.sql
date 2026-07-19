-- ===================================================
-- Migration: Add orientation and sort_order to bts_videos
-- Run this in Supabase SQL Editor
-- ===================================================

ALTER TABLE bts_videos 
ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'horizontal',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
