import { useMemo, useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { LINKS, ViewName, dopOf } from '@/data/onboarding';
import { IToolTutorial, IWorkTool } from '@/lib/base-data';
import { UniversalLink } from '@/lib/platform';

interface ToolsViewProps {
  active: boolean;
  learned: string[];
  workTools: IWorkTool[];
  tutorials: IToolTutorial[];
  onSwitchView: (v: ViewName) => void;
  onToggleMastered: (name: string) => void;
  onOpenWidget: (id: string) => void;
  isDark: boolean;
}

export default function ToolsView({ active, learned, workTools, tutorials, onSwitchView, onToggleMastered, onOpenWidget, isDark }: ToolsViewProps) {
  const [cat, setCat] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [openTutorial, setOpenTutorial] = useState<Record<string, boolean>>({});

  const cats = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of workTools) map.set(t.cat, (map.get(t.cat) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [workTools]);

  const shown = useMemo(
    () => (cat === 'all' ? workTools : workTools.filter(t => t.cat === cat)),
    [workTools, cat],
  );

  const masteredCount = workTools.filter(t => learned.includes(t.name)).length;

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-tools">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">Tool Center</div>
        <h1 style={{ marginTop: 5 }}>工具中心</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          掌握工作中常用的工具与平台，提升工作效率。数据来自明道云工作表「工作工具」表。
        </p>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>常用工具</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              点击卡片查看使用指南，可标记「已掌握」记录进度。
            </p>
          </div>
          <span className={'gstatus ' + (masteredCount > 0 ? 'mastered' : 'learning')}>
            已掌握 {masteredCount}/{workTools.length}
          </span>
        </div>

        <div className="wtabs">
          <button className={'wtab' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>
            全部 ({workTools.length})
          </button>
          {cats.map(([name, count]) => (
            <button key={name} className={'wtab' + (cat === name ? ' on' : '')} onClick={() => setCat(name)}>
              {name} ({count})
            </button>
          ))}
        </div>

        <div className="toolgrid">
          {shown.map(t => {
            const mastered = learned.includes(t.name);
            const mastery = mastered ? 100 : t.mastery;
            const open = openId === t.id;
            return (
              <article className="toolcard" key={t.id}>
                <button className="toolcard-head" onClick={() => setOpenId(open ? null : t.id)}>
                  <span className="gico">
                    <Mi name="widgets" />
                  </span>
                  <span className="toolname">
                    <b>{t.name}</b>
                    <small>{t.cat}</small>
                  </span>
                  {t.required ? <span className="reqtag">必修</span> : null}
                  <span className="arrow" style={{ color: 'var(--sub-2)' }}>
                    <Mi name="expandmore" />
                  </span>
                </button>
                <p className="muted" style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.6 }}>{t.desc}</p>
                <div className="mastery">
                  <div className="mastery-bar">
                    <span style={{ width: `${mastery}%` }} />
                  </div>
                  <em>{mastery}%</em>
                </div>
                {open ? (
                  <div className="toolcard-body">
                    <div className="step">
                      <span className="sno">i</span>
                      <span>{t.guide || '使用指南待补充，可到明道云后台完善。'}</span>
                    </div>
                    <button className={'gbtn' + (mastered ? ' primary' : '')} onClick={() => onToggleMastered(t.name)}>
                      {mastered ? <Mi name="checkcircle" /> : null}
                      {mastered ? '已掌握' : '标记已掌握'}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {shown.length === 0 ? (
          <p className="muted" style={{ padding: '16px 0' }}>该分类下暂无工具。</p>
        ) : null}
      </div>

      {tutorials.length > 0 ? (
        <div className="section">
          <div className="row-head">
            <div>
              <h2>工具教程</h2>
              <p className="muted" style={{ marginTop: 3 }}>
                数据来自明道云工作表「工具教程」表，点开查看学习内容。
              </p>
            </div>
            <span className="online">{tutorials.length} 篇</span>
          </div>
          <div>
            {tutorials.map(tu => {
              const open = !!openTutorial[tu.id];
              return (
                <div className="guide" key={tu.id}>
                  <button
                    className="guide-head"
                    onClick={() => setOpenTutorial(p => ({ ...p, [tu.id]: !p[tu.id] }))}
                  >
                    <span className="gico" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                      <Mi name="book" />
                    </span>
                    <span className="gmain">
                      <b>{tu.title}</b>
                      <p>
                        {tu.tool}
                        {tu.cat ? ` · ${tu.cat}` : ''}
                        {tu.level ? ` · ${tu.level}` : ''}
                        {tu.mins ? ` · ${tu.mins}` : ''}
                        {tu.required ? ' · 必修' : ''}
                      </p>
                    </span>
                    {tu.required ? (
                      <span className="gstatus mastered">必修</span>
                    ) : (
                      <span className="gstatus learning">选修</span>
                    )}
                    <span className="arrow" style={{ color: 'var(--sub-2)' }}>
                      <Mi name="expandmore" />
                    </span>
                  </button>
                  <div className={'guide-body' + (open ? ' open' : '')}>
                    <div className="step">
                      <span className="sno">i</span>
                      <span>{tu.content || '教程内容待补充，请到明道云后台完善。'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="section">
        <div className="row-head">
          <div>
            <h2>常用网址</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              内部系统与文档入口，点击直达。
            </p>
          </div>
        </div>
        <div className="links">
          {LINKS.map(l => {
            const c = dopOf(l.ckey, isDark);
            return (
              <UniversalLink className="lk" key={l.n} to={`https://${l.u}`} target="_blank" rel="noopener noreferrer">
                <span className="lk-ico" style={{ background: c.bg, color: c.fg }}>
                  <Mi name="code" />
                </span>
                <span>
                  {l.n}
                  <small>
                    {l.u} · {l.d}
                  </small>
                </span>
              </UniversalLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
