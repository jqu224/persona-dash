import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { scopedStorage } from '@/lib/platform';

import Mi from '@/components/workbench/Mi';
import { IMyTask, ModalState, ITaskView, ROLES, TaskFilter, ViewName } from '@/data/onboarding';
import { BaseDataProvider, useBaseData } from '@/lib/base-data';
import { IUserModule, advance } from '@/lib/learn-modules';

import '@/styles/workbench.css';
import HomeView from './HomeView';
import ModuleFab from './ModuleFab';
import ModulesView from './ModulesView';
import PeopleView from './PeopleView';
import ProgressView from './ProgressView';
import SettingsView, { NotifyPrefs } from './SettingsView';
import TasksBoardView from './TasksBoardView';
import ToolsView from './ToolsView';
import WorkbenchHeader from './WorkbenchHeader';
import WorkbenchModals from './WorkbenchModals';

const STORE_KEY = 'wb-state-v1';

interface PersistState {
  view: ViewName;
  theme: 'light' | 'dark';
  roleId: string;
  doneIds: string[];
  myTasks: IMyTask[];
  learned: string[];
  filter: TaskFilter;
  activeTrack: string;
  /** 看板任务状态本地覆盖（record id → 任务状态） */
  statusOverrides: Record<string, string>;
  /** 一句话创建的学习模块（背单词 / 测试） */
  modules: IUserModule[];
  prefs: NotifyPrefs;
}

const DEFAULT_PREFS: NotifyPrefs = { daily: true, achievement: true, unlock: false };

const DEFAULT_STATE: PersistState = {
  view: 'home',
  theme: 'light',
  roleId: 'zhang',
  doneIds: [],
  myTasks: [],
  learned: [],
  filter: 'today',
  activeTrack: 't1',
  statusOverrides: {},
  modules: [],
  prefs: DEFAULT_PREFS,
};

const NAV_ITEMS: { id: ViewName; label: string; icon: string }[] = [
  { id: 'home', label: '成长地图', icon: 'map' },
  { id: 'tasks', label: '任务看板', icon: 'checkcircle' },
  { id: 'tools', label: '工具中心', icon: 'widgets' },
  { id: 'modules', label: '我的模块', icon: 'book' },
  { id: 'people', label: '团队成员', icon: 'forum' },
  { id: 'progress', label: '我的进度', icon: 'schedule' },
  { id: 'settings', label: '设置', icon: 'palette' },
];

function loadState(): PersistState {
  try {
    const raw = scopedStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistState>;
    const merged = { ...DEFAULT_STATE, ...parsed };
    // 防御旧版本/异常存储的 null 字段，避免后续 .includes / .map 崩溃
    if (!Array.isArray(merged.doneIds)) merged.doneIds = [];
    if (!Array.isArray(merged.myTasks)) merged.myTasks = [];
    if (!Array.isArray(merged.learned)) merged.learned = [];
    if (!merged.statusOverrides || typeof merged.statusOverrides !== 'object') merged.statusOverrides = {};
    if (!Array.isArray(merged.modules)) merged.modules = [];
    if (!merged.prefs || typeof merged.prefs !== 'object') merged.prefs = DEFAULT_PREFS;
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

export default function WorkbenchPage() {
  return (
    <BaseDataProvider>
      <WorkbenchPageInner />
    </BaseDataProvider>
  );
}

function WorkbenchPageInner() {
  const base = useBaseData();
  const initial = useRef<PersistState>(loadState());
  const [view, setView] = useState<ViewName>(initial.current.view);
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.current.theme);
  const [roleId, setRoleId] = useState(initial.current.roleId);
  const [doneIds, setDoneIds] = useState<string[]>(initial.current.doneIds);
  const [myTasks, setMyTasks] = useState<IMyTask[]>(initial.current.myTasks);
  const [learned, setLearned] = useState<string[]>(initial.current.learned);
  const [filter, setFilter] = useState<TaskFilter>(initial.current.filter);
  const [activeTrack, setActiveTrack] = useState(initial.current.activeTrack);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>(initial.current.statusOverrides);
  const [prefs, setPrefs] = useState<NotifyPrefs>(initial.current.prefs);
  const [modules, setModules] = useState<IUserModule[]>(initial.current.modules);
  const [fabOpen, setFabOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number | null>(null);

  /* ===== 持久化 ===== */
  useEffect(() => {
    try {
      scopedStorage.setItem(
        STORE_KEY,
        JSON.stringify({ view, theme, roleId, doneIds, myTasks, learned, filter, activeTrack, statusOverrides, modules, prefs }),
      );
    } catch {
      /* 存储失败时静默降级为会话内状态 */
    }
  }, [view, theme, roleId, doneIds, myTasks, learned, filter, activeTrack, statusOverrides, modules, prefs]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  /* ===== 后台同步提示 ===== */
  const notifiedSync = useRef(false);
  useEffect(() => {
    if (base.sync === 'live' && !notifiedSync.current) {
      notifiedSync.current = true;
      notify('已从明道云后台同步最新数据');
    }
  }, [base.sync, notify]);

  /* ===== 派生数据 ===== */
  const role = useMemo(
    () => base.roles.find(r => r.id === roleId) ?? base.roles[0] ?? ROLES[0],
    [base.roles, roleId],
  );
  const isDark = theme === 'dark';

  const allTasks: ITaskView[] = useMemo(
    () => [
      ...base.seedTasks.map(s => ({ ...s, self: false })),
      ...myTasks.map(m => ({ ...m, self: true })),
    ],
    [base.seedTasks, myTasks],
  );

  const isDone = useCallback(
    (id: string) => doneIds.includes(id) || (myTasks.find(m => m.id === id)?.done ?? false),
    [doneIds, myTasks],
  );

  const counts = useMemo(() => {
    let today = 0;
    let todo = 0;
    let done = 0;
    for (const t of allTasks) {
      if (isDone(t.id)) done += 1;
      else if (t.w === 'today') today += 1;
      else todo += 1;
    }
    return { today, todo, done };
  }, [allTasks, isDone]);

  /* ===== 交互 ===== */
  const toggleTask = useCallback(
    (id: string) => {
      const mine = myTasks.find(m => m.id === id);
      if (mine) {
        setMyTasks(prev => prev.map(m => (m.id === id ? { ...m, done: !m.done } : m)));
        notify(mine.done ? '已恢复为待办' : '已完成 1 项任务');
        return;
      }
      setDoneIds(prev => {
        if (prev.includes(id)) {
          notify('已恢复为待办');
          return prev.filter(x => x !== id);
        }
        notify('已完成 1 项任务');
        return [...prev, id];
      });
    },
    [myTasks, notify],
  );

  const submitTask = useCallback(
    (title: string, track: string, when: string) => {
      const task: IMyTask = {
        id: `m${Date.now()}`,
        t: title,
        tr: track,
        w: when,
        d: '我为自己添加的待办事项。',
        by: '我自己添加',
        done: false,
        self: true,
      };
      setMyTasks(prev => [...prev, task]);
      setFilter(when === 'today' ? 'today' : 'todo');
      setModal(null);
      notify('已添加到我的清单');
    },
    [notify],
  );

  const sendMsg = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) {
        notify('先写点内容再发送');
        return false;
      }
      setModal(null);
      notify('消息已发送（演示）');
      return true;
    },
    [notify],
  );

  const chooseRole = useCallback(
    (id: string) => {
      setRoleId(id);
      setModal(null);
      const r = base.roles.find(x => x.id === id);
      notify(`已切换到 ${r ? r.name : '新身份'} 的视角`);
    },
    [base.roles, notify],
  );

  /* 任务看板：状态切换（乐观更新 + 写回明道云工作表） */
  const handleBoardStatus = useCallback(
    (id: string, status: string, synced: boolean) => {
      setStatusOverrides(prev => ({ ...prev, [id]: status }));
      if (status === '已完成') {
        setDoneIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      } else {
        setDoneIds(prev => prev.filter(x => x !== id));
      }
      if (synced) notify(`状态已写回明道云：${status}`);
      else notify('本地已更新，但写回明道云失败，稍后可重试');
    },
    [notify],
  );

  /* 「+」号新建任务：已写入明道云工作表，刷新直连数据并跳到看板 */
  const handleTaskCreated = useCallback(
    (title: string, _category: string) => {
      notify(`「${title}」已写入明道云工作表`);
      setView('tasks');
      base.refresh();
    },
    [base, notify],
  );

  const togglePref = useCallback(
    (key: keyof NotifyPrefs) => {
      setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    },
    [],
  );

  /* ===== 一句话学习模块 ===== */
  const handleModuleCreated = useCallback(
    (m: IUserModule, byAI: boolean) => {
      setModules(prev => [...prev, m]);
      setView('modules');
      notify(byAI ? `「${m.title}」已生成，今天先过第一遍` : `AI 暂不可用，已用演示内容创建「${m.title}」`);
    },
    [notify],
  );

  const handleModuleAnswer = useCallback(
    (moduleId: string, itemId: string, correct: boolean) => {
      setModules(prev =>
        prev.map(m =>
          m.id !== moduleId
            ? m
            : { ...m, items: m.items.map(i => (i.id === itemId ? advance(i, correct) : i)) },
        ),
      );
    },
    [],
  );

  const handleModuleRemove = useCallback(
    (moduleId: string) => {
      setModules(prev => prev.filter(m => m.id !== moduleId));
      notify('模块已删除');
    },
    [notify],
  );

  /* XP / 等级（与我的进度页、设置页共享口径） */
  const xp = useMemo(() => {
    const boardDone = base.boardTasks.filter(t => (statusOverrides[t.id] ?? t.status) === '已完成').length;
    const boardDoing = base.boardTasks.filter(t => (statusOverrides[t.id] ?? t.status) === '进行中').length;
    const myDone = myTasks.filter(m => m.done).length;
    return Math.max(boardDone, doneIds.length) * 30 + boardDoing * 5 + learned.length * 40 + myDone * 10;
  }, [base.boardTasks, statusOverrides, doneIds, learned, myTasks]);
  const level = Math.floor(xp / 400) + 1;

  const toggleMastered = useCallback(
    (name: string) => {
      setLearned(prev => {
        if (prev.includes(name)) {
          notify('已回到学习中');
          return prev.filter(x => x !== name);
        }
        notify('已掌握，进度已记录');
        return [...prev, name];
      });
    },
    [notify],
  );

  return (
    <div className="wb-root" data-theme={theme}>
      <div className="app">
        <WorkbenchHeader
          theme={theme}
          pageName={role.name}
          avatar={role.avatar}
          onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          onBell={() => notify('没有新通知，一切正常')}
          onAvatar={() => setModal({ type: 'role' })}
        />

        <div className="shell">
          <nav className="side">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={'navitem' + (view === item.id ? ' on' : '')}
                onClick={() => setView(item.id)}
              >
                <Mi name={item.icon} />
                {item.label}
                {item.id === 'home' && counts.today > 0 ? (
                  <span className="n-badge">{counts.today}</span>
                ) : null}
              </button>
            ))}
            <div className="side-foot">
              Onboarding · 每日成长工作台
              <br />
              {base.sync === 'live' ? '内容后台：明道云 HAP' : '当前为本地演示数据'}
            </div>
          </nav>

          <main>
            <HomeView
              active={view === 'home'}
              tracks={base.tracks}
              role={role}
              counts={counts}
              filter={filter}
              onFilter={setFilter}
              activeTrack={activeTrack}
              onTrack={setActiveTrack}
              allTasks={allTasks}
              isDone={isDone}
              onToggleTask={toggleTask}
              onOpenTask={id => setModal({ type: 'task', taskId: id })}
              onOpenAdd={() => setModal({ type: 'add' })}
              onSwitchView={setView}
              onSwitchRole={() => setModal({ type: 'role' })}
              notify={notify}
              isDark={isDark}
            />
            <PeopleView
              active={view === 'people'}
              members={base.members}
              onSwitchView={setView}
              onOpenMessage={who => setModal({ type: 'msg', who })}
              onOpenWidget={id => setModal({ type: 'widget', id })}
            />
            <ToolsView
              active={view === 'tools'}
              learned={learned}
              workTools={base.workTools}
              tutorials={base.tutorials}
              onSwitchView={setView}
              onToggleMastered={toggleMastered}
              onOpenWidget={id => setModal({ type: 'widget', id })}
              isDark={isDark}
            />

            <ModulesView
              active={view === 'modules'}
              modules={modules}
              onAnswer={handleModuleAnswer}
              onRemove={handleModuleRemove}
              onSwitchView={setView}
              onOpenCreate={() => setFabOpen(true)}
            />

            <TasksBoardView
              active={view === 'tasks'}
              boardTasks={base.boardTasks}
              overrides={statusOverrides}
              onStatusChange={handleBoardStatus}
              notify={notify}
              onSwitchView={setView}
            />

            <ProgressView
              active={view === 'progress'}
              role={role}
              tracks={base.tracks}
              boardTasks={base.boardTasks}
              overrides={statusOverrides}
              doneIds={doneIds}
              learned={learned}
              myTasks={myTasks}
              onSwitchView={setView}
            />

            <SettingsView
              active={view === 'settings'}
              role={role}
              roles={base.roles}
              onChooseRole={chooseRole}
              prefs={prefs}
              onTogglePref={togglePref}
              sync={base.sync}
              xp={xp}
              level={level}
              onSwitchView={setView}
            />

            <WorkbenchModals
              modal={modal}
              allTasks={allTasks}
              isDone={isDone}
              onToggleTask={toggleTask}
              onClose={() => setModal(null)}
              onSubmitTask={submitTask}
              onSendMsg={sendMsg}
              onChooseRole={chooseRole}
              currentRoleId={roleId}
              notify={notify}
            />

            {toast ? <div className="toast">{toast}</div> : null}

            <ModuleFab
              open={fabOpen}
              onOpen={() => setFabOpen(true)}
              onClose={() => setFabOpen(false)}
              onCreated={handleModuleCreated}
              onTaskCreated={handleTaskCreated}
              existingTitles={base.boardTasks.map(t => t.title)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
