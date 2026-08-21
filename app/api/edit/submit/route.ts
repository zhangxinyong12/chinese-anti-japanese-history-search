import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkContentSafety } from '@/lib/security-check'

// 编辑提交验证schema
const submissionSchema = z.object({
  editType: z.enum(['ADD', 'UPDATE', 'DELETE']),
  proposedData: z.object({
    name: z.string().min(1, '姓名不能为空'),
    period: z.string().optional(),
    identity: z.string().min(1, '身份不能为空'),
    activities: z.string().min(1, '主要事迹不能为空'),
    note: z.string().optional(),
    year: z.number().int().nullable().optional(),
    punishment: z.string().optional(),
    deathPlace: z.string().optional()
  }),
  citationSources: z.array(z.string()).min(1, '至少需要一个文献引用'),
  figureId: z.number().optional() // 用于UPDATE和DELETE操作
})

export async function POST(request: Request) {
  try {
    const session = await getSimpleSession()
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 验证数据
    const validatedData = submissionSchema.parse(body)
    
    // 检查用户状态
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.id) }
    })

    if (!user || user.status === 'BANNED') {
      return NextResponse.json(
        { error: '账号已被封禁，无法提交编辑' },
        { status: 403 }
      )
    }

    // 安全检查：防止提交保护人物
    const safetyCheck = checkContentSafety({
      name: validatedData.proposedData.name,
      identity: validatedData.proposedData.identity,
      activities: validatedData.proposedData.activities,
      note: validatedData.proposedData.note
    })

    if (!safetyCheck.isSafe) {
      // 记录违规行为
      await prisma.securityViolation.create({
        data: {
          userId: user.id,
          violationType: 'PROTECTED_FIGURE',
          content: validatedData,
          reason: safetyCheck.reason || '检测到保护人物',
          matchedFigure: safetyCheck.matchedFigure,
          protectionLevel: safetyCheck.protectionLevel,
          status: 'CONFIRMED'
        }
      })

      // 自动惩罚用户
      const newReputationScore = Math.max(0, user.reputationScore - 50)
      const newStatus = newReputationScore <= 0 ? 'BANNED' : 'ACTIVE'
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          reputationScore: newReputationScore,
          status: newStatus
        }
      })

      // 记录信誉历史
      await prisma.reputationHistory.create({
        data: {
          userId: user.id,
          changeType: 'SECURITY_VIOLATION',
          changeAmount: -50,
          reason: `提交保护人物: ${safetyCheck.matchedFigure || safetyCheck.reason}`,
          relatedSubmissionId: 0
        }
      })

      return NextResponse.json(
        { 
          error: '提交内容包含敏感人物，系统已拒绝本次提交',
          reason: safetyCheck.reason,
          matchedFigure: safetyCheck.matchedFigure,
          penalty: '信誉分扣除50分，可能面临账号封禁',
          newReputationScore: newReputationScore,
          accountStatus: newStatus
        },
        { status: 403 }
      )
    }

    // 验证数据质量 - 检查英雄关键词
    const heroKeywords = ['英雄', '抗日', '爱国', '烈士', '将领', '司令', '抗战']
    const hasHeroKeyword = heroKeywords.some(keyword => 
      validatedData.proposedData.identity?.includes(keyword) || 
      validatedData.proposedData.activities?.includes(keyword) ||
      validatedData.proposedData.note?.includes(keyword)
    )

    if (hasHeroKeyword) {
      return NextResponse.json(
        { error: '系统仅记录汉奸历史，请勿提交英雄相关内容' },
        { status: 400 }
      )
    }

    // 检查是否有重复提交
    if (validatedData.editType === 'ADD') {
      const existingFigure = await prisma.historicalFigure.findFirst({
        where: { 
          name: validatedData.proposedData.name,
          isDeleted: false
        }
      })

      if (existingFigure) {
        return NextResponse.json(
          { error: '该汉奸记录已存在，请使用编辑功能更新现有记录' },
          { status: 400 }
        )
      }
    }

    // 检查相似提交（用于自动验证）
    const similarSubmissions = await prisma.editSubmission.findMany({
      where: {
        status: { in: ['PENDING', 'AUTO_APPROVED'] },
        editType: validatedData.editType
      },
      take: 5
    })

    // 计算相似度（简化版）
    let similarityGroupId = null
    if (similarSubmissions.length > 0) {
      // 这里可以添加更复杂的相似度算法
      // 暂时使用简单的名称匹配
      const similar = similarSubmissions.find(s => 
        s.proposedData && typeof s.proposedData === 'object' &&
        'name' in s.proposedData &&
        s.proposedData.name === validatedData.proposedData.name
      )
      if (similar) {
        similarityGroupId = similar.similarityGroupId || similar.id
      }
    }

    // 创建编辑提交
    const submission = await prisma.editSubmission.create({
      data: {
        // ADD 没有现有人物，使用可空外键而不是伪造一个不存在的 id。
        figureId: validatedData.figureId ?? null,
        submitterId: parseInt(session.id),
        editType: validatedData.editType,
        proposedData: validatedData.proposedData,
        citationSources: validatedData.citationSources.filter(c => c.trim()),
        status: 'PENDING',
        similarityGroupId: similarityGroupId
      }
    })

    // 记录用户活动
    await prisma.userActivityLog.create({
      data: {
        userId: parseInt(session.id),
        activityType: 'SUBMISSION',
        details: {
          submissionId: submission.id,
          editType: validatedData.editType,
          figureName: validatedData.proposedData.name
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // 检查是否达到自动采纳条件
    let shouldAutoApprove = false
    
    if (similarityGroupId && validatedData.editType === 'ADD') {
      // 统计相似提交数量
      const similarCount = await prisma.editSubmission.count({
        where: {
          similarityGroupId: similarityGroupId,
          status: { in: ['PENDING', 'AUTO_APPROVED'] }
        }
      })

      // 如果有3个以上相似提交，自动采纳
      if (similarCount >= 3) {
        shouldAutoApprove = true
        
        // 更新所有相似提交的状态
        await prisma.editSubmission.updateMany({
          where: {
            similarityGroupId: similarityGroupId
          },
          data: {
            status: 'AUTO_APPROVED'
          }
        })

        // 给所有参与者增加信誉分
        const similarSubmissions = await prisma.editSubmission.findMany({
          where: { similarityGroupId: similarityGroupId }
        })

        const participantIds = [...new Set(similarSubmissions.map(s => s.submitterId))]
        await prisma.user.updateMany({
          where: { id: { in: participantIds } },
          data: { reputationScore: { increment: 10 } }
        })

        // 创建新的汉奸记录
        await prisma.historicalFigure.create({
          data: {
            ...validatedData.proposedData,
            isDeleted: false
          }
        })

        // 记录信誉历史
        await prisma.reputationHistory.createMany({
          data: participantIds.map(userId => ({
            userId,
            changeType: 'AUTO_APPROVED',
            changeAmount: 10,
            reason: '多人提交相似汉奸信息，自动采纳',
            relatedSubmissionId: submission.id
          }))
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: shouldAutoApprove 
        ? '您的提交已通过交叉验证，自动采纳！' 
        : '提交成功，正在等待审核',
      submissionId: submission.id,
      status: shouldAutoApprove ? 'AUTO_APPROVED' : 'PENDING',
      autoApproved: shouldAutoApprove
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('编辑提交错误:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
