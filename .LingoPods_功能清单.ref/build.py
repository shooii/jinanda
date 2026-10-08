# -*- coding: utf-8 -*-
"""LingoPods 翻译耳机 App — 功能清单工作簿生成脚本"""
try:
    import openpyxl
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", "openpyxl>=3.1.0"])
    import openpyxl

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule

import os, sys
_BASE = r"D:/XYT/翻译耳机app/LingoPods_功能清单.xlsx"
_OUT = _BASE
if len(sys.argv) > 1:
    _OUT = sys.argv[1]
else:
    try:
        with open(_BASE, "a+b"):
            pass
    except PermissionError:
        stem, ext = os.path.splitext(_BASE)
        _OUT = f"{stem}_v2{ext}"
OUT = _OUT


def xl_color(css_hex: str) -> str:
    value = css_hex.removeprefix("#").upper()
    if len(value) != 6:
        raise ValueError(f"Expected #RRGGBB, got: {css_hex}")
    return "FF" + value


XL_PRIMARY = xl_color("#4472C4")      # 表头背景
XL_HEADER_FONT = xl_color("#FFFFFF")
XL_LIGHT = xl_color("#D9E2F3")        # 浅底
XL_SUMMARY = xl_color("#2F5597")      # 汇总强调
XL_BORDER = xl_color("#BFBFBF")
XL_GREEN_BG = xl_color("#C6EFCE")
XL_GREEN_FT = xl_color("#006100")
XL_YELLOW_BG = xl_color("#FFEB9C")
XL_YELLOW_FT = xl_color("#9C6500")
XL_RED_BG = xl_color("#FFC7CE")
XL_RED_FT = xl_color("#9C0006")

thin = Side(style="thin", color=XL_BORDER)
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

HEAD_FILL = PatternFill("solid", fgColor=XL_PRIMARY)
HEAD_FONT = Font(bold=True, color=XL_HEADER_FONT, size=11)
HEAD_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)
BODY_ALIGN = Alignment(horizontal="left", vertical="top", wrap_text=True)
CENTER_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)

# ---------------------------------------------------------------- 功能清单数据
# (模块, 功能点, 功能说明, 入口/位置, 状态, 源文件)
DATA = [
    # 1 设备连接
    ("设备连接", "蓝牙搜索与配对", "扫描附近设备并一键连接，含“打开耳机盒并长按配对键 3 秒”引导", "首页设备胶囊 / 我的-重新连接", "已实现", "src/features/BluetoothSetup.tsx"),
    ("设备连接", "连接状态可视化", "雷达波纹动效与两步进度（开启蓝牙 → 选择并连接耳机）", "蓝牙连接页", "已实现", "src/features/BluetoothSetup.tsx"),
    ("设备连接", "设备校准", "第二步校准：左右耳佩戴、麦克风收音、触控翻译三项检测并给出结果", "蓝牙连接页-继续设置", "已实现", "src/features/BluetoothSetup.tsx"),
    ("设备连接", "连接帮助入口", "四步排查清单，可一键重新搜索或转人工支持", "蓝牙连接页", "已实现", "src/features/BluetoothSetup.tsx"),
    ("设备连接", "电量显示", "左耳 88% / 右耳 84% / 充电盒 62%，电量 ≤20% 时低电量标红", "首页顶栏、我的-设备卡片", "已实现", "src/components/BatteryPair.tsx"),
    # 2 设备查找与养护
    ("设备查找与养护", "查找耳机-声音查找", "支持双耳 / 左耳 / 右耳选择性响铃，可停止或重新播放提示音", "我的-查找耳机", "已实现", "src/features/FindDevice.tsx"),
    ("设备查找与养护", "查找耳机-地图查找", "示意街区底图 + 最后已知位置（约 35 米、5 分钟前）与信号强度", "查找耳机-地图页签", "已实现", "src/features/FindDevice.tsx"),
    ("设备查找与养护", "在此处响铃 / 导航前往", "导航提供路线步骤与距离递减指引，可随时响铃或结束导航", "查找耳机-地图页签", "已实现", "src/features/FindDevice.tsx"),
    ("设备查找与养护", "清灰养护", "20 秒高频声波除尘，三步进度条、完成后生成左右耳养护报告，可再处理一次", "我的-设备设置-清灰养护", "已实现", "src/features/DeviceCare.tsx"),
    ("设备查找与养护", "排水处理", "15 秒低频声波排水，含水分检测、排水、复检三步与安全提示", "我的-设备设置-排水处理", "已实现", "src/features/DeviceCare.tsx"),
    # 3 翻译核心
    ("翻译核心", "实时双语对话", "轮次制（你 / TA）交替说话，支持暂停聆听、继续、手动换人说", "首页开始翻译 / 翻译页麦克风", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "场景上下文", "旅行 / 商务 / 餐厅 / 医疗 四种场景切换，影响识别策略", "实时对话-对话设置", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "声音出口分配", "智能分配（我听耳机、对方听手机）或手机免提两种方案", "实时对话-对话设置", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "会话偏好开关", "不保存会话（结束后删除原始音频与文字）、离线优先、锁屏继续翻译", "实时对话-对话设置", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "译文词确认与词操作", "点击低置信词后可执行：重复播放、0.75× 慢速、纠正译文、加入常用语", "实时对话-转写区", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "记住生词", "将生词加入个人词汇，下次优先识别", "实时对话-词操作面板", "已实现", "src/features/LiveSession.tsx"),
    ("翻译核心", "面对面模式选择", "智能分配 / 一人一只耳机 / 耳机+手机 / 手机免提，含佩戴检测与 0.8 秒延迟预估", "首页-面对面翻译", "已实现", "src/features/DialogueMode.tsx"),
    ("翻译核心", "语言对设置", "我的语言与对方语言双向设置与切换（中文 ↔ 英语）", "面对面翻译页 / 翻译页", "已实现", "src/features/DialogueMode.tsx"),
    ("翻译核心", "拍照翻译", "自动扫描识别（约 1.7 秒），译文覆盖原图并保留排版，可对照原文切换", "翻译页-拍照", "已实现", "src/features/CameraMode.tsx"),
    ("翻译核心", "拍照辅助操作", "保存译文图（写入翻译记录）、相册选图、闪光灯三档切换、重新扫描", "拍照翻译页-底部控制栏", "已实现", "src/features/CameraMode.tsx"),
    ("翻译核心", "会议录音转写", "开始 / 暂停 / 结束记录、实时计时、区分发言人的双语转写（最多 8 位）", "翻译页-会议", "已实现", "src/features/MeetingMode.tsx"),
    ("翻译核心", "会议参会同意确认", "开始前需确认已获得参会者同意录音与转写", "会议记录页", "已实现", "src/features/MeetingMode.tsx"),
    ("翻译核心", "会议 AI 纪要", "三句话摘要 + 结构化提取“决定 / 待办 / 待确认”", "会议结束后", "已实现", "src/features/MeetingMode.tsx"),
    ("翻译核心", "会议纪要操作", "查看全文双语转写；导出支持复制、下载 TXT、保存到记录；结束前二次确认", "会议记录页", "已实现", "src/features/MeetingMode.tsx"),
    ("翻译核心", "旅行模式-离线语言包", "英语 / 西班牙语 / 日语 / 法语包下载，含地区、容量、下载中与已下载状态", "翻译页-离线", "已实现", "src/features/TravelMode.tsx"),
    ("翻译核心", "旅行-行程准备卡片", "“明天 · 东京”一键下载日语离线包，完成后显示“旅行准备已完成”", "旅行模式页", "已实现", "src/features/TravelMode.tsx"),
    ("翻译核心", "旅行-存储占用", "离线包存储占用进度条（已使用 1.2 GB / 8 GB）", "旅行模式页", "已实现", "src/features/TravelMode.tsx"),
    ("翻译核心", "通话翻译", "模拟通话计时与双语字幕实时滚动，支持静音 / 免提，结束生成摘要、存记录与导出字幕", "快捷功能库（可添加）", "已实现", "src/features/CallTranslate.tsx"),
    ("翻译核心", "文本翻译", "输入或粘贴文字翻译：内置句级与词级词典，可复制、朗读、存为记录与导出", "快捷功能库（可添加）", "已实现", "src/features/TextTranslate.tsx"),
    # 4 首页与快捷功能
    ("首页与快捷功能", "首页设备 Hero", "LingoPods Pro 已连接状态、耳机插画、开始实时翻译（中文 ↔ 英语）", "首页", "已实现", "src/pages/Home.tsx"),
    ("首页与快捷功能", "快捷功能卡片", "按启用配置渲染，支持 featured 高亮与“新功能”角标", "首页-快捷功能", "已实现", "src/pages/Home.tsx"),
    ("首页与快捷功能", "快捷功能编辑", "添加 / 移除（首页最多 4 个、至少保留 2 个）、上下移动排序、恢复默认", "首页-编辑", "已实现", "src/features/ShortcutEditor.tsx"),
    ("首页与快捷功能", "最近记录入口", "展示最近一条记录并带 AI 摘要角标，点击跳转全部记录", "首页-最近记录", "已实现", "src/pages/Home.tsx"),
    ("首页与快捷功能", "夜间聆听入口", "深海白噪音 + 45 分钟睡眠定时快捷入口，跳转助眠页", "首页-夜间聆听", "已实现", "src/pages/Home.tsx"),
    ("首页与快捷功能", "会员权益卡片", "Lingo+ 已激活状态与 2026 年 10 月续费提醒", "首页-设备专属权益", "已实现", "src/pages/Home.tsx"),
    # 5 翻译记录
    ("翻译记录", "记录统计概览", "本月翻译 347 分钟 / 18 次真实对话 / 6 份 AI 摘要", "记录页", "已实现", "src/pages/Records.tsx"),
    ("翻译记录", "记录筛选", "全部 / 对话 / 会议 / 拍照 四类筛选", "记录页", "已实现", "src/pages/Records.tsx"),
    ("翻译记录", "记录详情", "AI 摘要、发言人与关键点数量、原文与译文对照转写", "记录页-点击卡片", "已实现", "src/pages/Records.tsx"),
    ("翻译记录", "记录操作", "播放原声（进度条 + 暂停）、导出记录为 TXT（含摘要与双语转写）", "记录详情弹层", "已实现", "src/pages/Records.tsx"),
    ("翻译记录", "弹层键盘关闭", "Esc 键关闭记录详情弹层", "记录详情弹层", "已实现", "src/lib/core.ts"),
    # 6 翻译中心
    ("翻译中心", "语言对切换与交换", "我的语言 / 对方语言展示与一键交换", "翻译页", "已实现", "src/pages/TranslateHub.tsx"),
    ("翻译中心", "实时对话入口", "面对面对话按钮 + 麦克风直达实时翻译", "翻译页", "已实现", "src/pages/TranslateHub.tsx"),
    ("翻译中心", "工具入口", "会议 / 拍照 / 离线（旅行语言包）三个入口", "翻译页-工具区", "已实现", "src/pages/TranslateHub.tsx"),
    ("翻译中心", "常用语手册", "内置常用语句，支持选中切换、显示译文、播放发音；可增删改与恢复默认", "翻译页-常用语", "已实现", "src/pages/TranslateHub.tsx"),
    # 7 助眠模式
    ("助眠模式", "声景播放", "深海白噪音 / 森林雨夜 / 云端漫步 / 壁炉微光，支持播放与暂停", "首页-夜间聆听", "已实现", "src/pages/SleepLibrary.tsx"),
    ("助眠模式", "睡眠定时", "45 分钟后自动停止播放", "助眠页", "已实现", "src/pages/SleepLibrary.tsx"),
    ("助眠模式", "智能音量", "入睡后缓慢降低音量", "助眠页-睡眠工具", "已实现", "src/pages/SleepLibrary.tsx"),
    # 8 会员订阅
    ("会员订阅", "会员权益展示", "不限时实时翻译（42 种语言）/ 离线旅行语言包 / AI 纪要与待办", "会员页", "已实现", "src/pages/Membership.tsx"),
    ("会员订阅", "会员使用数据", "347 翻译分钟 / 18 次真实对话 / 6 份会议纪要 / 4h 节省时间", "会员页", "已实现", "src/pages/Membership.tsx"),
    ("会员订阅", "第三方耳机订阅入口", "月付 ¥38 / 年付 ¥298 方案对比与确认订阅，订阅后写入会员状态", "会员页", "已实现", "src/features/SubscriptionPlans.tsx"),
    ("会员订阅", "订阅管理", "当前方案 Lingo+ Unlimited（¥0 赠送期）、激活与赠送期结束时间线", "会员页-管理会员", "已实现", "src/pages/Membership.tsx"),
    ("会员订阅", "续费披露与取消", "到期后 ¥38/月自动续费、提前 7 天提醒；关闭续费带二次确认，恢复购买可查订单结果", "订阅管理页", "已实现", "src/pages/Membership.tsx"),
    ("会员订阅", "法务入口", "服务条款、隐私政策全文弹层，支持发送副本到邮箱", "订阅管理页-底部", "已实现", "src/features/LegalDocument.tsx"),
    # 9 个人中心
    ("个人中心", "用户信息卡", "头像、昵称、连续使用 12 天、等级“探索者”", "我的", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "设备卡片", "三电量展示 + 重新连接 / 查找耳机 / 设备设置快捷操作", "我的-我的设备", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "外观主题", "日间 / 夜间 / 跟随系统（自动匹配系统外观），持久化存储", "我的-外观主题", "已实现", "src/lib/theme.ts"),
    ("个人中心", "翻译语言设置", "中文（普通话）/ 英语（美国）/ 西班牙语", "我的-翻译语言", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "个人词汇", "12 个词汇列表，支持编辑与添加词汇以提升识别准确率", "我的-个人词汇", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "数据与隐私", "保存翻译记录、用于改进识别（默认关闭）、原始音频会话后自动删除", "我的-数据与隐私", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "帮助与支持", "连接与翻译质量的分步排查指南，联系在线支持含分类工单表单与提交回执", "我的-帮助与支持", "已实现", "src/features/SupportCenter.tsx"),
    ("个人中心", "设备偏好开关", "自动连接、佩戴检测、触控翻译（长按耳机开始对话）", "我的-设备偏好", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "按键（手势）设置", "左右耳 × 单击 / 双击 / 三击 / 长按 → 11 种动作自定义，支持恢复默认", "我的-设备设置-按键设置", "已实现", "src/features/GestureSettings.tsx"),
    ("个人中心", "EQ 均衡器", "开关 + 6 组预设（原声 / 流行 / 摇滚 / 人声 / 古典 / 低音增强）+ 6 频段自定义（-6~+6dB）", "我的-设备设置-EQ", "已实现", "src/features/EqSettings.tsx"),
    ("个人中心", "耳塞贴合测试", "6 秒声波测试流程，生成左右耳密封报告，可复测与存档", "我的-设备设置", "已实现", "src/features/DeviceFitTest.tsx"),
    ("个人中心", "固件版本", "固件 2.4.1，显示“已是最新版本”", "我的-设备设置", "已实现", "src/pages/Profile.tsx"),
    ("个人中心", "保修与设备信息", "序列号、购买日期、保修期限与覆盖范围，支持申请保修与获取电子发票", "我的-设备设置", "已实现", "src/features/WarrantyInfo.tsx"),
    ("个人中心", "服务页脚", "隐私政策 / 用户协议跳转法务文档，服务状态展示各服务实时运行状态与订阅故障通知", "我的-底部", "已实现", "src/features/ServiceStatus.tsx"),
    ("个人中心", "版本与设备编号", "LingoPods 1.0 MVP · 设备编号 LP-8821", "我的-底部", "已实现", "src/pages/Profile.tsx"),
    # 10 系统基础
    ("系统基础", "底部导航", "首页 / 翻译 / 记录 / 我的 四个主页签", "全局", "已实现", "src/App.tsx"),
    ("系统基础", "桌面端品牌侧栏", "品牌故事与 42 种语言卖点（宽屏显示）", "全局（≥1024px）", "已实现", "src/App.tsx"),
    ("系统基础", "本地持久化", "usePersistentState：快捷功能、手势、EQ、主题、对话模式", "全局", "已实现", "src/lib/core.ts"),
    ("系统基础", "视图过渡动画", "基于 View Transitions API 的页面切换动画，不支持时自动降级", "全局", "已实现", "src/lib/core.ts"),
    ("系统基础", "弹层 Esc 关闭", "useEscapeKey 统一处理弹层关闭", "全局弹层", "已实现", "src/lib/core.ts"),
    ("系统基础", "原型演示提示", "未接入功能点击后弹出“原型演示：该功能开发中”Toast", "全局", "已实现", "src/components/AppButton.tsx"),
    ("系统基础", "自定义字体", "LingoPodsSans.woff2 品牌字体", "全局", "已实现", "src/assets/LingoPodsSans.woff2"),
    ("系统基础", "无障碍支持", "aria-label / role=dialog / aria-modal / 键盘可达", "全局", "已实现", "src/components/AppButton.tsx"),
    # 11 全球支付
    ("全球支付", "Apple 应用内购买", "iOS 端接入 StoreKit 2，系统弹窗内确认，收据经 App Store Server API 服务端校验", "订阅结算页-iOS 页签", "已实现", "src/lib/payments.ts"),
    ("全球支付", "Google Play 结算", "Android 端接入 Play Billing 6，支持信用卡 / PayPal / 运营商代扣，Purchase Token 校验", "订阅结算页-Android 页签", "已实现", "src/lib/payments.ts"),
    ("全球支付", "厂商支付渠道", "三星 Galaxy Store、小米应用商店、OPPO 软件商店各自的收银台与管理路径", "订阅结算页-Android 页签", "已实现", "src/lib/payments.ts"),
    ("全球支付", "网页端支付通路", "Stripe Checkout（卡 / Apple Pay / Google Pay / SEPA / iDEAL / Klarna）、PayPal、银行卡直连（3-D Secure 2）", "订阅结算页-网页端页签", "已实现", "src/lib/payments.ts"),
    ("全球支付", "多币种自动定价", "美元基准价 × 汇率 × 购买力系数，按当地习惯取整（.99 尾数 / 10 日元 / 100 韩元），覆盖 14 个地区 11 种币种", "订阅结算页-计费地区", "已实现", "src/lib/payments.ts"),
    ("全球支付", "税务合规计算", "欧盟 VAT 按国别税率（19%–23%）含税价反推、美国按账单州销售税加计、日韩消费税 / GST，附 OSS VAT ID 说明", "订阅结算页-费用明细", "已实现", "src/lib/payments.ts"),
    ("全球支付", "支付流程与状态机", "创建订单 → 渠道授权 → 校验收据 → 开通权益四步进度，按平台区分步骤文案", "订阅结算页-处理中", "已实现", "src/features/PaymentCheckout.tsx"),
    ("全球支付", "支付结果页", "订单号、方案、实付、税额、渠道与下次扣费日期，可直达订阅管理", "订阅结算页-支付完成", "已实现", "src/features/PaymentCheckout.tsx"),
    ("全球支付", "分渠道订阅管理", "Apple ID / Play 商店 / Galaxy Store / 小米 / OPPO / 网页端各自的管理步骤与入口链接复制", "我的-支付与账单", "已实现", "src/features/SubscriptionManage.tsx"),
    ("全球支付", "分渠道退款指引", "48 小时（Apple / Google / 三星）与 7 天（小米 / OPPO）、14 天（Stripe）、30 天（银行卡）时限与分步流程", "我的-支付与账单", "已实现", "src/features/SubscriptionManage.tsx"),
    ("全球支付", "支付方式更换", "网页端可自助更换卡片并跳转结算页；应用商店渠道提示需经商店调整", "我的-支付与账单", "已实现", "src/features/SubscriptionManage.tsx"),
    ("全球支付", "账单与发票导出", "订单列表含渠道、时间与金额，可下载 TXT 发票（含税额拆分与开票说明）", "我的-支付与账单", "已实现", "src/lib/store.ts"),
    ("全球支付", "全球定价对照表", "一键查看 14 个地区的月付 / 年付本地定价", "订阅结算页-查看全部地区定价", "已实现", "src/features/PaymentCheckout.tsx"),
]

MODULES = [
    "设备连接", "设备查找与养护", "翻译核心", "首页与快捷功能", "翻译记录",
    "翻译中心", "助眠模式", "会员订阅", "个人中心", "系统基础", "全球支付",
]

STATUS_OK, STATUS_DEMO, STATUS_TODO = "已实现", "占位演示", "未实现"

wb = Workbook()

# ============================================================ Sheet1 功能清单
ws = wb.active
ws.title = "功能清单"
HEADERS = ["序号", "模块", "功能点", "功能说明", "入口 / 位置", "状态", "源文件"]
for c, name in enumerate(HEADERS, start=1):
    cell = ws.cell(row=1, column=c, value=name)
    cell.fill = HEAD_FILL
    cell.font = HEAD_FONT
    cell.alignment = HEAD_ALIGN
    cell.border = BORDER
ws.row_dimensions[1].height = 24

for i, (module, feature, desc, entry, status, src) in enumerate(DATA):
    r = 2 + i
    ws.cell(row=r, column=1, value=i + 1).alignment = CENTER_ALIGN
    ws.cell(row=r, column=2, value=module).alignment = BODY_ALIGN
    ws.cell(row=r, column=3, value=feature).alignment = BODY_ALIGN
    ws.cell(row=r, column=4, value=desc).alignment = BODY_ALIGN
    ws.cell(row=r, column=5, value=entry).alignment = BODY_ALIGN
    st = ws.cell(row=r, column=6, value=status)
    st.alignment = CENTER_ALIGN
    ws.cell(row=r, column=7, value=src).alignment = BODY_ALIGN
    for c in range(1, 8):
        ws.cell(row=r, column=c).border = BORDER
        if i % 2 == 1:
            ws.cell(row=r, column=c).fill = PatternFill("solid", fgColor=XL_LIGHT)

LAST = 1 + len(DATA)          # 数据最后一行
FIRST = 2                     # 数据首行

# 条件格式：状态列
rng = f"F{FIRST}:F{LAST}"
ws.conditional_formatting.add(rng, FormulaRule(
    formula=[f'F{FIRST}="{STATUS_OK}"'], fill=PatternFill("solid", bgColor=XL_GREEN_BG),
    font=Font(color=XL_GREEN_FT), stopIfTrue=False))
ws.conditional_formatting.add(rng, FormulaRule(
    formula=[f'F{FIRST}="{STATUS_DEMO}"'], fill=PatternFill("solid", bgColor=XL_YELLOW_BG),
    font=Font(color=XL_YELLOW_FT), stopIfTrue=False))
ws.conditional_formatting.add(rng, FormulaRule(
    formula=[f'F{FIRST}="{STATUS_TODO}"'], fill=PatternFill("solid", bgColor=XL_RED_BG),
    font=Font(color=XL_RED_FT), stopIfTrue=False))

dv = DataValidation(type="list", formula1=f'"{STATUS_OK},{STATUS_DEMO},{STATUS_TODO}"', allow_blank=False)
ws.add_data_validation(dv)
dv.add(f"F{FIRST}:F{LAST}")

widths = {"A": 6, "B": 16, "C": 18, "D": 46, "E": 26, "F": 10, "G": 32}
for col, w in widths.items():
    ws.column_dimensions[col].width = w
ws.freeze_panes = "C2"
ws.auto_filter.ref = f"A1:G{LAST}"

# ============================================================ Sheet2 模块汇总
ws2 = wb.create_sheet("模块汇总")
ws2["A1"] = "LingoPods 功能清单 · 模块汇总"
ws2.merge_cells("A1:F1")
ws2["A1"].font = Font(bold=True, size=13, color=XL_HEADER_FONT)
ws2["A1"].fill = PatternFill("solid", fgColor=XL_SUMMARY)
ws2["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws2.row_dimensions[1].height = 28

H2 = ["模块", "功能数", "已实现", "占位演示", "未实现", "实现率"]
for c, name in enumerate(H2, start=1):
    cell = ws2.cell(row=2, column=c, value=name)
    cell.fill = HEAD_FILL
    cell.font = HEAD_FONT
    cell.alignment = HEAD_ALIGN
    cell.border = BORDER
ws2.row_dimensions[2].height = 22

# 锚点：标题 1、表头 2、数据 3 ~ 3+len(MODULES)-1、合计行 = 3+len(MODULES)
row0 = 3
# 统计口径：按「功能清单」明细逐模块计数（直接落值，保证任何预览器均可见）
stats = {
    m: {
        "total": sum(1 for row in DATA if row[0] == m),
        "ok": sum(1 for row in DATA if row[0] == m and row[4] == STATUS_OK),
        "demo": sum(1 for row in DATA if row[0] == m and row[4] == STATUS_DEMO),
        "todo": sum(1 for row in DATA if row[0] == m and row[4] == STATUS_TODO),
    }
    for m in MODULES
}
for i, m in enumerate(MODULES):
    r = row0 + i
    s = stats[m]
    ws2.cell(row=r, column=1, value=m).alignment = BODY_ALIGN
    ws2.cell(row=r, column=2, value=s["total"]).alignment = CENTER_ALIGN
    ws2.cell(row=r, column=3, value=s["ok"]).alignment = CENTER_ALIGN
    ws2.cell(row=r, column=4, value=s["demo"]).alignment = CENTER_ALIGN
    ws2.cell(row=r, column=5, value=s["todo"]).alignment = CENTER_ALIGN
    ws2.cell(row=r, column=6, value=(s["ok"] / s["total"] if s["total"] else None)).alignment = CENTER_ALIGN
    ws2.cell(row=r, column=6).number_format = "0.0%"
    for c in range(1, 7):
        ws2.cell(row=r, column=c).border = BORDER
        if i % 2 == 1:
            ws2.cell(row=r, column=c).fill = PatternFill("solid", fgColor=XL_LIGHT)

total_row = row0 + len(MODULES)
tot = {
    "total": sum(s["total"] for s in stats.values()),
    "ok": sum(s["ok"] for s in stats.values()),
    "demo": sum(s["demo"] for s in stats.values()),
    "todo": sum(s["todo"] for s in stats.values()),
}
ws2.cell(row=total_row, column=1, value="合计")
ws2.cell(row=total_row, column=2, value=tot["total"]).alignment = CENTER_ALIGN
ws2.cell(row=total_row, column=3, value=tot["ok"]).alignment = CENTER_ALIGN
ws2.cell(row=total_row, column=4, value=tot["demo"]).alignment = CENTER_ALIGN
ws2.cell(row=total_row, column=5, value=tot["todo"]).alignment = CENTER_ALIGN
ws2.cell(row=total_row, column=6, value=(tot["ok"] / tot["total"] if tot["total"] else None)).alignment = CENTER_ALIGN
ws2.cell(row=total_row, column=6).number_format = "0.0%"
for c in range(1, 7):
    cell = ws2.cell(row=total_row, column=c)
    cell.fill = PatternFill("solid", fgColor=XL_SUMMARY)
    cell.font = Font(bold=True, color=XL_HEADER_FONT)
    cell.border = Border(left=thin, right=thin, top=Side(style="thin", color=XL_BORDER), bottom=thin)

# 实现率条件格式
rate_rng = f"F{row0}:F{total_row}"
ws2.conditional_formatting.add(rate_rng, CellIsRule(
    operator="greaterThanOrEqual", formula=["0.8"], fill=PatternFill("solid", bgColor=XL_GREEN_BG), font=Font(color=XL_GREEN_FT)))
ws2.conditional_formatting.add(rate_rng, CellIsRule(
    operator="lessThan", formula=["0.6"], fill=PatternFill("solid", bgColor=XL_RED_BG), font=Font(color=XL_RED_FT)))

for col, w in {"A": 20, "B": 10, "C": 10, "D": 12, "E": 10, "F": 12}.items():
    ws2.column_dimensions[col].width = w
ws2.freeze_panes = "A3"

# ============================================================ Sheet3 项目说明
ws3 = wb.create_sheet("项目说明")
ws3["A1"] = "项目说明"
ws3.merge_cells("A1:B1")
ws3["A1"].font = Font(bold=True, size=13, color=XL_HEADER_FONT)
ws3["A1"].fill = PatternFill("solid", fgColor=XL_SUMMARY)
ws3["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws3.row_dimensions[1].height = 28

for c, name in enumerate(["项目", "说明"], start=1):
    cell = ws3.cell(row=2, column=c, value=name)
    cell.fill = HEAD_FILL
    cell.font = HEAD_FONT
    cell.alignment = HEAD_ALIGN
    cell.border = BORDER

INFO = [
    ("项目名称", "LingoPods · AI 翻译耳机（LingoPods Pro 配套 App 原型）"),
    ("产品定位", "专为耳机打造的 AI 翻译，无需一直盯着手机屏幕；支持 42 种语言"),
    ("当前版本", "LingoPods 1.0 MVP · 设备编号 LP-8821"),
    ("技术栈", "React 19 + TypeScript 5.7 + Vite 8 + Tailwind CSS v4"),
    ("源码结构", "src/pages（6 个页面）· src/features（21 个功能模块）· src/components（5 个基础组件）· src/lib（持久化、主题、离线词典、支付）"),
    ("数据来源", "全部为原型内置静态数据与模拟交互，未接入任何后端服务、真实地图服务与支付网关"),
    ("状态说明", "全部 89 项均已实现：可在原型中交互，导出类功能会真实下载 TXT 文件，保存类数据写入 localStorage"),
    ("本轮补充", "全球支付体系：Apple IAP / Google Play / 三星 / 小米 / OPPO / Stripe / PayPal / 银行卡八条通路，14 地区多币种定价与 VAT、销售税、GST 计算，分渠道订阅管理与退款指引，账单发票导出"),
    ("本地持久化", "localStorage 键：lingo.shortcuts / lingo.gestures / lingo.eq / lingo.theme / lingo.dialogue-mode / lingo.records / lingo.phrases / lingo.plan / lingo.orders"),
    ("开发服务器", "Vite dev server，端口 8443（npm run dev）"),
    ("清单生成时间", "2026-10-08"),
]
for i, (k, v) in enumerate(INFO):
    r = 3 + i
    ws3.cell(row=r, column=1, value=k).alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws3.cell(row=r, column=2, value=v).alignment = BODY_ALIGN
    for c in range(1, 3):
        ws3.cell(row=r, column=c).border = BORDER
        if i % 2 == 1:
            ws3.cell(row=r, column=c).fill = PatternFill("solid", fgColor=XL_LIGHT)
ws3.column_dimensions["A"].width = 16
ws3.column_dimensions["B"].width = 78
ws3.freeze_panes = "A3"

wb.properties.title = "LingoPods 功能清单"
wb.save(OUT)
print("saved:", OUT)
