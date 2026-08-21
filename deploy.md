# 🚀 部署指南

## 🌐 Vercel 部署步骤

### 1. 准备工作

确保你已完成以下步骤：
- ✅ 代码已推送到 GitHub
- ✅ 拥有 Vercel 账号 (https://vercel.com)
- ✅ package.json 配置正确

### 2. 通过 Vercel 网站部署

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目

3. **配置项目**
   ```json
   {
     "Framework Preset": "Next.js",
     "Build Command": "npm run build",
     "Output Directory": ".next",
     "Install Command": "npm install"
   }
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约 2-3 分钟）
   - 获得部署域名：`https://your-project.vercel.app`

### 3. 通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

### 4. 环境变量（如需要）

如果项目需要环境变量，在 Vercel 控制台设置：

```bash
# 在 Vercel 项目设置中添加环境变量
NEXT_PUBLIC_API_URL=your_api_url
```

### 5. 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 配置 DNS 记录：
   ```
   Type: CNAME
   Name: your-domain.com
   Value: cname.vercel-dns.com
   ```

## 🔧 部署配置文件

项目已包含 `vercel.json` 配置文件，包含以下设置：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hkg1"],  // 香港节点，适合国内用户访问
  "headers": [
    // 安全头部配置
  ]
}
```

## 📊 部署后检查清单

部署完成后，请检查：

- [ ] 网站可以正常访问
- [ ] 中文搜索功能正常工作
- [ ] 响应式设计在不同设备上正常
- [ ] 加载速度正常
- [ ] 没有 console 错误
- [ ] SEO 标签正确
- [ ] 历史人物数据正确显示

## 🔄 更新部署

每次推送到 GitHub 主分支时，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update website"
git push origin main
```

## 🐛 常见问题

### 部署失败

1. 检查构建日志
2. 确认所有依赖都已安装
3. 检查 TypeScript 编译错误
4. 验证环境变量配置

### 路由问题

- 确认 `next.config.js` 配置正确
- 检查静态导出设置
- 验证 API 路由路径

### 性能优化

- 启用 Vercel Analytics
- 配置图片优化
- 使用 CDN 加速
- 启用缓存策略

### 中文显示问题

- 确认字体配置正确
- 检查字符编码设置
- 验证中文搜索功能

## 🌏 国内访问优化

### 1. 节点选择
- 使用香港节点 (hkg1) 优化国内访问速度
- 考虑使用自定义域名 + 国内 CDN

### 2. 网络优化
- 启用图片压缩和优化
- 使用静态资源 CDN
- 配置合理的缓存策略

### 3. SEO 优化
- 添加中文 meta 标签
- 配置 sitemap.xml
- 优化页面加载速度

## 📱 移动端优化

本项目已配置响应式设计，在移动设备上会自动适配：

- 自适应布局
- 触摸友好界面
- 移动端性能优化
- 横竖屏支持

## 🔍 功能测试

部署后建议进行以下测试：

### 搜索功能测试
- 测试中文姓名搜索（如：汪精卫）
- 测试关键词搜索（如：伪政府）
- 验证搜索结果准确性

### 页面功能测试
- 测试所有链接和按钮
- 验证响应式布局
- 检查中文显示正常

### 性能测试
- 测试页面加载速度
- 检查图片加载优化
- 验证 API 响应时间

## 📈 监控和分析

### Vercel Analytics
1. 在 Vercel 控制台启用 Analytics
2. 查看访问数据和用户行为
3. 优化页面性能

### 错误监控
- 监控 404 错误
- 跟踪 API 错误
- 查看服务器日志

## 🎯 部署成功后

### 立即配置
1. **绑定自定义域名**（可选）
2. **启用 HTTPS**（自动提供）
3. **配置 DNS**（如使用自定义域名）

### 运维维护
1. **定期更新依赖**
2. **监控网站性能**
3. **备份重要数据**
4. **更新历史人物数据**

### 推广建议
1. **分享部署链接**
2. **提交到相关目录**
3. **欢迎社区贡献**
4. **收集用户反馈**

---

## 🎉 部署成功！

恭喜！你的日奸清算器现在已成功部署。

**你的网站地址**: `https://your-project.vercel.app`

**接下来的工作**:
- 添加更多历史人物数据
- 完善搜索功能
- 优化用户体验
- 欢迎社区贡献

**⚠️ 重要提醒**:
- 定期更新历史资料
- 验证数据准确性
- 保持历史教育意义

**🇨🇳 缅怀先烈，警惕汉奸，铭记历史，珍爱和平！**

---

如有问题，请查看 [Vercel 官方文档](https://vercel.com/docs) 或提交 Issue。
