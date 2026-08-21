import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'

// 管理员权限检查
function isAdmin(session: any) {
  return session?.role === 'ADMIN'
}

export async function GET(request: Request) {
  try {
    const session = await getSimpleSession()
    
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

    // 获取可疑用户列表
    const suspiciousUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        reputationScore: { lt: 30 } // 信誉分低于30
      },
      include: {
        _count: {
          select: { submissions: true }
        },
        submissions: {
          where: { status: 'REJECTED' },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { reputationScore: 'asc' },
      take: 20
    })

    // 计算每个用户的统计数据
    const usersWithStats = await Promise.all(
      suspiciousUsers.map(async (user) => {
        const recentSubmissions = await prisma.editSubmission.findMany({
          where: {
            submitterId: user.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 最近7天
          }
        })

        const rejectedCount = recentSubmissions.filter(s => s.status === 'REJECTED').length
        const rejectRate = recentSubmissions.length > 0 
          ? rejectedCount / recentSubmissions.length 
          : 0

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          reputationScore: user.reputationScore,
          role: user.role,
          createdAt: user.createdAt,
          stats: {
            totalSubmissions: recentSubmissions.length,
            rejectedSubmissions: rejectedCount,
            rejectRate: Math.round(rejectRate * 100),
            shouldBan: rejectedCount >= 3 && rejectRate > 0.7 // 3个以上拒绝且拒绝率>70%
          }
        }
      })
    )

    // 获取最近的封禁记录
    const recentBans = await prisma.user.findMany({
      where: { status: 'BANNED' },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // 获取当前待审核数量
    const pendingCount = await prisma.editSubmission.count({
      where: { status: 'PENDING' }
    })

    const votingCount = await prisma.editSubmission.count({
      where: { status: 'VOTING' }
    })

    return NextResponse.json({
      success: true,
      data: {
        suspiciousUsers: usersWithStats,
        recentBans,
        stats: {
          pendingCount,
          votingCount,
          totalSuspicious: usersWithStats.length
        }
      }
    })

  } catch (error) {
    console.error('获取监控数据错误:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
