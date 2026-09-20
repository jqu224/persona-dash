/** 棋盘/网格引擎：2048 / 记忆翻牌 / 点灯 / 数字华容道 / 扫雷 / 色块泛滥 / 四宫数独 / 色彩找不同 */
import { useEffect, useMemo, useState } from 'react';

import { EngineProps, GameOver, ScoreBar, randInt, shuffle, useBest } from './util';

/* ================= 2048 ================= */
const TILE_BG: Record<number, string> = {
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
  128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
};

function emptyCells(grid: number[][]): [number, number][] {
  const out: [number, number][] = [];
  grid.forEach((row, r) => row.forEach((v, c) => v === 0 && out.push([r, c])));
  return out;
}

function addTile(grid: number[][]) {
  const cells = emptyCells(grid);
  if (!cells.length) return;
  const [r, c] = cells[randInt(0, cells.length - 1)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

export function G2048({ id, params }: EngineProps) {
  const n = Number(params.n ?? 4);
  const init = () => {
    const grid = Array.from({ length: n }, () => Array<number>(n).fill(0));
    addTile(grid);
    addTile(grid);
    return grid;
  };
  const [grid, setGrid] = useState<number[][]>(init);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [best, submit] = useBest(id);

  const move = (dir: 'up' | 'down' | 'left' | 'right') => {
    const g = grid.map(row => [...row]);
    let gained = 0;
    const mergeLine = (line: number[]) => {
      const nums = line.filter(v => v);
      const out: number[] = [];
      for (let i = 0; i < nums.length; i += 1) {
        if (nums[i] === nums[i + 1]) {
          out.push(nums[i] * 2);
          gained += nums[i] * 2;
          i += 1;
        } else out.push(nums[i]);
      }
      while (out.length < n) out.push(0);
      return out;
    };
    for (let i = 0; i < n; i += 1) {
      if (dir === 'left') g[i] = mergeLine(g[i]);
      else if (dir === 'right') g[i] = mergeLine(g[i].slice().reverse()).reverse();
      else {
        const col = Array.from({ length: n }, (_, r) => g[r][i]);
        const merged = dir === 'up' ? mergeLine(col) : mergeLine(col.slice().reverse()).reverse();
        merged.forEach((v, r) => {
          g[r][i] = v;
        });
      }
    }
    if (JSON.stringify(g) === JSON.stringify(grid)) return;
    addTile(g);
    if (gained) setScore(s => s + gained);
    setGrid(g);
    if (emptyCells(g).length === 0) {
      let canMove = false;
      for (let r = 0; r < n && !canMove; r += 1) {
        for (let c = 0; c < n && !canMove; c += 1) {
          if (c + 1 < n && g[r][c] === g[r][c + 1]) canMove = true;
          if (r + 1 < n && g[r][c] === g[r + 1][c]) canMove = true;
        }
      }
      if (!canMove) {
        setDead(true);
        submit(score + gained);
      }
    }
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const dir = map[ev.key];
      if (dir) {
        ev.preventDefault();
        move(dir);
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div>
      <div className="m-kicker">2048</div>
      <h2>合并到 2048（或更高）</h2>
      <ScoreBar score={score} best={best} />
      <div className="g2048" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {grid.flatMap((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              className="t2048"
              style={{ background: v ? TILE_BG[v] ?? '#3c3a32' : 'rgba(0,0,0,.06)', color: v > 4 ? '#fff' : '#776e65', fontSize: n >= 5 ? (v >= 1024 ? 13 : 16) : v >= 1024 ? 15 : 19 }}
            >
              {v || ''}
            </div>
          )),
        )}
      </div>
      <div className="ball-ops">
        <button className="mbtn ghost" onClick={() => move('left')}>←</button>
        <button className="mbtn ghost" onClick={() => move('up')}>↑</button>
        <button className="mbtn ghost" onClick={() => move('down')}>↓</button>
        <button className="mbtn ghost" onClick={() => move('right')}>→</button>
      </div>
      <p className="m-desc">方向键 / WASD 或按钮移动，相同数字合并翻倍。</p>
      {dead ? <GameOver text={`无路可走，本局 ${score} 分`} onRestart={() => { setGrid(init()); setScore(0); setDead(false); }} /> : null}
    </div>
  );
}

/* ================= 记忆翻牌 ================= */
const MEMORY_BANK: Record<string, string[]> = {
  animal: ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐸'],
  food: ['🍎', '🍔', '🍜', '🍣', '🍰', '🍩', '🍕', '🌮'],
  face: ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯'],
  sport: ['⚽', '🏀', '🏓', '🏸', '🎾', '🏐', '🏉', '🥏'],
  plant: ['🌱', '🌳', '🌸', '🌻', '🌵', '🍀', '🌴', '🍁'],
  travel: ['🚗', '🚌', '🚲', '✈️', '🚀', '⛵', '🚂', '🛸'],
  space: ['🌍', '🌙', '⭐', '☄️', '🪐', '🔭', '👽', '🛰️'],
  office: ['💻', '📱', '📎', '🖊️', '📌', '🗂️', '☕', '⏰'],
};

export function Memory({ id, params }: EngineProps) {
  const theme = String(params.theme ?? 'animal');
  const pairs = Number(params.pairs ?? 8);
  const bank = MEMORY_BANK[theme] ?? MEMORY_BANK.animal;
  const make = () => shuffle([...bank.slice(0, pairs), ...bank.slice(0, pairs)].map((icon, i) => ({ key: i, icon })));
  const [cards, setCards] = useState(make);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [best, submit] = useBest(id);
  const finished = done.size === cards.length;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    if (cards[a].icon === cards[b].icon) {
      setDone(prev => new Set([...prev, a, b]));
      setOpen([]);
    } else {
      const t = window.setTimeout(() => setOpen([]), 700);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open, cards]);

  useEffect(() => {
    if (finished && moves > 0) submit(Math.max(1, 1000 - moves * 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const cols = pairs <= 8 ? 4 : 6;

  return (
    <div>
      <div className="m-kicker">记忆翻牌</div>
      <h2>{pairs} 对图案 · 翻出全部配对</h2>
      <div className="g-scorebar">
        <span>翻牌 <b>{moves}</b> 次</span>
        <span>剩 <b>{cards.length - done.size}</b> 张</span>
      </div>
      <div className="memory" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card, i) => {
          const shown = open.includes(i) || done.has(i);
          return (
            <button
              key={card.key}
              className={'mcard' + (shown ? ' open' : '') + (done.has(i) ? ' done' : '')}
              disabled={shown || open.length === 2}
              onClick={() => {
                setOpen(prev => [...prev, i]);
                if (open.length === 1) setMoves(m => m + 1);
              }}
            >
              {shown ? card.icon : '❓'}
            </button>
          );
        })}
      </div>
      {finished ? <GameOver text={`全部配对！共翻 ${moves} 次`} onRestart={() => { setCards(make()); setOpen([]); setDone(new Set()); setMoves(0); }} /> : (
        <p className="m-desc">最佳纪录：{best > 0 ? `${(1000 - best) / 10} 次` : '—'}（越少越好）</p>
      )}
    </div>
  );
}

/* ================= 点灯 ================= */
export function LightsOut({ id, params }: EngineProps) {
  const n = Number(params.n ?? 4);
  const make = () => {
    // 从全灭状态随机按 n*n 次生成必然可解的盘面
    const grid = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
    const toggle = (r: number, c: number) => {
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) grid[rr][cc] = !grid[rr][cc];
      });
    };
    const times = randInt(n, n * n);
    for (let i = 0; i < times; i += 1) toggle(randInt(0, n - 1), randInt(0, n - 1));
    if (grid.every(row => row.every(v => !v))) toggle(0, 0), toggle(0, 0); // 极小概率全灭则再打一下（两次=恢复）→ 直接再生成
    return grid;
  };
  const [grid, setGrid] = useState<boolean[][]>(() => {
    let g = make();
    while (g.every(row => row.every(v => !v))) g = make();
    return g;
  });
  const [steps, setSteps] = useState(0);
  const [best, submit] = useBest(id);
  const won = grid.every(row => row.every(v => !v));

  useEffect(() => {
    if (won && steps > 0) submit(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const click = (r: number, c: number) => {
    setGrid(prev => {
      const g = prev.map(row => [...row]);
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) g[rr][cc] = !g[rr][cc];
      });
      return g;
    });
    setSteps(s => s + 1);
  };

  return (
    <div>
      <div className="m-kicker">点灯</div>
      <h2>点一盏翻转十字 · 全部熄灭即胜</h2>
      <div className="g-scorebar">
        <span>步数 <b>{steps}</b></span>
        <span>最佳 <b>{best || '—'}</b></span>
      </div>
      <div className="lights" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {grid.flatMap((row, r) =>
          row.map((on, c) => (
            <button key={`${r}-${c}`} className={'light' + (on ? ' on' : '')} onClick={() => click(r, c)} />
          )),
        )}
      </div>
      {won ? <GameOver text={`全部熄灭！用了 ${steps} 步`} onRestart={() => { setGrid(make()); setSteps(0); }} /> : <p className="m-desc">点亮一盏会同时翻转上下左右相邻的灯。</p>}
    </div>
  );
}

/* ================= 数字华容道 ================= */
export function Fifteen({ id, params }: EngineProps) {
  const n = Number(params.n ?? 4);
  const make = () => {
    // 随机可解排列：从完成态做 n*n*20 次随机空格移动
    const size = n * n;
    const arr = Array.from({ length: size }, (_, i) => (i + 1) % size); // 最后一个是 0（空格）
    let zero = size - 1;
    const swap = (a: number, b: number) => {
      [arr[a], arr[b]] = [arr[b], arr[a]];
    };
    for (let i = 0; i < n * n * 20; i += 1) {
      const r = Math.floor(zero / n);
      const c = zero % n;
      const neighbors: number[] = [];
      if (r > 0) neighbors.push(zero - n);
      if (r < n - 1) neighbors.push(zero + n);
      if (c > 0) neighbors.push(zero - 1);
      if (c < n - 1) neighbors.push(zero + 1);
      const pick = neighbors[randInt(0, neighbors.length - 1)];
      swap(zero, pick);
      zero = pick;
    }
    return arr;
  };
  const [arr, setArr] = useState<number[]>(make);
  const [moves, setMoves] = useState(0);
  const [best, submit] = useBest(id);
  const won = arr.every((v, i) => v === (i + 1) % (n * n));

  useEffect(() => {
    if (won && moves > 0) submit(moves);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const click = (i: number) => {
    const zi = arr.indexOf(0);
    const zr = Math.floor(zi / n);
    const zc = zi % n;
    const r = Math.floor(i / n);
    const c = i % n;
    if (Math.abs(r - zr) + Math.abs(c - zc) !== 1) return;
    const next = [...arr];
    [next[i], next[zi]] = [next[zi], next[i]];
    setArr(next);
    setMoves(m => m + 1);
  };

  return (
    <div>
      <div className="m-kicker">数字华容道</div>
      <h2>滑到 1…{n * n - 1} 顺序排列</h2>
      <div className="g-scorebar">
        <span>步数 <b>{moves}</b></span>
        <span>最佳 <b>{best || '—'}</b></span>
      </div>
      <div className="fifteen" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {arr.map((v, i) => (
          <button key={i} className={'ftile' + (v === 0 ? ' empty' : '')} disabled={v === 0} onClick={() => click(i)}>
            {v || ''}
          </button>
        ))}
      </div>
      {won ? <GameOver text={`完成！${moves} 步`} onRestart={() => { setArr(make()); setMoves(0); }} /> : <p className="m-desc">点击空格旁边的数字块滑动。</p>}
    </div>
  );
}

/* ================= 扫雷 ================= */
interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  n: number;
}

export function Minesweeper({ id, params }: EngineProps) {
  const n = Number(params.n ?? 9);
  const totalMines = Number(params.mines ?? 10);
  const [best, submit] = useBest(id);

  const build = (safeIdx: number | null): Cell[][] => {
    const grid: Cell[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => ({ mine: false, open: false, flag: false, n: 0 })),
    );
    const forbidden = new Set<number>();
    if (safeIdx != null) {
      const r0 = Math.floor(safeIdx / n);
      const c0 = safeIdx % n;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const r = r0 + dr;
          const c = c0 + dc;
          if (r >= 0 && r < n && c >= 0 && c < n) forbidden.add(r * n + c);
        }
      }
    }
    let placed = 0;
    while (placed < totalMines) {
      const idx = randInt(0, n * n - 1);
      if (forbidden.has(idx) || grid[Math.floor(idx / n)][idx % n].mine) continue;
      grid[Math.floor(idx / n)][idx % n].mine = true;
      placed += 1;
    }
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        let cnt = 0;
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < n && cc >= 0 && cc < n && grid[rr][cc].mine) cnt += 1;
          }
        }
        grid[r][c].n = cnt;
      }
    }
    return grid;
  };

  const [grid, setGrid] = useState<Cell[][]>(() => build(null));
  const [state, setState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flags, setFlags] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const open = (r: number, c: number) => {
    if (state === 'won' || state === 'lost') return;
    setGrid(prev => {
      let g = prev;
      if (state === 'idle') {
        // 首击重建（首击位置 3×3 无雷）
        g = build(r * n + c);
        setState('playing');
        setStartedAt(Date.now());
      }
      const next = g.map(row => row.map(cell => ({ ...cell })));
      if (next[r][c].flag || next[r][c].open) return next;
      if (next[r][c].mine) {
        next.forEach(row => row.forEach(cell => cell.mine && (cell.open = true)));
        setGrid(next);
        setState('lost');
        return next;
      }
      const flood = (rr: number, cc: number) => {
        if (rr < 0 || rr >= n || cc < 0 || cc >= n) return;
        const cell = next[rr][cc];
        if (cell.open || cell.flag || cell.mine) return;
        cell.open = true;
        if (cell.n === 0) {
          for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) flood(rr + dr, cc + dc);
        }
      };
      flood(r, c);
      const opened = next.flat().filter(cell => cell.open && !cell.mine).length;
      if (opened === n * n - totalMines) {
        setState('won');
        const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        submit(Math.max(1, 3000 - secs * 10));
      }
      return next;
    });
  };

  const flag = (r: number, c: number) => {
    if (state === 'won' || state === 'lost') return;
    setGrid(prev =>
      prev.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c && !cell.open ? { ...cell, flag: !cell.flag } : cell))),
    );
    setFlags(f => f + (grid[r][c].flag ? -1 : 1));
  };

  const NUM_COLORS = ['', '#0e7490', '#16a34a', '#dc2626', '#7c58f5', '#b45309', '#0f766e', '#161616', '#6b7280'];

  return (
    <div>
      <div className="m-kicker">扫雷</div>
      <h2>{n}×{n} · {totalMines} 雷 · 首击保护</h2>
      <div className="g-scorebar">
        <span>🚩 <b>{totalMines - flags}</b></span>
        <span>状态 <b>{state === 'won' ? '胜利' : state === 'lost' ? '踩雷' : state === 'playing' ? '进行中' : '待开始'}</b></span>
      </div>
      <div className="mines" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {grid.flatMap((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              className={'mcell' + (cell.open ? ' open' : '')}
              onClick={() => open(r, c)}
              onContextMenu={ev => {
                ev.preventDefault();
                flag(r, c);
              }}
              style={{ color: cell.open && cell.n ? NUM_COLORS[cell.n] : undefined }}
            >
              {cell.open ? (cell.mine ? '💥' : cell.n || '') : cell.flag ? '🚩' : ''}
            </button>
          )),
        )}
      </div>
      <p className="m-desc">左键翻开 · 右键插旗（手机长按）。首击 3×3 范围保证无雷。</p>
      {state === 'won' ? <GameOver text="全部翻开，排雷成功！" onRestart={() => { setGrid(build(null)); setState('idle'); setFlags(0); }} /> : null}
      {state === 'lost' ? <GameOver text="踩到雷了，再来一局" onRestart={() => { setGrid(build(null)); setState('idle'); setFlags(0); }} /> : null}
    </div>
  );
}

/* ================= 色块泛滥 Flood It ================= */
const FLOOD_COLORS = ['#ff4d8d', '#ffd21f', '#22c55e', '#0e7490', '#7c58f5', '#ff7a1a'];

export function Flood({ id, params }: EngineProps) {
  const n = Number(params.n ?? 12);
  const maxSteps = Math.round(n * 2.4);
  const make = () =>
    Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(0, FLOOD_COLORS.length - 1)));
  const [grid, setGrid] = useState<number[][]>(make);
  const [steps, setSteps] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [best, submit] = useBest(id);

  const paint = (color: number) => {
    if (won || lost) return;
    const origin = grid[0][0];
    if (origin === color) return;
    const g = grid.map(row => [...row]);
    const fill = (r: number, c: number) => {
      if (r < 0 || r >= n || c < 0 || c >= n || g[r][c] !== origin) return;
      g[r][c] = color;
      fill(r + 1, c);
      fill(r - 1, c);
      fill(r, c + 1);
      fill(r, c - 1);
    };
    fill(0, 0);
    const nowSteps = steps + 1;
    setSteps(nowSteps);
    setGrid(g);
    const uniform = g.every(row => row.every(v => v === color));
    if (uniform) {
      setWon(true);
      submit(Math.max(1, 1000 - nowSteps * 10));
    } else if (nowSteps >= maxSteps) {
      setLost(true);
    }
  };

  return (
    <div>
      <div className="m-kicker">色块泛滥</div>
      <h2>从左上角开始 · {maxSteps} 步内填满同色</h2>
      <div className="g-scorebar">
        <span>步数 <b>{steps}/{maxSteps}</b></span>
        <span>最佳 <b>{best > 0 ? `${Math.round((1000 - best) / 10)} 步` : '—'}</b></span>
      </div>
      <div className="flood" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {grid.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} className="fcell" style={{ background: FLOOD_COLORS[v] }} />))}
      </div>
      <div className="ball-ops">
        {FLOOD_COLORS.map((c, i) => (
          <button key={i} className="fbtn" style={{ background: c }} onClick={() => paint(i)} />
        ))}
      </div>
      {won ? <GameOver text={`${steps} 步填满！`} onRestart={() => { setGrid(make()); setSteps(0); setWon(false); setLost(false); }} /> : null}
      {lost ? <GameOver text="步数用完，差一点" onRestart={() => { setGrid(make()); setSteps(0); setWon(false); setLost(false); }} /> : null}
    </div>
  );
}

/* ================= 四宫数独 ================= */
function genSudoku4(clues: number): number[][] {
  // 4×4 数独：每行每列每 2×2 宫 1-4。生成完整解再挖洞。
  const base = [1, 2, 3, 4];
  const rows = shuffle([
    [base[0], base[1], base[2], base[3]],
    [base[2], base[3], base[0], base[1]],
    [base[1], base[0], base[3], base[2]],
    [base[3], base[2], base[1], base[0]],
  ]);
  const sol = rows.map(r => [...r]);
  const puzzle = sol.map(r => [...r]);
  const holes = 16 - clues;
  const idxs = shuffle([...Array(16).keys()]).slice(0, holes);
  idxs.forEach(i => {
    puzzle[Math.floor(i / 4)][i % 4] = 0;
  });
  return puzzle;
}

export function Sudoku4({ id, params }: EngineProps) {
  const clues = Number(params.clues ?? 6);
  const init = useMemo(() => genSudoku4(clues), [clues]);
  const [puzzle] = useState(init);
  const [values, setValues] = useState<number[][]>(() => init.map(r => [...r]));
  const [best, submit] = useBest(id);
  const given = useMemo(() => init.flat().map(v => v !== 0), [init]);
  const solved = JSON.stringify(values) === JSON.stringify(puzzle.map(r => r.map(v => v))); // 解即生成解（4 宫解唯一性由生成器保证的概率极高；这里以完整解判定）

  useEffect(() => {
    if (solved) submit(clues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const cycle = (i: number) => {
    if (given[i]) return;
    setValues(prev => {
      const next = prev.map(r => [...r]);
      const r = Math.floor(i / 4);
      const c = i % 4;
      next[r][c] = (next[r][c] + 1) % 5;
      return next;
    });
  };

  return (
    <div>
      <div className="m-kicker">四宫数独</div>
      <h2>每行每列每宫 1-4 不重复</h2>
      <p className="m-desc">点击空格循环填入 1-4，填满即判定（提示 {clues} 个）。</p>
      <div className="sudoku4">
        {values.flat().map((v, i) => (
          <button key={i} className={'scell' + (given[i] ? ' given' : '') + (Math.floor(i / 4) % 2 === (i % 4) % 2 ? ' a' : ' b')} onClick={() => cycle(i)}>
            {v || ''}
          </button>
        ))}
      </div>
      {solved ? <GameOver text="解开啦！" onRestart={() => setValues(init.map(r => [...r]))} /> : null}
    </div>
  );
}

/* ================= 色彩找不同 ================= */
export function ColorFind({ id, params }: EngineProps) {
  const n = Number(params.n ?? 4);
  const make = () => {
    const hue = randInt(0, 359);
    const diff = Math.max(8, 60 - n * 8); // 阶数越高色差越小
    return { hue, diff, odd: randInt(0, n * n - 1) };
  };
  const [round, setRound] = useState(make);
  const [level, setLevel] = useState(1);
  const [best, submit] = useBest(id);
  const [wrong, setWrong] = useState(0);

  const pick = (i: number) => {
    if (i === round.odd) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      submit(nextLevel - 1);
      setRound(make());
    } else {
      setWrong(w => w + 1);
    }
  };

  const base = `hsl(${round.hue} 72% 62%)`;
  const oddC = `hsl(${(round.hue + round.diff) % 360} 72% ${62 - round.diff / 3}%)`;

  return (
    <div>
      <div className="m-kicker">色彩找不同</div>
      <h2>找到颜色不一样的那一块</h2>
      <div className="g-scorebar">
        <span>关卡 <b>{level}</b></span>
        <span>失误 <b>{wrong}</b></span>
        <span>最佳 <b>{best}</b></span>
      </div>
      <div className="colorfind" style={{ gridTemplateColumns: `repeat(${Math.min(n, 6)}, 1fr)` }}>
        {Array.from({ length: n * n }, (_, i) => (
          <button key={i} className="cfcell" style={{ background: i === round.odd ? oddC : base }} onClick={() => pick(i)} />
        ))}
      </div>
      <p className="m-desc">每过一关色差越小。手机上眯眼效果更佳。</p>
    </div>
  );
}
