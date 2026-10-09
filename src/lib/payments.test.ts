import { describe, expect, it } from "vitest"
import {
  availableChannels,
  channels,
  firstChannel,
  formatMoney,
  localPrice,
  priceQuote,
  regionById,
  regions,
  yearlySaving,
} from "@/lib/payments"

describe("地区与渠道数据", () => {
  it("地区 id 唯一，且币种 / 税种 / 地区码齐全", () => {
    expect(regions.length).toBeGreaterThan(0)
    expect(new Set(regions.map((r) => r.id)).size).toBe(regions.length)
    for (const region of regions) {
      expect(region.currency).toMatch(/^[A-Z]{3}$/)
      expect(region.locale.trim()).not.toBe("")
      expect(["vat", "sales", "gst", "consumption", "none"]).toContain(region.taxKind)
    }
  })

  it("渠道覆盖三大平台且 id 唯一", () => {
    expect(new Set(channels.map((c) => c.id)).size).toBe(channels.length)
    const platforms = new Set(channels.map((c) => c.platform))
    expect(platforms).toContain("ios")
    expect(platforms).toContain("android")
    expect(platforms).toContain("web")
  })

  it("未知地区回落到第一个地区而不是抛错", () => {
    expect(regionById("不存在的地区").id).toBe(regions[0].id)
    expect(regionById(null).id).toBe(regions[0].id)
  })
})

describe("多币种定价", () => {
  it("月付与年付都为正，且年付单价低于 12 个月月付", () => {
    for (const region of regions) {
      const monthly = localPrice("monthly", region)
      const yearly = localPrice("yearly", region)
      expect(monthly).toBeGreaterThan(0)
      expect(yearly).toBeGreaterThan(0)
      expect(yearly).toBeLessThan(monthly * 12)
    }
  })

  it("取整符合当地习惯：charm 地区的价格以 .99 结尾", () => {
    for (const region of regions.filter((r) => r.charm)) {
      const price = localPrice("monthly", region)
      expect(Math.abs((price * 100) % 100 - 99)).toBeLessThan(0.001)
    }
  })

  it("年付节省比例落在 0–100 之间", () => {
    for (const region of regions) {
      const saving = yearlySaving(region)
      expect(saving).toBeGreaterThanOrEqual(0)
      expect(saving).toBeLessThanOrEqual(100)
    }
  })

  it("金额格式化带币种符号", () => {
    const us = regionById("US")
    expect(formatMoney(localPrice("monthly", us), us)).toContain("$")
  })
})

describe("税费计算", () => {
  it("含税地区实付即标价，不含税地区实付为标价加税", () => {
    for (const region of regions) {
      const quote = priceQuote("monthly", region)
      if (region.priceInclusive) {
        expect(quote.inclusive).toBe(true)
        expect(quote.total).toBeCloseTo(quote.gross, 6)
        expect(quote.tax).toBeGreaterThanOrEqual(0)
      } else {
        expect(quote.inclusive).toBe(false)
        expect(quote.total).toBeCloseTo(quote.gross + quote.tax, 6)
      }
    }
  })

  it("美国按账单州税率覆盖国家默认税率", () => {
    const us = regionById("US")
    const state = us.states?.[0]
    expect(state).toBeDefined()
    if (!state) return
    const quote = priceQuote("monthly", us, state.id)
    expect(quote.rate).toBe(state.rate)
  })
})

describe("渠道可用性", () => {
  it("被地区排除的渠道不会出现在可选列表里", () => {
    for (const region of regions) {
      for (const channel of availableChannels(region, "android")) {
        expect(region.excluded ?? []).not.toContain(channel.id)
      }
    }
  })

  it("每个地区的每个平台都至少有一个可用渠道", () => {
    for (const region of regions) {
      for (const platform of ["ios", "android", "web"] as const) {
        expect(availableChannels(region, platform).length).toBeGreaterThan(0)
        expect(firstChannel(region, platform)).toBeTruthy()
      }
    }
  })
})
