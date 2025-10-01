# Daily Scheduler Setup Guide

## 🕛 Automatic Daily Reservations at 00:00 UTC

### What This Does
- **Automatically sends daily reservation summary** every day at 00:00 UTC (midnight)
- **Uses external cron service** to trigger the scheduler
- **No manual intervention needed** - runs automatically

### Setup Steps

#### Step 1: External Cron Service Setup
Since Supabase doesn't have built-in cron jobs, we need to use an external service to ping our scheduler every minute.

**Option A: Cron-job.org (Recommended - Free)**
1. Go to https://cron-job.org
2. Sign up for free account
3. Create new cron job:
   - **Title**: "Krampus Tattoo Daily Scheduler"
   - **URL**: `https://[YOUR_PROJECT_ID].supabase.co/functions/v1/daily-scheduler`
   - **Schedule**: `* * * * *` (every minute)
   - **Request Method**: POST
   - **Headers**: 
     - `Authorization: Bearer [YOUR_SUPABASE_ANON_KEY]`
     - `Content-Type: application/json`
4. Save and enable the cron job

**Option B: UptimeRobot (Alternative)**
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://[YOUR_PROJECT_ID].supabase.co/functions/v1/daily-scheduler`
   - **Monitoring Interval**: 1 minute
   - **Request Method**: POST
   - **Request Headers**: 
     - `Authorization: Bearer [YOUR_SUPABASE_ANON_KEY]`
     - `Content-Type: application/json`

**Option C: GitHub Actions (For developers)**
Create `.github/workflows/daily-scheduler.yml`:
```yaml
name: Daily Scheduler
on:
  schedule:
    - cron: '* * * * *'  # Every minute
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scheduler
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://[YOUR_PROJECT_ID].supabase.co/functions/v1/daily-scheduler
```

#### Step 2: Test the Setup
1. **Manual test**: Call the scheduler function directly from your app
2. **Check logs**: Monitor Supabase function logs
3. **Wait for midnight**: The first automatic summary will be sent at 00:00 UTC

#### Step 3: Monitor and Verify
- **Check Telegram**: You should receive daily summaries at 00:00 UTC
- **Check logs**: Supabase function logs will show scheduler activity
- **Adjust timezone**: If you want local time instead of UTC, modify the scheduler logic

### How It Works

```
External Cron Service → Pings every minute → Scheduler Function
                                                    ↓
                                            Checks if 00:00 UTC
                                                    ↓
                                        Calls daily-reservation-summary
                                                    ↓
                                            Sends Telegram messages
```

### Timezone Notes
- **Current setup**: Uses UTC (00:00 UTC = midnight UTC)
- **To change timezone**: Modify the scheduler to check for your local midnight
- **Example for CET**: Check for `(currentHour === 23 && currentMinute === 0)` for UTC to get CET midnight

### Troubleshooting
- **No messages**: Check cron service is running and URL is correct
- **Wrong time**: Verify timezone calculations
- **Function errors**: Check Supabase function logs
- **Telegram issues**: Verify bot token and chat ID in environment variables

### Cost
- **Supabase**: Edge function calls (very minimal cost)
- **Cron service**: Free tiers available on all recommended services
- **Total**: Essentially free for this use case