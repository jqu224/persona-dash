import { useMemo, type CSSProperties } from 'react';

import Mi from '@/components/workbench/Mi';
import { IPeopleRole, IMyTask, ITrack, ViewName, dopOf } from '@/data/onboarding';
import { IBoardTask } from '@/lib/base-data';

interface ProgressViewProps {
  active: boolean;
  role: IPeopleRole;
  tracks: ITrack[];
  boardTasks: IBoardTask[];
  overrides: Record<string, string>;
  doneIds: string[];
  learned: string[];
  myTasks: IMyTask[];
  onSwitchView: (v: ViewName) => void;
}

const XP_PER_LEVEL = 400;

export default function ProgressView({ active, role, tracks, boardTasks, overrides, doneIds, learned, myTasks, onSwitchView }: ProgressViewProps) {
  const stats = useMemo(() => {
    const boardDone = boardTasks.filter(t => (overrides[t.id] ?? t.status) === '已完成').length;
    const boardDoing = boardTasks.filter(t => (overrides[t.id] ?? t.status) === '进行中').length;
    const myDone = myTasks.filter(m => m.done).length;
    const done = Math.max(boardDone, doneIds.length);
    const xp = done * 30 + boardDoing * 5 + learned.length * 40 + myDone * 10;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const nextLevelXp = level * XP_PER_LEVEL;
    const prevXp = (level - 1) * XP_PER_LEVEL;
    const pct = Math.min(100, Math.round(((xp - prevXp) / (nextLevelXp - prevXp)) * 100));
    return { done, total: boardTasks.length, xp, level, pct, nextLevelXp };
  }, [boardTasks, overrides, doneIds, learned, myTasks]);

  const achievements = useMemo(() => {
    const rate = stats.total > 0 ? stats.done / stats.total : 0;
    return [
      { icon: 'hand', ckey: 'yellow', name: '初来乍到', desc: '加入团队并打开工作台', got: true },
      { icon: 'checkcircle', ckey: 'green', name: '首战告捷', desc: '完成第 1 项入职任务', got: stats.done >= 1 },
      { icon: 'bolt', ckey: 'orange', name: '渐入佳境', desc: '完成 5 项入职任务', got: stats.done >= 5 },
      { icon: 'widgets', ckey: 'blue', name: '工具上手', desc: '掌握 3 个常用工具', got: learned.length >= 3 },
      { icon: 'trending', ckey: 'pink', name: '半程里程碑', desc: '任务完成过半', got: rate >= 0.5 && stats.total > 0 },
      { icon: 'target', ckey: 'teal', name: '全速前进', desc: '完成 80% 入职任务', got: rate >= 0.8 && stats.total > 0 },
    ];
  }, [stats, learned.length]);

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-progress">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">My Progress</div>
        <h1 style={{ marginTop: 5 }}>我的进度</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          等级与经验值来自任务完成、工具掌握与测验学习，数据与飞书多维表格联动。
        </p>
      </div>

      <div className="lvlcard">
        <div className="lvl-avatar">{role.avatar}</div>
        <div className="lvl-main">
          <div className="lvl-name">
            <b>{role.name}</b>
            <span className="lvl-badge">Lv.{stats.level}</span>
          </div>
          <div className="mastery" style={{ marginTop: 10 }}>
            <div className="mastery-bar">
              <span style={{ width: `${stats.pct}%` }} />
            </div>
            <em>{stats.xp} / {stats.nextLevelXp} XP</em>
          </div>
          <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            再获得 {Math.max(0, stats.nextLevelXp - stats.xp)} XP 升到 Lv.{stats.level + 1}，完成任务、掌握工具都能攒经验。
          </p>
        </div>
        <div className="lvl-nums">
          <div>
            <b>{stats.done}</b>
            <span>已完成任务</span>
          </div>
          <div>
            <b>{stats.total}</b>
            <span>全部任务</span>
          </div>
          <div>
            <b>{learned.length}</b>
            <span>掌握工具</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>四条成长线</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              进度由「入职任务」表按分类实时统计。
            </p>
          </div>
        </div>
        <div className="gdash">
          {tracks.map(tr => {
            const c = dopOf(tr.ckey, false);
            const pct = tr.total > 0 ? Math.round((tr.done / tr.total) * 100) : 0;
            const r = 44;
            const circ = 2 * Math.PI * r;
            return (
              <div className="gcard" key={tr.id}>
                <div className="gauge" style={{ '--gauge-fg': c.fg, '--gauge-bg': c.bg } as CSSProperties}>
                  <svg viewBox="0 0 120 120" aria-hidden>
                    <circle className="g-ring-edge" cx="60" cy="60" r="56" />
                    <circle className="g-ring-track" cx="60" cy="60" r={r} />
                    <circle
                      className="g-ring-value"
                      cx="60" cy="60" r={r}
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - pct / 100)}
                    />
                    {pct >= 100 && <circle className="g-ring-full" cx="60" cy="60" r={r} />}
                  </svg>
                  <div className="g-center">
                    <b>{pct}%</b>
                    <span>{tr.done}/{tr.total}</span>
                  </div>
                </div>
                <div className="g-name">
                  <span className="gico" style={{ background: c.bg, color: c.fg }}>
                    <Mi name={tr.icon} />
                  </span>
                  <b>{tr.name}</b>
                </div>
                <p className="muted">{tr.ds}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>成就徽章</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              完成对应目标即可点亮。
            </p>
          </div>
        </div>
        <div className="achvs">
          {achievements.map(a => {
            const c = dopOf(a.ckey, false);
            return (
              <div className={'achv' + (a.got ? ' got' : '')} key={a.name}>
                <span className="gico" style={{ background: a.got ? c.bg : 'var(--soft)', color: a.got ? c.fg : 'var(--sub-2)' }}>
                  <Mi name={a.icon} />
                </span>
                <b>{a.name}</b>
                <p className="muted">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
