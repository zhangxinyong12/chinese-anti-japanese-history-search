import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// JSON 兜底数据：数据库不可用时保证站点仍可搜索
function loadJsonFallback() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'historical-figures.json');
    const { traitors = [] } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return traitors; // 只返回汉奸数据
  } catch {
    return [];
  }
}

// 从 Neon 数据库加载全部记录
async function loadFromDb(): Promise<any[]> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  const rows = await sql`
    SELECT name, period, identity, activities, note, year, punishment, death_place
    FROM historical_figures
    WHERE is_deleted = false
    ORDER BY name
  `;
  return rows.map((r) => ({
    ...r,
    deathPlace: r.death_place,
    punishment: r.punishment,
    // 移除type字段，只记录汉奸
  }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Neon 优先，失败时回退 JSON
  let allData: any[] = [];
  let source = 'database';
  try {
    allData = await loadFromDb();
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
