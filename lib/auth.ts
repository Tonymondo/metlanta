import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { upsertUser, getUserByEmail } from './supabase'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'attendee' | 'host' | 'admin'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
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
      },
      async authorize(credentials) {
        // TODO: add password hashing + DB lookup when email auth is ready
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user) return null
        // Placeholder: real implementation needs bcrypt password comparison
        return null
      },
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
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role as 'attendee' | 'host' | 'admin'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
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
