-- Create Supabase Storage Bucket for WhatsApp Media
-- Run this in Supabase SQL Editor

-- Create storage bucket for WhatsApp images
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload WhatsApp media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'whatsapp-media');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own WhatsApp media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'whatsapp-media');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own WhatsApp media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'whatsapp-media');

-- Allow public read access (so WhatsApp can display images)
CREATE POLICY "Public can view WhatsApp media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'whatsapp-media');
