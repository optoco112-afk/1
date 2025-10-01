/*
  # Setup automated daily summary cron job

  1. Cron Job Setup
    - Create a cron job that runs daily at midnight (00:00 UTC)
    - The job will call the daily-reservation-summary function
    - Uses pg_cron extension for scheduling

  2. Security
    - Cron job runs with service role permissions
    - Ensures reliable execution every day

  3. Notes
    - Time is in UTC, adjust if needed for local timezone
    - Cron expression: '0 0 * * *' means every day at midnight
    - The job will automatically send daily summaries to Telegram
*/

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing cron job with the same name
SELECT cron.unschedule('daily-reservation-summary');

-- Schedule the daily summary to run every day at midnight UTC
-- Adjust the time if you need it to run at a different hour
SELECT cron.schedule(
  'daily-reservation-summary',
  '0 0 * * *', -- Every day at midnight UTC (00:00)
  $$
  SELECT
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/cron-daily-summary',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'source', 'cron',
        'timestamp', now()
      )
    );
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'daily-reservation-summary';