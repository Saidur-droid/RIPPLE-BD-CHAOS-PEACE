# RIPPLE BD — Zero-Cost Anonymous Tracking Setup

RIPPLE is prepared to record anonymous product events in a Google Sheet without Supabase, Vercel, a paid database, or a paid analytics product.

## What is recorded

Only product-interaction data:
- anonymous session ID;
- current screen / scenario;
- first-choice option ID;
- second-choice option ID;
- scenario score;
- X-Ray signals opened;
- completion and timing;
- mobile/tablet/desktop class and viewport size;
- app version.

The app does not send a name, phone number, email, religion, ethnicity, political preference, personal story, GPS location, or raw user-agent fingerprint.

Users see a clear analytics-consent control before the experience. Central tracking occurs only when they opt in.

## One-time setup

1. Create a new Google Sheet named RIPPLE BD Pilot Events.
2. In that Sheet open Extensions → Apps Script.
3. Replace the default script with the contents of analytics/APPS_SCRIPT.gs.
4. Click Deploy → New deployment → Web app.
5. Set Execute as: Me.
6. Set Who has access: Anyone.
7. Deploy and copy the Web App URL ending in /exec.
8. In GitHub open Settings → Secrets and variables → Actions → Variables.
9. Add a repository variable:
   - Name: VITE_TRACKING_ENDPOINT
   - Value: the Apps Script /exec URL.
10. Re-run the GitHub Pages workflow, or make a tiny commit.

The workflow already injects this repository variable into the Vite production build.

## Event names

Typical rows include:
- app_open
- analytics_consent_granted
- guide_completed
- scenario_started
- mirror_choice
- ripple_viewed
- rewind_started
- peace_choice
- xray_signal_opened
- xray_completed
- shield_completed
- scenario_completed
- results_viewed
- session_complete
- session_leave

## Fallback

If the Sheet endpoint is unavailable, consented events are still kept in that browser's local storage as a small fallback queue. Cross-user pilot reporting requires the Google Sheet endpoint to be connected.
