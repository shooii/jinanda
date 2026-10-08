import { useState } from "react"
import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { downloadText, nowLabel } from "@/lib/store"



const device = {
  model: "LingoPods Pro",
  serial: "LP-8821-CN-0417",
  deviceId: "LP-8821",
  purchasedAt: "2025 年 10 月 18 日",
  warrantyUntil: "2027 年 10 月 18 日",
  firmware: "2.4.1",
}

export function WarrantyInfo({ onClose }: { onClose: () => void }) {
  const [ticket, setTicket] = useState<string | null>(null)

  return (
    <InfoSheet
      eyebrow="保修与设备信息"
      icon="headphones"
      onClose={onClose}
      title="LingoPods Pro"
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
          <strong className="good">
            <Icon name="check" size={15} /> 在保 · 剩余 24 个月
          </strong>
        </div>
        <div className="kv-row">
          <small>固件版本</small>
          <strong>{device.firmware} · 已是最新</strong>
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
