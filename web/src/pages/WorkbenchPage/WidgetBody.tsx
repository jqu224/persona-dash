import { useEffect, useState } from 'react';

import { FACTS, REFRESH, TOPICS, WORDS } from '@/data/onboarding';
import { useBaseData } from '@/lib/base-data';

interface WidgetBodyProps {
  id: string;
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ===== 答题闯关 ===== */
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

/* ===== 方块呼吸 4-4-4-4 ===== */
function BreatheWidget() {
  const seq = [
    { l: '吸', t: 4 },
    { l: '屏', t: 4 },
    { l: '呼', t: 4 },
    { l: '屏', t: 4 },
  ];
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStep(s => s + 1), 4000);
    return () => window.clearInterval(id);
  }, [running]);

  const s = seq[step % 4];

  return (
    <div>
      <div className="m-kicker">方块呼吸</div>
      <h2>4-4-4-4 呼吸</h2>
      <p className="m-desc">跟着节奏吸、屏、呼、屏，循环 4 轮大约 1 分钟。</p>
      <div
        className="breathe"
        style={{
          transform: `scale(${s.l === '呼' ? 0.72 : 1})`,
          background:
            s.l === '呼' ? 'linear-gradient(135deg,#a7f3d0,#34d399)' : 'linear-gradient(135deg,#ffd21f,#ff7a1a)',
        }}
      >
        {s.l} {s.t}
      </div>
      <div className="m-actions">
        <button className="cancel" onClick={() => setRunning(false)}>
          停止
        </button>
      </div>
    </div>
  );
}

/* ===== 4-7-8 助眠呼吸 ===== */
function Four78Widget() {
  const seq = [
    { l: '吸气', t: 4 },
    { l: '屏住', t: 7 },
    { l: '呼气', t: 8 },
  ];
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStep(s => s + 1), 8000);
    return () => window.clearInterval(id);
  }, [running]);

  const s = seq[step % 3];

  return (
    <div>
      <div className="m-kicker">4-7-8 呼吸</div>
      <h2>助眠放松</h2>
      <p className="m-desc">吸 4 秒 → 屏 7 秒 → 呼 8 秒，循环几轮后会明显放松。</p>
      <div className="breathe" style={{ transform: `scale(${s.l === '呼气' ? 0.72 : 1})` }}>
        {s.l} {s.t}
      </div>
      <div className="m-actions">
        <button className="cancel" onClick={() => setRunning(false)}>
          停止
        </button>
      </div>
    </div>
  );
}

/* ===== 54321 着陆 ===== */
function FiveWidget() {
  const list = [
    '看：说出你看到的 5 样东西',
    '触：感受 4 种身体的触觉',
    '听：留意 3 种周围的声音',
    '闻：觉察 2 种气味',
    '尝：体会 1 种味道或感受',
  ];
  const [step, setStep] = useState(0);
  const done = step >= list.length;

  return (
    <div>
      <div className="m-kicker">54321 着陆</div>
      <h2>把注意力拉回当下</h2>
      <p className="m-desc">按你的节奏一步步走，不用赶。</p>
      <div className="panel">
        {done ? '完成啦。你现在的感觉怎么样？可以回到任务列表，挑一件小事开始。' : list[step]}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        {!done
          ? list.map((_, i) => <span key={i} className={'step-dot' + (i === step ? ' on' : '')} />)
          : null}
      </div>
      <div className="m-actions">
        {!done ? (
          <>
            <button className="ok" onClick={() => setStep(s => s + 1)}>
              下一步
            </button>
            <button className="cancel" onClick={() => setStep(list.length)}>
              停止
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ===== 猜词小游戏 ===== */
function HangmanWidget() {
  const [word, setWord] = useState(() => pick(WORDS).toUpperCase());
  const [left, setLeft] = useState(6);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [right, setRight] = useState<Set<string>>(new Set());

  const wordLetters = new Set(word.split(''));
  const won = right.size === wordLetters.size;
  const lost = left <= 0;
  const parts = 6 - left;
  const gallows = [
    '  ____',
    '  |  |',
    '  |  ' + (parts > 0 ? 'o' : ''),
    '  |  ' + (parts > 1 ? '/' : ' ') + (parts > 2 ? '|' : ' ') + (parts > 3 ? '\\' : ' '),
    '  |  ' + (parts > 4 ? '/' : ' ') + ' ' + (parts > 5 ? '\\' : ' '),
    '__|__',
  ].join('\n');
  const shown = word
    .split('')
    .map(c => (right.has(c) ? c : '_'))
    .join(' ');

  const guess = (c: string) => {
    if (guessed.includes(c) || won || lost) return;
    setGuessed(g => [...g, c]);
    if (word.includes(c)) {
      setRight(prev => {
        const n = new Set(prev);
        n.add(c);
        return n;
      });
    } else {
      setLeft(l => l - 1);
    }
  };

  const reset = () => {
    setWord(pick(WORDS).toUpperCase());
    setLeft(6);
    setGuessed([]);
    setRight(new Set());
  };

  const msg = won
    ? `猜对啦！这个词是「${word}」。`
    : lost
      ? `机会用完啦，正确答案是「${word}」。`
      : `还剩 ${left} 次机会`;

  return (
    <div>
      <div className="m-kicker">猜词小游戏</div>
      <h2>从术语表里猜一个词</h2>
      <pre className="hang">{gallows}</pre>
      <div className="word">{shown}</div>
      <div className="letters">
        {won || lost
          ? null
          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => (
              <button key={c} disabled={guessed.includes(c)} onClick={() => guess(c)}>
                {c}
              </button>
            ))}
      </div>
      <p className="m-desc">{msg}</p>
      <div className="m-actions">
        <button className="cancel" onClick={reset}>
          换一个词
        </button>
      </div>
    </div>
  );
}

/* ===== 提神站 ===== */
function EnergyWidget() {
  const [tip, setTip] = useState(() => pick(REFRESH));
  return (
    <div>
      <div className="m-kicker">提神站</div>
      <h2>2 分钟小动作</h2>
      <div className="panel">{tip}</div>
      <div className="m-actions">
        <button className="ok" onClick={() => setTip(pick(REFRESH))}>
          再来一个
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
    default:
      return (
        <div>
          <div className="m-kicker">每日小站</div>
          <h2>未找到该小工具</h2>
        </div>
      );
  }
}
