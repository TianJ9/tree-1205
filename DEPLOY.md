# GitHub Pages 部署指南

## 部署步骤

### 1. 准备 GitHub 仓库

1. 在 GitHub 上创建一个新仓库（如果还没有）
2. 将代码推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

### 2. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 在左侧菜单中找到 **Pages**（页面）
4. 在 **Source**（源）部分：
   - 选择 **GitHub Actions** 作为部署源
   - 保存设置

### 3. 配置仓库名称（重要）

如果你的仓库名不是 `christmas-tree-main`，需要修改 `vite.config.ts` 中的 `base` 路径：

```typescript
base: '/你的仓库名/',
```

例如，如果仓库名是 `my-christmas-tree`，则改为：
```typescript
base: '/my-christmas-tree/',
```

### 4. 确保照片文件被提交

检查 `.gitignore` 文件，确保 `public/photos/` 目录中的照片文件不会被忽略。

如果 `.gitignore` 中有 `*.jpg` 规则，需要添加例外：
```
# 允许 public/photos 目录中的图片
!public/photos/*.jpg
```

### 5. 自动部署

配置完成后，每次推送到 `main` 分支时，GitHub Actions 会自动：
- 安装依赖
- 构建项目
- 部署到 GitHub Pages

### 6. 访问你的网站

部署完成后，你的网站地址将是：
```
https://你的用户名.github.io/你的仓库名/
```

## 手动部署（可选）

如果你想手动部署：

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录的内容推送到 `gh-pages` 分支：
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

## 注意事项

- 首次部署可能需要几分钟时间
- 确保所有静态资源（照片、模型文件）都在 `public` 目录中
- 如果使用自定义域名，需要在仓库 Settings > Pages 中配置

