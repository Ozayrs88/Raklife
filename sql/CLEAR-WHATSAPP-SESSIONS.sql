-- Clear all WhatsApp sessions to start fresh
-- Run this in Supabase SQL Editor

DELETE FROM whatsapp_sessions;

-- Verify it's cleared
SELECT COUNT(*) as remaining_sessions FROM whatsapp_sessions;
