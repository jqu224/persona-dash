import Mi from '@/components/workbench/Mi';
import { IPeopleRole, ViewName } from '@/data/onboarding';
import { BaseSyncState } from '@/lib/base-data';

export interface NotifyPrefs {
  daily: boolean;
  achievement: boolean;
  unlock: boolean;
}

interface SettingsViewProps {
  active: boolean;
  role: IPeopleRole;
  roles: IPeopleRole[];
  onChooseRole: (id: string) => void;
  prefs: NotifyPrefs;
  onTogglePref: (key: keyof NotifyPrefs) => void;
  sync: BaseSyncState;
  xp: number;
  level: number;
  onSwitchView: (v: ViewName) => void;
}

const SYNC_TEXT: Record<BaseSyncState, { label: string; desc: string }> = {
  live: { label: '已连接', desc: '内容实时来自明道云工作表「新人助手 Onboarding Helper」，任务状态可写回明道云。' },
  local: { label: '本地演示', desc: '正在连接明道云工作表，当前展示本地演示数据。' },
  error: { label: '连接失败', desc: '明道云后台暂不可达，已回退本地演示数据，稍后自动重试。' },
};

export default function SettingsView({ active, role, roles, onChooseRole, prefs, onTogglePref, sync, xp, level, onSwitchView }: SettingsViewProps) {
  const s = SYNC_TEXT[sync];

  const PREFS: { key: keyof NotifyPrefs; title: string; desc: string }[] = [
    { key: 'daily', title: '每日任务提醒', desc: '每天早上 9 点推送当日 3 件核心任务。' },
    { key: 'achievement', title: '成就解锁通知', desc: '完成里程碑或升级时发出提醒。' },
    { key: 'unlock', title: '新任务解锁', desc: '前置任务完成后，新任务解锁时通知。' },
  ];

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-settings">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">Settings</div>
        <h1 style={{ marginTop: 5 }}>设置</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          个性化你的 Onboarding 体验。
        </p>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>当前工种</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              来自明道云工作表「工种角色」表，切换后任务地图与推荐会更新。
            </p>
          </div>
        </div>
        <div className="rolegrid">
          {roles.map(r => (
            <button
              key={r.id}
              className={'roleopt' + (r.id === role.id ? ' on' : '')}
              onClick={() => onChooseRole(r.id)}
            >
              <span className="lvl-avatar sm">{r.avatar}</span>
              <span className="roleopt-main">
                <b>{r.name}</b>
                <small>{r.team} · 入职 {r.day} 天</small>
              </span>
              {r.id === role.id ? <Mi name="checkcircle" /> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>通知偏好</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              选择你希望收到提醒的时刻。
            </p>
          </div>
        </div>
        <div className="preflist">
          {PREFS.map(p => (
            <div className="prefrow" key={p.key}>
              <div className="pref-main">
                <b>{p.title}</b>
                <p className="muted">{p.desc}</p>
              </div>
              <button
                className={'switch' + (prefs[p.key] ? ' on' : '')}
                onClick={() => onTogglePref(p.key)}
                role="switch"
                aria-checked={prefs[p.key]}
                aria-label={p.title}
              >
                <span className="knob" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>账户信息</h2>
          </div>
        </div>
        <div className="lvlcard">
          <div className="lvl-avatar">{role.avatar}</div>
          <div className="lvl-main">
            <div className="lvl-name">
              <b>{role.name}</b>
              <span className="lvl-badge">Lv.{level}</span>
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              {role.team} · {role.role} · 总经验值 {xp} XP
            </p>
          </div>
          <div className="lvl-nums">
            <div>
              <b>Lv.{level}</b>
              <span>等级</span>
            </div>
            <div>
              <b>{xp}</b>
              <span>总经验值</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>数据同步</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              新人助手与明道云工作表双向联动。
            </p>
          </div>
          <span className={'gstatus ' + (sync === 'live' ? 'mastered' : 'learning')}>{s.label}</span>
        </div>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
        <p className="muted" style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7 }}>
          只读联动：工种角色 · 入职任务 · 工作工具 · 工具教程 · 知识测验 · 团队成员；写回联动：任务看板状态更新。
        </p>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>关于</h2>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
          Onboard · 让每一次入职都成为美好开端。每天积累一点，四周后回头看，你已经走了很远。
        </p>
      </div>
    </section>
  );
}
