// auth.ts
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { userQueries } from '@/db/query'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth][authorize] Credentials received:', credentials)
        const { email, password } = credentials!

        if (!email || !password) {
          console.error('[Auth][authorize] Missing email or password')
          throw new Error('Email and password are required')
        }

        try {
          const user = await userQueries.getUserByEmail(email);

          if (!user) {
            console.error('[Auth][authorize] No user found with email:', email)
            throw new Error('No matching user found')
          }

          // Check if user has a password set (OAuth users may not)
          if (!user.hashedPassword) {
            console.error('[Auth][authorize] User signed up with OAuth, no password set')
            throw new Error('Please sign in with Google or set a password first')
          }

          console.log('[Auth][authorize] User found, validating password')
          const isValid = await bcrypt.compare(password, user.hashedPassword)
          if (!isValid) {
            console.error('[Auth][authorize] Invalid password for user:', email)
            throw new Error('Invalid password')
          }

          console.log('[Auth][authorize] Authentication successful, returning user:', { id: user.id, email: user.email, username: user.username });
          return { id: user.id, email: user.email, username: user.username || '' }
        } catch (error) {
          console.error('[Auth][authorize] Database error:', error)
          throw new Error('Error retrieving user')
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[Auth][signIn] Sign-in attempt:', { user, account: account?.provider });
      
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        const email = user.email!;
        const existing = await userQueries.getUserByEmail(email);

        if (!existing) {
          console.log('[Auth][signIn] Creating new user from Google OAuth');
          // Create user without password for OAuth sign-in
          await userQueries.createUser({
            email,
            username: user.name || email.split('@')[0],
            hashedPassword: null, // OAuth users don't have passwords initially
          });
        } else {
          console.log('[Auth][signIn] Existing user found for Google OAuth');
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      console.log('[Auth][jwt] Processing JWT, user:', user, 'current token:', token);
      
      if (user) {
        // Fetch full user from DB to get ID and other fields
        const dbUser = await userQueries.getUserByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
        }
      }
      
      if (account) {
        token.provider = account.provider;
        // Store access and refresh tokens for Gmail API access
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      
      console.log('[Auth][jwt] Returning token:', token);
      return token;
    },

    async session({ session, token }) {
      console.log('[Auth][session] Creating session from token:', token);
      
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = (token.username as string) || '';
        (session.user as any).provider = token.provider as string;
        (session.user as any).accessToken = token.accessToken as string;
      }
      
      console.log('[Auth][session] Session created successfully:', session);
      
      return session;
    },
  },

  // Use the standard environment variable name expected by NextAuth
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)