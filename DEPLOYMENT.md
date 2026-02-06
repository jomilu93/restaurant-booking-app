# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub repository (already created: https://github.com/jomilu93/restaurant-booking-app)

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub account and find `restaurant-booking-app`
4. Click "Import"

### Step 2: Configure Project Settings

Vercel will auto-detect Next.js. Use these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Set Up Database

#### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Choose a region (ideally close to your users, e.g., `us-east-1` for NYC)
5. Click "Create"
6. Vercel will automatically add `DATABASE_URL` to your environment variables

#### Option B: External PostgreSQL

If using Neon, Supabase, or another provider:

1. Create a PostgreSQL database
2. Copy the connection string
3. Add it as `DATABASE_URL` in Vercel environment variables

### Step 4: Configure Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Database (automatically added if using Vercel Postgres)
DATABASE_URL="postgres://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="[Generate with: openssl rand -base64 32]"

# OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

To generate `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. Vercel will provide a production URL (e.g., `restaurant-booking-app.vercel.app`)

### Step 6: Initialize Database

After first deployment, run migrations and seed data:

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npm run db:push

# Seed the database
npm run db:seed
```

#### Method 2: Using Drizzle Studio

```bash
# Pull environment variables
vercel env pull .env.local

# Open Drizzle Studio
npm run db:studio

# Manually run the seed script from your local machine
npm run db:seed
```

### Step 7: Verify Deployment

Visit your production URL and verify:

- [x] Homepage loads with restaurant recommendations
- [x] Can browse restaurant list
- [x] Can view restaurant details
- [x] Can see availability slots
- [x] Authentication pages accessible

---

## Local Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jomilu93/restaurant-booking-app.git
cd restaurant-booking-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
cp .env.example .env.local
```

4. Add your database URL to `.env.local`:
```
DATABASE_URL="postgres://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
```

5. Push database schema:
```bash
npm run db:push
```

6. Seed the database:
```bash
npm run db:seed
```

7. Run development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Test Account

After seeding, you can login with:
- **Email**: test@example.com
- **Password**: password123

---

## Production Checklist

Before going live, ensure:

- [ ] Database is properly configured and seeded
- [ ] Environment variables are set
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Google OAuth configured (for social login)
- [ ] Test all user flows:
  - [ ] User registration and login
  - [ ] Restaurant search and filtering
  - [ ] Restaurant detail page
  - [ ] Booking creation
  - [ ] Booking history
  - [ ] Personalized recommendations
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Security headers configured
- [ ] Rate limiting on API routes
- [ ] SEO metadata configured

---

## Monitoring & Maintenance

### Vercel Analytics

Enable in your project dashboard to track:
- Page views
- User sessions
- Performance metrics
- Core Web Vitals

### Error Tracking

Recommended: [Sentry](https://sentry.io)

```bash
npm install @sentry/nextjs

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

### Database Backups

If using Vercel Postgres:
- Automatic daily backups included
- Point-in-time recovery available

If using external database:
- Set up automated backups through your provider
- Test restore procedures regularly

### Performance Monitoring

Monitor these metrics:
- API response times (< 500ms target)
- Database query performance
- Page load times (< 2s target)
- Error rates (< 0.1% target)

---

## Scaling Considerations

### Database

As you grow, consider:
- **Connection pooling**: Use PgBouncer or Vercel Postgres pooling
- **Read replicas**: For high-traffic scenarios
- **Caching**: Vercel KV (Redis) for hot data
- **Indexes**: Monitor slow queries and add indexes

### API Rate Limiting

Implement rate limiting for public APIs:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### CDN & Caching

- Images: Automatically optimized by Next.js
- Static pages: Use ISR with appropriate revalidation times
- API responses: Add `Cache-Control` headers where appropriate

---

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors
**Solution**: Run `npm run build` locally to see full error messages

**Issue**: Missing environment variables
**Solution**: Verify all required env vars are set in Vercel dashboard

### Database Connection Issues

**Issue**: `connect ECONNREFUSED`
**Solution**: Check `DATABASE_URL` format and network access

**Issue**: Migration errors
**Solution**: Run `npm run db:push` locally first to test migrations

### Runtime Errors

Check logs:
```bash
vercel logs [deployment-url]
```

Or view in Vercel dashboard under "Logs" tab.

---

## Custom Domain Setup

1. Go to your Vercel project → Settings → Domains
2. Add your domain (e.g., `nycdining.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain
5. Redeploy

---

## Support

- **Documentation**: See `docs/` folder
- **GitHub Issues**: [Create an issue](https://github.com/jomilu93/restaurant-booking-app/issues)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

## Next Steps

After deployment, consider:

1. **Real API Integration**: Replace mock clients with actual Resy/OpenTable APIs
2. **Email Service**: Set up Resend or SendGrid for booking confirmations
3. **Advanced Features**: Waitlist, group bookings, loyalty programs
4. **Mobile App**: React Native or native iOS/Android
5. **Analytics**: Google Analytics or Mixpanel for user behavior tracking

---

**Deployment Guide Version**: 1.0
**Last Updated**: February 6, 2026
