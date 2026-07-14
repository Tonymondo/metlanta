import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { upsertUser, getUserByEmail, getServiceClient } from './supabase'
import { verifyPassword } from './password'

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

    // Email + Password login
    CredentialsProvider({
      id: 'email-password',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const db = getServiceClient()
          const { data: user } = await db
            .from('users')
            .select('id, email, name, image, role, onboarding_complete, password_hash')
            .eq('email', credentials.email.toLowerCase().trim())
            .single()
          if (!user?.password_hash) return null
          const valid = verifyPassword(credentials.password, user.password_hash)
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name, image: user.image }
        } catch { return null }
      },
    }),

    // Phone OTP login
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null
        try {
          const db = getServiceClient()
          const phone = credentials.phone.replace(/\D/g, '')

          // Verify OTP
          const { data: record } = await db
            .from('phone_otps')
            .select('*')
            .eq('phone', phone)
            .eq('otp', credentials.otp)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (!record) return null

          // Delete used OTP
          await db.from('phone_otps').delete().eq('id', record.id)

          // Upsert user by phone
          const { data: existing } = await db
            .from('users')
            .select('id, email, name, image, role, onboarding_complete')
            .eq('phone', phone)
            .single()

          if (existing) {
            return { id: existing.id, email: existing.email ?? `${phone}@phone.metlanta.app`, name: existing.name, image: existing.image }
          }

          // Create new phone user
          const { data: newUser } = await db
            .from('users')
            .insert({ phone, email: `${phone}@phone.metlanta.app`, role: 'attendee', onboarding_complete: false })
            .select('id, email, name')
            .single()

          if (!newUser) return null
          return { id: newUser.id, email: newUser.email, name: newUser.name ?? null, image: null }
        } catch { return null }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      if (user.email.endsWith('@phone.metlanta.app')) return true
      try {
        await upsertUser({ email: user.email, name: user.name, image: user.image })
      } catch (e) {
        console.error('signIn sync error:', e)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.email || token.id) {
        const email = user?.email ?? token.email
        if (email) {
          const dbUser = await getUserByEmail(email as string)
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
