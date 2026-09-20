import { useMemo, useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { QA_ROWS, ViewName } from '@/data/onboarding';
import { ITeamMember } from '@/lib/base-data';

interface PeopleViewProps {
  active: boolean;
  members: ITeamMember[];
  onSwitchView: (v: ViewName) => void;
  onOpenMessage: (who: string) => void;
  onOpenWidget: (id: string) => void;
}

const MEMBER_COLORS = [
  { bg: '#dcfce7', fg: '#16a34a' },
  { bg: '#cffafe', fg: '#0e7490' },
  { bg: '#fef3c7', fg: '#d97706' },
  { bg: '#ede9fe', fg: '#7c3aed' },
  { bg: '#ffe4e6', fg: '#e11d48' },
  { bg: '#e0f2fe', fg: '#0369a1' },
];

export default function PeopleView({ active, members, onSwitchView, onOpenMessage, onOpenWidget }: PeopleViewProps) {
  const [team, setTeam] = useState('all');

  const teams = useMemo(() => {
    const set = new Set(members.map(m => m.team).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [members]);

  const shown = useMemo(
    () => (team === 'all' ? members : members.filter(m => m.team === team)),
    [members, team],
  );

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-people">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">Team Members</div>
        <h1 style={{ marginTop: 5 }}>团队成员</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          认识你的小伙伴，快速建立连接。数据来自飞书多维表格「团队成员」表。
        </p>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>我的伙伴</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              数据来自飞书多维表格「团队成员」表，向导师与协作方提问。
            </p>
          </div>
          <span className="online">{shown.length} 位成员</span>
        </div>
        <div className="wtabs">
          {teams.map(t => (
            <button key={t} className={'wtab' + (team === t ? ' on' : '')} onClick={() => setTeam(t)}>
              {t === 'all' ? '全部团队' : t}
            </button>
          ))}
        </div>
        <div className="people">
          {shown.map((m, i) => {
            const c = MEMBER_COLORS[i % MEMBER_COLORS.length];
            const subtitle = [m.title, m.team, m.desk].filter(Boolean).join(' · ');
            return (
              <article className="person" key={m.id}>
                <div className="phead">
                  <span className="pa" style={{ background: c.bg, color: c.fg }}>
                    {m.name[0] ?? '友'}
                  </span>
                  <span className="pinfo">
                    <h3>{m.name}</h3>
                    <p className="pd">{subtitle || '团队成员'}</p>
                  </span>
                  {m.tag ? <span className="prole">{m.tag}</span> : null}
                </div>
                <p className="muted" style={{ margin: '2px 0 10px', fontSize: 13, lineHeight: 1.6 }}>
                  {m.areas ? `${m.areas}。` : ''}
                  {m.quote}
                </p>
                <button className="pbtn" onClick={() => onOpenMessage(`${m.name}（${m.tag || m.title}）`)}>
                  发起提问
                </button>
              </article>
            );
          })}
        </div>
        <div className="qa-row">
          <span className="pa" style={{ background: '#dcfce7', color: '#16a34a' }}>
            王
          </span>
          <div>
            <p>
              <b>王芳回复了你：</b>
              组件用法先看组件库文档的 props 示例，文档里没有再到技术群 @ 模块 owner，记得带上复现步骤。
            </p>
            <div className="qm">12 分钟前 · 导师频道</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>提问路径地图</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              先按问题类型选渠道，不要盲发；数据来自成长系统 Base「提问路径」表。
            </p>
          </div>
        </div>
        <div className="qa-table">
          {QA_ROWS.map(q => (
            <div className="qa-item" key={q.t}>
              <div className="qtype">
                <b>{q.t}</b>
                <span>{q.e}</span>
              </div>
              <div className="qwhere">{q.w}</div>
              <span className="qresp">{q.r}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>提问培训 · BGTA 四段式</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              把「在吗」「帮我看看」训练成专业提问。
            </p>
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="bgta-grid">
            <div className="bgta-cell">
              <b>B · Background</b>
              <span>背景：我在做什么</span>
            </div>
            <div className="bgta-cell">
              <b>G · Goal</b>
              <span>目标：想达成什么</span>
            </div>
            <div className="bgta-cell">
              <b>T · Tried</b>
              <span>已尝试：试过什么</span>
            </div>
            <div className="bgta-cell">
              <b>A · Ask</b>
              <span>请求：需要对方做什么</span>
            </div>
          </div>
          <button className="mbtn" onClick={() => onOpenWidget('bgta')}>
            <Mi name="target" />
            打开 BGTA 提问生成器
          </button>
        </div>
      </div>
    </section>
  );
}
