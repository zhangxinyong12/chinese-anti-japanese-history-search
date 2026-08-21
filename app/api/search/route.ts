import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 读取JSON数据文件
function loadData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'historical-figures.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading data:', error);
    return { traitors: [], heroes: [] };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // 从JSON文件加载数据
  const { traitors, heroes } = loadData();
  
  // 合并所有数据
  const allData = [...traitors, ...heroes];
  
  // 搜索逻辑
  const results = allData.filter(person => {
    const searchableText = `${person.name} ${person.identity} ${person.activities}`.toLowerCase();
    return searchableText.includes(query) || 
           query.split('').every((char: string) => searchableText.includes(char));
  });

  return NextResponse.json({ 
    results,
    total: results.length,
    query: query
  });
}
