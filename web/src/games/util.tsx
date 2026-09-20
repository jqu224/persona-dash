/** 游戏引擎共用工具：最佳成绩存取、随机、防抖键控 */
import { useCallback, useEffect, useRef, useState } from 'react';

const BEST_PREFIX = 'pd-best-';

export function getBest(id: string): number {
  try {
    return Number(localStorage.getItem(BEST_PREFIX + id) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function setBest(id: string, score: number): boolean {
  try {
    if (score > getBest(id)) {
      localStorage.setItem(BEST_PREFIX + id, String(score));
      return true;
    }
  } catch {
    /* 隐私模式静默 */
  }
  return false;
}

/** 最佳成绩 Hook：返回 [best, submit]，submit 得分更高时更新 */
export function useBest(id: string): [number, (score: number) => boolean] {
  const [best, setBestState] = useState(() => getBest(id));
  const submit = useCallback(
    (score: number) => {
      const updated = setBest(id, score);
      if (updated) setBestState(score);
      return updated;
    },
    [id],
  );
  return [best, submit];
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 键盘监听（阻止方向键滚动页面），卸载自动清理 */
export function useKeys(handler: (key: string) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(ev.key)) ev.preventDefault();
      ref.current(ev.key);
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** 游戏分数条：当前分 / 最佳分 */
export function ScoreBar({ score, best }: { score: number; best: number }) {
  return (
    <div className="g-scorebar">
      <span>
        得分 <b>{score}</b>
      </span>
      <span>
        最佳 <b>{best}</b>
      </span>
    </div>
  );
}

/** 结算面板 + 重开按钮 */
export function GameOver({ text, onRestart }: { text: string; onRestart: () => void }) {
  return (
    <div className="m-actions" style={{ marginTop: 12 }}>
      <span className="g-over">{text}</span>
      <button className="ok" onClick={onRestart}>
        再来一局
      </button>
    </div>
  );
}

export interface EngineProps {
  id: string;
  params: Record<string, unknown>;
}
