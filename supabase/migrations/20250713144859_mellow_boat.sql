/*
  # Setup Daily Reservation Summary Cron Job

  1. Cron Job Setup
    - Creates a cron job that runs daily at midnight (00:00 UTC)
    - Calls the daily-reservation-summary edge function
    - Uses pg_cron extension for scheduling

  2. Configuration
    - Runs every day at 00:00 UTC
    - Automatically triggers the daily summary function
    - Handles timezone considerations

  3. Notes
    - Requires pg_cron extension to be enabled
    - May require Supabase Pro plan or higher
    - Adjust timezone as needed for your location
*/

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing cron job with the same name
SELECT cron.unschedule('daily-reservation-summary');

-- Schedule the daily reservation summary to run at midnight UTC every day
-- Format: '0 0 * * *' = minute hour day month day_of_week
-- This runs at 00:00 UTC every day
SELECT cron.schedule(
  'daily-reservation-summary',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/daily-reservation-summary',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'source', 'cron',
        'timestamp', now()
      )
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'daily-reservation-summary';