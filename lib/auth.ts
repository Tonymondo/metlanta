import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { upsertUser, getUserByEmail } from './supabase'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'attendee' | 'host' | 'promoter' | 'admin'
      onboarding_complete?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'attendee' | 'host' | 'promoter' | 'admin'
    onboarding_complete?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        await upsertUser({ email: user.email, name: user.name, image: user.image })
      } catch (e) {
        console.error('signIn sync error:', e)
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      // Refresh from DB on sign-in OR when update() is called client-side
      if (user?.email || trigger === 'update' || !token.id) {
        const email = (user?.email ?? token.email) as string | undefined
        if (email) {
          const dbUser = await getUserByEmail(email)
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role as 'attendee' | 'host' | 'promoter' | 'admin'
            token.onboarding_complete = dbUser.onboarding_complete ?? false
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role ?? 'attendee'
        session.user.onboarding_complete = token.onboarding_complete ?? false
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}
