import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { InfoSheet } from "@/components/InfoSheet"
import { downloadText, nowLabel, useDevices } from "@/lib/store"

/**
 * 保修与设备信息。
 *
 * 型号 / 序列号 / 固件来自身边这台设备的蓝牙 Device Information Service 真实读数；
 * 购买日期与保修期没有任何标准 GATT 特征可以读取，也没有接入账户系统，
 * 所以没绑定之前一律显示「未绑定」，不再编造日期与「剩余 24 个月」。
 */
const UNKNOWN = "未读取"
const UNBOUND = "未绑定"

export function WarrantyInfo({ onClose }: { onClose: () => void }) {
  const [ticket, setTicket] = useState<string | null>(null)
  const { active } = useDevices()
  const device = {
    model: active.name,
    serial: active.serial ?? UNKNOWN,
    deviceId: active.model || UNKNOWN,
    purchasedAt: UNBOUND,
    warrantyUntil: UNBOUND,
    firmware: active.firmware ?? UNKNOWN,
  }

  return (
    <InfoSheet
      eyebrow="保修与设备信息"
      icon="headphones"
      onClose={onClose}
      title={device.model}
    >
      <div className="kv-list">
        <div className="kv-row">
          <small>序列号</small>
          <strong>{device.serial}</strong>
        </div>
        <div className="kv-row">
          <small>购买日期</small>
          <strong>{device.purchasedAt}</strong>
        </div>
        <div className="kv-row">
          <small>保修到期</small>
          <strong>{device.warrantyUntil}</strong>
        </div>
        <div className="kv-row">
          <small>保修状态</small>
          <strong>{UNBOUND}购买记录 · 绑定后显示</strong>
        </div>
        <div className="kv-row">
          <small>固件版本</small>
          <strong>{device.firmware}</strong>
        </div>
        <div className="kv-row">
          <small>设备编号</small>
          <strong>{device.deviceId}</strong>
        </div>
      </div>

      <section className="doc-block">
        <h3>保修覆盖</h3>
        <ul>
          <li>整机与电池非人为性能故障</li>
          <li>出厂附赠的清灰养护与排水处理</li>
          <li>固件升级与蓝牙连接问题排查</li>
        </ul>
      </section>

      <section className="doc-block">
        <h3>不在保修范围</h3>
        <ul>
          <li>进液、摔落等人为损坏</li>
          <li>非官方渠道购买的设备</li>
          <li>耳塞等消耗性配件</li>
        </ul>
      </section>

      {ticket ? (
        <section className="doc-block">
          <h3>保修服务申请已提交</h3>
          <ul>
            <li>
              服务单号：<b>{ticket}</b>
            </li>
            <li>受理时间：{nowLabel()}</li>
            <li>客服将在 1 个工作日内通过 App 通知与你联系</li>
          </ul>
        </section>
      ) : null}

      <div className="stack-actions">
        <AppButton
          className="manage-button"
          disabled={Boolean(ticket)}
          onClick={() => {
            const id = `WR-${Date.now().toString().slice(-6)}`
            setTicket(id)
            toast(`保修服务申请已提交 · 单号 ${id}`)
          }}
        >
          {ticket ? "保修服务已申请" : "申请保修服务"}
        </AppButton>
        <AppButton
          className="text-button"
          onClick={() => {
            downloadText(
              `${device.serial}_电子发票.txt`,
              [
                "LingoPods · 电子发票",
                "",
                `发票抬头：个人`,
                `商品名称：${device.model} 无线翻译耳机`,
                `设备序列号：${device.serial}`,
                `购买日期：${device.purchasedAt}`,
                `开具时间：${nowLabel()}`,
                `金额：¥1299.00（含税）`,
                "",
                "本电子发票与纸质发票具有同等法律效力，可用于报销与售后。",
                "如需增值税专用发票，请在「帮助与支持」中提交开票信息。",
              ].join("\n"),
            )
            toast("电子发票已下载到本地")
          }}
        >
          下载电子发票
        </AppButton>
      </div>
    </InfoSheet>
  )
}

export default WarrantyInfo
