import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 使用 Prisma 搜索数据库
    const results = await prisma.historicalFigure.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { identity: { contains: query, mode: 'insensitive' } },
          { activities: { contains: query, mode: 'insensitive' } },
          { note: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      results,
      total: results.length,
      query: query,
    });
  } catch (error) {
    console.error('Database search error:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}
