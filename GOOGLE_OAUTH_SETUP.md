# Google OAuth Setup Guide

Your project has been successfully configured to use Google OAuth authentication! 🎉

## What Changed

### 1. Database Schema (`db/schema.ts`)
- Made `hashedPassword` field **nullable** to support OAuth users who sign in without passwords
- Migration applied: `0001_make_password_nullable.sql`

### 2. Database Queries (`db/query.ts`)
- Updated `createUser` to accept optional `hashedPassword` parameter
- Added `updateUserPassword` helper for users who want to set a password later

### 3. Authentication (`lib/auth.ts`)
- Added **Google OAuth provider**
- Updated callbacks to automatically create users on first Google sign-in
- Enhanced Credentials provider to handle users without passwords
- Session management includes `id`, `username`, and `provider` fields

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
5. Copy your **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Database (already configured)
DATABASE_URL="postgresql://postgres:ayush2005@localhost:3000/emaily"
```

### Step 3: Create NextAuth API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { authOptions } from '@/lib/auth'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

Or for Pages Router, create `pages/api/auth/[...nextauth].ts`:

```typescript
export { default } from '@/lib/auth'
```

### Step 4: Test Authentication

Run your development server:

```bash
npm run dev
```

Visit `http://localhost:3000/api/auth/signin` to test Google sign-in.

## User Flow

### For New Users (Google Sign-in)
1. User clicks "Sign in with Google"
2. Google authenticates and returns user info
3. System checks if user exists in DB by email
4. If new, creates user with:
   - Email from Google
   - Username from Google profile
   - No password (NULL)
5. Session created with user ID, email, username

### For Existing Users (Credentials)
1. User enters email and password
2. System validates against `hashedPassword`
3. If user signed up via Google (no password), shows error: "Please sign in with Google"
4. If valid, creates session

### Setting a Password (Optional)
Users who signed up with Google can optionally set a password to enable credential login. Create an API endpoint:

```typescript
// app/api/user/set-password/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { userQueries } from '@/db/query'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { password } = await req.json()
  if (!password || password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await userQueries.updateUserPassword(session.user.id, hashed)
  
  return Response.json({ success: true })
}
```

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- Google OAuth uses secure token exchange
- Session strategy is JWT (stateless)
- Always validate session server-side for protected actions
- Never expose `GOOGLE_CLIENT_SECRET` or `NEXTAUTH_SECRET`

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production domain to Google OAuth authorized origins/redirects
3. Use strong, unique values for `NEXTAUTH_SECRET`
4. Set all environment variables in your hosting platform
5. Update `DATABASE_URL` to production database

## Troubleshooting

**"Missing Google credentials"**
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`

**"Redirect URI mismatch"**
- Verify the redirect URI in Google Console matches: `{NEXTAUTH_URL}/api/auth/callback/google`

**"Database connection failed"**
- Check `DATABASE_URL` is correct and database is running
- Verify migration was applied: `npm run migrate:push`

**"User already exists with different provider"**
- This is expected if email is shared across providers
- System will use the existing user record
