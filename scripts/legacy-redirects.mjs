/**
 * 旧 Jekyll 博客 pretty permalink（带尾部斜杠的目录形式 URL）兼容脚本。
 * 在 `npx quartz build` 之后运行，向 public/ 写入目录式 index.html 跳转页。
 * v5 的 alias-redirects 插件只能生成 xxx.html，无法覆盖 `/path/` 形式，
 * 因此用这个零依赖构建后脚本补齐。新增迁移文章时，在 redirects 表加一行即可。
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputDir = path.join(repoRoot, "public")

// key: 旧 URL（带尾部斜杠）  value: 新 Quartz 页面 slug（根路径相对）
const redirects = {
  "/2024/01/03/r-n的问题/": "/r-n的问题",
  "/2023/12/23/hello-world/": "/hello-world",
  "/about/": "/about",
}

const redirectHtml = (target) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<title>Redirecting…</title>
<link rel="canonical" href="${target}">
<meta name="robots" content="noindex">
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p>正在跳转至 <a href="${target}">${target}</a>…</p>
</body>
</html>
`

let count = 0
for (const [from, to] of Object.entries(redirects)) {
  const fromSlug = from.replace(/^\/+|\/+$/g, "")
  const dir = path.join(outputDir, fromSlug)
  await fs.mkdir(dir, { recursive: true })

  // 由目录深度计算相对路径：/a/b/c/ -> ../../../ + 目标 slug
  const depth = fromSlug.split("/").length
  const relativeTarget = "../".repeat(depth - 1) + to.replace(/^\//, "")
  await fs.writeFile(path.join(dir, "index.html"), redirectHtml(relativeTarget))
  console.log(`redirect: ${from} -> ${to}`)
  count++
}
console.log(`Legacy redirects written: ${count}`)
