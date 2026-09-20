import { useMemo } from 'react';

import Mi from '@/components/workbench/Mi';
import { IPeopleRole, ITaskView, ITrack, PHASES, TaskFilter, TRACKS, ViewName, dopOf } from '@/data/onboarding';

interface HomeViewProps {
  active: boolean;
  tracks: ITrack[];
  role: IPeopleRole;
  counts: { today: number; todo: number; done: number };
  filter: TaskFilter;
  onFilter: (f: TaskFilter) => void;
  activeTrack: string;
  onTrack: (id: string) => void;
  allTasks: ITaskView[];
  isDone: (id: string) => boolean;
  onToggleTask: (id: string) => void;
  onOpenTask: (id: string) => void;
  onOpenAdd: () => void;
  onSwitchView: (v: ViewName) => void;
  onSwitchRole: () => void;
  notify: (msg: string) => void;
  isDark: boolean;
}

export default function HomeView({
  active,
  tracks,
  role,
  counts,
  filter,
  onFilter,
  activeTrack,
  onTrack,
  allTasks,
  isDone,
  onToggleTask,
  onOpenTask,
  onOpenAdd,
  onSwitchView,
  onSwitchRole,
  notify,
  isDark,
}: HomeViewProps) {
  const overall = Math.round(PHASES.reduce((a, p) => a + p.p, 0) / PHASES.length);
  const track = tracks.find(t => t.id === activeTrack) ?? tracks[0] ?? TRACKS[0];
  const trackPct = Math.round((track.done / track.total) * 100);
  const trackColor = dopOf(track.ckey, isDark);
  const todoHint = counts.todo > 0 ? (counts.todo > 1 ? '今晚前搞定这几件' : '1 项即将到期') : '本周清单已清空';

  const list = useMemo(
    () =>
      allTasks.filter(t => {
        if (filter === 'today') return t.w === 'today' && !isDone(t.id);
        if (filter === 'todo') return t.w === 'todo' && !isDone(t.id);
        return isDone(t.id);
      }),
    [allTasks, filter, isDone],
  );

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-home">
      {/* 问候区 */}
      <div className="greet">
        <div>
          <div className="crumb">
            <span>{role.team}</span>
            <Mi name="chevron" />
            <b>{role.role}</b>
          </div>
          <h1>{role.hi}</h1>
          <p>
            入职第 <b>{role.day}</b> 天 · 本周重点是<b>跑通团队工具链，学会「该去哪问、该怎么问」</b>。
          </p>
        </div>
        <button className="btn-ghost" onClick={onSwitchRole}>
          <Mi name="hand" />
          切换身份
        </button>
      </div>

      {/* 统计三卡 */}
      <div className="stats">
        <button className="stat lead" onClick={() => onFilter('today')}>
          <span
            className="sico"
            style={{ background: 'var(--orange-bg)', color: 'var(--orange)' }}
          >
            <Mi name={counts.today > 0 ? 'schedule' : 'checkcircle'} />
          </span>
          <span>
            <div className="lab">今日任务</div>
            <div className="num">{counts.today}</div>
            <div className="hint">预计 60 分钟</div>
          </span>
        </button>
        <button className="stat todo" onClick={() => onFilter('todo')}>
          <span
            className="sico"
            style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}
          >
            <Mi name={counts.todo > 0 ? 'schedule' : 'checkcircle'} />
          </span>
          <span>
            <div className="lab">待办</div>
            <div className="num">{counts.todo}</div>
            <div className={'hint' + (counts.todo > 0 ? ' amber' : '')}>{todoHint}</div>
          </span>
        </button>
        <button className="stat done" onClick={() => onFilter('done')}>
          <span className="sico" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>
            <Mi name={counts.done > 0 ? 'checkcircle' : 'schedule'} />
          </span>
          <span>
            <div className="lab">已完成</div>
            <div className="num">{counts.done}</div>
            <div className="hint green">本周状态很好</div>
          </span>
        </button>
      </div>

      {/* Onboarding 五站旅程地图 */}
      <div className="mapcard">
        <div className="map-top">
          <span>第 1 天</span>
          <span>
            今天 · 第 {role.day} 天
          </span>
          <span>第 90 天</span>
        </div>
        <div className="mapbar">
          <i style={{ width: `${overall}%` }} />
        </div>
        <div className="phases">
          {PHASES.map((p, i) => (
            <button
              key={p.n}
              className={'phase' + (i === 2 ? ' now' : '')}
              title={p.d}
              onClick={() => {
                onFilter('today');
                notify(`当前阶段：${p.n} · ${p.d}`);
              }}
            >
              <span className="pno">{i + 1}</span>
              <p>{p.n}</p>
              <span>{p.d}</span>
            </button>
          ))}
        </div>
        <div className="map-foot">
          <p>当前里程碑：完成安全培训与工具安装，独立跑通一次「提问 → 找渠道 → 拿到答案」。</p>
          <button onClick={() => onFilter('today')}>查看清单</button>
        </div>
      </div>

      {/* 成长线 */}
      <div className="section">
        <div className="row-head">
          <div>
            <div className="eyebrow">Growth tracks</div>
            <h2 style={{ marginTop: 4 }}>四条成长线</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              切换成长线，聚焦对应的任务与里程碑。
            </p>
          </div>
        </div>
        <div className="tracks">
          {tracks.map(t => {
            const c = dopOf(t.ckey, isDark);
            const pct = Math.round((t.done / t.total) * 100);
            return (
              <button
                key={t.id}
                className={'track' + (t.id === activeTrack ? ' on' : '')}
                onClick={() => onTrack(t.id)}
              >
                <span className="tico" style={{ background: c.bg, color: c.fg }}>
                  <Mi name={t.icon} />
                </span>
                <span className="tbody">
                  <p>{t.name}</p>
                  <span className="tbar">
                    <i style={{ width: `${pct}%`, background: c.fg }} />
                  </span>
                  <span className="tpct">{t.t}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="track-detail">
          <span className="tico" style={{ background: trackColor.bg, color: trackColor.fg }}>
            <Mi name={track.icon} />
          </span>
          <span className="tmain">
            <b>
              {track.name} · {trackPct}%
            </b>
            <p>{track.ds}</p>
          </span>
          <span className="tpct">{trackPct}%</span>
          <button className="gbtn primary" onClick={() => onFilter('todo')}>
            查看任务
          </button>
        </div>
      </div>

      {/* 每日任务 */}
      <div className="section" id="tasks">
        <div className="row-head">
          <div>
            <h2>每日任务</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              完成任务会同步更新旅程进度，也可以记录你自己的待办。
            </p>
          </div>
          <div className="task-tabs">
            <button className={filter === 'today' ? 'on' : ''} onClick={() => onFilter('today')}>
              今日
            </button>
            <button className={filter === 'todo' ? 'on' : ''} onClick={() => onFilter('todo')}>
              待办
            </button>
            <button className={filter === 'done' ? 'on' : ''} onClick={() => onFilter('done')}>
              已完成
            </button>
          </div>
        </div>
        <div>
          {list.length === 0 ? (
            <div className="empty">
              {filter === 'done' ? '还没有已完成的任务，加油' : '今日清单已清空，去添加一件自己的待办吧'}
            </div>
          ) : (
            list.map(t => {
              const done = isDone(t.id);
              return (
                <div className="task" key={t.id}>
                  <button className={'check' + (done ? ' done' : '')} onClick={() => onToggleTask(t.id)}>
                    {done ? <Mi name="check" /> : null}
                  </button>
                  <div className="tmain" onClick={() => onOpenTask(t.id)}>
                    <div className="tline">
                      <h3 className={done ? 'done' : ''}>{t.t}</h3>
                      {t.self ? <span className="tchip mine">我的待办</span> : null}
                      <span className="tchip">{tracks.find(x => x.id === t.tr)?.name ?? '成长任务'}</span>
                    </div>
                    <div className="tmeta">
                      {t.by}
                      {t.w === 'today' ? ' · 今天' : ' · 本周'}
                    </div>
                  </div>
                  <span className="arrow">
                    <Mi name="chevron" />
                  </span>
                </div>
              );
            })
          )}
        </div>
        <button className="task-add" onClick={onOpenAdd}>
          <svg className="mi" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          添加我的待办
        </button>
      </div>

      {/* 双入口 */}
      <div className="duo">
        <button className="duo-item d1" onClick={() => onSwitchView('people')}>
          <span className="dico" style={{ background: 'var(--green-bg)', color: 'var(--ok)' }}>
            <Mi name="forum" />
          </span>
          <span className="dbody">
            <h3>有问题，先找对人</h3>
            <p>导师王芳在线，提问路径表告诉你「什么问题该去哪问」，还能用 BGTA 把问题问专业。</p>
          </span>
          <span className="go">
            去提问
            <Mi name="chevron" />
          </span>
        </button>
        <button className="duo-item d2" onClick={() => onSwitchView('tools')}>
          <span className="dico" style={{ background: 'var(--pink-bg)', color: 'var(--pink)' }}>
            <Mi name="widgets" />
          </span>
          <span className="dbody">
            <h3>常用工具与解压小站</h3>
            <p>软件安装步骤可打卡，呼吸、54321、答题闯关、破冰话题，累了随时用一下。</p>
          </span>
          <span className="go">
            查看指南
            <Mi name="chevron" />
          </span>
        </button>
      </div>
    </section>
  );
}
