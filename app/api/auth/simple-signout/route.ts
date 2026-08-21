import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // 清除session cookie
    cookieStore.delete('next-auth.session-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('登出失败:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}