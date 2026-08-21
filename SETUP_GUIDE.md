# 🚀 日奸清算器 - 快速部署指南

## 📋 项目概览

日奸清算器是一个基于 Next.js 15 构建的中国抗日战争时期历史人物查询工具，支持查询1931-1945年期间的汉奸、伪政府官员和抗日英雄。

## ⚡ 快速开始

### 1. 环境要求
- Node.js 18.x+
- npm 或 yarn
- Git

### 2. 本地运行
```bash
# 克隆仓库
git clone https://github.com/yourusername/japanese-traitor-search.git
cd japanese-traitor-search

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 3. 构建生产版本
```bash
npm run build
npm start
```

## 🌐 部署到 Vercel

### 方式一：通过 Vercel 网站
1. 访问 https://vercel.com 并登录
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 配置
5. 点击 "Deploy" 开始部署

### 方式二：通过 Vercel CLI
```bash
# 全局安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

### 部署配置
项目已包含完整的 Vercel 配置 (`vercel.json`)，支持：
- 自动构建和部署
- 香港节点部署（优化国内访问速度）
- 安全头部配置
- 静态资源优化

## 📦 GitHub 推送准备

### 1. 初始化 Git 仓库
```bash
cd "D:\Personal\日奸清算器"
git init
git add .
git commit -m "Initial commit: 日奸清算器项目"
```

### 2. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 创建新仓库（建议名称：`japanese-traitor-search` 或 `日奸清算器`）
3. 不要初始化 README（我们已有）

### 3. 推送到 GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/japanese-traitor-search.git
git branch -M main
git push -u origin main
```

## 🎨 自定义配置

### 网站信息编辑
编辑 `app/layout.tsx` 修改：
- 网站标题
- Meta 描述
- 页脚信息

### 数据扩充
编辑 `app/api/search/route.ts` 添加：
- 更多历史人物数据
- 修正现有信息
- 添加新的搜索字段

### 样式自定义
编辑 `app/globals.css` 调整：
- 颜色方案
- 字体样式
- 组件样式

## 🔧 常见问题解决

### 依赖安装失败
```bash
# 清理缓存后重新安装
rm -rf node_modules package-lock.json
npm install
```

### 构建错误
```bash
# 检查 TypeScript 错误
npm run lint

# 重新构建
npm run build
```

### 搜索功能异常
- 检查 API 路由配置
- 验证数据格式正确性
- 查看浏览器控制台错误

## 📊 项目结构说明

```
日奸清算器/
├── app/                    # Next.js 应用目录
│   ├── api/search/        # 搜索 API
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 主页面
│   └── globals.css       # 全局样式
├── components/            # React 组件（待扩展）
├── lib/                   # 工具函数
├── public/               # 静态资源
├── .github/              # GitHub 模板和配置
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.ts    # Tailwind CSS 配置
├── next.config.js        # Next.js 配置
└── vercel.json          # Vercel 部署配置
```

## 🎯 历史时期说明

### 抗日战争时期 (1931-1945)

- **九一八事变 (1931年)**：日本侵占中国东北
- **七七事变 (1937年)**：全面抗战爆发
- **抗战胜利 (1945年)**：日本投降，抗战结束

### 主要人物类型

- **汉奸/伪政府官员**：投靠日本侵略者的历史人物
- **抗日英雄/爱国志士**：为保卫祖国抵抗侵略的志士

## 🚀 部署检查清单

部署前确认：
- [ ] 所有文件已提交到 Git
- [ ] package.json 配置正确
- [ ] 依赖已安装（npm install）
- [ ] 本地构建成功（npm run build）
- [ ] 搜索功能正常工作
- [ ] 响应式设计正常

部署后确认：
- [ ] 网站可访问
- [ ] API 路由正常
- [ ] 没有 console 错误
- [ ] 移动端显示正常

## 📞 技术支持

遇到问题？查看以下资源：
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [项目 Issues](https://github.com/yourusername/japanese-traitor-search/issues)

## 🎉 部署成功后

部署成功后，你会获得：
- Vercel 域名：`https://your-project.vercel.app`
- 自动 HTTPS
- 全球 CDN 加速
- 自动部署（推送代码时）

接下来你可以：
- 绑定自定义域名
- 启用 Vercel Analytics
- 配置环境变量
- 添加团队成员

## 📜 数据来源

当前数据库包含示例数据，实际应用中建议补充：

### 官方史料
- 抗日战争纪念馆官方资料
- 国家档案馆历史档案
- 各地地方志和历史文献

### 学术研究
- 抗日战争史研究专著
- 历史学术论文
- 专家研究成果

### 补充建议
- 欢迎提交 PR 补充更多历史人物
- 提供可靠的历史来源引用
- 添加详细的历史背景说明

---

**准备好了吗？开始部署你的日奸清算器吧！** 🚀
