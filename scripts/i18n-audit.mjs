/**
 * 界面文案审计：统计仍未接入 i18n 的硬编码中文。
 *
 * i18n 用的是位置数组，漏配不会有编译错误，所以留一个可量化的基线，
 * 并把它作为「只降不升」的棘轮：新增硬编码文案会让审计失败。
 *
 * 用法：
 *   node scripts/i18n-audit.mjs          # 打印统计
 *   node scripts/i18n-audit.mjs --check  # 超过基线则退出码 1
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

/**
 * 只审计界面层。lib/payments、lib/translate 里的中文是计费规则与词典数据，
 * 属于内容而不是界面文案，混在一起会让指标失去意义。
 */
const ROOTS = ["src/components", "src/features", "src/pages"]
const SKIP = /(i18n\.ts|\.test\.tsx?$)/

/** 当前基线。每清理一批就把它调小，防止回退。 */
const BASELINE = 450

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

/** 统计字符串字面量里的中文，忽略注释 */
function countHardcoded(source) {
  const withoutComments = source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
  const literals = withoutComments.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g) ?? []
  return literals.filter((text) => /[\u4e00-\u9fff]/.test(text)).length
}

const files = ROOTS.flatMap((root) => walk(root)).filter((file) => !SKIP.test(file))
const perFile = files
  .map((file) => ({
    file: relative("src", file).replace(/\\/g, "/"),
    count: countHardcoded(readFileSync(file, "utf8")),
  }))
  .filter((item) => item.count > 0)
  .sort((a, b) => b.count - a.count)

const total = perFile.reduce((sum, item) => sum + item.count, 0)
console.log(`硬编码中文文案：${total} 处（基线 ${BASELINE}）\n`)
for (const item of perFile.slice(0, 15)) {
  console.log(`  ${String(item.count).padStart(4)}  ${item.file}`)
}
if (perFile.length > 15) console.log(`  …  其余 ${perFile.length - 15} 个文件`)

if (process.argv.includes("--check") && total > BASELINE) {
  console.error(`\n新增了硬编码文案：${total} > ${BASELINE}。请改用 t("…")。`)
  process.exit(1)
}
