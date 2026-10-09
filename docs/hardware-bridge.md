# 硬件通路说明

## 浏览器内已经能做到的（已实现）

`src/lib/device-link.ts` 用 Web Bluetooth 连接真实耳机，读取标准 GATT 服务：

| 服务 | UUID | 用途 |
| --- | --- | --- |
| Battery Service | `0x180F` | 电量读取与变化订阅 |
| Device Information Service | `0x180A` | 厂商 / 型号 / 固件版本 / 序列号 |

设备名、型号与电量都是硬件真实读数，并会回写到设备列表与顶栏电量胶囊。

## 浏览器做不到、需要原生桥接的

| 能力 | 为什么浏览器做不到 | 需要的原生能力 |
| --- | --- | --- |
| 双耳音频分流（我听耳机、对方听手机） | 网页无法选择蓝牙音频输出通道 | iOS `AVAudioSession` / Android `AudioManager` + `BluetoothA2dp` |
| 麦克风阵列波束成形与回声消除 | Web Audio 只能拿到处理后的单路音轨 | 平台音频栈的 `VoiceProcessingIO` / `AcousticEchoCanceler` |
| 主动降噪档位与佩戴检测 | 厂商私有 GATT 特征，无公开标准 | 厂商 SDK 或自定义协议 |
| 固件 DFU | 各厂商私有升级协议 | 厂商 DFU SDK（如 Nordic DFU / 各家私有协议） |
| 端到端时延预算 | 浏览器不暴露音频链路时延 | 平台音频会话配置 |

## 建议的落地方式

1. **先做 PWA + Web Bluetooth**（当前状态）：电量、设备信息、基础连接可用
2. **再包一层原生壳**（Capacitor / React Native / 自研）：把上表能力通过
   Bridge 暴露成与 `device-link.ts` 相同的接口，前端不用改调用点
3. **固件升级与降噪**：需要厂商提供 SDK 与签名密钥，属于商务前置条件

## 时延测量

通话链路已经记录每一段的真实耗时（识别结束 → 翻译返回 → 开始朗读），
可在设备管理页查看，用来对照「首次翻译延迟」这个核心指标。
