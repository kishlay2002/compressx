# CompressX — Production Deployment Guide

## Prerequisites

- Node.js 18+
- A PostgreSQL database (recommended: [Neon](https://neon.tech) — free tier available)
- A hosting platform (recommended: [Vercel](https://vercel.com))
- (Optional) Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

---

## 1. Set Up PostgreSQL Database

### Option A: Neon (Recommended — free tier)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

### Option B: Supabase
1. Sign up at https://supabase.com
2. Create a new project → Settings → Database → Connection string

### Option C: Railway
1. Sign up at https://railway.app
2. Add a PostgreSQL service → copy the connection string

---

## 2. Switch Schema to PostgreSQL

```bash
# Copy the PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

---

## 3. Configure Environment Variables

Create a `.env` file (or set these in your hosting dashboard):

```env
DATABASE_URL="postgresql://user:password@host:5432/compressx?sslmode=require"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Important:** Generate a strong `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## 4. Push Database Schema

```bash
# Generate Prisma client
DATABASE_URL="your-postgresql-url" npx prisma generate

# Push schema to production database
DATABASE_URL="your-postgresql-url" npx prisma db push
```

---

## 5. Deploy to Vercel

### Via CLI:
```bash
npm i -g vercel
vercel
```

### Via GitHub:
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables in the Vercel dashboard
5. Deploy

### Build Settings (auto-detected by Vercel):
- **Framework:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`

---

## 6. Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test sign up / sign in with credentials
- [ ] Test Google OAuth (if configured)
- [ ] Test image compression + download
- [ ] Test PDF compression + download
- [ ] Test merge, split, convert tools
- [ ] Test dark mode toggle
- [ ] Check dashboard loads with stats
- [ ] Verify security headers (use https://securityheaders.com)
- [ ] Test on mobile devices

---

## Local Development

```bash
# Install dependencies
npm install

# Set up local database
DATABASE_URL="file:./dev.db" npx prisma generate
DATABASE_URL="file:./dev.db" npx prisma db push

# Start dev server
npm run dev
```

---

## Architecture Notes

- **Client-side processing:** All file compression/conversion happens in the browser. No files are uploaded to the server.
- **Server only stores metadata:** Job tracking (filename, sizes, ratios) for the dashboard. Never file content.
- **Auth:** NextAuth.js with credentials (bcrypt) + Google OAuth.
- **Database:** SQLite for local dev, PostgreSQL for production. The `src/lib/db.ts` auto-detects based on `DATABASE_URL` prefix.
