# 🇨🇳 日奸清算器

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 项目背景

### 📜 从韩国热点说起

2026年，韩国一个民间开发的"亲日派查询器"网站意外爆火，引发了全社会对历史清算的广泛关注。这个事件源于韩国女演员安贺营在综艺节目中炫耀家世，被网友通过该网站查出其曾祖父是日本殖民时期的亲日人士，导致其代言和剧集全部取消，引爆了韩国社会的深度讨论。

那个韩国网站允许用户输入"姓氏+本贯"（韩国祖籍，如：순흥 안씨 顺兴安氏），就能查询到同宗族里是否有已经被历史委员会认定的亲日者或抗日有功者。数据库基于韩国国家报勋部的公开档案，包含约1,006名认定亲日人员和19,059位抗日义士记录。

### 🎯 我们的思考

看到这个韩国案例后，我们想到：**中国也有丰富的抗日战争历史，为什么我们没有类似的工具？**

中国的抗日战争时期(1931-1945)同样有：
- 🔴 **汉奸群体**：投靠日本侵略者的伪政府官员、伪军将领
- 🟢 **抗日英雄**：为保卫祖国抵抗侵略的无数志士

**我们怀念张自忠、杨靖宇、赵一曼这样的民族英雄，也必须铭记汪精卫、陈公博、周佛海这样的历史教训。**

### 🚀 应运而生

受到韩国案例的启发，我们开发了这款**日奸清算器** —— 专门针对中国抗日战争时期的历史人物查询工具。这不是简单的模仿，而是基于中国自身的历史需求和教育意义：

- 🇨🇳 **服务中国用户**：完全简体中文界面
- 📚 **基于中国历史**：1931-1945年抗日战争时期
- 🎯 **面向中文查询**：支持中文姓名和关键词搜索
- ⚖️ **平衡历史观**：既缅怀先烈，也警示后人

## 📖 项目简介

日奸清算器是一个基于中国抗日战争时期历史档案的查询工具，用于查询1931-1945年期间的汉奸、伪政府官员和抗日英雄的历史记录。

### ⚠️ 重要声明

- **本项目仅供历史研究和教育参考使用**
- 基于公开的历史资料和学术研究
- 历史评价需要放在具体历史背景中理解
- 不得将历史记录简单套用到当代普通人身上
- 欢迎补充更多历史人物资料和文献引用

## 🚀 功能特性

- 🔍 **智能搜索**：支持中文姓名和关键词搜索
- 📊 **双数据库**：汉奸/伪政府官员 + 抗日英雄/爱国志士
- 🎨 **现代UI**：使用 Tailwind CSS 构建的响应式界面
- ⚡ **快速部署**：支持 Vercel 一键部署
- 🇨🇳 **中文界面**：完全简体中文，适合国内用户
- 💾 **现代数据库**：支持 Prisma + Vercel Postgres

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **编程语言**: TypeScript
- **样式方案**: Tailwind CSS
- **数据库**: Prisma + Vercel Postgres
- **部署平台**: Vercel
- **历史时期**: 1931-1945 中国抗日战争

## 📦 安装和运行

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/zhangxinyong/chinese-anti-japanese-history-search.git
cd chinese-anti-japanese-history-search

# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库 schema
npx prisma db push

# 运行种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## 🌐 部署到 Vercel

### 快速部署

1. **创建 Vercel Postgres 数据库**
   - 在 Vercel Dashboard → Storage → Create Database
   - 选择 Postgres 数据库

2. **部署项目**
   - 访问 https://vercel.com 并用 GitHub 登录
   - 导入你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 配置
   - 点击 "Deploy" 开始部署

3. **初始化数据**
   - 部署完成后运行种子脚本
   - 或通过 Prisma Studio 添加数据

**详细部署指南请查看 [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)**

## 📝 使用方法

### 搜索方式

1. **输入格式**：中文姓名或关键词
2. **搜索示例**：
   - 姓名搜索：`汪精卫`、`张自忠`
   - 关键词搜索：`伪政府`、`抗日`

### 搜索结果说明

- 🔴 **汉奸/伪政府官员**：投靠日本侵略者的历史人物
- 🟢 **抗日英雄/爱国志士**：为保卫祖国抵抗侵略的志士

## 📂 项目结构

```
日奸清算器/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts        # 搜索API路由
│   ├── layout.tsx               # 应用布局
│   ├── page.tsx                 # 主页面
│   └── globals.css              # 全局样式
├── prisma/
│   ├── schema.prisma            # 数据库模型
│   └── seed.ts                 # 初始化数据
├── lib/
│   ├── prisma.ts               # Prisma 客户端
│   └── utils.ts                # 工具函数
├── data/
│   └── historical-figures.json  # JSON 数据备份
├── components/                  # React 组件
├── public/                     # 静态资源
├── README.md                    # 项目说明
├── DEPLOY_VERCEL.md            # Vercel 部署指南
└── package.json
```

## 🎯 历史背景

### 抗日战争时期 (1931-1945)

这是中华民族历史上最艰苦卓绝的时期之一。从1931年九一八事变开始，到1945年日本投降结束，历时14年。

### 🔴 主要汉奸势力

- **伪满洲国政府** (1932-1945)：日本在中国东北建立的傀儡政权
- **汪精卫伪国民政府** (1940-1945)：日本在南京建立的傀儡政权  
- **各地伪维持会**：日本在占领区建立的伪地方政权

### 🟢 抗日力量

- **中国共产党**：领导的八路军、新四军等抗日武装
- **国民党**：领导的正规军和地方武装
- **各界爱国人士**：包括知识分子、工人、农民、商人等

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

特别欢迎：
- 补充更多历史人物资料
- 修正历史信息错误
- 添加详细的历史背景说明
- 改进用户界面和功能

### 数据贡献

你可以通过以下方式贡献数据：

1. **提交 PR**：直接添加历史人物数据
2. **Issue 报告**：报告数据错误或补充建议
3. **Prisma Studio**：使用可视化工具管理数据

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源。

## ⚠️ 免责声明

1. 本项目仅供历史研究和教育参考使用
2. 历史评价复杂，需要放在具体历史背景中理解
3. 数据可能不完整或有遗漏，欢迎补充
4. 不得将历史记录用于诽谤当代人
5. 历史人物后人的情况各不相同，应具体分析
6. 开发者不对使用本工具产生的任何后果承担责任

## 🔗 相关资源

### 历史资料
- [抗日战争纪念网](http://www.krzzjn.com/)
- [中国国家博物馆](http://www.chnmuseum.cn/)
- [抗日战争纪念馆](http://www.1937-1945.org.cn/)

### 技术文档
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Vercel 文档](https://vercel.com/docs)

### 项目相关
- **启发来源**：韩国亲日派查询器网站
- **灵感来源**：韩国2026年《亲日反民族行为者财产的国家归属等相关特别法》

## 💡 技术支持

如有技术问题，请通过以下方式联系：

- 提交 GitHub Issue: https://github.com/zhangxinyong/chinese-anti-japanese-history-search/issues
- 发送邮件至：13271150671@wo.cn
- 查看 [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) 部署指南

## 🌟 致谢

- 感谢韩国开发者的启发，让我们意识到历史教育工具的重要性
- 感谢所有为抗日战争历史研究做出贡献的学者和研究人员
- 感谢开源社区提供的优秀工具和框架

---

**🇨🇳 缅怀先烈，警惕汉奸，铭记历史，珍爱和平！**

**⚠️ 再次提醒：这是历史教育工具，请理性使用，尊重历史，尊重事实。**
