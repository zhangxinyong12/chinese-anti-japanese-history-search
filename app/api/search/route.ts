import { NextRequest, NextResponse } from 'next/server';
import { loadHistoricalFigures, loadJsonFallback, type HistoricalFigureRecord } from '@/lib/historical-figures';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Neon 优先，失败时回退 JSON
  let allData: HistoricalFigureRecord[] = [];
  let source = 'database';
  try {
    allData = await loadHistoricalFigures();
  } catch (error) {
    console.error('Database query failed, falling back to JSON:', error);
    allData = loadJsonFallback();
    source = 'json-fallback';
  }

  if (allData.length === 0) {
    allData = loadJsonFallback();
    source = 'json-fallback';
  }

  // 中文搜索：整词包含 或 每个字符都命中
  const results = allData.filter((person) => {
    const searchableText = `${person.name} ${person.identity} ${person.activities}`.toLowerCase();
    return (
      searchableText.includes(query) ||
      query.split('').every((char: string) => searchableText.includes(char))
    );
  });

  return NextResponse.json({
    results,
    total: results.length,
    query,
    source,
  });
}
