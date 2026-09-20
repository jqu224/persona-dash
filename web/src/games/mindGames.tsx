/** 脑力/记忆/反应引擎：汉诺塔 / 记忆旋律 / 算术快闪 / 序列推理 / 数字记忆 / 打地鼠 / 手速挑战 / 孔明棋 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { EngineProps, GameOver, ScoreBar, randInt, useBest } from './util';

/* ================= 汉诺塔 ================= */
export function Hanoi({ id, params }: EngineProps) {
  const n = Number(params.n ?? 3);
  const optimal = 2 ** n - 1;
  const init = (): number[][] => [Array.from({ length: n }, (_, i) => n - i), [], []];
  const [towers, setTowers] = useState<number[][]>(init);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [best, submit] = useBest(id);
  const won = towers[2].length === n;

  useEffect(() => {
    if (won && moves > 0) submit(moves);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const click = (t: number) => {
    if (sel === null) {
      if (towers[t].length) setSel(t);
      return;
    }
    if (sel === t) {
      setSel(null);
      return;
    }
    const disk = towers[sel][towers[sel].length - 1];
    const top = towers[t][towers[t].length - 1];
    if (top !== undefined && top < disk) return; // 大不能压小
    setTowers(prev => {
      const next = prev.map(x => [...x]);
      next[t].push(next[sel].pop()!);
      return next;
    });
    setMoves(m => m + 1);
    setSel(null);
  };

  const colors = ['#22c55e', '#0e7490', '#ffd21f', '#ff7a1a', '#ff4d8d', '#7c58f5'];

  return (
    <div>
      <div className="m-kicker">汉诺塔</div>
      <h2>把整摞移到最右柱 · 最优 {optimal} 步</h2>
      <div className="g-scorebar">
        <span>步数 <b>{moves}</b></span>
        <span>最佳 <b>{best || '—'}</b></span>
      </div>
      <div className="hanoi">
        {towers.map((tower, ti) => (
          <button key={ti} className={'tower' + (sel === ti ? ' sel' : '')} onClick={() => click(ti)}>
            <div className="towerslots">
              {Array.from({ length: n }, (_, i) => {
                const disk = tower[n - 1 - i];
                return (
                  <div key={i} className="slot">
                    {disk !== undefined ? (
                      <span className="disk" style={{ width: `${28 + disk * 16}px`, background: colors[disk - 1] }}>
                        {disk}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <span className="tbase">{ti === 0 ? 'A' : ti === 1 ? 'B' : 'C'}</span>
          </button>
        ))}
      </div>
      {won ? <GameOver text={`完成！${moves} 步（最优 ${optimal}）`} onRestart={() => { setTowers(init()); setMoves(0); setSel(null); }} /> : <p className="m-desc">先选起点柱再选终点柱，大盘不能压小盘。</p>}
    </div>
  );
}

/* ================= 记忆旋律 Simon ================= */
const SIMON_COLORS = ['#22c55e', '#ff4d8d', '#ffd21f', '#0e7490', '#7c58f5', '#ff7a1a'];

export function Simon({ id, params }: EngineProps) {
  const n = Number(params.n ?? 4);
  const [seq, setSeq] = useState<number[]>([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'lost'>('idle');
  const [best, submit] = useBest(id);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const playSeq = (s: number[]) => {
    setPhase('show');
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    s.forEach((v, i) => {
      timers.current.push(
        window.setTimeout(() => setFlash(v), i * 620 + 300),
        window.setTimeout(() => setFlash(null), i * 620 + 300 + 380),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase('input');
        setInputIdx(0);
      }, s.length * 620 + 400),
    );
  };

  const start = () => {
    const s = [randInt(0, n - 1)];
    setSeq(s);
    playSeq(s);
  };

  const press = (i: number) => {
    if (phase !== 'input') return;
    setFlash(i);
    window.setTimeout(() => setFlash(null), 180);
    if (seq[inputIdx] !== i) {
      submit(seq.length - 1);
      setPhase('lost');
      return;
    }
    if (inputIdx === seq.length - 1) {
      const next = [...seq, randInt(0, n - 1)];
      setSeq(next);
      submit(next.length - 1);
      playSeq(next);
    } else {
      setInputIdx(inputIdx + 1);
    }
  };

  return (
    <div>
      <div className="m-kicker">记忆旋律</div>
      <h2>跟着亮的键按 · 一轮比一轮长</h2>
      <div className="g-scorebar">
        <span>轮次 <b>{seq.length}</b></span>
        <span>最佳 <b>{best}</b></span>
        <span>状态 <b>{phase === 'show' ? '看好了' : phase === 'input' ? '轮到你' : phase === 'lost' ? '失误' : '待开始'}</b></span>
      </div>
      <div className="simon" style={{ gridTemplateColumns: `repeat(${Math.min(n, 3)}, 1fr)` }}>
        {Array.from({ length: n }, (_, i) => (
          <button key={i} className="skey" style={{ background: flash === i ? SIMON_COLORS[i] : 'var(--soft)' }} onClick={() => press(i)}>
            {['1', '2', '3', '4', '5', '6'][i]}
          </button>
        ))}
      </div>
      {phase === 'idle' || phase === 'lost' ? (
        <div className="m-actions">
          {phase === 'lost' ? <span className="g-over">记到了第 {seq.length - 1} 轮</span> : null}
          <button className="ok" onClick={start}>
            {phase === 'lost' ? '再来一局' : '开始'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ================= 算术快闪 ================= */
function genMath(level: number): { q: string; a: number; opts: number[] } {
  let question: string;
  let ans: number;
  if (level === 1) {
    const a = randInt(5, 40);
    const b = randInt(3, 30);
    const plus = Math.random() > 0.5;
    question = `${a} ${plus ? '+' : '−'} ${b}`;
    ans = plus ? a + b : a - b;
  } else if (level === 2) {
    if (Math.random() > 0.5) {
      const a = randInt(3, 12);
      const b = randInt(3, 12);
      question = `${a} × ${b}`;
      ans = a * b;
    } else {
      const d = randInt(2, 9); // 除数
      const q = randInt(2, 9); // 商
      question = `${d * q} ÷ ${d}`;
      ans = q;
    }
  } else {
    const a = randInt(3, 9);
    const b = randInt(3, 9);
    const c = randInt(2, 9);
    question = `${a} + ${b} × ${c}`;
    ans = a + b * c;
  }
  const opts = new Set<number>([ans]);
  while (opts.size < 4) {
    const delta = randInt(1, Math.max(4, Math.round(Math.abs(ans) * 0.25)));
    opts.add(ans + (Math.random() > 0.5 ? delta : -delta));
  }
  const arr = [...opts].sort(() => Math.random() - 0.5);
  return { q: question, a: ans, opts: arr };
}

export function MathFlash({ id, params }: EngineProps) {
  const level = Number(params.level ?? 1);
  const TOTAL = 10;
  const [q, setQ] = useState(() => genMath(level));
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [best, submit] = useBest(id);

  const answer = (v: number) => {
    if (v === q.a) setRight(r => r + 1);
    if (idx + 1 >= TOTAL) {
      setDone(true);
      const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      submit(right * 100 - secs);
    } else {
      setIdx(i => i + 1);
      setQ(genMath(level));
    }
  };

  return (
    <div>
      <div className="m-kicker">算术快闪</div>
      <h2>10 题限时心算 · 越快越准分越高</h2>
      <div className="g-scorebar">
        <span>进度 <b>{Math.min(idx + 1, TOTAL)}/{TOTAL}</b></span>
        <span>答对 <b>{right}</b></span>
      </div>
      {done ? (
        <GameOver text={`答对 ${right}/${TOTAL} · 用时 ${Math.round((Date.now() - startedAt) / 1000)}s`} onRestart={() => { setQ(genMath(level)); setIdx(0); setRight(0); setStartedAt(Date.now()); setDone(false); }} />
      ) : (
        <>
          <div className="mathq">{q.q} = ?</div>
          <div className="ballopts">
            {q.opts.map(v => (
              <button key={v} onClick={() => answer(v)}>
                {v}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= 序列推理 ================= */
function genSeq(level: number): { nums: (number | string)[]; answer: number; opts: number[] } {
  const kindPool = level === 1 ? ['arith', 'geom'] : level === 2 ? ['arith', 'geom', 'square', 'fib'] : ['fib', 'square', 'zigzag', 'recur'];
  const kind = kindPool[randInt(0, kindPool.length - 1)];
  let nums: number[] = [];
  let answer = 0;
  if (kind === 'arith') {
    const d = randInt(2, 9) * (Math.random() > 0.3 ? 1 : -1);
    const a0 = randInt(1, 15);
    nums = [0, 1, 2, 3, 4].map(i => a0 + d * i);
    answer = a0 + d * 5;
  } else if (kind === 'geom') {
    const r = randInt(2, 3);
    const a0 = randInt(1, 4);
    nums = [0, 1, 2, 3, 4].map(i => a0 * r ** i);
    answer = a0 * r ** 5;
  } else if (kind === 'square') {
    const a0 = randInt(1, 5);
    nums = [0, 1, 2, 3, 4].map(i => (a0 + i) ** 2);
    answer = (a0 + 5) ** 2;
  } else if (kind === 'fib') {
    let a = randInt(1, 3);
    let b = randInt(2, 5);
    nums = [a, b];
    for (let i = 0; i < 3; i += 1) {
      [a, b] = [b, a + b];
      nums.push(b);
    }
    answer = a + b;
  } else if (kind === 'zigzag') {
    const a0 = randInt(2, 8);
    const d = randInt(2, 6);
    nums = [a0, a0 + d, a0 + 1, a0 + 1 + d, a0 + 2];
    answer = a0 + 2 + d;
  } else {
    const a0 = randInt(2, 5);
    const d = randInt(2, 4);
    nums = [a0];
    for (let i = 1; i < 5; i += 1) nums.push(nums[i - 1] + d * i);
    answer = nums[4] + d * 5;
  }
  const opts = new Set<number>([answer]);
  while (opts.size < 4) opts.add(Math.max(0, answer + randInt(1, 12) * (Math.random() > 0.5 ? 1 : -1)));
  const arr = [...opts].sort(() => Math.random() - 0.5);
  return { nums: [...nums.slice(0, 4), '?', nums[4]], answer, opts: arr };
}

export function Sequence({ id, params }: EngineProps) {
  const level = Number(params.level ?? 1);
  const TOTAL = 8;
  const [round, setRound] = useState(() => genSeq(level));
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);
  const [best, submit] = useBest(id);

  const answer = (v: number) => {
    if (v === round.answer) setRight(r => r + 1);
    if (idx + 1 >= TOTAL) {
      setDone(true);
      submit(right * 10 + (v === round.answer ? 10 : 0));
    } else {
      setIdx(i => i + 1);
      setRound(genSeq(level));
    }
  };

  return (
    <div>
      <div className="m-kicker">序列推理</div>
      <h2>找规律 · 填出「?」</h2>
      <div className="g-scorebar">
        <span>进度 <b>{Math.min(idx + 1, TOTAL)}/{TOTAL}</b></span>
        <span>答对 <b>{right}</b></span>
        <span>最佳 <b>{best}</b></span>
      </div>
      {done ? (
        <GameOver text={`答对 ${right}/${TOTAL}`} onRestart={() => { setRound(genSeq(level)); setIdx(0); setRight(0); setDone(false); }} />
      ) : (
        <>
          <div className="seqrow">
            {round.nums.map((v, i) => (
              <span key={i} className={'seqcell' + (v === '?' ? ' q' : '')}>
                {v}
              </span>
            ))}
          </div>
          <div className="ballopts">
            {round.opts.map(v => (
              <button key={v} onClick={() => answer(v)}>
                {v}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= 数字记忆 Span ================= */
export function Span({ id, params }: EngineProps) {
  const reverse = params.mode === 'reverse';
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [digits, setDigits] = useState<number[]>([]);
  const [shown, setShown] = useState('');
  const [input, setInput] = useState('');
  const [len, setLen] = useState(3);
  const [best, submit] = useBest(id);

  const start = (l: number) => {
    const d = Array.from({ length: l }, () => randInt(0, 9));
    setDigits(d);
    setPhase('show');
    setInput('');
    d.forEach((v, i) => {
      window.setTimeout(() => setShown(String(v)), i * 800);
      window.setTimeout(() => setShown(''), i * 800 + 600);
    });
    window.setTimeout(() => {
      setPhase('input');
    }, l * 800 + 200);
  };

  const submitAnswer = () => {
    const target = reverse ? [...digits].reverse().join('') : digits.join('');
    if (input.trim() === target) {
      const nextLen = len + 1;
      submit(len);
      setLen(nextLen);
      start(nextLen);
    } else {
      submit(len - 1);
      setPhase('done');
    }
  };

  return (
    <div>
      <div className="m-kicker">数字记忆 · {reverse ? '倒背' : '顺背'}</div>
      <h2>记住数字串{reverse ? '，倒着输入' : ''}</h2>
      <div className="g-scorebar">
        <span>当前长度 <b>{len}</b></span>
        <span>最佳 <b>{best}</b></span>
      </div>
      {phase === 'idle' ? (
        <div className="m-actions">
          <button className="ok" onClick={() => start(len)}>
            开始
          </button>
        </div>
      ) : null}
      {phase === 'show' ? <div className="breathe" style={{ width: 92, height: 92, transform: 'none', transition: 'none' }}>{shown}</div> : null}
      {phase === 'input' ? (
        <>
          <div className="field" style={{ marginTop: 12 }}>
            <input value={input} onChange={e => setInput(e.target.value.replace(/\D/g, ''))} placeholder={reverse ? '倒着输入数字' : '输入刚才的数字'} autoFocus />
          </div>
          <div className="m-actions">
            <button className="ok" onClick={submitAnswer}>
              提交
            </button>
          </div>
        </>
      ) : null}
      {phase === 'done' ? (
        <GameOver text={`正确答案是 ${digits.join('')}${reverse ? '（倒背 ' : '（'}${reverse ? [...digits].reverse().join('') : ''}）`} onRestart={() => { setLen(3); setPhase('idle'); }} />
      ) : null}
    </div>
  );
}

/* ================= 打地鼠 ================= */
export function Whack({ id, params }: EngineProps) {
  const secs = Number(params.secs ?? 30);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(secs);
  const [score, setScore] = useState(0);
  const [hole, setHole] = useState<number | null>(null);
  const [best, submit] = useBest(id);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft(l => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      submit(score);
      setHole(null);
      return;
    }
    const t = window.setTimeout(() => setHole(randInt(0, 8)), Math.max(320, 900 - score * 12));
    return () => window.clearTimeout(t);
  }, [running, left, score, submit]);

  return (
    <div>
      <div className="m-kicker">打地鼠</div>
      <h2>{secs} 秒 · 点中一只 +1</h2>
      <ScoreBar score={score} best={best} />
      <div className="g-scorebar">
        <span>剩余 <b>{Math.max(0, left)}s</b></span>
      </div>
      <div className="whack">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            className="mole"
            onClick={() => {
              if (hole === i) {
                setScore(s => s + 1);
                setHole(null);
              }
            }}
          >
            {hole === i ? '🐹' : '🕳️'}
          </button>
        ))}
      </div>
      {!running ? (
        <div className="m-actions">
          {left < secs ? <span className="g-over">本局 {score} 分</span> : null}
          <button className="ok" onClick={() => { setRunning(true); setLeft(secs); setScore(0); }}>
            {left < secs ? '再来一局' : '开始'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ================= 手速挑战 ================= */
export function Reaction({ id, params }: EngineProps) {
  const mode = String(params.mode ?? 'single');
  const secs = Number(params.secs ?? 5);
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go' | 'result' | 'counting' | 'cpsdone'>('idle');
  const [ms, setMs] = useState(0);
  const [clicks, setClicks] = useState(0);
  const goAt = useRef(0);
  const startAt = useRef(0);
  const [best, submit] = useBest(id);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (mode === 'single') {
    const arm = () => {
      setPhase('wait');
      timer.current = window.setTimeout(() => {
        goAt.current = performance.now();
        setPhase('go');
      }, randInt(1200, 3500));
    };
    const hit = () => {
      if (phase === 'idle' || phase === 'result') {
        arm();
        return;
      }
      if (phase === 'wait') {
        if (timer.current) window.clearTimeout(timer.current);
        setPhase('result');
        setMs(-1);
        return;
      }
      if (phase === 'go') {
        const t = Math.round(performance.now() - goAt.current);
        setMs(t);
        submit(Math.max(1, 1000 - Math.round(t / 2)));
        setPhase('result');
      }
    };
    return (
      <div>
        <div className="m-kicker">手速 · 反应测试</div>
        <h2>变绿立刻点 · 抢跳算失误</h2>
        <div className="g-scorebar">
          <span>上次 <b>{ms > 0 ? `${ms}ms` : ms === -1 ? '抢跳' : '—'}</b></span>
          <span>最佳 <b>{best > 0 ? `${(1000 - best) * 2}ms` : '—'}</b></span>
        </div>
        <button
          className={'reactpad' + (phase === 'go' ? ' go' : phase === 'wait' ? ' wait' : '')}
          onClick={hit}
        >
          {phase === 'idle' ? '点击开始' : phase === 'wait' ? '等变绿…' : phase === 'go' ? '点！' : ms === -1 ? '抢跳了！再试' : `${ms}ms · 再来`}
        </button>
      </div>
    );
  }

  // 连点模式
  const startCps = () => {
    setClicks(0);
    setPhase('counting');
    startAt.current = Date.now();
    timer.current = window.setTimeout(() => {
      setPhase('cpsdone');
    }, secs * 1000);
  };
  const tap = () => {
    if (phase === 'counting') setClicks(c => c + 1);
  };
  const elapsed = phase === 'cpsdone' ? secs : 0;
  return (
    <div>
      <div className="m-kicker">手速 · {secs} 秒连点</div>
      <h2>{secs} 秒内点多少下</h2>
      <ScoreBar score={clicks} best={best} />
      <button className={'reactpad' + (phase === 'counting' ? ' go' : '')} onClick={phase === 'counting' ? tap : startCps}>
        {phase === 'idle' ? '点击开始' : phase === 'counting' ? `${clicks}` : `${clicks} 下 · ${elapsed}s ${(clicks / secs).toFixed(1)} 次/秒`}
      </button>
      {phase === 'cpsdone' ? (
        <GameOver text={`${clicks} 下 · ${(clicks / secs).toFixed(1)} CPS`} onRestart={startCps} />
      ) : null}
    </div>
  );
}

/* ================= 孔明棋（英式十字 33 孔） ================= */
export function Peg({ id }: EngineProps) {
  const N = 7;
  // true = 有棋子；十字形棋盘，中心空
  const valid = (r: number, c: number) =>
    (r >= 2 && r <= 4 && c >= 0 && c <= 6) || (c >= 2 && c <= 4 && r >= 0 && r <= 6);
  const make = (): boolean[][] =>
    Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => valid(r, c) && !(r === 3 && c === 3)));
  const [grid, setGrid] = useState<boolean[][]>(make);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState(0);
  const [best, submit] = useBest(id);
  const pegs = grid.flat().filter(Boolean).length;
  const stuck = useMemo(() => {
    for (let r = 0; r < N; r += 1) {
      for (let c = 0; c < N; c += 1) {
        if (!grid[r][c]) continue;
        for (const [dr, dc] of [[0, 2], [2, 0], [0, -2], [-2, 0]]) {
          const mr = r + dr / 2;
          const mc = c + dc / 2;
          const tr = r + dr;
          const tc = c + dc;
          if (tr >= 0 && tr < N && tc >= 0 && tc < N && valid(tr, tc) && grid[mr][mc] && !grid[tr][tc]) return false;
        }
      }
    }
    return true;
  }, [grid]);

  useEffect(() => {
    if (stuck) submit(32 - pegs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stuck]);

  const click = (r: number, c: number) => {
    if (!valid(r, c)) return;
    if (sel === null) {
      if (grid[r][c]) setSel([r, c]);
      return;
    }
    const [sr, sc] = sel;
    if (sr === r && sc === c) {
      setSel(null);
      return;
    }
    const dr = r - sr;
    const dc = c - sc;
    if (Math.abs(dr) + Math.abs(dc) === 2 && (dr === 0 || dc === 0)) {
      const mr = sr + dr / 2;
      const mc = sc + dc / 2;
      if (grid[sr][sc] && grid[mr][mc] && !grid[r][c]) {
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[sr][sc] = false;
          next[mr][mc] = false;
          next[r][c] = true;
          return next;
        });
        setMoves(m => m + 1);
        setSel(null);
        return;
      }
    }
    if (grid[r][c]) setSel([r, c]);
  };

  return (
    <div>
      <div className="m-kicker">孔明棋 · 经典十字</div>
      <h2>跳吃相邻棋子 · 剩得越少越强</h2>
      <div className="g-scorebar">
        <span>剩余 <b>{pegs}</b> 枚</span>
        <span>步数 <b>{moves}</b></span>
        <span>最佳 <b>{best > 0 ? `剩 ${32 - best} 枚` : '—'}</b></span>
      </div>
      <div className="peg">
        {grid.flatMap((row, r) =>
          row.map((on, c) =>
            valid(r, c) ? (
              <button
                key={`${r}-${c}`}
                className={'pegcell' + (on ? ' on' : '') + (sel && sel[0] === r && sel[1] === c ? ' sel' : '')}
                onClick={() => click(r, c)}
              />
            ) : (
              <span key={`${r}-${c}`} className="pegcell void" />
            ),
          ),
        )}
      </div>
      <p className="m-desc">选一颗棋子，隔着一颗跳到空位（吃掉中间那颗）。剩 1 枚为大师。</p>
      {stuck ? <GameOver text={`无子可跳 · 剩 ${pegs} 枚${pegs <= 4 ? '，高手！' : ''}`} onRestart={() => { setGrid(make()); setMoves(0); setSel(null); }} /> : null}
    </div>
  );
}
