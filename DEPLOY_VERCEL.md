# 🚀 Vercel + Prisma 部署完整指南

## 📋 前提条件

- ✅ GitHub 仓库已创建
- ✅ Vercel 账号已注册
- ✅ 项目代码已推送到 GitHub

## 🗄️ 第一步：创建 Vercel Postgres 数据库

### 1. 在 Vercel 创建数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **"Storage"** 标签
4. 点击 **"Create Database"**
5. 选择 **"Postgres"**
6. 选择区域（推荐：Hong Kong 或 Singapore）
7. 点击 **"Create"**

### 2. 获取环境变量

Vercel 会自动在你的项目设置中添加：
```bash
DATABASE_URL="postgres://..."
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

## 🔧 第二步：本地开发配置

### 1. 安装依赖
```bash
npm install
```

### 2. 生成 Prisma 客户端
```bash
npx prisma generate
```

### 3. 推送数据库 schema
```bash
# 连接到 Vercel 数据库
npx prisma db push

# 或者使用 Vercel 的 Postgres URL
DATABASE_URL=$(vercel env get DATABASE_URL) npx prisma db push
```

### 4. 运行种子数据
```bash
npm run db:seed
```

## 🚀 第三步：部署到 Vercel

### 方式 1：通过 Vercel 网站

1. 访问 Vercel 项目页面
2. 点击 **"Deployments"**
3. 点击 **"Redeploy"**
4. Vercel 会自动：
   - 安装依赖（包括 `postinstall` 脚本）
   - 生成 Prisma 客户端
   - 构建应用
   - 部署到全球 CDN

### 方式 2：通过 Git 推送

```bash
git add .
git commit -m "Add Prisma database support"
git push origin main
```

Vercel 会自动检测到推送并重新部署。

## 🔍 第四步：验证部署

### 1. 检查数据库连接

在 Vercel 项目中：
- 查看 **"Build Logs"** 确认构建成功
- 查看 **"Storage"** 确认数据库连接正常

### 2. 测试搜索功能

访问你的 Vercel 域名：
```
https://your-project.vercel.app
```

尝试搜索：
- "汪精卫" - 应该返回汉奸结果
- "张自忠" - 应该返回抗日英雄结果

## 📊 第五步：数据库管理

### 查看数据库内容

1. 在 Vercel 项目中点击 **"Storage"**
2. 点击你的数据库
3. 点击 **"Query"** 标签
4. 执行 SQL 查询：

```sql
-- 查看所有历史人物
SELECT * FROM "historical_figures";

-- 查看汉奸数量
SELECT COUNT(*) FROM "historical_figures" WHERE type = 'TRAITOR';

-- 查看抗日英雄数量
SELECT COUNT(*) FROM "historical_figures" WHERE type = 'HERO';
```

### 添加新数据

方式 1：通过 Prisma Studio
```bash
npx prisma studio
```

方式 2：通过 SQL 查询
```sql
INSERT INTO "historical_figures" (name, identity, period, activities, type, note, year)
VALUES ('新人物', '身份', '1931-1945', '主要事迹', 'HERO', '备注', 1940);
```

## ⚡ 性能优化

### 1. 启用连接池

Vercel Postgres 自动提供连接池，无需额外配置。

### 2. 添加缓存

在 `app/api/search/route.ts` 中添加缓存：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // 检查缓存
  const cached = cache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const results = await prisma.historicalFigure.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { identity: { contains: query, mode: 'insensitive' } },
          { activities: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    const responseData = {
      results,
      total: results.length,
      query: query,
    };

    // 设置缓存
    cache.set(query, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Database search error:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

## 🐛 常见问题解决

### 问题 1：Prisma Client 生成失败

```bash
# 解决方案：手动生成
npx prisma generate
```

### 问题 2：数据库连接失败

检查 Vercel 环境变量：
```bash
vercel env ls
```

确认 `DATABASE_URL` 已正确设置。

### 问题 3：部署时数据库迁移失败

使用 `prisma db push` 而不是 `prisma migrate`：
```bash
npx prisma db push
```

## 📈 数据库限额

### Vercel Postgres 免费版

- **存储**：512MB
- **连接**：60 个并发连接
- **带宽**：100GB/月
- **计算时间**：60 小时/月

对于你的日奸清算器项目，这些限额完全足够！

## 🎯 下一步

1. **添加更多历史人物数据**
   - 使用 Prisma Studio 或 SQL 查询
   - 通过 GitHub PR 贡献数据

2. **优化搜索功能**
   - 添加模糊搜索
   - 支持拼音搜索
   - 添加历史时间线

3. **添加管理功能**
   - 创建管理后台
   - 数据验证
   - 用户贡献系统

---

**🎉 现在你有了完整的数据库支持！**

**🇨🇳 你的日奸清算器已经准备好在 Vercel 上运行了！**
