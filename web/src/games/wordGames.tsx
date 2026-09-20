/** 文字引擎：单词大师 Wordle / 打字练习 / 单词速测 / 技术问答（feishu-ai 题库） */
import { useEffect, useMemo, useState } from 'react';

import { WORDS } from '@/data/words';
import { TRIVIA_SETS } from '@/data/trivia';
import { shuffle, useBest } from './util';
import type { EngineProps } from './util';

/* ================= 单词大师 Wordle ================= */
export function Wordle({ id, params }: EngineProps) {
  const len = Number(params.len ?? 5);
  const pool = useMemo(() => WORDS.filter(w => w.w.length === len), [len]);
  const target = useMemo(() => (pool.length ? pool[Math.floor(Math.random() * pool.length)].w.toUpperCase() : ''), [pool]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [cur, setCur] = useState('');
  const [best, submit] = useBest(id);
  const won = guesses.includes(target);
  const lost = !won && guesses.length >= 6;

  useEffect(() => {
    if (won) submit(6 - guesses.length + 1);
    if (lost) submit(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won, lost]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (won || lost) return;
      if (ev.key === 'Enter') {
        if (cur.length === len) {
          setGuesses(g => [...g, cur]);
          setCur('');
        }
      } else if (ev.key === 'Backspace') {
        setCur(c => c.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(ev.key)) {
        setCur(c => (c.length < len ? c + ev.key.toUpperCase() : c));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, len, won, lost]);

  const grade = (guess: string) => {
    const res: ('g' | 'y' | 'b')[] = Array(len).fill('b');
    const rest = [...target];
    for (let i = 0; i < len; i += 1) {
      if (guess[i] === target[i]) {
        res[i] = 'g';
        rest.splice(rest.indexOf(guess[i]), 1);
      }
    }
    for (let i = 0; i < len; i += 1) {
      if (res[i] === 'g') continue;
      const idx = rest.indexOf(guess[i]);
      if (idx >= 0) {
        res[i] = 'y';
        rest.splice(idx, 1);
      }
    }
    return res;
  };

  const rows = [...guesses, ...Array(Math.max(0, 6 - guesses.length)).fill('')];

  return (
    <div>
      <div className="m-kicker">单词大师 · {len} 字母</div>
      <h2>6 次机会猜出 CET 单词</h2>
      <div className="wordle">
        {rows.map((row, ri) => {
          const isCur = ri === guesses.length && !won && !lost;
          const letters = isCur ? cur : row;
          const marks = row && !isCur ? grade(row) : null;
          return (
            <div key={ri} className="wrow">
              {Array.from({ length: len }, (_, ci) => (
                <span
                  key={ci}
                  className={'wcell' + (marks ? ` ${marks[ci]}` : '') + (!marks && letters[ci] ? ' typing' : '')}
                >
                  {letters[ci] ?? ''}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      {won ? <p className="m-desc" style={{ color: 'var(--ok)' }}>猜对了！{target}（{WORDS.find(w => w.w.toUpperCase() === target)?.h}）</p> : null}
      {lost ? <p className="m-desc" style={{ color: 'var(--danger)' }}>答案是 {target}（{WORDS.find(w => w.w.toUpperCase() === target)?.h}）</p> : null}
      {!won && !lost ? <p className="m-desc">键盘输入 · Enter 提交（绿=位置对 · 黄=字母对 · 灰=没有）</p> : null}
      {won || lost ? (
        <div className="m-actions">
          <button className="ok" onClick={() => window.location.reload()}>
            再来一局
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ================= 打字练习 ================= */
const QUOTES = [
  'Stay hungry, stay foolish.',
  'Talk is cheap, show me the code.',
  'Practice makes perfect.',
  'The best way to predict the future is to invent it.',
  'Simplicity is the ultimate sophistication.',
  'Well done is better than well said.',
];

export function Typing({ id, params }: EngineProps) {
  const mode = String(params.mode ?? 'words');
  const text = useMemo(() => {
    if (mode === 'quote') return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const pool = shuffle(WORDS.filter(w => w.w.length <= 8)).slice(0, 24);
    return pool.map(w => w.w).join(' ');
  }, [mode]);
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [best, submit] = useBest(id);

  const done = input.length >= text.length;
  const correctChars = [...input].filter((ch, i) => ch === text[i]).length;
  const accuracy = input.length ? Math.round((correctChars / input.length) * 100) : 100;
  const minutes = startedAt ? Math.max(0.008, (Date.now() - startedAt) / 60000) : 1;
  const wpm = Math.round(correctChars / 5 / minutes);

  useEffect(() => {
    if (done && startedAt) submit(wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div>
      <div className="m-kicker">打字练习 · {mode === 'quote' ? '金句' : '单词'}</div>
      <h2>照着打 · 计 WPM 与准确率</h2>
      <div className="g-scorebar">
        <span>速度 <b>{done || startedAt ? wpm : '—'} WPM</b></span>
        <span>准确率 <b>{accuracy}%</b></span>
        <span>最佳 <b>{best || '—'}</b></span>
      </div>
      <div className="typebox">
        {[...text].map((ch, i) => (
          <span key={i} className={'tchar' + (i < input.length ? (input[i] === ch ? ' ok' : ' bad') : '') + (i === input.length ? ' cur' : '')}>
            {ch === ' ' ? '␣' : ch}
          </span>
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <input
          value={input}
          onChange={e => {
            if (!startedAt) setStartedAt(Date.now());
            setInput(e.target.value.slice(0, text.length));
          }}
          placeholder="从这里开始输入…"
          autoFocus
          spellCheck={false}
        />
      </div>
      {done ? (
        <div className="m-actions">
          <span className="g-over">{wpm} WPM · {accuracy}%</span>
          <button className="ok" onClick={() => window.location.reload()}>
            换一段
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ================= 单词速测（CET 中英互选） ================= */
export function WordQuiz({ id }: EngineProps) {
  const TOTAL = 10;
  const makeRound = useMemo(
    () => () => {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const distractors = shuffle(WORDS.filter(w => w.w !== word.w)).slice(0, 3);
      const opts = shuffle([word, ...distractors]);
      return { word, opts };
    },
    [],
  );
  const [round, setRound] = useState(makeRound);
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [best, submit] = useBest(id);

  const answer = (w: { w: string; h: string }) => {
    if (picked) return;
    setPicked(w.w);
    if (w.w === round.word.w) setRight(r => r + 1);
  };

  const next = () => {
    if (idx + 1 >= TOTAL) {
      setDone(true);
      submit(right * 10);
    } else {
      setIdx(i => i + 1);
      setRound(makeRound);
      setPicked(null);
    }
  };

  return (
    <div>
      <div className="m-kicker">单词速测</div>
      <h2>{round.word.h} · 选出正确的单词</h2>
      <div className="g-scorebar">
        <span>进度 <b>{Math.min(idx + 1, TOTAL)}/{TOTAL}</b></span>
        <span>答对 <b>{right}</b></span>
        <span>最佳 <b>{best}</b></span>
      </div>
      {done ? (
        <div className="m-actions">
          <span className="g-over">答对 {right}/{TOTAL}</span>
          <button className="ok" onClick={() => { setIdx(0); setRight(0); setDone(false); setPicked(null); setRound(makeRound); }}>
            再来一局
          </button>
        </div>
      ) : (
        <>
          <div>
            {round.opts.map(o => (
              <button
                key={o.w}
                className={'opt' + (picked ? (o.w === round.word.w ? ' right' : picked === o.w ? ' wrong' : '') : '')}
                disabled={!!picked}
                onClick={() => answer(o)}
              >
                {o.w}
              </button>
            ))}
          </div>
          {picked ? (
            <div className="m-actions">
              <button className="ok" onClick={next}>
                {idx + 1 >= TOTAL ? '看结果' : '下一题'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ================= 技术问答（feishu-ai 通用题库） ================= */
export function Trivia({ id, params }: EngineProps) {
  const set = TRIVIA_SETS.find(s => s.id === params.set) ?? TRIVIA_SETS[0];
  const [order] = useState(() => shuffle(set.questions.map((_, i) => i)));
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [best, submit] = useBest(id);

  const q = set.questions[order[idx]];
  const answered = picked !== null;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  const answer = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.answer) setRight(r => r + 1);
  };

  const next = () => {
    if (idx + 1 >= set.questions.length) {
      setDone(true);
      submit(right * 10);
    } else {
      setIdx(i => i + 1);
      setPicked(null);
    }
  };

  if (done) {
    const ratio = right / set.questions.length;
    const title = ratio >= 0.9 ? '六边形战士' : ratio >= 0.7 ? '高级玩家' : ratio >= 0.4 ? '进阶练习生' : '默认选项选手';
    return (
      <div>
        <div className="m-kicker">{set.title}</div>
        <h2>结果 · {title}</h2>
        <p className="m-desc">
          答对 {right}/{set.questions.length}（{Math.round(ratio * 100)}%）。{ratio >= 0.4 ? '漂亮！' : '再来一轮熟悉熟悉。'}
        </p>
        <div className="m-actions">
          <button className="ok" onClick={() => window.location.reload()}>
            再来一轮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="m-kicker">{set.title}</div>
      <h2>
        第 {idx + 1}/{set.questions.length} 题
      </h2>
      <p className="m-desc">{q.q}</p>
      <div>
        {q.options.map((o, i) => (
          <button
            key={o}
            className={'opt' + (answered && i === q.answer ? ' right' : answered && i === picked && i !== q.answer ? ' wrong' : '')}
            disabled={answered}
            onClick={() => answer(i)}
          >
            {letters[i]}. {o}
          </button>
        ))}
      </div>
      {answered ? <div className="panel">{(picked === q.answer ? '答对了！' : '答错了。') + (q.explain ?? '')}</div> : null}
      <div className="m-actions">
        {answered ? (
          <button className="ok" onClick={next}>
            {idx + 1 >= set.questions.length ? '看结果' : '下一题'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
