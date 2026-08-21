import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'hanjian-qingsuanqi-secret-key-2024'

export interface SimpleUser {
  id: string
  email: string
  name: string
  username: string
  role: string
  reputationScore: number
}

export async function getSimpleSession(): Promise<SimpleUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value

    if (!sessionToken) {
      return null
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as SimpleUser
    return decoded
  } catch (error) {
    console.error('Session解析错误:', error)
    return null
  }
}

export async function requireAuth(): Promise<SimpleUser> {
  const session = await getSimpleSession()
  
  if (!session) {
    throw new Error('未授权访问')
  }
  
  return session
}
