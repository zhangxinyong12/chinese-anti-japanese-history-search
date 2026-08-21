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

    // 获取待投票的提交（排除自己的）
    const pendingSubmissions = await prisma.editSubmission.findMany({
      where: {
        status: { in: ['PENDING', 'VOTING'] },
        submitterId: { not: parseInt(session.id) }
      },
      include: {
        submitter: {
          select: {
            username: true,
            reputationScore: true
          }
        },
        votes: {
          select: {
            voteType: true,
            weight: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 添加投票统计
    const submissionsWithStats = pendingSubmissions.map(submission => {
      const supportVotes = submission.votes.filter(v => v.voteType).length
      const opposeVotes = submission.votes.filter(v => !v.voteType).length
      const supportWeight = submission.votes.filter(v => v.voteType).reduce((sum, v) => sum + v.weight, 0)
      const opposeWeight = submission.votes.filter(v => !v.voteType).reduce((sum, v) => sum + v.weight, 0)

      return {
        id: submission.id,
        editType: submission.editType,
        proposedData: submission.proposedData,
        status: submission.status,
        citationSources: submission.citationSources,
        createdAt: submission.createdAt,
        submitter: submission.submitter,
        votes: {
          support: supportVotes,
          oppose: opposeVotes,
          total: submission.votes.length,
          supportWeight,
          opposeWeight
        }
      }
    })

    return NextResponse.json({
      success: true,
      submissions: submissionsWithStats
    })

  } catch (error) {
    console.error('获取待投票内容错误:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
