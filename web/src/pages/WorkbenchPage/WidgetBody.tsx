import { useEffect, useState } from 'react';

import { TOPICS } from '@/data/onboarding';
import { useBaseData } from '@/lib/base-data';
import { WORDS } from '@/data/words';
import { getCalmExercise } from '@/data/calm';
import { REFRESH_SHAPES } from '@/data/refresh';
import { FACTS as COLD_FACTS } from '@/data/facts';

interface WidgetBodyProps {
  id: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ===== 答题闯关（题库来自明道云工作表） ===== */
function QuizWidget() {
  const { quiz: QUIZ } = useBaseData();
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const reset = () => {
    setIdx(0);
    setRight(0);
    setPicked(null);
    setFinished(false);
  };

  if (QUIZ.length === 0) {
    return (
      <div>
        <div className="m-kicker">答题闯关</div>
        <h2>题库加载中</h2>
        <p className="m-desc">题库正在从明道云后台同步，稍后再试。</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div>
        <div className="m-kicker">答题闯关</div>
        <h2>结果</h2>
        <p className="m-desc">
          答对 {right}/{QUIZ.length} 题。
          {right >= 4 ? '你已经很懂这家公司了，可以试着带新人啦。' : '结合「提问路径地图」再复习一遍，随时可以重来。'}
        </p>
        <div className="m-actions">
          <button className="ok" onClick={reset}>
            再来一次
          </button>
        </div>
      </div>
    );
  }

  const q = QUIZ[idx];
  const answered = picked !== null;
  const ok = picked === q.a;

  return (
    <div>
      <div className="m-kicker">答题闯关</div>
      <h2>
        第 {idx + 1}/{QUIZ.length} 题
      </h2>
      <p className="m-desc">{q.q}</p>
      <div>
        {q.opts.map((o, i) => (
          <button
            key={o}
            className={
              'opt' + (answered && i === q.a ? ' right' : answered && i === picked && !ok ? ' wrong' : '')
            }
            disabled={answered}
            onClick={() => {
              if (answered) return;
              setPicked(i);
              if (i === q.a) setRight(r => r + 1);
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {answered ? <div className="panel">{(ok ? '答对了！' : '答错了。') + q.why}</div> : null}
      <div className="m-actions">
        {answered ? (
          <button
            className="cancel"
            onClick={() => {
              if (idx + 1 < QUIZ.length) {
                setIdx(idx + 1);
                setPicked(null);
              } else {
                setFinished(true);
              }
            }}
          >
            {idx + 1 < QUIZ.length ? '下一题' : '看结果'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ===== 破冰话题 ===== */
function BreakWidget() {
  const [topic, setTopic] = useState(() => pick(TOPICS));
  return (
    <div>
      <div className="m-kicker">破冰话题</div>
      <h2>今天聊点什么</h2>
      <div className="panel">{topic}</div>
      <p className="m-desc">可以拿去和工友、导师开场，也可以当群里的每日一问。</p>
      <div className="m-actions">
        <button className="ok" onClick={() => setTopic(pick(TOPICS))}>
          换一个
        </button>
      </div>
    </div>
  );
}

/* ===== BGTA 提问生成 ===== */
function BgtaWidget() {
  const [b, setB] = useState('');
  const [g, setG] = useState('');
  const [t, setT] = useState('');
  const [a, setA] = useState('');
  const [out, setOut] = useState<string | null>(null);

  const p = (v: string) => v.trim() || '（待补充）';

  return (
    <div>
      <div className="m-kicker">BGTA 提问生成</div>
      <h2>把问题组织成四段式</h2>
      <p className="m-desc">按「背景 → 目标 → 已尝试 → 请求」写，对方一次就能帮你。</p>
      <div className="field">
        <label>B · 背景（我在做什么）</label>
        <input value={b} onChange={e => setB(e.target.value)} placeholder="例如：我在搭新人工具链" />
      </div>
      <div className="field">
        <label>G · 目标（想达成什么）</label>
        <input value={g} onChange={e => setG(e.target.value)} placeholder="例如：想让新人第一天就能跑通构建" />
      </div>
      <div className="field">
        <label>T · 已尝试（试过什么）</label>
        <input value={t} onChange={e => setT(e.target.value)} placeholder="例如：试了 wiki 里的两种方式，第二种报错" />
      </div>
      <div className="field">
        <label>A · 请求（需要对方做什么）</label>
        <input value={a} onChange={e => setA(e.target.value)} placeholder="例如：能帮我看下报错截图吗" />
      </div>
      <div className="m-actions">
        <button
          className="ok"
          onClick={() => setOut(`【背景】${p(b)}；【目标】${p(g)}；【已尝试】${p(t)}；【请求】${p(a)}`)}
        >
          生成完整提问
        </button>
      </div>
      {out ? <div className="panel">{out}</div> : null}
    </div>
  );
}

/* ===== 呼吸引擎：相位表 × 轮数，自动倒计时 + 圆圈平滑缩放动效 =====
 * 动效原理：圆圈 transform 目标值随相位切换，CSS transition 时长 = 该相位秒数，
 * 于是「吸气」在 4 秒内从收缩平滑胀大、「呼气」在 4 秒内缓缓缩回——
 * 呼吸节奏由动效本身表达，不需要用户数秒。倒计时数字每秒跳一次，只作参考。
 */
interface BreathPhase {
  label: string;
  secs: number;
  scale: number;
  tip: string;
}

function useBreath(phases: BreathPhase[], rounds: number) {
  const [s, setS] = useState({ running: false, round: 0, pi: 0, left: 0, done: false });

  const start = () => setS({ running: true, round: 1, pi: 0, left: phases[0].secs, done: false });
  const stop = () => setS(prev => ({ ...prev, running: false }));

  useEffect(() => {
    if (!s.running) return;
    const t = window.setInterval(() => {
      setS(prev => {
        if (prev.left > 1) return { ...prev, left: prev.left - 1 };
        const np = prev.pi + 1;
        if (np < phases.length) return { ...prev, pi: np, left: phases[np].secs };
        const nr = prev.round + 1;
        if (nr <= rounds) return { ...prev, round: nr, pi: 0, left: phases[0].secs };
        return { ...prev, running: false, done: true };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [s.running, phases, rounds]);

  return { ...s, phase: phases[s.pi] ?? phases[0], start, stop };
}

function BreathCircle({ label, desc, phases, rounds, doneText }: { label: string; desc: string; phases: BreathPhase[]; rounds: number; doneText: string }) {
  const b = useBreath(phases, rounds);
  return (
    <div>
      <div className="m-kicker">{label}</div>
      <h2>{desc}</h2>
      <p className="m-desc">跟着圆圈缩放呼吸，点开始后自动走完 {rounds} 轮，不用自己数秒。</p>
      <div
        className="breathe"
        style={{
          transform: `scale(${b.running ? b.phase.scale : 1})`,
          transition: `transform ${b.running ? b.phase.secs : 0.6}s cubic-bezier(.45,.05,.55,.95)`,
        }}
      >
        {b.running ? (
          <>
            <b>{b.phase.label}</b>
            <span className="bnum">{b.left}</span>
          </>
        ) : b.done ? (
          <b>{doneText}</b>
        ) : (
          <b>开始</b>
        )}
      </div>
      {b.running ? <p className="muted" style={{ textAlign: 'center', fontSize: 12.5 }}>{b.phase.tip} · 第 {b.round} / {rounds} 轮</p> : null}
      <div className="m-actions">
        {b.running ? (
          <button className="cancel" onClick={b.stop}>
            停止
          </button>
        ) : (
          <button className="ok" onClick={b.start}>
            {b.done ? '再来一轮' : '开始'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ===== 方块呼吸 4-4-4-4 ===== */
function BreatheWidget() {
  return (
    <BreathCircle
      label="方块呼吸"
      desc="4-4-4-4 呼吸"
      rounds={4}
      doneText="完成"
      phases={[
        { label: '吸气', secs: 4, scale: 1.32, tip: '鼻子慢慢吸，腹部像气球一样鼓起' },
        { label: '屏息', secs: 4, scale: 1.32, tip: '保持住，肩膀别用力' },
        { label: '呼气', secs: 4, scale: 0.85, tip: '嘴唇微张，缓缓吐尽' },
        { label: '屏息', secs: 4, scale: 0.85, tip: '保持住，肩膀别用力' },
      ]}
    />
  );
}

/* ===== 4-7-8 助眠呼吸 ===== */
function Four78Widget() {
  return (
    <BreathCircle
      label="4-7-8 呼吸"
      desc="助眠放松"
      rounds={4}
      doneText="放松"
      phases={[
        { label: '吸气', secs: 4, scale: 1.3, tip: '舌尖轻抵上颚，鼻子慢慢吸' },
        { label: '屏息', secs: 7, scale: 1.3, tip: '保持住，感受腹部的压力' },
        { label: '呼气', secs: 8, scale: 0.82, tip: '噘嘴发出轻轻的「呼」声，吐尽' },
      ]}
    />
  );
}

/* ===== 握拳放松（绷紧-松开交替，自动倒计时） ===== */
function MuscleWidget() {
  return (
    <BreathCircle
      label="握拳放松"
      desc="绷紧 5 秒 · 松开 10 秒"
      rounds={1}
      doneText="完成"
      phases={[
        { label: '握紧双拳', secs: 5, scale: 1.24, tip: '用七成力，保持住' },
        { label: '松开', secs: 10, scale: 1, tip: '摊在腿上，感受血液回流的温热' },
        { label: '耸肩', secs: 5, scale: 1.24, tip: '耸到耳朵，再用力一点' },
        { label: '放下', secs: 10, scale: 1, tip: '让肩膀彻底垮掉' },
        { label: '皱紧面部', secs: 5, scale: 1.24, tip: '眯眼、咬牙、皱眉' },
        { label: '舒展', secs: 10, scale: 1, tip: '打个大哈欠也可以' },
      ]}
    />
  );
}

/* ===== 通用引导语步进器（正念数息 / 身体扫描） ===== */
function GuideWidget({ id, name }: { id: string; name: string }) {
  const ex = getCalmExercise(id);
  const [step, setStep] = useState(0);
  if (!ex) return null;
  const total = ex.steps.length;
  const done = step >= total;
  const cur = ex.steps[Math.min(step, total - 1)];
  const md = typeof cur.md === 'string' ? cur.md : '';

  return (
    <div>
      <div className="m-kicker">{name}</div>
      <h2>{ex.name}</h2>
      <p className="m-desc">{ex.caption}</p>
      <div className="panel">{done ? ex.done : md}</div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={'step-dot' + (i === step ? ' on' : '')} />
        ))}
      </div>
      <div className="m-actions">
        {!done ? (
          <>
            <button className="ok" onClick={() => setStep(s => s + 1)}>
              {typeof cur.btn === 'string' ? cur.btn : '下一步'}
            </button>
            <button className="cancel" onClick={() => setStep(total)}>
              停止
            </button>
          </>
        ) : (
          <button className="ok" onClick={() => setStep(0)}>
            再做一次
          </button>
        )}
      </div>
    </div>
  );
}

/* ===== 54321 着陆（15 步逐样点名，完整版） ===== */
function FiveWidget() {
  const ex = getCalmExercise('ground');
  const [step, setStep] = useState(0);
  if (!ex) return null;
  const total = ex.steps.length;
  const done = step >= total;
  const cur = ex.steps[Math.min(step, total - 1)];
  const md = typeof cur.md === 'string' ? cur.md : '';

  return (
    <div>
      <div className="m-kicker">54321 着陆</div>
      <h2>把注意力拉回当下</h2>
      <p className="m-desc">按你的节奏一步步走，不用赶。</p>
      <div className="panel">{done ? ex.done : md}</div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        {!done
          ? Array.from({ length: total - 1 }, (_, i) => (
              <span key={i} className={'step-dot' + (i + 1 === step ? ' on' : '')} />
            ))
          : null}
      </div>
      <div className="m-actions">
        {!done ? (
          <>
            <button className="ok" onClick={() => setStep(s => s + 1)}>
              {typeof cur.btn === 'string' ? cur.btn : '下一步'}
            </button>
            <button className="cancel" onClick={() => setStep(total)}>
              停止
            </button>
          </>
        ) : (
          <button className="ok" onClick={() => setStep(0)}>
            再做一次
          </button>
        )}
      </div>
    </div>
  );
}

/* ===== 猜单词（CET 英文词库，26 字母键盘，6 次机会） ===== */
const MAX_WRONG = 6;

/** 吊死鬼渐进绘制：每错一次多画一笔（SPIRIT.md 标准图案） */
function gallowsOf(wrongs: number): string {
  const rows = ['  +---+', '  |   |'];
  rows.push('  ' + (wrongs >= 1 ? 'O' : ' ') + '   |');
  rows.push('  |  ' + (wrongs >= 2 ? '/' : ' ') + (wrongs >= 3 ? '|' : ' ') + (wrongs >= 4 ? '\\' : ' '));
  rows.push('  |  ' + (wrongs >= 5 ? '/' : ' ') + ' ' + (wrongs >= 6 ? '\\' : ' '));
  rows.push('      |');
  rows.push('=========');
  return rows.join('\n');
}

function HangmanWidget() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [guessed, setGuessed] = useState<string[]>([]);

  const entry = WORDS[idx];
  const word = entry.w.toUpperCase();
  const letters = new Set(word.split(''));
  const wrongs = guessed.filter(l => !letters.has(l)).length;
  const hits = [...letters].filter(l => guessed.includes(l)).length;
  const won = hits === letters.size;
  const lost = !won && wrongs >= MAX_WRONG;
  const totalGuesses = hits + wrongs;

  const guess = (l: string) => {
    if (guessed.includes(l) || won || lost) return;
    setGuessed(g => [...g, l]);
  };

  const reset = () => {
    setIdx(Math.floor(Math.random() * WORDS.length));
    setGuessed([]);
  };

  const shown = word
    .split('')
    .map(c => (guessed.includes(c) ? c : '_'))
    .join(' ');

  return (
    <div>
      <div className="m-kicker">猜单词</div>
      <h2>从词库猜一个英文词</h2>
      <p className="m-desc">提示：{entry.h}（CET 词汇 · {word.length} 个字母）</p>
      <pre className="hang">{won ? '' : gallowsOf(wrongs)}</pre>
      <div className="word">{won || lost ? word : shown}</div>
      <div className="letters">
        {won || lost
          ? null
          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => {
              const g = guessed.includes(c);
              const cls = g ? (letters.has(c) ? ' hit' : ' miss') : '';
              return (
                <button key={c} className={cls} disabled={g} onClick={() => guess(c)}>
                  {c}
                </button>
              );
            })}
      </div>
      {won ? (
        <p className="m-desc" style={{ color: 'var(--ok)' }}>
          漂亮！答对 {hits} 次 · 答错 {wrongs} 次 · 正确率 {totalGuesses ? Math.round((hits / totalGuesses) * 100) : 100}%
        </p>
      ) : lost ? (
        <p className="m-desc" style={{ color: 'var(--danger)' }}>
          机会用完啦，答案是 <b>{word}</b>（{entry.h}）。下次紫腚行！
        </p>
      ) : (
        <p className="m-desc">还剩 {MAX_WRONG - wrongs} 次机会</p>
      )}
      <div className="m-actions">
        <button className="cancel" onClick={reset}>
          {won || lost ? '再来一局' : '换一个词'}
        </button>
      </div>
    </div>
  );
}

/* ===== 提神站（100 张 emoji 像素画，移植自变形球同宗画风） ===== */
function EnergyWidget() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * REFRESH_SHAPES.length));
  const shape = REFRESH_SHAPES[idx];
  const again = () =>
    setIdx(i => {
      if (REFRESH_SHAPES.length < 2) return i;
      let n = i;
      while (n === i) n = Math.floor(Math.random() * REFRESH_SHAPES.length);
      return n;
    });
  return (
    <div>
      <div className="m-kicker">提神站</div>
      <h2>{shape.name}</h2>
      <pre className="ballterm">{shape.lines.join('\n')}</pre>
      <p className="muted" style={{ textAlign: 'center', fontSize: 12.5 }}>
        {shape.caption} · 第 {idx + 1} 号图形
      </p>
      <div className="m-actions">
        <button className="ok" onClick={again}>
          再换一个
        </button>
      </div>
    </div>
  );
}

/* ===== 冷知识 ===== */
function FactWidget() {
  const [fact, setFact] = useState(() => pick(COLD_FACTS));
  return (
    <div>
      <div className="m-kicker">冷知识</div>
      <h2>你知道吗</h2>
      <div className="panel">{fact}</div>
      <p className="m-desc">第 {COLD_FACTS.indexOf(fact) + 1} 条 / 共 {COLD_FACTS.length} 条。</p>
      <div className="m-actions">
        <button className="ok" onClick={() => setFact(pick(COLD_FACTS))}>
          换一条
        </button>
      </div>
    </div>
  );
}

/* ===== 分发器 ===== */
export default function WidgetBody({ id }: WidgetBodyProps) {
  switch (id) {
    case 'quiz':
      return <QuizWidget />;
    case 'break':
      return <BreakWidget />;
    case 'bgta':
      return <BgtaWidget />;
    case 'breathe':
      return <BreatheWidget />;
    case 'five':
      return <FiveWidget />;
    case '478':
      return <Four78Widget />;
    case 'hangman':
      return <HangmanWidget />;
    case 'energy':
      return <EnergyWidget />;
    case 'mindful':
      return <GuideWidget id="mindful" name="正念数息" />;
    case 'scan':
      return <GuideWidget id="scan" name="身体扫描" />;
    case 'muscle':
      return <MuscleWidget />;
    case 'fact':
      return <FactWidget />;
    default:
      return (
        <div>
          <div className="m-kicker">每日小站</div>
          <h2>未找到该小工具</h2>
        </div>
      );
  }
}
