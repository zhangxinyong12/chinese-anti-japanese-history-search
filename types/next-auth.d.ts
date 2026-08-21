import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      reputationScore: number
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    reputationScore: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    reputationScore: number
  }
}