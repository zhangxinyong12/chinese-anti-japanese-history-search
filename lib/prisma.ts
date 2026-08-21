// Prisma 客户端实例
// 适配 Vercel Serverless 环境

import { PrismaClient } from '@prisma/client';

// 在开发环境中使用全局变量防止热重载创建多个实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Vercel 专用：连接池优化
if (process.env.VERCEL) {
  prisma.$connect();
}
