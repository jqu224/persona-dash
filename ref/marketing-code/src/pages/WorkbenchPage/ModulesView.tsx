import { useMemo, useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { ViewName } from '@/data/onboarding';
import {
  GAPS,
  IQuizItem,
  IUserModule,
  IVocabItem,
  isDue,
  isMastered,
  moduleKind,
  moduleStats,
  todayStr,
} from '@/lib/learn-modules';

interface ModulesViewProps {
  active: boolean;
  modules: IUserModule[];
  onAnswer: (moduleId: string, itemId: string, correct: boolean) => void;
  onRemove: (moduleId: string) => void;
  onSwitchView: (v: ViewName) => void;
  onOpenCreate: () => void;
}

const TYPE_META: Record<IUserModule['type'], { label: string; icon: string; ckey: { fg: string; bg: string } }> = {
  vocabulary: { label: '背单词 · 艾宾浩斯', icon: 'abc', ckey: { fg: 'var(--blue)', bg: 'var(--blue-bg)' } },
  quiz: { label: '测试 · 滚动复测', icon: 'psychology', ckey: { fg: 'var(--pink)', bg: 'var(--pink-bg)' } },
};

function DueBadge({ n }: { n: number }) {
  return n > 0 ? <span className="mod-due">{n} 待复习</span> : null;
}

/* ===== 背单词复习卡 ===== */
function VocabTrainer({ m, onAnswer }: { m: IUserModule; onAnswer: ModulesViewProps['onAnswer'] }) {
  const due = m.items.filter(i => isDue(i)) as IVocabItem[];
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [lastMark, setLastMark] = useState<'ok' | 'no' | null>(null);

  if (due.length === 0) {
    return (
      <div className="mod-empty">
        <Mi name="checkcircle" />
        <b>今天没有到期的单词</b>
        <p className="muted">下一次复习日到了这里会自动亮起新词，按 1 / 2 / 4 / 7 / 15 天节奏推进。</p>
      </div>
    );
  }

  const cur = due[idx % due.length];
  const mark = (correct: boolean) => {
    onAnswer(m.id, cur.id, correct);
    setLastMark(correct ? 'ok' : 'no');
    window.setTimeout(() => {
      setLastMark(null);
      setRevealed(false);
      setIdx(i => i + 1);
    }, 650);
  };

  return (
    <div className="vocab-trainer">
      <div className="vocab-count">
        <span>今日到期 {due.length} 词</span>
        <span>进度 {idx % due.length + 1} / {due.length}</span>
      </div>
      <div className={'vocab-card' + (lastMark === 'ok' ? ' flash-ok' : lastMark === 'no' ? ' flash-no' : '')}>
        <b className="vocab-word">{cur.word}</b>
        {revealed ? (
          <p className="vocab-trans">{cur.translation}</p>
        ) : (
          <button className="vocab-reveal" onClick={() => setRevealed(true)}>点击显示释义</button>
        )}
        <div className="vocab-dots">
          {GAPS.vocabulary.map((_, i) => (
            <span key={i} className={i < cur.stage ? 'on' : ''} />
          ))}
        </div>
      </div>
      <div className="vocab-actions">
        <button className="vocab-btn no" onClick={() => mark(false)} disabled={lastMark !== null}>
          不认识 · 明天重来
        </button>
        <button className="vocab-btn yes" onClick={() => mark(true)} disabled={lastMark !== null}>
          认识 · 进入下一间隔
        </button>
      </div>
    </div>
  );
}

/* ===== 测试答题器 ===== */
function QuizTrainer({ m, onAnswer }: { m: IUserModule; onAnswer: ModulesViewProps['onAnswer'] }) {
  const due = m.items.filter(i => isDue(i)) as IQuizItem[];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const cur = due.length > 0 ? due[idx % due.length] : null;

  if (!cur) {
    return (
      <div className="mod-empty">
        <Mi name="checkcircle" />
        <b>今天的测试都完成了</b>
        <p className="muted">题目会在 24h / 48h / 1 周 / 1 个月节点自动回到窗口，答错则明天重测。</p>
      </div>
    );
  }

  const pick = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    onAnswer(m.id, cur.id, opt === cur.answer);
    window.setTimeout(() => {
      setPicked(null);
      setIdx(i => i + 1);
    }, 900);
  };

  const stageName = ['当天首测', '24h 复测', '48h 复测', '1 周复测', '1 个月复测'][Math.min(cur.stage, 4)];

  return (
    <div className="quiz-trainer">
      <div className="vocab-count">
        <span>今日窗口 {due.length} 题</span>
        <span>本题节点：{stageName}</span>
      </div>
      <div className="quiz-card">
        <b>{cur.question}</b>
        <div className="quiz-opts">
          {cur.options.map(opt => {
            const state = picked === null ? '' : opt === cur.answer ? 'right' : opt === picked ? 'wrong' : 'dim';
            return (
              <button
                key={opt}
                className={'quiz-opt ' + state}
                onClick={() => pick(opt)}
                disabled={picked !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== null ? (
          <p className={'quiz-veil ' + (picked === cur.answer ? 'ok' : 'no')}>
            {picked === cur.answer
              ? '答对了！这道题进入下一个复测节点。'
              : `答错了，正确答案是「${cur.answer}」。这道题回到第 1 天，明天重测。`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ===== 词条/题目明细 ===== */
function ItemTable({ m }: { m: IUserModule }) {
  const rows = useMemo(() => {
    const today = todayStr();
    return m.items.map(i => ({
      i,
      due: isDue(i, today),
      mastered: isMastered(i),
      kind: moduleKind(i),
    }));
  }, [m]);

  return (
    <div className="mod-table">
      <div className="mod-tr head">
        <span>{m.type === 'vocabulary' ? '单词' : '题目'}</span>
        <span>{m.type === 'vocabulary' ? '释义' : '答案'}</span>
        <span>节点</span>
        <span>下次到期</span>
      </div>
      {rows.map(({ i, due, mastered, kind }) => (
        <div className={'mod-tr' + (due ? ' due' : '')} key={i.id}>
          <span className="mod-tr-main">
            <b>{kind === 'vocabulary' ? (i as IVocabItem).word : (i as IQuizItem).question}</b>
          </span>
          <span className="mod-tr-sub">
            {kind === 'vocabulary' ? (i as IVocabItem).translation : (i as IQuizItem).answer}
          </span>
          <span className="mod-stage">
            {mastered ? (
              <em className="mod-pill ok">已毕业</em>
            ) : (
              <em className={'mod-pill' + (due ? ' hot' : '')}>{i.stage}/{GAPS[kind].length + 1}</em>
            )}
          </span>
          <span className="mod-tr-sub">{mastered ? '—' : due ? '今天' : i.nextDue}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== 主视图 ===== */
export default function ModulesView({ active, modules, onAnswer, onRemove, onSwitchView, onOpenCreate }: ModulesViewProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = modules.find(m => m.id === openId) ?? null;

  if (current) {
    const meta = TYPE_META[current.type];
    const stats = moduleStats(current);
    return (
      <section className={'view' + (active ? ' on' : '')} id="view-modules">
        <button className="back" onClick={() => setOpenId(null)}>
          <Mi name="chevron" />
          返回模块列表
        </button>
        <div style={{ margin: '18px 0 22px' }}>
          <div className="eyebrow" style={{ color: meta.ckey.fg }}>{meta.label}</div>
          <h1 style={{ marginTop: 5 }}>{current.title}</h1>
          <p className="muted" style={{ marginTop: 7 }}>
            共 {stats.total} 条 · 今日到期 {stats.due} 条 · 已毕业 {stats.mastered} 条（{stats.pct}%）
          </p>
        </div>

        <div className="section">
          <div className="row-head">
            <div>
              <h2>今日复习窗口</h2>
              <p className="muted" style={{ marginTop: 3 }}>
                {current.type === 'vocabulary'
                  ? '进入窗口的条件：未毕业 且 到期日 ≤ 今天；答错回到第 1 天、明天重现。'
                  : '进入窗口的条件：未毕业 且 到期日 ≤ 今天；节奏为当天 · 24h · 48h · 1 周 · 1 个月，答错重置。'}
              </p>
            </div>
            <button className="mod-del" onClick={() => { onRemove(current.id); setOpenId(null); }}>
              删除模块
            </button>
          </div>
          {current.type === 'vocabulary'
            ? <VocabTrainer m={current} onAnswer={onAnswer} />
            : <QuizTrainer m={current} onAnswer={onAnswer} />}
        </div>

        <div className="section">
          <div className="row-head">
            <div>
              <h2>全部内容</h2>
              <p className="muted" style={{ marginTop: 3 }}>节点 = 已通过的复测次数；毕业后移出滚动窗口。</p>
            </div>
          </div>
          <ItemTable m={current} />
        </div>
      </section>
    );
  }

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-modules">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">My Modules</div>
        <h1 style={{ marginTop: 5 }}>我的模块</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          点右下角「+」用一句话创建模块：背单词走艾宾浩斯遗忘曲线，测试题按
          第 1 天 · 24h · 48h · 1 周 · 1 个月滚动复测，答错自动回到窗口起点。
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="section">
          <div className="mod-empty">
            <Mi name="book" />
            <b>还没有自定义模块</b>
            <p className="muted">试试一句话：「做一个英语四级高频词背单词模块」或「做一个入职知识测试模块」。</p>
            <button className="vocab-btn yes" onClick={onOpenCreate}>立即创建</button>
          </div>
        </div>
      ) : (
        <div className="mod-grid">
          {modules.map(m => {
            const meta = TYPE_META[m.type];
            const stats = moduleStats(m);
            return (
              <button className="mod-card" key={m.id} onClick={() => setOpenId(m.id)}>
                <div className="mod-card-top">
                  <span className="gico" style={{ background: meta.ckey.bg, color: meta.ckey.fg }}>
                    <Mi name={meta.icon} />
                  </span>
                  <div className="mod-card-title">
                    <b>{m.title}</b>
                    <span>{meta.label}</span>
                  </div>
                  <DueBadge n={stats.due} />
                </div>
                <div className="phasebar">
                  <div className="mastery-bar">
                    <span style={{ width: `${stats.pct}%` }} />
                  </div>
                  <em>{stats.mastered}/{stats.total} 毕业</em>
                </div>
                <span className="mod-open">打开模块 →</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
