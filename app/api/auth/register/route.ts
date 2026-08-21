import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// 注册验证schema
const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2位').max(20, '用户名最多20位'),
  password: z.string().min(6, '密码至少6位')
})

function isUsernameConflict(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 验证数据
    const validatedData = registerSchema.parse(body)
    
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: '该用户名已被使用，请选择其他用户名' },
        { status: 400 }
      )
    }
    
    // 生成唯一的内部邮箱（用于数据库唯一性）
    const uniqueEmail = `user_${validatedData.username}_${Date.now()}@internal.local`
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        passwordHash: hashedPassword,
        email: uniqueEmail, // 使用唯一的内部邮箱
        emailVerified: true,
        reputationScore: 50,
        status: 'ACTIVE',
        role: 'USER'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username
      }
    })
    
  } catch (error) {
    console.error('注册详细错误:', error)

    // The database constraint is the final guard for concurrent requests;
    // surface that expected conflict as a validation response instead of a 500.
    if (isUsernameConflict(error)) {
      return NextResponse.json(
        { error: '该用户名已被使用，请选择其他用户名' },
        { status: 400 }
      )
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    // 记录更详细的错误信息
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('错误消息:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
