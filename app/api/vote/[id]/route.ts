import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 投票验证schema
const voteSchema = z.object({
  voteType: z.boolean(), // true=支持, false=反对
  reason: z.string().optional()
})

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

    const submissionId = parseInt(id)
    const userId = parseInt(session.id)

    // 检查提交是否存在
    const submission = await prisma.editSubmission.findUnique({
      where: { id: submissionId },
      include: {
        submitter: true
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: '提交不存在' },
        { status: 404 }
      )
    }

    // 检查提交状态
    if (submission.status !== 'PENDING' && submission.status !== 'VOTING') {
      return NextResponse.json(
        { error: '该提交不在投票阶段' },
        { status: 400 }
      )
    }

    // 不能给自己的提交投票
    if (submission.submitterId === userId) {
      return NextResponse.json(
        { error: '不能为自己的提交投票' },
        { status: 400 }
      )
    }

    // 检查用户是否已经投过票
    const existingVote = await prisma.vote.findUnique({
      where: {
        submissionId_voterId: {
          submissionId: submissionId,
          voterId: userId
        }
      }
    })

    if (existingVote) {
      return NextResponse.json(
        { error: '您已经投过票了' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = voteSchema.parse(body)

    // 计算投票权重（基于用户信誉分）
    const voter = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!voter) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 计算投票权重
    let weight = 1
    if (voter.reputationScore >= 80) weight += 1
    if (voter.reputationScore >= 90) weight += 1
    if (voter.role === 'MODERATOR' || voter.role === 'ADMIN') weight += 2

    // 创建投票记录
    const vote = await prisma.vote.create({
      data: {
        submissionId,
        voterId: userId,
        voteType: validatedData.voteType,
        weight,
        reason: validatedData.reason
      }
    })

    // 更新提交状态为投票中
    await prisma.editSubmission.update({
      where: { id: submissionId },
      data: { status: 'VOTING' }
    })

    // 检查投票结果
    const allVotes = await prisma.vote.findMany({
      where: { submissionId }
    })

    const supportWeight = allVotes
      .filter(v => v.voteType)
      .reduce((sum, v) => sum + v.weight, 0)

    const opposeWeight = allVotes
      .filter(v => !v.voteType)
      .reduce((sum, v) => sum + v.weight, 0)

    const totalVotes = allVotes.length
    let statusChanged = false
    let message = "投票成功"

    // 投票结果判定
    if (totalVotes >= 5) {
      // 有足够投票数，开始判定结果
      if (supportWeight > opposeWeight * 2) {
        // 支持票数远超反对票，自动采纳
        await prisma.editSubmission.update({
          where: { id: submissionId },
          data: { status: 'APPROVED' }
        })

        // 创建新的汉奸记录（如果是ADD类型）
        if (submission.editType === 'ADD') {
          const proposedData = submission.proposedData as any
          await prisma.historicalFigure.create({
            data: {
              ...proposedData,
              isDeleted: false
            }
          })
        } else if (submission.editType === 'UPDATE' && submission.figureId !== null && submission.figureId > 0) {
          const proposedData = submission.proposedData as any
          await prisma.historicalFigure.update({
            where: { id: submission.figureId },
            data: proposedData
          })
        }

        // 增加提交者的信誉分
        await prisma.user.update({
          where: { id: submission.submitterId },
          data: { reputationScore: { increment: 15 } }
        })

        // 给所有支持者增加信誉分
        const supporters = allVotes.filter(v => v.voteType).map(v => v.voterId)
        await prisma.user.updateMany({
          where: { id: { in: supporters } },
          data: { reputationScore: { increment: 5 } }
        })

        statusChanged = true
        message = "投票完成，提交已采纳！"

      } else if (opposeWeight > supportWeight * 2) {
        // 反对票数远超支持票，拒绝
        await prisma.editSubmission.update({
          where: { id: submissionId },
          data: { 
            status: 'REJECTED',
            rejectReason: '社区投票拒绝'
          }
        })

        // 降低提交者的信誉分
        await prisma.user.update({
          where: { id: submission.submitterId },
          data: { reputationScore: { decrement: 10 } }
        })

        // 检查是否需要封禁用户（反恶意检测）
        const submitter = await prisma.user.findUnique({
          where: { id: submission.submitterId },
          include: {
            _count: {
              select: { submissions: true }
            }
          }
        })

        if (submitter && submitter.reputationScore <= 0) {
          // 自动封禁
          await prisma.user.update({
            where: { id: submission.submitterId },
            data: { status: 'BANNED' }
          })

          // 记录封禁
          await prisma.userActivityLog.create({
            data: {
              userId: submission.submitterId,
              activityType: 'AUTO_BANNED',
              details: {
                reason: '信誉分过低，自动封禁',
                reputationScore: submitter.reputationScore
              }
            }
          })
        }

        statusChanged = true
        message = "投票完成，提交已拒绝"
      }
    }

    return NextResponse.json({
      success: true,
      message,
      vote: {
        id: vote.id,
        voteType: vote.voteType,
        weight: vote.weight
      },
      results: {
        support: allVotes.filter(v => v.voteType).length,
        oppose: allVotes.filter(v => !v.voteType).length,
        total: totalVotes,
        supportWeight,
        opposeWeight
      },
      statusChanged
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('投票错误:', error)
    return NextResponse.json(
      { error: '投票失败' },
      { status: 500 }
    )
  }
}
