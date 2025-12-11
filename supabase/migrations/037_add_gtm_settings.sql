-- Add Google Tag Manager fields to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS google_tag_manager_header TEXT,
ADD COLUMN IF NOT EXISTS google_tag_manager_body TEXT;
