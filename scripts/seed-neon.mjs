// Neon 数据库建表 + 导入种子数据
// 用法: node scripts/seed-neon.mjs  (需要 .env.local 中有 DATABASE_URL)
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// 读取 .env.local
const env = {};
for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
}

if (!env.DATABASE_URL) {
  console.error('❌ 未找到 DATABASE_URL，请先运行 vercel env pull');
  process.exit(1);
}

const sql = neon(env.DATABASE_URL);
const { traitors = [], heroes = [] } = JSON.parse(
  readFileSync(resolve(root, 'data/historical-figures.json'), 'utf8')
);

console.log(`📦 开始导入：汉奸 ${traitors.length} 人，抗日英雄 ${heroes.length} 人`);

// 建表
await sql`
  CREATE TABLE IF NOT EXISTS historical_figures (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    period TEXT,
    identity TEXT,
    activities TEXT,
    type TEXT NOT NULL,
    note TEXT,
    year INT,
    punishment TEXT,
    death_place TEXT
  )
`;

// 清空旧数据，保证可重复执行
await sql`DELETE FROM historical_figures`;

// 逐条插入（数据量小，无需批量优化）
for (const p of [...traitors, ...heroes]) {
  await sql.query(
    `INSERT INTO historical_figures
       (name, period, identity, activities, type, note, year, punishment, death_place)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      p.name,
      p.period ?? '1931-1945',
      p.identity ?? '',
      p.activities ?? '',
      p.type === 'traitor' ? 'traitor' : 'hero',
      p.note ?? null,
      p.year ?? null,
      p.punishment ?? null,
      p.death_place ?? null,
    ]
  );
}

const [row] = await sql`SELECT COUNT(*)::int AS count FROM historical_figures`;
console.log(`✅ 导入完成，当前共 ${row.count} 条记录`);
