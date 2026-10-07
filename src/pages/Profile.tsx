import { useEffect, useState } from "react"
import { AppButton } from "@/components/AppButton"
import { Earbuds, Icon } from "@/components/Icon"
import { useEscapeKey, usePersistentState } from "@/lib/core"



export function Profile({
  onConnect,
  onMembership,
}: {
  onConnect: () => void
  onMembership: () => void
}) {
  const [panel, setPanel] =
    useState<"device" | "language" | "vocabulary" | "privacy" | "help" | null>(
      null,
    )
  const [finding, setFinding] = useState(false)
  const [theme, setTheme] = usePersistentState(
    "lingo.theme",
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEscapeKey(() => {
    if (finding) setFinding(false)
    else if (panel) setPanel(null)
  })

  return (
    <main className="tab-page profile-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">个人中心</span>
          <h1>我的</h1>
        </div>
        <AppButton
          ariaLabel="个人设置"
          className="page-icon-button"
          onClick={() => setPanel("device")}
        >
          <Icon name="settings" />
        </AppButton>
      </header>

      <section className="user-card">
        <span className="user-avatar">YL</span>
        <div>
          <strong>远行者</strong>
          <small>已连续使用 12 天</small>
        </div>
        <span className="level-pill">探索者</span>
      </section>

      <section className="my-device-card">
        <div className="device-card-head">
          <div>
            <span className="eyebrow">
              <i /> 已连接
            </span>
            <h2>LingoPods Pro</h2>
          </div>
          <AppButton className="text-button" onClick={onConnect}>
            管理
          </AppButton>
        </div>
        <div className="device-display">
          <Earbuds />
          <div className="device-battery-grid">
            <span>
              <small>左耳</small>
              <strong>88%</strong>
            </span>
            <span>
              <small>右耳</small>
              <strong>84%</strong>
            </span>
            <span>
              <small>充电盒</small>
              <strong>62%</strong>
            </span>
          </div>
        </div>
        <div className="device-actions">
          <AppButton onClick={onConnect}>
            <Icon name="bluetooth" />
            <span>重新连接</span>
          </AppButton>
          <AppButton onClick={() => setFinding(true)}>
            <Icon name="audio" />
            <span>查找耳机</span>
          </AppButton>
          <AppButton onClick={() => setPanel("device")}>
            <Icon name="settings" />
            <span>设备设置</span>
          </AppButton>
        </div>
      </section>

      <AppButton className="membership-row" onClick={onMembership}>
        <span>
          <Icon name="sparkles" />
        </span>
        <div>
          <small>LINGO+ 会员</small>
          <strong>设备赠送权益使用中</strong>
          <i>
            <b /> 还剩 10 个月
          </i>
        </div>
        <Icon name="chevron" />
      </AppButton>

      <section className="settings-list">
        <AppButton
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <span>
            <Icon name="moon" />
          </span>
          <div>
            <strong>深色模式</strong>
            <small>
              {theme === "dark" ? "已开启 · 适合夜间使用" : "关闭 · 白天更清爽"}
            </small>
          </div>
          <i
            className={`theme-toggle ${theme === "dark" ? "toggle-on" : ""}`}
            aria-hidden="true"
          >
            <b />
          </i>
        </AppButton>
        <AppButton onClick={() => setPanel("language")}>
          <span>
            <Icon name="globe" />
          </span>
          <div>
            <strong>翻译语言</strong>
            <small>中文、英语、西班牙语</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("vocabulary")}>
          <span>
            <Icon name="sparkles" />
          </span>
          <div>
            <strong>个人词汇</strong>
            <small>姓名、地点和专业术语</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("privacy")}>
          <span>
            <Icon name="notes" />
          </span>
          <div>
            <strong>数据与隐私</strong>
            <small>记录仅保存在你的账户中</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
        <AppButton onClick={() => setPanel("help")}>
          <span>
            <Icon name="headphones" />
          </span>
          <div>
            <strong>帮助与支持</strong>
            <small>连接指南、常见问题</small>
          </div>
          <Icon name="chevron" />
        </AppButton>
      </section>
      <small className="app-version">
        LingoPods 1.0 MVP · 设备编号 LP-8821
      </small>
      <div className="service-footer">
        <span>
          <i /> 所有服务运行正常
        </span>
        <div>
          <AppButton>隐私政策</AppButton>
          <AppButton>用户协议</AppButton>
          <AppButton>服务状态</AppButton>
        </div>
      </div>
      {finding && (
        <div className="find-device-backdrop">
          <div
            className="find-device-card"
            role="dialog"
            aria-modal="true"
            aria-label="查找耳机"
          >
            <AppButton
              ariaLabel="关闭查找耳机"
              onClick={() => setFinding(false)}
            >
              <Icon name="close" />
            </AppButton>
            <div className="find-radar">
              <i />
              <i />
              <span>
                <Icon name="headphones" size={30} />
              </span>
            </div>
            <span className="eyebrow">正在播放提示音</span>
            <h2>耳机就在附近</h2>
            <p>声音将逐渐增大。找到耳机后，请点击下方按钮停止。</p>
            <AppButton
              className="manage-button"
              onClick={() => setFinding(false)}
            >
              已找到，停止播放
            </AppButton>
          </div>
        </div>
      )}
      {panel && (
        <div className="profile-panel-backdrop" onClick={() => setPanel(null)}>
          <div
            className="profile-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="设置"
          >
            <div className="sheet-handle" />
            <header>
              <div>
                <span className="eyebrow">设置</span>
                <h2>
                  {panel === "device"
                    ? "设备偏好"
                    : panel === "language"
                      ? "翻译语言"
                      : panel === "vocabulary"
                        ? "个人词汇"
                        : panel === "privacy"
                          ? "数据与隐私"
                          : "帮助与支持"}
                </h2>
              </div>
              <AppButton onClick={() => setPanel(null)}>
                <Icon name="close" />
              </AppButton>
            </header>
            {panel === "language" && (
              <div className="panel-options">
                <AppButton className="selected">
                  <span>中文（普通话）</span>
                  <Icon name="check" />
                </AppButton>
                <AppButton>
                  <span>英语（美国）</span>
                  <Icon name="check" />
                </AppButton>
                <AppButton>
                  <span>西班牙语</span>
                  <Icon name="plus" />
                </AppButton>
              </div>
            )}
            {panel === "vocabulary" && (
              <div className="vocabulary-panel">
                <div className="vocabulary-stats">
                  <strong>12</strong>
                  <span>个词汇已用于提升识别准确率</span>
                </div>
                <div className="vocabulary-list">
                  <div>
                    <span>
                      <strong>LingoPods</strong>
                      <small>产品名称 · 按英文发音</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                  <div>
                    <span>
                      <strong>Shibuya</strong>
                      <small>地点 · 涩谷</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                  <div>
                    <span>
                      <strong>Alex Chen</strong>
                      <small>联系人姓名</small>
                    </span>
                    <AppButton>编辑</AppButton>
                  </div>
                </div>
                <AppButton className="add-vocabulary">
                  <Icon name="plus" /> 添加词汇
                </AppButton>
              </div>
            )}
            {panel === "privacy" && (
              <div className="privacy-options">
                <div>
                  <span>
                    <strong>保存翻译记录</strong>
                    <small>仅同步到你的加密账户</small>
                  </span>
                  <i className="toggle-on">
                    <b />
                  </i>
                </div>
                <div>
                  <span>
                    <strong>用于改进识别</strong>
                    <small>默认关闭，不上传原始音频</small>
                  </span>
                  <i>
                    <b />
                  </i>
                </div>
                <p>
                  <Icon name="check" size={15} /> 原始音频将在会话结束后自动删除
                </p>
              </div>
            )}
            {panel === "help" && (
              <div className="help-options">
                <AppButton>
                  <Icon name="bluetooth" />
                  <span>
                    <strong>耳机无法连接</strong>
                    <small>查看分步排查指南</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
                <AppButton>
                  <Icon name="mic" />
                  <span>
                    <strong>翻译效果不佳</strong>
                    <small>优化佩戴与收音环境</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
                <AppButton>
                  <Icon name="profile" />
                  <span>
                    <strong>联系在线支持</strong>
                    <small>平均 2 分钟内回复</small>
                  </span>
                  <Icon name="chevron" />
                </AppButton>
              </div>
            )}
            {panel === "device" && (
              <>
                <div className="privacy-options">
                  <div>
                    <span>
                      <strong>自动连接</strong>
                      <small>打开 App 时连接最近设备</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                  <div>
                    <span>
                      <strong>佩戴检测</strong>
                      <small>自动判断译文播放位置</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                  <div>
                    <span>
                      <strong>触控翻译</strong>
                      <small>长按耳机开始对话</small>
                    </span>
                    <i className="toggle-on">
                      <b />
                    </i>
                  </div>
                </div>
                <div className="device-info-list">
                  <AppButton>
                    <span>
                      <strong>触控手势</strong>
                      <small>长按开始翻译 · 双击切换发言人</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>耳塞贴合测试</strong>
                      <small>左右耳密封良好</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>固件版本 2.4.1</strong>
                      <small>已是最新版本</small>
                    </span>
                    <Icon name="check" />
                  </AppButton>
                  <AppButton>
                    <span>
                      <strong>保修与设备信息</strong>
                      <small>保修期至 2027 年 10 月</small>
                    </span>
                    <Icon name="chevron" />
                  </AppButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Profile
