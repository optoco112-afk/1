-- Setup Daily Reservation Summary Cron Job
-- This will run every day at midnight UTC (00:00)

-- First, ensure the pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing cron job with the same name
SELECT cron.unschedule('daily-reservation-summary') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-reservation-summary'
);

-- Create the cron job to run daily at midnight UTC
-- Change the time if you want a different timezone:
-- For Greece (UTC+2): use '0 22 * * *' (10 PM UTC = midnight Greece)
-- For other timezones, calculate accordingly
SELECT cron.schedule(
  'daily-reservation-summary',  -- Job name
  '0 0 * * *',                 -- Cron expression (midnight UTC)
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/daily-reservation-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := jsonb_build_object(
      'source', 'cron_job',
      'timestamp', now()
    )
  );
  $$
);

-- Verify the cron job was created
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'daily-reservation-summary';

-- To check cron job history later, use:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-reservation-summary')
-- ORDER BY start_time DESC LIMIT 10;