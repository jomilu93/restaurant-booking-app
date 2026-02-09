# Fix: Application Error on Vercel

## Step 1: Check Vercel Logs

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your `restaurant-booking-app` project
3. Click on "Deployments" tab
4. Click on the latest deployment
5. Click "Runtime Logs" or "Functions" tab
6. Look for the actual error message

## Step 2: Most Likely Issue - Missing Database URL

The error is probably: **"missing_connection_string"**

### Fix:

1. **In Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Check if `DATABASE_URL` exists**
3. If missing or you haven't set up a database yet, you have 2 options:

#### Option A: Use Vercel Postgres (Recommended)

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose region (e.g., `us-east-1` for NYC)
5. Click **Create**
6. Vercel automatically adds `DATABASE_URL` to your environment variables
7. Go back to **Deployments** and click **Redeploy** (3 dots menu)

#### Option B: Use External Database (Neon, Supabase, etc.)

1. Create a PostgreSQL database at:
   - Neon: https://neon.tech (free tier)
   - Supabase: https://supabase.com (free tier)
2. Copy the connection string
3. In Vercel: Settings → Environment Variables
4. Add: `DATABASE_URL` = `postgresql://...your-connection-string...`
5. Save and redeploy

## Step 3: Add Required Environment Variables

Make sure these are set in Vercel:

```bash
DATABASE_URL=postgresql://...        # Required
NEXTAUTH_URL=https://your-app.vercel.app  # Required
NEXTAUTH_SECRET=<random-32-char-string>   # Required
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Or use online generator: https://generate-secret.vercel.app/32

## Step 4: Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click the 3 dots on latest deployment
3. Click "Redeploy"
4. Wait for build to complete

## Step 5: Initialize Database

Once deployment succeeds and app loads:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables
cd restaurant-booking-app
vercel env pull .env.local

# Push database schema
npm run db:push

# Seed with 50 NYC restaurants
npm run db:seed
```

## Quick Fix Commands

If you already have a database URL:

```bash
# Set environment variable via CLI
vercel env add DATABASE_URL production

# When prompted, paste your database URL
# Then redeploy
vercel --prod
```

## Common Errors & Solutions

### Error: "missing_connection_string"
**Cause**: No DATABASE_URL environment variable
**Fix**: Add DATABASE_URL in Vercel settings (see Step 2)

### Error: "connect ECONNREFUSED"
**Cause**: Database URL is incorrect or database is not accessible
**Fix**: Verify database URL format and network access

### Error: "relation 'restaurants' does not exist"
**Cause**: Database schema not created
**Fix**: Run `npm run db:push` to create tables

### Error: "Invalid `prisma.user.findFirst()` invocation"
**Cause**: Database is empty
**Fix**: Run `npm run db:seed` to add restaurant data

## Verification Steps

After fixing:

1. ✅ Visit your app URL - should load homepage
2. ✅ Go to `/restaurants` - should show restaurant list
3. ✅ Click on a restaurant - should show details
4. ✅ Check availability - should show time slots

## Still Not Working?

Share the actual error from Vercel Runtime Logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment
3. Click "Runtime Logs" or "Functions"
4. Copy the full error message
5. Share with me to get specific help
