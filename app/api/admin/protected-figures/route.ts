import { NextResponse } from 'next/server'
import { getSimpleSession } from '@/lib/simple-auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// 管理员权限检查
async function checkAdminPermission(session: any) {
  if (!session) {
    return { authorized: false, error: '请先登录' }
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.id) }
  })

  if (!user || user.status === 'BANNED') {
    return { authorized: false, error: '账号已被封禁' }
  }

  if (user.role !== 'ADMIN') {
    return { authorized: false, error: '需要管理员权限' }
  }

  return { authorized: true, user }
}

// GET - 获取保护名单和违规记录
export async function GET(request: Request) {
  try {
    const session = await getSimpleSession()
    const authCheck = await checkAdminPermission(session)

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === '请先登录' ? 401 : 403 }
      )
    }

    // 读取保护名单
    const dataPath = path.join(process.cwd(), 'data', 'protected-figures.json')
    let protectedFigures = []
    
    try {
      const fileContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      protectedFigures = fileContent.figures || []
    } catch (error) {
      console.error('读取保护名单失败:', error)
    }

    // 获取最近的违规记录
    const recentViolations = await prisma.securityViolation.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            reputationScore: true,
            status: true
          }
        }
      }
    })

    // 统计数据
    const violationStats = await prisma.securityViolation.groupBy({
      by: ['violationType'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
        }
      }
    })

    return NextResponse.json({
      protectedFigures: {
        total: protectedFigures.length,
        figures: protectedFigures.slice(0, 50) // 只返回前50个预览
      },
      recentViolations: recentViolations.map(v => ({
        id: v.id,
        userId: v.userId,
        userName: v.user.username || v.user.email,
        violationType: v.violationType,
        reason: v.reason,
        matchedFigure: v.matchedFigure,
        status: v.status,
        userReputation: v.user.reputationScore,
        userStatus: v.user.status,
        createdAt: v.createdAt
      })),
      stats: {
        totalProtectedFigures: protectedFigures.length,
        recentViolations: violationStats.reduce((sum, stat) => sum + stat._count.id, 0),
        violationByType: violationStats.map(stat => ({
          type: stat.violationType,
          count: stat._count.id
        }))
      }
    })

  } catch (error) {
    console.error('管理员API错误:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// POST - 添加保护人物
export async function POST(request: Request) {
  try {
    const session = await getSimpleSession()
    const authCheck = await checkAdminPermission(session)

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === '请先登录' ? 401 : 403 }
      )
    }

    const body = await request.json()
    const { name, category, protectionLevel, reason } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: '姓名和类别不能为空' },
        { status: 400 }
      )
    }

    // 读取现有保护名单
    const dataPath = path.join(process.cwd(), 'data', 'protected-figures.json')
    let fileContent = { figures: [] as any[] }
    
    try {
      const fileData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      if (fileData.figures && Array.isArray(fileData.figures)) {
        fileContent = fileData
      }
    } catch (error) {
      console.error('读取保护名单失败:', error)
    }

    // 检查是否已存在
    const existing = fileContent.figures.find((f: any) => f.name === name)
    if (existing) {
      return NextResponse.json(
        { error: '该人物已在保护名单中' },
        { status: 400 }
      )
    }

    // 添加新人物
    const newFigure = {
      name,
      category,
      protectionLevel: protectionLevel || 'HIGH',
      reason: reason || '需要保护的历史人物',
      addedBy: authCheck.user?.email || 'admin',
      addedAt: new Date().toISOString()
    }

    fileContent.figures.push(newFigure)
    
    // 保存到文件
    fs.writeFileSync(dataPath, JSON.stringify(fileContent, null, 2), 'utf8')

    return NextResponse.json({
      success: true,
      message: '成功添加保护人物',
      figure: newFigure
    })

  } catch (error) {
    console.error('添加保护人物错误:', error)
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除保护人物
export async function DELETE(request: Request) {
  try {
    const session = await getSimpleSession()
    const authCheck = await checkAdminPermission(session)

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === '请先登录' ? 401 : 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: '请提供要删除的人物姓名' },
        { status: 400 }
      )
    }

    // 读取现有保护名单
    const dataPath = path.join(process.cwd(), 'data', 'protected-figures.json')
    let fileContent = { figures: [] as any[] }
    
    try {
      const fileData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      if (fileData.figures && Array.isArray(fileData.figures)) {
        fileContent = fileData
      }
    } catch (error) {
      return NextResponse.json(
        { error: '读取保护名单失败' },
        { status: 500 }
      )
    }

    // 删除指定人物
    const originalLength = fileContent.figures.length
    fileContent.figures = fileContent.figures.filter((f: any) => f.name !== name)

    if (fileContent.figures.length === originalLength) {
      return NextResponse.json(
        { error: '未找到指定人物' },
        { status: 404 }
      )
    }

    // 保存到文件
    fs.writeFileSync(dataPath, JSON.stringify(fileContent, null, 2), 'utf8')

    return NextResponse.json({
      success: true,
      message: '成功删除保护人物',
      deletedName: name
    })

  } catch (error) {
    console.error('删除保护人物错误:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}
