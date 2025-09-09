import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import clientPromise from "./mongodb"
import { ROUTES } from "@/constants/routes"

export const authOptions: NextAuthOptions = {
  // adapter: MongoDBAdapter(clientPromise), // Commented out for now due to version conflicts
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const client = await clientPromise
          const db = client.db('lims')
          const user = await db.collection('users').findOne({ 
            username: credentials.username 
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid || !user.isActive || !user.isVerified) {
            return null
          }

          // Update last login
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          )

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.isVerified = user.isVerified
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.isVerified = token.isVerified as boolean
        session.user.isActive = token.isActive as boolean
      }
      return session
    }
  },
  pages: {
    signIn: ROUTES.AUTH.LOGIN,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
