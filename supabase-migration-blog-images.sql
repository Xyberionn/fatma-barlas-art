-- Migration: Add multi-image support to blog posts
-- Date: 2026-01-08
-- Description: Adds images TEXT[] column to blogs table for storing multiple images per post

-- Add images column (array of image URLs)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS images TEXT[];

-- Migrate existing single image_url to images array
-- Only update rows where image_url exists and images is null
UPDATE blogs
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN blogs.images IS 'Array of image URLs for blog post carousel (max 5 images)';

-- Note: We keep the image_url column for backward compatibility
-- It can be dropped later after confirming all data is migrated successfully
