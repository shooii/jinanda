import { AppButton, toast } from "@/components/AppButton"
import { Icon } from "@/components/Icon"
import { InfoSheet } from "@/components/InfoSheet"
import { copyText } from "@/lib/store"

export type LegalDocId = "terms" | "privacy" | "agreement"

const docs: Record<
  LegalDocId,
  { title: string; eyebrow: string; updated: string; sections: { h: string; p: string[] }[] }
> = {
  terms: {
    title: "服务条款",
    eyebrow: "Lingo+ 会员",
    updated: "更新日期：2026 年 9 月 1 日",
    sections: [
      {
        h: "一、服务范围",
        p: [
          "Lingo+ 为 LingoPods 设备提供实时翻译、会议纪要与离线语言包等服务，具体功能以 App 内实际提供为准。",
          "设备赠送权益与单独订阅权益在可用功能上保持一致，仅计费方式不同。",
        ],
      },
      {
        h: "二、订阅与续费",
        p: [
          "单独订阅按月或按年计费，到期前 7 天会推送续费提醒。",
          "赠送期结束后如未取消，将按 ¥38/月 自动续费；你可随时在订阅管理中关闭。",
        ],
      },
      {
        h: "三、取消与退款",
        p: [
          "关闭自动续费后，当期权益保留至到期日，不影响已获得的服务。",
          "已使用超过 7 天的订阅不支持按比例退款，具体以应用商店政策为准。",
        ],
      },
    ],
  },
  privacy: {
    title: "隐私政策",
    eyebrow: "数据与隐私",
    updated: "更新日期：2026 年 9 月 1 日",
    sections: [
      {
        h: "一、我们收集什么",
        p: [
          "为实现翻译功能，仅在会话进行中处理语音与文本，原始音频在会话结束后自动删除。",
          "设备信息（型号、固件版本、电量）用于连接与养护功能。",
        ],
      },
      {
        h: "二、我们如何使用",
        p: [
          "翻译记录默认仅保存在你的设备上；未接入账户服务时不会上传或同步。本应用不保存原始音频，记录也不会用于任何广告用途。",
          "“用于改进识别”默认关闭，开启后仅上传脱敏文本，不上传原始音频。",
        ],
      },
      {
        h: "三、你的权利",
        p: [
          "你可随时导出或删除全部翻译记录，删除操作不可恢复。",
          "可在数据与隐私中关闭记录保存，关闭后新会话不再留存任何内容。",
        ],
      },
    ],
  },
  agreement: {
    title: "用户协议",
    eyebrow: "账号与使用",
    updated: "更新日期：2026 年 9 月 1 日",
    sections: [
      {
        h: "一、账号",
        p: [
          "你需要使用本人手机号注册并妥善保管账号，账号下的行为由你自行负责。",
          "一个账号最多可绑定 5 台 LingoPods 设备。",
        ],
      },
      {
        h: "二、使用规范",
        p: [
          "请勿在未经对方同意的情况下录音或转写会议内容。",
          "不得将翻译服务用于违法用途或批量爬取等滥用行为。",
        ],
      },
      {
        h: "三、责任范围",
        p: [
          "翻译结果仅供参考，重要场合请与对方确认后再执行。",
          "因网络或环境导致的识别偏差，不构成服务质量承诺的违反。",
        ],
      },
    ],
  },
}

export function LegalDocument({
  doc,
  onClose,
}: {
  doc: LegalDocId
  onClose: () => void
}) {
  const content = docs[doc]

  const copyDoc = async () => {
    const text = [
      content.title,
      content.updated,
      "",
      ...content.sections.flatMap((section) => [
        section.h,
        ...section.p,
        "",
      ]),
      "—— LingoPods",
    ].join("\n")
    const ok = await copyText(text)
    toast(ok ? "文档全文已复制" : "复制失败，请手动选择文本")
  }

  return (
    <InfoSheet
      eyebrow={content.eyebrow}
      icon="notes"
      onClose={onClose}
      title={content.title}
    >
      <small className="doc-updated">{content.updated}</small>
      {content.sections.map((section) => (
        <section className="doc-block" key={section.h}>
          <h3>{section.h}</h3>
          {section.p.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      ))}
      <AppButton className="text-button doc-action" onClick={copyDoc}>
        <Icon name="notes" size={14} />
        <span>复制文档全文</span>
      </AppButton>
    </InfoSheet>
  )
}

export default LegalDocument
