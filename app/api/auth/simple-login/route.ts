import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'hanjian-qingsuanqi-secret-key-2024'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 支持用户名或邮箱登录
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    if (user.status === 'BANNED') {
      return NextResponse.json(
        { error: '账号已被封禁' },
        { status: 403 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 创建JWT token
    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
        name: user.username, // 显示名称使用用户名
        username: user.username, // 添加用户名字段
        role: user.role,
        reputationScore: user.reputationScore
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // 设置cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.username, // 显示名称使用用户名
        username: user.username, // 添加用户名字段
        role: user.role,
        reputationScore: user.reputationScore
      }
    })

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      // 本地生产构建通常通过 HTTP 访问，只有 HTTPS 请求才应要求 Secure cookie。
      secure: new URL(request.url).protocol === 'https:',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/'
    })

    return response

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
