import { useState, type FormEvent } from 'react';

import Mi from '@/components/workbench/Mi';
import { ITaskView, IMyTask, ModalState } from '@/data/onboarding';
import { gameById } from '@/data/games';
import { useBaseData } from '@/lib/base-data';
import WidgetBody from './WidgetBody';

interface WorkbenchModalsProps {
  modal: ModalState;
  allTasks: ITaskView[];
  isDone: (id: string) => boolean;
  onToggleTask: (id: string) => void;
  onClose: () => void;
  onSubmitTask: (title: string, track: string, when: string) => void;
  onSendMsg: (text: string) => boolean;
  onChooseRole: (id: string) => void;
  currentRoleId: string;
  notify: (msg: string) => void;
}

/* ===== 任务详情 ===== */
function TaskModal({ task, done, onToggle, onClose }: { task: ITaskView; done: boolean; onToggle: () => void; onClose: () => void }) {
  const { tracks } = useBaseData();
  return (
    <div className="mask on">
      <div className="modal">
        <button className="mclose" onClick={onClose} aria-label="关闭">
          <Mi name="close" />
        </button>
        <div className="m-kicker">{tracks.find(t => t.id === task.tr)?.name ?? '成长任务'}</div>
        <h2>{task.t}</h2>
        <p className="m-desc">
          {task.d}
          {task.by ? `（${task.by}）` : ''}
        </p>
        <div className="m-actions">
          <button className="cancel" onClick={onClose}>
            稍后处理
          </button>
          <button className="ok" onClick={() => { onToggle(); onClose(); }}>
            {done ? '恢复为待办' : '标记完成'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== 添加我的待办 ===== */
function AddModal({ onSubmit, onClose, notify }: { onSubmit: (t: string, tr: string, w: string) => void; onClose: () => void; notify: (msg: string) => void }) {
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('t1');
  const [when, setWhen] = useState('today');
  const { tracks } = useBaseData();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      notify('先写下要做的事');
      return;
    }
    onSubmit(t, track, when);
  };

  return (
    <div className="mask on">
      <div className="modal">
        <button className="mclose" onClick={onClose} aria-label="关闭">
          <Mi name="close" />
        </button>
        <div className="m-kicker">My task</div>
        <h2>添加我的待办</h2>
        <p className="m-desc">记录你自己的任务事项，会进入今日清单并参与进度统计，保存在本机浏览器中。</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>任务内容</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：整理第一次需求评审的会议纪要" />
          </div>
          <div className="field">
            <label>所属成长线</label>
            <select value={track} onChange={e => setTrack(e.target.value)}>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>时间</label>
            <select value={when} onChange={e => setWhen(e.target.value)}>
              <option value="today">今天</option>
              <option value="todo">本周稍后</option>
            </select>
          </div>
          <div className="m-actions">
            <button type="button" className="cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="ok">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== 发消息 ===== */
function MsgModal({ who, onSend, onClose }: { who: string; onSend: (text: string) => boolean; onClose: () => void }) {
  const [text, setText] = useState('');

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (onSend(text)) {
      setText('');
    }
  };

  return (
    <div className="mask on">
      <div className="modal">
        <button className="mclose" onClick={onClose} aria-label="关闭">
          <Mi name="close" />
        </button>
        <div className="m-kicker">新消息</div>
        <h2>发给 {who}</h2>
        <form onSubmit={handleSend}>
          <div className="field">
            <textarea style={{ height: 110 }} value={text} onChange={e => setText(e.target.value)} placeholder="按 BGTA 写下：背景、目标、已尝试、具体请求…" />
          </div>
          <div className="m-actions">
            <button type="button" className="cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="ok">
              发送消息
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== 切换身份 ===== */
function RoleModal({ onChoose, onClose }: { onChoose: (id: string) => void; onClose: () => void }) {
  const { roles } = useBaseData();
  return (
    <div className="mask on">
      <div className="modal">
        <button className="mclose" onClick={onClose} aria-label="关闭">
          <Mi name="close" />
        </button>
        <div className="m-kicker">切换视角（演示）</div>
        <h2>选择员工身份</h2>
        <p className="m-desc">工作台会按「我」的资料渲染；真实环境中由登录身份自动确定。</p>
        <div style={{ marginTop: 12 }}>
          {roles.map(r => (
            <button key={r.id} className="opt" onClick={() => onChoose(r.id)}>
              <b>{r.name}</b> · {r.team} · {r.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== 小工具容器 ===== */
function WidgetModal({ id, onClose }: { id: string; onClose: () => void }) {
  // 注册表游戏用加宽弹窗（棋盘/画布需要空间），原有小工具维持 470px
  const isGame = gameById(id) != null;
  return (
    <div className="mask on">
      <div className={'modal' + (isGame ? ' game-modal' : '')}>
        <button className="mclose" onClick={onClose} aria-label="关闭">
          <Mi name="close" />
        </button>
        <WidgetBody id={id} />
      </div>
    </div>
  );
}

export default function WorkbenchModals({
  modal,
  allTasks,
  isDone,
  onToggleTask,
  onClose,
  onSubmitTask,
  onSendMsg,
  onChooseRole,
  currentRoleId,
  notify,
}: WorkbenchModalsProps) {
  if (!modal) return null;

  switch (modal.type) {
    case 'task': {
      const task = allTasks.find(t => t.id === modal.taskId);
      if (!task) return null;
      return (
        <TaskModal
          task={task}
          done={isDone(task.id)}
          onToggle={() => onToggleTask(task.id)}
          onClose={onClose}
        />
      );
    }
    case 'add':
      return <AddModal onSubmit={onSubmitTask} onClose={onClose} notify={notify} />;
    case 'msg':
      return <MsgModal who={modal.who} onSend={onSendMsg} onClose={onClose} />;
    case 'role':
      return <RoleModal onChoose={onChooseRole} onClose={onClose} />;
    case 'widget':
      return <WidgetModal key={modal.id} id={modal.id} onClose={onClose} />;
    default:
      return null;
  }
}

export type { IMyTask };
