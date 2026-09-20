import { useMemo, useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { WIDGETS, ViewName, dopOf } from '@/data/onboarding';
import { TESTS } from '@/data/tests';
import { transformBall, ZOOM_LABEL, ZOOM_METER } from '@/data/ball';
import { FACTS as COLD_FACTS } from '@/data/facts';

/* ===== 类型（tests.ts 为移植数据文件，此处补类型边界） ===== */
interface TestOption {
  t: string;
  w: Record<string, number>;
}
interface TestQuestion {
  q: string;
  options: TestOption[];
}
interface TestResult {
  key: string;
  name: string;
  color: string;
  desc: string;
}
interface TestDef {
  id: string;
  title: string;
  desc: string;
  color: string;
  resolve: (c: Record<string, number>) => TestResult;
  questions: TestQuestion[];
}
const TEST_LIST = TESTS as unknown as TestDef[];

/* ===== 人格测试：题目 → 选项计权重 → 结果 ===== */
function TestRunner({ test, isDark, onBack }: { test: TestDef; isDark: boolean; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  const q = test.questions[idx];
  const c = dopOf(test.color, isDark);

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setCounters(prev => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(q.options[i].w)) next[k] = (next[k] ?? 0) + v;
      return next;
    });
  };

  const nextQ = () => {
    if (idx + 1 < test.questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setResult(test.resolve(counters));
    }
  };

  const reset = () => {
    setIdx(0);
    setCounters({});
    setPicked(null);
    setResult(null);
  };

  if (result) {
    return (
      <div className="section">
        <div className="row-head">
          <div>
            <h2>{test.title}</h2>
            <p className="muted" style={{ marginTop: 3 }}>你的结果</p>
          </div>
          <button className="mbtn ghost" onClick={onBack}>
            <Mi name="chevron" />
            换一个测试
          </button>
        </div>
        <div className="panel">
          <b style={{ color: c.fg }}>{result.name}</b>
          <p style={{ marginTop: 8, lineHeight: 1.8 }}>{result.desc}</p>
        </div>
        <div className="m-actions" style={{ marginTop: 14 }}>
          <button className="ok" onClick={reset}>
            重新测
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="row-head">
        <div>
          <h2>{test.title}</h2>
          <p className="muted" style={{ marginTop: 3 }}>
            第 {idx + 1} / {test.questions.length} 题 · 凭第一直觉选
          </p>
        </div>
        <button className="mbtn ghost" onClick={onBack}>
          退出
        </button>
      </div>
      <p className="m-desc" style={{ fontSize: 14.5, marginTop: 10 }}>{q.q}</p>
      <div>
        {q.options.map((o, i) => (
          <button key={o.t} className="opt" disabled={picked !== null} onClick={() => answer(i)}>
            {o.t}
          </button>
        ))}
      </div>
      <div className="m-actions">
        {picked !== null ? (
          <button className="ok" onClick={nextQ}>
            {idx + 1 < test.questions.length ? '下一题' : '看结果'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ===== 变形球：程序化像素生成器（变/转 90°/放大/缩小） ===== */
function BallToy() {
  const [f, setF] = useState(0);
  const [r, setR] = useState(0);
  const [z, setZ] = useState(0);

  const { seed, mode, lines, rot, zoom } = useMemo(() => transformBall(f, r, z), [f, r, z]);
  const flags = [`--${mode.cmd}`, '--seed', String(seed).padStart(4, '0')];
  if (rot) flags.push('--rot', String(rot * 90));
  if (zoom) flags.push('--zoom', String((ZOOM_LABEL as Record<number, string>)[zoom]));
  const terminal = [
    `$ morph.ball ${flags.join(' ')}`,
    '',
    ...lines,
    '',
    `> 图案 No.${seed + 1} · ${mode.name}`,
    `> 视野 ${ZOOM_METER[zoom + 2]} ${(ZOOM_LABEL as Record<number, string>)[zoom]}${rot ? ` · 旋转 ${rot * 90}°` : ''}`,
    '> 变 换一张 · 转 旋转 90° · 缩放看细节',
  ].join('\n');

  return (
    <div className="section">
      <div className="row-head">
        <div>
          <h2>变形球</h2>
          <p className="muted" style={{ marginTop: 3 }}>{mode.caption}</p>
        </div>
        <button className="mbtn ghost" onClick={() => { setF(0); setR(0); setZ(0); }}>
          重置
        </button>
      </div>
      <pre className="ballterm">{terminal}</pre>
      <div className="ball-ops">
        <button className="mbtn" onClick={() => setF(seed + 1)}>变！</button>
        <button className="mbtn ghost" onClick={() => setR(v => v + 1)}>转 90°</button>
        <button className="mbtn ghost" onClick={() => setZ(v => Math.min(2, v + 1))}>放大</button>
        <button className="mbtn ghost" onClick={() => setZ(v => Math.max(-2, v - 1))}>缩小</button>
      </div>
    </div>
  );
}

/* ===== 石头剪刀布 ===== */
const MOVES = ['rock', 'scissors', 'paper'] as const;
type Move = (typeof MOVES)[number];
const MOVE_NAME: Record<Move, string> = { rock: '石头', scissors: '剪刀', paper: '布' };
const BEATS: Record<Move, Move> = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

function RpsToy() {
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [last, setLast] = useState<string | null>(null);

  const play = (m: Move) => {
    const bot = MOVES[Math.floor(Math.random() * MOVES.length)];
    const result = m === bot ? 'd' : BEATS[m] === bot ? 'w' : 'l';
    setScore(s => ({ ...s, [result]: s[result] + 1 }));
    setLast(
      `你出${MOVE_NAME[m]}，AI 出${MOVE_NAME[bot]} · ${result === 'w' ? '你赢了！' : result === 'l' ? 'AI 赢了。' : '平局。'}`,
    );
  };

  return (
    <div className="section">
      <div className="row-head">
        <div>
          <h2>石头剪刀布</h2>
          <p className="muted" style={{ marginTop: 3 }}>和 AI 来一局，战绩实时累计</p>
        </div>
        <button className="mbtn ghost" onClick={() => { setScore({ w: 0, l: 0, d: 0 }); setLast(null); }}>
          重置战绩
        </button>
      </div>
      <div className="rps-score">
        <span>胜<b>{score.w}</b></span>
        <span>负<b>{score.l}</b></span>
        <span>平<b>{score.d}</b></span>
      </div>
      <div className="rps-moves">
        {MOVES.map(m => (
          <button key={m} onClick={() => play(m)}>
            {MOVE_NAME[m]}
          </button>
        ))}
      </div>
      {last ? <div className="panel">{last}</div> : null}
    </div>
  );
}

/* ===== 冷知识 ===== */
function FactToy() {
  const [fact, setFact] = useState(() => COLD_FACTS[Math.floor(Math.random() * COLD_FACTS.length)]);
  return (
    <div className="section">
      <div className="row-head">
        <div>
          <h2>冷知识</h2>
          <p className="muted" style={{ marginTop: 3 }}>第 {COLD_FACTS.indexOf(fact) + 1} 条 / 共 {COLD_FACTS.length} 条</p>
        </div>
      </div>
      <div className="panel">{fact}</div>
      <div className="m-actions" style={{ marginTop: 14 }}>
        <button className="ok" onClick={() => setFact(COLD_FACTS[Math.floor(Math.random() * COLD_FACTS.length)])}>
          换一条
        </button>
      </div>
    </div>
  );
}

/* ===== 游戏中心 ===== */
interface GamesViewProps {
  active: boolean;
  onSwitchView: (v: ViewName) => void;
  onOpenWidget: (id: string) => void;
  isDark: boolean;
}

export default function GamesView({ active, onSwitchView, onOpenWidget, isDark }: GamesViewProps) {
  const [testId, setTestId] = useState<string | null>(null);
  const [toy, setToy] = useState<'ball' | 'rps' | 'fact' | null>(null);
  const test = TEST_LIST.find(t => t.id === testId) ?? null;

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-games">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">Game Center</div>
        <h1 style={{ marginTop: 5 }}>游戏中心</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          培训、破冰、解压、提神，点开即用；人格测试与像素玩具，摸鱼快乐两不误。
        </p>
      </div>

      {/* ===== 每日小站 ===== */}
      <div className="section">
        <div className="row-head">
          <div>
            <h2>每日小站</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              答题闯关、破冰话题、呼吸练习……点开即用，状态不丢。
            </p>
          </div>
        </div>
        <div className="widgets">
          {WIDGETS.map(w => {
            const c = dopOf(w.ckey, isDark);
            return (
              <button className="widget" key={w.id} onClick={() => onOpenWidget(w.id)}>
                <span className="wico" style={{ background: c.bg, color: c.fg }}>
                  <Mi name={w.icon} />
                </span>
                <span className="wbody">
                  <b>{w.name}</b>
                  <span className="d">{w.d}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 人格测试 ===== */}
      {test ? (
        <TestRunner test={test} isDark={isDark} onBack={() => setTestId(null)} />
      ) : (
        <div className="section">
          <div className="row-head">
            <div>
              <h2>人格测试</h2>
              <p className="muted" style={{ marginTop: 3 }}>
                四套题库，凭第一直觉作答，测完即出结果。
              </p>
            </div>
          </div>
          <div className="widgets">
            {TEST_LIST.map(t => {
              const c = dopOf(t.color, isDark);
              return (
                <button className="widget" key={t.id} onClick={() => setTestId(t.id)}>
                  <span className="wico" style={{ background: c.bg, color: c.fg }}>
                    <Mi name="psychology" />
                  </span>
                  <span className="wbody">
                    <b>{t.title}</b>
                    <span className="d">{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 互动玩具 ===== */}
      {toy === 'ball' ? (
        <BallToy />
      ) : toy === 'rps' ? (
        <RpsToy />
      ) : toy === 'fact' ? (
        <FactToy />
      ) : (
        <div className="section">
          <div className="row-head">
            <div>
              <h2>互动玩具</h2>
              <p className="muted" style={{ marginTop: 3 }}>
                程序化生成的像素玩具，种子无限、图案无限。
              </p>
            </div>
          </div>
          <div className="widgets">
            <button className="widget" onClick={() => setToy('ball')}>
              <span className="wico" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan)' }}>
                <Mi name="casino" />
              </span>
              <span className="wbody">
                <b>变形球</b>
                <span className="d">万花筒/海螺/五角星……转 90°、放大缩小</span>
              </span>
            </button>
            <button className="widget" onClick={() => setToy('rps')}>
              <span className="wico" style={{ background: 'var(--yellow-bg)', color: 'var(--amber)' }}>
                <Mi name="hand" />
              </span>
              <span className="wbody">
                <b>石头剪刀布</b>
                <span className="d">和 AI 来一局，战绩实时累计</span>
              </span>
            </button>
            <button className="widget" onClick={() => setToy('fact')}>
              <span className="wico" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                <Mi name="book" />
              </span>
              <span className="wbody">
                <b>冷知识</b>
                <span className="d">抽一条冷知识，涨点奇怪的知识</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
