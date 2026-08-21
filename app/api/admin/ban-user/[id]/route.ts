import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'

// 管理员权限检查
function isAdmin(session: any) {
  return session?.role === 'ADMIN'
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSimpleSession()
    const { id } = await params
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const userId = parseInt(id)
    const body = await request.json()
    const { reason, banType } = body

    if (!reason) {
      return NextResponse.json(
        { error: '请提供封禁原因' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: '无法封禁管理员' },
        { status: 403 }
      )
    }

    // 封禁用户
    const bannedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'BANNED',
        reputationScore: 0 // 清零信誉分
      }
    })

    // 拒绝该用户的所有待审核提交
    await prisma.editSubmission.updateMany({
      where: {
        submitterId: userId,
        status: { in: ['PENDING', 'VOTING'] }
      },
      data: {
        status: 'REJECTED',
        rejectReason: reason || '管理员封禁用户'
      }
    })

    // 记录封禁活动
    await prisma.userActivityLog.create({
      data: {
        userId: userId,
        activityType: 'ADMIN_BAN',
        details: {
          reason,
          adminId: session.id,
          adminName: session.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '用户已封禁',
      user: {
        id: bannedUser.id,
        email: bannedUser.email,
        username: bannedUser.username
      }
    })

  } catch (error) {
    console.error('封禁用户错误:', error)
    return NextResponse.json(
      { error: '封禁失败' },
      { status: 500 }
    )
  }
}
