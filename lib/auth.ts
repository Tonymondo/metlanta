import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'attendee' | 'host' | 'admin'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'attendee' | 'host' | 'admin'
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        // TODO: replace with Supabase DB lookup
        // Scaffold only — email/password requires database integration
        if (!credentials?.email || !credentials?.password) return null
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Default all new users to attendee; upgrade to host via dashboard
        token.role = 'attendee'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? 'attendee'
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
