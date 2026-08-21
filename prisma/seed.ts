// 数据库初始化种子数据
// 使用 Prisma Seed 在 Vercel Postgres 中初始化历史人物数据

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化历史人物数据...');

  // 清空现有数据
  await prisma.historicalFigure.deleteMany();

  // 汉奸数据
  const traitors = [
    {
      name: '汪精卫',
      identity: '伪国民政府主席',
      period: '1931-1945',
      activities: '投靠日本，成立伪国民政府，背叛国家和民族',
      type: 'TRAITOR',
      note: '抗日战争时期最大的汉奸之一',
      year: 1940,
      deathPlace: '日本名古屋',
      punishment: '病死于日本（1944年）'
    },
    {
      name: '陈公博',
      identity: '伪国民政府立法院院长',
      period: '1931-1945',
      activities: '汪伪政权重要成员，积极参与投敌叛国活动',
      type: 'TRAITOR',
      note: '战后被判处死刑',
      year: 1946,
      deathPlace: '苏州',
      punishment: '被执行死刑（1946年）'
    },
    {
      name: '周佛海',
      identity: '伪国民政府行政院副院长',
      period: '1931-1945',
      activities: '汪伪政权核心成员，协助日本统治',
      type: 'TRAITOR',
      note: '战后被判处死刑，后改无期徒刑',
      year: 1948,
      deathPlace: '南京',
      punishment: '死于狱中（1948年）'
    },
    {
      name: '梁鸿志',
      identity: '伪中华民国维新政府主席',
      period: '1931-1945',
      activities: '在日本支持下成立伪政权，背叛国家',
      type: 'TRAITOR',
      note: '战后被判处死刑',
      year: 1946,
      deathPlace: '上海',
      punishment: '被执行死刑（1946年）'
    },
    {
      name: '李士群',
      identity: '伪76号特工总部主任',
      period: '1931-1945',
      activities: '汪伪政权特务头子，残酷镇压抗日力量',
      type: 'TRAITOR',
      note: '后被毒死',
      year: 1943,
      deathPlace: '上海',
      punishment: '被毒死（1943年）'
    },
  ];

  // 抗日英雄数据
  const heroes = [
    {
      name: '张自忠',
      identity: '国民党第33集团军总司令',
      period: '1931-1945',
      activities: '抗日战争中牺牲的最高级别将领，英勇抗日，壮烈殉国',
      type: 'HERO',
      note: '被誉为"抗战军人之魂"',
      year: 1940,
      deathPlace: '湖北宜城南瓜店',
      punishment: null
    },
    {
      name: '杨靖宇',
      identity: '东北抗日联军第一路军总司令',
      period: '1931-1945',
      activities: '东北抗日联军领导人，在零下40度的严寒中与日军作战',
      type: 'HERO',
      note: '孤身奋战数日后壮烈牺牲，胃里只有草根和树皮',
      year: 1940,
      deathPlace: '吉林蒙江县（今靖宇县）',
      punishment: null
    },
    {
      name: '赵一曼',
      identity: '东北抗日联军团政委',
      period: '1931-1945',
      activities: '女抗日英雄，被捕后遭受酷刑仍坚贞不屈',
      type: 'HERO',
      note: '就义前给儿子写下遗书，感人至深',
      year: 1936,
      deathPlace: '黑龙江珠河县（今尚志市）',
      punishment: null
    },
    {
      name: '左权',
      identity: '八路军副参谋长',
      period: '1931-1945',
      activities: '八路军高级将领，在抗日战场上英勇作战',
      type: 'HERO',
      note: '1942年在山西辽县(今左权县)战斗中牺牲',
      year: 1942,
      deathPlace: '山西辽县（今左权县）',
      punishment: null
    },
    {
      name: '彭雪枫',
      identity: '新四军第四师师长',
      period: '1931-1945',
      activities: '新四军著名将领，英勇抗日，战功赫赫',
      type: 'HERO',
      note: '1944年在河南战斗中牺牲',
      year: 1944,
      deathPlace: '河南夏邑县八里庄',
      punishment: null
    },
  ];

  // 插入数据
  await prisma.historicalFigure.createMany({
    data: [...traitors, ...heroes],
  });

  console.log('✅ 初始化完成！插入了', traitors.length + heroes.length, '条历史人物记录');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
