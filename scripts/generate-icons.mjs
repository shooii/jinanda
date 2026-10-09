/**
 * 生成 PWA 图标（192 / 512）。
 *
 * 用手写 PNG 编码器而不是引入图像依赖：图标是纯几何图形，
 * 一个圆角方块加一个 L 字形，像素级可控且不增加构建依赖。
 *
 * 用法：node scripts/generate-icons.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs"
import { deflateSync } from "node:zlib"

const BRAND = [0x2f, 0x6c, 0xf6]
const WHITE = [0xff, 0xff, 0xff]

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(size, pixelAt) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0 // filter: none
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixelAt(x, y)
      const offset = y * stride + 1 + x * 4
      raw[offset] = r
      raw[offset + 1] = g
      raw[offset + 2] = b
      raw[offset + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/** 圆角方块 + L 字形，坐标一律归一化，缩放不糊 */
function pixelAt(size) {
  const radius = 0.22
  const lVertical = [0.34, 0.29, 0.46, 0.68]
  const lHorizontal = [0.34, 0.56, 0.68, 0.68]
  return (x, y) => {
    const nx = (x + 0.5) / size
    const ny = (y + 0.5) / size

    // 圆角矩形命中判定
    const cx = Math.min(Math.max(nx, radius), 1 - radius)
    const cy = Math.min(Math.max(ny, radius), 1 - radius)
    const dx = nx - cx
    const dy = ny - cy
    const outside = Math.hypot(dx, dy) > radius
      ? Math.max(0, Math.abs(dx), Math.abs(dy)) > 0 && Math.hypot(dx, dy) > radius
      : false
    if (outside) return [0, 0, 0, 0]

    const inVertical =
      nx >= lVertical[0] && nx <= lVertical[2] && ny >= lVertical[1] && ny <= lVertical[3]
    const inHorizontal =
      nx >= lHorizontal[0] && nx <= lHorizontal[2] && ny >= lHorizontal[1] && ny <= lHorizontal[3]
    if (inVertical || inHorizontal) return [...WHITE, 255]
    return [...BRAND, 255]
  }
}

mkdirSync("public", { recursive: true })
for (const size of [192, 512]) {
  const png = encodePng(size, pixelAt(size))
  writeFileSync(`public/icon-${size}.png`, png)
  console.log(`public/icon-${size}.png  ${png.length} bytes`)
}
