import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'

export async function GET() {
  try {
    const session = await getSimpleSession()
    
    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: session })
  } catch (error) {
    console.error('获取session失败:', error)
    return NextResponse.json(
      { error: '获取session失败' },
      { status: 500 }
    )
  }
}