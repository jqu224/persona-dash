import { useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { ViewName, dopOf } from '@/data/onboarding';
import { CATEGORIES, GAMES, GAME_COUNT, GameCategory, GameEntry, GameType, TYPES } from '@/data/games';

interface GamesViewProps {
  active: boolean;
  onSwitchView: (v: ViewName) => void;
  onOpenWidget: (id: string) => void;
  isDark: boolean;
}

function WidgetCard({ game, isDark, onOpen }: { game: GameEntry; isDark: boolean; onOpen: () => void }) {
  const c = dopOf(game.ckey, isDark);
  return (
    <button className="widget" onClick={onOpen}>
      <span className="wico" style={{ background: c.bg, color: c.fg }}>
        <Mi name={game.icon} />
      </span>
      <span className="wbody">
        <b>{game.name}</b>
        <span className="d">{game.desc}</span>
      </span>
    </button>
  );
}

export default function GamesView({ active, onSwitchView, onOpenWidget, isDark }: GamesViewProps) {
  const [groupBy, setGroupBy] = useState<'category' | 'type'>('category');

  const sections =
    groupBy === 'category'
      ? CATEGORIES.map(cat => ({
          key: cat.key as string,
          title: cat.key,
          icon: cat.icon,
          blurb: cat.blurb,
          games: GAMES.filter(g => g.category === (cat.key as GameCategory)),
        }))
      : TYPES.map(t => ({
          key: t.key as string,
          title: t.label,
          icon: t.icon,
          blurb: t.blurb,
          games: GAMES.filter(g => g.type === (t.key as GameType)),
        }));

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-games">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div className="games-head">
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Game Center</div>
          <h1 style={{ marginTop: 5 }}>游戏中心</h1>
          <p className="muted" style={{ marginTop: 7 }}>
            共 {GAME_COUNT} 个入口 · 按内容或玩法浏览，点开即玩，最佳成绩记在本机。
          </p>
        </div>
        {/* 右上角双档切换：分类（按内容）/ 类型（按玩法 schema） */}
        <div className="group-switch" role="group" aria-label="分组方式">
          <button className={'gs' + (groupBy === 'category' ? ' on' : '')} onClick={() => setGroupBy('category')}>
            分类
          </button>
          <button className={'gs' + (groupBy === 'type' ? ' on' : '')} onClick={() => setGroupBy('type')}>
            类型
          </button>
        </div>
      </div>

      {sections.map(sec =>
        sec.games.length === 0 ? null : (
          <div className="section" key={sec.key}>
            <div className="row-head">
              <div>
                <h2>
                  <span className="sec-ico">
                    <Mi name={sec.icon} />
                  </span>
                  {sec.title}
                </h2>
                <p className="muted" style={{ marginTop: 3 }}>
                  {sec.blurb}
                </p>
              </div>
              <span className="online">{sec.games.length} 个</span>
            </div>
            <div className="widgets">
              {sec.games.map(g => (
                <WidgetCard key={g.id} game={g} isDark={isDark} onOpen={() => onOpenWidget(g.id)} />
              ))}
            </div>
          </div>
        ),
      )}
    </section>
  );
}
