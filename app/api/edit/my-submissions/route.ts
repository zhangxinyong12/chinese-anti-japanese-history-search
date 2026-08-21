import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSimpleSession()
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.id)

    // 获取用户的提交记录
    const submissions = await prisma.editSubmission.findMany({
      where: { submitterId: userId },
      include: {
        votes: {
          select: {
            voteType: true,
            weight: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 统计每个提交的投票情况
    const submissionsWithStats = submissions.map(submission => {
      const supportVotes = submission.votes.filter(v => v.voteType).length
      const opposeVotes = submission.votes.filter(v => !v.voteType).length
      const totalWeight = submission.votes.reduce((sum, v) => sum + v.weight, 0)

      return {
        id: submission.id,
        editType: submission.editType,
        proposedData: submission.proposedData,
        status: submission.status,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        rejectReason: submission.rejectReason,
        citationSources: submission.citationSources,
        votes: {
          support: supportVotes,
          oppose: opposeVotes,
          total: submission.votes.length,
          totalWeight
        }
      }
    })

    return NextResponse.json({
      success: true,
      submissions: submissionsWithStats
    })

  } catch (error) {
    console.error('获取提交列表错误:', error)
    return NextResponse.json(
      { error: '获取提交列表失败' },
      { status: 500 }
    )
  }
}
