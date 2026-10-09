# 账户与订阅服务契约

客户端已经按下面的契约实现（`src/lib/services/`）。要真正上线，需要部署一个
实现这些端点的服务端，并把 `VITE_API_BASE_URL` 指向它。

未配置该变量时，客户端进入**本地模式**：同步只累积在本地发件箱，权益校验
直接失败并在界面上如实标注「待服务端校验」。本地模式不会伪造成功状态。

## 约定

- 传输：HTTPS + JSON，字符集 UTF-8
- 鉴权：`Authorization: Bearer <token>`
- 幂等：写操作携带客户端生成的 `id`，服务端按 `id` 去重
- 时间：ISO 8601（UTC）
- 错误体：`{ "code": "…", "message": "…" }`，HTTP 状态表达类别

## 端点

### POST /v1/auth/otp
请求 `{ "email": "…" }`；向邮箱发送一次性验证码。响应 `204`。

### POST /v1/auth/session
请求 `{ "email": "…", "code": "…" }`；响应：

```json
{ "token": "…", "expiresAt": "2026-11-09T00:00:00Z", "userId": "u_…" }
```

### GET /v1/entitlements
响应（`src/lib/services/entitlements.ts` 的 `Entitlement`）：

```json
{
  "source": "device | standalone | none",
  "planId": "monthly | yearly | null",
  "expiresAt": "2026-10-18T00:00:00Z",
  "verified": true
}
```

### POST /v1/entitlements/verify
请求 `{ "channelId": "apple", "planId": "yearly", "receipt": "…", "transactionId": "…" }`

服务端负责向对应平台校验收据（App Store Server API / Google Play Developer API /
三星 · 小米 · OPPO 开放接口 / Stripe 与 PayPal 的 webhook），校验通过后写入权益并
返回与 `GET /v1/entitlements` 相同的对象。

**这条链路必须在服务端完成**：客户端本地通过一律视为未开通。

### POST /v1/sync
请求为发件箱条目（`src/lib/services/outbox.ts` 的 `OutboxOp`）：

```json
{
  "id": "record-1730000000-upsert",
  "entity": "record | phrase | vocabulary | device",
  "op": "upsert | delete",
  "payload": { "id": "…", "…": "…" },
  "at": 1730000000,
  "attempts": 0
}
```

响应 `204` 表示已接收。服务端以 `id` 幂等去重，冲突时以服务端副本为准。

### GET /v1/sync?since=<epoch_ms>
响应 `{ "records": [ … ], "serverTime": 1730000000 }`，用于拉取其他设备的增量。

## 上线前还需要

1. 部署服务端并配置上述端点
2. 在构建环境中设置 `VITE_API_BASE_URL`
3. 在 Apple / Google / 三星 / 小米 / OPPO / Stripe / PayPal 申请商户与密钥，
   并配置各自的回调地址
4. 补充用量计量端点（翻译分钟数、会议时长），用于对账与风控

## 客户端现状

| 能力 | 状态 |
| --- | --- |
| HTTP 客户端（超时、重试、错误分类） | 已实现 |
| 登录态与令牌存储 | 已实现（等待服务端） |
| 收据校验调用与权益模型 | 已实现（等待服务端） |
| 本地优先发件箱与重试 | 已实现 |
| 跨设备拉取与合并 | 契约已定义，待服务端 |
| 退款与对账 | 依赖支付平台 webhook，待服务端 |
