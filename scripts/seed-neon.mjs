// Neon 数据库增量导入种子数据
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
const { traitors = [] } = JSON.parse(
  readFileSync(resolve(root, 'data/historical-figures.json'), 'utf8')
);

console.log(`📦 开始导入：汉奸 ${traitors.length} 人`);

// 只补充缺失的人物，避免重复部署时删除用户提交或覆盖人工修订。
for (const p of traitors) {
  const existing = await sql`
    SELECT id FROM historical_figures WHERE name = ${p.name} LIMIT 1
  `;

  if (existing.length > 0) {
    console.log(`⏭️ 已存在，跳过：${p.name}`);
    continue;
  }

  await sql`
    INSERT INTO historical_figures
      (name, period, identity, activities, note, year, punishment, death_place, is_deleted)
    VALUES
      (${p.name}, ${p.period ?? '1931-1945'}, ${p.identity ?? ''},
       ${p.activities ?? ''}, ${p.note ?? null}, ${p.year ?? null},
       ${p.punishment ?? null}, ${p.deathPlace ?? p.death_place ?? null}, false)
  `;
  console.log(`➕ 已添加：${p.name}`);
}

const [row] = await sql`SELECT COUNT(*)::int AS count FROM historical_figures`;
console.log(`✅ 导入完成，当前共 ${row.count} 条记录`);
