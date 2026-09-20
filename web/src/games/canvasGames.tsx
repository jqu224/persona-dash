/** canvas 街机引擎：贪吃蛇 / 弹弹球 / 俄罗斯方块 / 乒乓人机 / 陨石躲避。
 * 统一约定：canvas 逻辑宽高 CSS 像素，rAF 循环在 useEffect 内启动、卸载即停；
 * 键盘走 useKeys，触屏走指针事件（滑动手势）。 */
import { useEffect, useRef, useState } from 'react';

import { EngineProps, GameOver, ScoreBar, randInt, useBest, useKeys } from './util';

const SIZE = 336; // 画布逻辑边长（21 格 × 16px 等）

/* ================= 贪吃蛇 ================= */
export function Snake({ id, params }: EngineProps) {
  const ms = Number(params.ms ?? 140);
  const wrap = Boolean(params.wrap);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [best, submit] = useBest(id);
  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    score: 0,
    dead: false,
  });

  const turn = (key: string) => {
    const s = state.current;
    const d = s.dir;
    if ((key === 'ArrowUp' || key === 'w') && d.y === 0) s.nextDir = { x: 0, y: -1 };
    if ((key === 'ArrowDown' || key === 's') && d.y === 0) s.nextDir = { x: 0, y: 1 };
    if ((key === 'ArrowLeft' || key === 'a') && d.x === 0) s.nextDir = { x: -1, y: 0 };
    if ((key === 'ArrowRight' || key === 'd') && d.x === 0) s.nextDir = { x: 1, y: 0 };
  };
  useKeys(turn);

  useEffect(() => {
    const cell = SIZE / 21;
    const draw = () => {
      const cv = canvasRef.current;
      const ctx = cv?.getContext('2d');
      if (!ctx) return;
      const s = state.current;
      ctx.fillStyle = 'var(--soft)';
      ctx.fillStyle = '#f6f7f4';
      ctx.fillRect(0, 0, SIZE, SIZE);
      // 食物
      ctx.fillStyle = '#ff7a1a';
      ctx.beginPath();
      ctx.arc((s.food.x + 0.5) * cell, (s.food.y + 0.5) * cell, cell * 0.38, 0, Math.PI * 2);
      ctx.fill();
      // 蛇
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#16a34a' : `rgba(22,163,74,${Math.max(0.45, 1 - i / 30)})`;
        ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
      });
    };
    const step = () => {
      const s = state.current;
      if (s.dead) return;
      s.dir = s.nextDir;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (wrap) {
        head.x = (head.x + 21) % 21;
        head.y = (head.y + 21) % 21;
      } else if (head.x < 0 || head.x >= 21 || head.y < 0 || head.y >= 21) {
        s.dead = true;
      }
      if (!s.dead && s.snake.some(p => p.x === head.x && p.y === head.y)) s.dead = true;
      if (s.dead) {
        submit(s.score);
        setDead(true);
        return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 1;
        setScore(s.score);
        let f;
        do {
          f = { x: randInt(0, 20), y: randInt(0, 20) };
        } while (s.snake.some(p => p.x === f!.x && p.y === f!.y));
        s.food = f;
      } else {
        s.snake.pop();
      }
      draw();
    };
    const timer = window.setInterval(step, ms);
    draw();
    return () => window.clearInterval(timer);
  }, [ms, wrap, submit]);

  const restart = () => {
    state.current = { snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, food: { x: 15, y: 10 }, score: 0, dead: false };
    setScore(0);
    setDead(false);
  };

  // 触屏滑动
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <div>
      <div className="m-kicker">贪吃蛇</div>
      <h2>{wrap ? '穿墙模式 · 撞墙从对面出来' : '经典模式 · 别撞墙别咬自己'}</h2>
      <ScoreBar score={score} best={best} />
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="g-canvas"
        onTouchStart={ev => {
          const t = ev.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={ev => {
          const st = touchStart.current;
          if (!st) return;
          const t = ev.changedTouches[0];
          const dx = t.clientX - st.x;
          const dy = t.clientY - st.y;
          if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
          else turn(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        }}
      />
      <p className="m-desc">方向键 / WASD / 滑动控制方向。</p>
      {dead ? <GameOver text={`本局 ${score} 分${score >= best && score > 0 ? ' · 新纪录！' : ''}`} onRestart={restart} /> : null}
    </div>
  );
}

/* ================= 弹弹球 ================= */
export function Breakout({ id, params }: EngineProps) {
  const paddleW = Number(params.paddle ?? 76);
  const rows = Number(params.rows ?? 4);
  const speed0 = Number(params.speed ?? 3.2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [best, submit] = useBest(id);

  useEffect(() => {
    const W = SIZE;
    const H = SIZE;
    const cols = 8;
    const bricks: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(true));
    const st = {
      x: W / 2,
      y: H - 60,
      dx: speed0 * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed0,
      paddleX: (W - paddleW) / 2,
      score: 0,
      done: false,
    };
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    let leftDown = false;
    let rightDown = false;
    const onKey = (down: boolean) => (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'a') leftDown = down;
      if (ev.key === 'ArrowRight' || ev.key === 'd') rightDown = down;
      if (['ArrowLeft', 'ArrowRight'].includes(ev.key)) ev.preventDefault();
    };
    const kd = onKey(true);
    const ku = onKey(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const mouse = (ev: PointerEvent) => {
      const rect = cv?.getBoundingClientRect();
      if (!rect) return;
      st.paddleX = Math.max(0, Math.min(W - paddleW, ((ev.clientX - rect.left) / rect.width) * W - paddleW / 2));
    };
    cv?.addEventListener('pointermove', mouse);

    const brickH = 16;
    const gap = 4;
    const brickW = (W - gap * (cols + 1)) / cols;

    const loop = () => {
      if (!st.done) {
        if (leftDown) st.paddleX = Math.max(0, st.paddleX - 6);
        if (rightDown) st.paddleX = Math.min(W - paddleW, st.paddleX + 6);
        st.x += st.dx;
        st.y += st.dy;
        if (st.x < 6 || st.x > W - 6) st.dx = -st.dx;
        if (st.y < 6) st.dy = -st.dy;
        // 挡板
        if (st.y > H - 26 && st.y < H - 14 && st.x > st.paddleX - 4 && st.x < st.paddleX + paddleW + 4 && st.dy > 0) {
          st.dy = -Math.abs(st.dy);
          st.dx += ((st.x - (st.paddleX + paddleW / 2)) / paddleW) * 1.6;
          st.dx = Math.max(-5, Math.min(5, st.dx));
        }
        // 砖块
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            if (!bricks[r][c]) continue;
            const bx = gap + c * (brickW + gap);
            const by = 40 + r * (brickH + gap);
            if (st.x > bx && st.x < bx + brickW && st.y > by && st.y < by + brickH) {
              bricks[r][c] = false;
              st.dy = -st.dy;
              st.score += 10;
              setScore(st.score);
            }
          }
        }
        if (st.y > H) {
          st.done = true;
          submit(st.score);
          setLost(true);
        }
        if (bricks.every(row => row.every(b => !b))) {
          st.done = true;
          submit(st.score);
          setWon(true);
        }
      }
      // 绘制
      if (ctx) {
        ctx.fillStyle = '#f6f7f4';
        ctx.fillRect(0, 0, W, H);
        const palette = ['#22c55e', '#0e7490', '#ffd21f', '#ff7a1a', '#ff4d8d', '#7c58f5'];
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            if (!bricks[r][c]) continue;
            ctx.fillStyle = palette[r % palette.length];
            ctx.fillRect(gap + c * (brickW + gap), 40 + r * (brickH + gap), brickW, brickH);
          }
        }
        ctx.fillStyle = '#161616';
        ctx.fillRect(st.paddleX, H - 20, paddleW, 8);
        ctx.beginPath();
        ctx.arc(st.x, st.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4d8d';
        ctx.fill();
      }
    };
    const timer = window.setInterval(loop, 16);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv?.removeEventListener('pointermove', mouse);
    };
  }, [paddleW, rows, speed0, submit]);

  const restart = () => window.location.reload();

  return (
    <div>
      <div className="m-kicker">弹弹球</div>
      <h2>接住球 · 打光所有砖块</h2>
      <ScoreBar score={score} best={best} />
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="g-canvas" style={{ touchAction: 'none' }} />
      <p className="m-desc">← → / A D 或鼠标滑动移动挡板。</p>
      {won ? <GameOver text={`通关！${score} 分`} onRestart={restart} /> : null}
      {lost ? <GameOver text={`球掉了，本局 ${score} 分`} onRestart={restart} /> : null}
    </div>
  );
}

/* ================= 俄罗斯方块 ================= */
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];
const TCOLORS = ['#22c55e', '#ffd21f', '#7c58f5', '#0e7490', '#ff7a1a', '#ff4d8d', '#4dd4e8'];

export function Tetris({ id, params }: EngineProps) {
  const ms = Number(params.ms ?? 550);
  const N = 12;
  const cell = SIZE / N;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [best, submit] = useBest(id);
  const st = useRef({
    grid: Array.from({ length: N }, () => Array<number>(N).fill(-1)),
    piece: { shape: SHAPES[0], color: 0, x: 4, y: 0 },
    score: 0,
    over: false,
  });

  const collide = (shape: number[][], px: number, py: number) => {
    const s = st.current;
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (!shape[r][c]) continue;
        const gx = px + c;
        const gy = py + r;
        if (gx < 0 || gx >= N || gy >= N) return true;
        if (gy >= 0 && s.grid[gy][gx] >= 0) return true;
      }
    }
    return false;
  };

  const spawn = () => {
    const s = st.current;
    const i = randInt(0, SHAPES.length - 1);
    s.piece = { shape: SHAPES[i], color: i, x: Math.floor((N - SHAPES[i][0].length) / 2), y: 0 };
    if (collide(s.piece.shape, s.piece.x, s.piece.y)) {
      s.over = true;
      submit(s.score);
      setOver(true);
    }
  };

  const lock = () => {
    const s = st.current;
    s.piece.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v && s.piece.y + r >= 0) s.grid[s.piece.y + r][s.piece.x + c] = s.piece.color;
      }),
    );
    let cleared = 0;
    for (let r = N - 1; r >= 0; r -= 1) {
      if (s.grid[r].every(v => v >= 0)) {
        s.grid.splice(r, 1);
        s.grid.unshift(Array<number>(N).fill(-1));
        cleared += 1;
        r += 1;
      }
    }
    if (cleared) {
      s.score += [0, 10, 30, 60, 100][cleared] ?? 100;
      setScore(s.score);
    }
    spawn();
  };

  useEffect(() => {
    spawn();
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    const draw = () => {
      const s = st.current;
      if (!ctx) return;
      ctx.fillStyle = '#f6f7f4';
      ctx.fillRect(0, 0, SIZE, SIZE);
      // 网格线
      ctx.strokeStyle = 'rgba(0,0,0,.05)';
      for (let i = 0; i <= N; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(SIZE, i * cell);
        ctx.stroke();
      }
      const block = (x: number, y: number, ci: number) => {
        ctx.fillStyle = TCOLORS[ci];
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      };
      s.grid.forEach((row, r) => row.forEach((v, c) => v >= 0 && block(c, r, v)));
      s.piece.shape.forEach((row, r) =>
        row.forEach((v, c) => v && s.piece.y + r >= 0 && block(s.piece.x + c, s.piece.y + r, s.piece.color)),
      );
    };
    const tick = () => {
      const s = st.current;
      if (s.over) return;
      if (!collide(s.piece.shape, s.piece.x, s.piece.y + 1)) s.piece.y += 1;
      else lock();
      draw();
    };
    const timer = window.setInterval(tick, ms);
    draw();
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  useKeys(key => {
    const s = st.current;
    if (s.over) return;
    if (key === 'ArrowLeft' || key === 'a') {
      if (!collide(s.piece.shape, s.piece.x - 1, s.piece.y)) s.piece.x -= 1;
    } else if (key === 'ArrowRight' || key === 'd') {
      if (!collide(s.piece.shape, s.piece.x + 1, s.piece.y)) s.piece.x += 1;
    } else if (key === 'ArrowDown' || key === 's') {
      if (!collide(s.piece.shape, s.piece.x, s.piece.y + 1)) s.piece.y += 1;
    } else if (key === 'ArrowUp' || key === 'w' || key === ' ') {
      const shape = s.piece.shape;
      const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
      if (!collide(rotated, s.piece.x, s.piece.y)) s.piece.shape = rotated;
    }
  });

  return (
    <div>
      <div className="m-kicker">俄罗斯方块</div>
      <h2>消行得分 · 一行 10 分起</h2>
      <ScoreBar score={score} best={best} />
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="g-canvas" />
      <p className="m-desc">← → 移动 · ↑ 旋转 · ↓ 加速。</p>
      {over ? <GameOver text={`顶到了！本局 ${score} 分`} onRestart={() => window.location.reload()} /> : null}
    </div>
  );
}

/* ================= 乒乓人机 ================= */
export function Pong({ id, params }: EngineProps) {
  const aiSkill = Number(params.ai ?? 0.55);
  const W = SIZE;
  const H = 260;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [you, setYou] = useState(0);
  const [ai, setAi] = useState(0);
  const [ended, setEnded] = useState<string | null>(null);
  const [best, submit] = useBest(id);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    const st = { x: W / 2, y: H / 2, dx: 3.2, dy: 2.2, py: H / 2 - 28, ay: H / 2 - 28, you: 0, ai: 0, ended: '' };
    const PW = 8;
    const PH = 56;
    const keys: Record<string, boolean> = {};
    const kd = (ev: KeyboardEvent) => {
      keys[ev.key] = true;
      if (['ArrowUp', 'ArrowDown'].includes(ev.key)) ev.preventDefault();
    };
    const ku = (ev: KeyboardEvent) => {
      keys[ev.key] = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const mouse = (ev: PointerEvent) => {
      const rect = cv?.getBoundingClientRect();
      if (!rect) return;
      st.py = Math.max(0, Math.min(H - PH, ((ev.clientY - rect.top) / rect.height) * H - PH / 2));
    };
    cv?.addEventListener('pointermove', mouse);

    const reset = (dir: number) => {
      st.x = W / 2;
      st.y = H / 2;
      st.dx = 3.4 * dir;
      st.dy = (Math.random() * 2 - 1) * 2.4;
    };

    const loop = () => {
      if (!st.ended) {
        if (keys.ArrowUp || keys.w) st.py = Math.max(0, st.py - 5);
        if (keys.ArrowDown || keys.s) st.py = Math.min(H - PH, st.py + 5);
        // AI 追球（带失误率）
        const target = st.dy > 0 && st.dx > 0 ? st.y - PH / 2 : H / 2 - PH / 2;
        st.ay += (target - st.ay) * aiSkill * 0.09;
        st.ay = Math.max(0, Math.min(H - PH, st.ay));
        st.x += st.dx;
        st.y += st.dy;
        if (st.y < 5 || st.y > H - 5) st.dy = -st.dy;
        if (st.x < 18 && st.x > 8 && st.y > st.py && st.y < st.py + PH && st.dx < 0) {
          st.dx = Math.abs(st.dx) * 1.03;
          st.dy += (st.y - (st.py + PH / 2)) * 0.06;
        }
        if (st.x > W - 18 && st.x < W - 8 && st.y > st.ay && st.y < st.ay + PH && st.dx > 0) {
          st.dx = -Math.abs(st.dx) * 1.03;
          st.dy += (st.y - (st.ay + PH / 2)) * 0.06;
        }
        if (st.x < 0) {
          st.ai += 1;
          setAi(st.ai);
          reset(1);
        }
        if (st.x > W) {
          st.you += 1;
          setYou(st.you);
          reset(-1);
        }
        if (st.you >= 7 || st.ai >= 7) {
          st.ended = st.you >= 7 ? 'win' : 'lose';
          submit(st.you * 10 - st.ai);
          setEnded(st.ended);
        }
      }
      if (ctx) {
        ctx.fillStyle = '#f6f7f4';
        ctx.fillRect(0, 0, W, H);
        ctx.setLineDash([6, 8]);
        ctx.strokeStyle = 'rgba(0,0,0,.18)';
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#161616';
        ctx.fillRect(8, st.py, PW, PH);
        ctx.fillStyle = '#ff7a1a';
        ctx.fillRect(W - 16, st.ay, PW, PH);
        ctx.fillStyle = '#0e7490';
        ctx.beginPath();
        ctx.arc(st.x, st.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const timer = window.setInterval(loop, 16);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv?.removeEventListener('pointermove', mouse);
    };
  }, [aiSkill, submit]);

  return (
    <div>
      <div className="m-kicker">乒乓人机</div>
      <h2>先得 7 分者胜</h2>
      <ScoreBar score={you * 10 - ai > 0 ? you * 10 - ai : 0} best={best} />
      <div className="g-scorebar">
        <span>
          你 <b>{you}</b>
        </span>
        <span>
          AI <b>{ai}</b>
        </span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="g-canvas" style={{ touchAction: 'none' }} />
      <p className="m-desc">↑ ↓ / W S 或鼠标滑动控制左侧球拍。</p>
      {ended ? (
        <GameOver text={ended === 'win' ? '你赢了这一局！' : 'AI 略胜一筹，再来！'} onRestart={() => window.location.reload()} />
      ) : null}
    </div>
  );
}

/* ================= 陨石躲避 ================= */
export function Dodge({ id, params }: EngineProps) {
  const density = Number(params.density ?? 1);
  const W = SIZE;
  const H = SIZE;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [best, submit] = useBest(id);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    const st = { x: W / 2, y: H - 30, rocks: [] as { x: number; y: number; r: number; v: number }[], t: 0, score: 0, over: false };
    const R = 9;
    const keys: Record<string, boolean> = {};
    const kd = (ev: KeyboardEvent) => {
      keys[ev.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.key)) ev.preventDefault();
    };
    const ku = (ev: KeyboardEvent) => {
      keys[ev.key] = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const mouse = (ev: PointerEvent) => {
      const rect = cv?.getBoundingClientRect();
      if (!rect) return;
      st.x = ((ev.clientX - rect.left) / rect.width) * W;
      st.y = ((ev.clientY - rect.top) / rect.height) * H;
    };
    cv?.addEventListener('pointermove', mouse);

    const loop = () => {
      if (!st.over) {
        st.t += 1;
        const speed = 5;
        if (keys.ArrowLeft || keys.a) st.x -= speed;
        if (keys.ArrowRight || keys.d) st.x += speed;
        if (keys.ArrowUp || keys.w) st.y -= speed;
        if (keys.ArrowDown || keys.s) st.y += speed;
        st.x = Math.max(R, Math.min(W - R, st.x));
        st.y = Math.max(R, Math.min(H - R, st.y));
        if (st.t % Math.max(6, Math.round(14 / density)) === 0) {
          st.rocks.push({ x: Math.random() * W, y: -14, r: randInt(7, 15), v: 1.6 + Math.random() * 1.6 * density });
        }
        st.rocks.forEach(rock => {
          rock.y += rock.v;
        });
        st.rocks = st.rocks.filter(rock => rock.y < H + 20);
        if (st.t % 10 === 0) {
          st.score += 1;
          setScore(st.score);
        }
        for (const rock of st.rocks) {
          if (Math.hypot(rock.x - st.x, rock.y - st.y) < rock.r + R * 0.8) {
            st.over = true;
            submit(st.score);
            setOver(true);
            break;
          }
        }
      }
      if (ctx) {
        ctx.fillStyle = '#f6f7f4';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#5b5b55';
        st.rocks.forEach(rock => {
          ctx.beginPath();
          ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#ff4d8d';
        ctx.beginPath();
        ctx.arc(st.x, st.y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const timer = window.setInterval(loop, 16);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      cv?.removeEventListener('pointermove', mouse);
    };
  }, [density, submit]);

  return (
    <div>
      <div className="m-kicker">陨石躲避</div>
      <h2>活一秒是一秒，坚持越久分越高</h2>
      <ScoreBar score={score} best={best} />
      <canvas ref={canvasRef} width={W} height={H} className="g-canvas" style={{ touchAction: 'none' }} />
      <p className="m-desc">方向键 / WASD / 手指拖动移动小粉点。</p>
      {over ? <GameOver text={`被砸中啦，坚持了 ${score} 拍`} onRestart={() => window.location.reload()} /> : null}
    </div>
  );
}
