import { useEffect, useRef, useState } from 'react';

import Mi from '@/components/workbench/Mi';
import { IUserModule, generateModule } from '@/lib/learn-modules';
import {
  ISubtask,
  SUB_HINTS,
  TASK_CATEGORIES,
  buildTaskDescription,
  createBitableTask,
  nextTaskNumber,
  splitTask,
  streamImageDescription,
  taskDisplayTitle,
} from '@/lib/task-create';
import { Image } from '@/components/ui/image';

const MODULE_PRESETS = [
  { label: '背单词', text: '做一个英语四级高频词背单词模块，按艾宾浩斯遗忘曲线安排复习' },
  { label: '知识测试', text: '做一个入职知识测试模块，题目在第 1 天、24 小时、48 小时、1 周、1 个月滚动复测' },
];

type Tab = 'task' | 'module';

interface ModuleFabProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreated: (m: IUserModule, byAI: boolean) => void;
  /** 任务创建成功回调（任务已写入飞书多维表格） */
  onTaskCreated: (title: string, category: string) => void;
  /** 现有任务标题列表（用于分类自动编号） */
  existingTitles: string[];
}

export default function ModuleFab({ open, onOpen, onClose, onCreated, onTaskCreated, existingTitles }: ModuleFabProps) {
  const [tab, setTab] = useState<Tab>('task');

  /* ===== 任务表单（三步：名称 → 分类 → 描述） ===== */
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(TASK_CATEGORIES[0]);
  const [customCat, setCustomCat] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imgBusy, setImgBusy] = useState(false);
  const [splitBusy, setSplitBusy] = useState(false);
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ===== 学习模块表单 ===== */
  const [modText, setModText] = useState('');
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // 关闭时整体复位
      setStep(1);
      setName('');
      setCategory(TASK_CATEGORIES[0]);
      setCustomCat('');
      setSubcategory('');
      setDesc('');
      setImages([]);
      setSubtasks([]);
      setError(null);
      setModText('');
      setModError(null);
    }
  }, [open]);

  const finalCategory = (category === '自定义' ? customCat.trim() : category).trim() || '全站';
  const taskNum = nextTaskNumber(existingTitles, finalCategory);
  const previewTitle = taskDisplayTitle(finalCategory, taskNum, name.trim() || '任务名');

  const toStep2 = () => {
    if (!name.trim()) {
      setError('先给任务起个名字');
      return;
    }
    setError(null);
    setStep(2);
  };

  const toStep3 = () => {
    if (category === '自定义' && !customCat.trim()) {
      setError('填写自定义分类名');
      return;
    }
    setError(null);
    setStep(3);
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...list].slice(0, 3));
  };

  const genDescFromImages = async () => {
    if (images.length === 0 || imgBusy) return;
    setImgBusy(true);
    setError(null);
    try {
      await streamImageDescription(
        images,
        `任务名：${name}；分类：${finalCategory}${subcategory ? ` / ${subcategory}` : ''}。请围绕该任务解读参考图并生成描述。`,
        full => setDesc(full),
      );
    } catch {
      setError('读图生成失败，请重试或手动填写描述');
    } finally {
      setImgBusy(false);
    }
  };

  const autoSplit = async () => {
    if (splitBusy) return;
    setSplitBusy(true);
    setError(null);
    try {
      const list = await splitTask({
        name: name.trim(),
        category: finalCategory,
        subcategory: subcategory.trim(),
        description: desc.trim(),
      });
      if (list.length === 0) {
        setError('AI 没有拆出子任务，先补充一点描述试试');
      } else {
        setSubtasks(list);
      }
    } catch {
      setError('自动拆分失败，请重试');
    } finally {
      setSplitBusy(false);
    }
  };

  const submitTask = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const title = taskDisplayTitle(finalCategory, taskNum, name.trim());
    const descText = buildTaskDescription(desc, subtasks, finalCategory, subcategory.trim());
    const ok = await createBitableTask({ title, desc: descText, category: finalCategory });
    setSubmitting(false);
    if (!ok) {
      setError('写入飞书多维表格失败，请重试');
      return;
    }
    onTaskCreated(title, finalCategory);
    onClose();
  };

  const submitModule = async () => {
    const req = modText.trim();
    if (!req) {
      setModError('先写一句话，比如“做一个日语 N3 背单词模块”');
      return;
    }
    setModLoading(true);
    setModError(null);
    try {
      const { module, byAI } = await generateModule(req);
      onCreated(module, byAI);
      onClose();
    } catch (e) {
      setModError(e instanceof Error ? e.message : '生成失败，请重试');
    } finally {
      setModLoading(false);
    }
  };

  return (
    <>
      {!open ? (
        <button className="mod-fab" onClick={onOpen} title="快速创建：任务 / 学习模块" aria-label="快速创建">
          <Mi name="close" />
        </button>
      ) : null}

      {open ? (
        <div className="fab-mask" onClick={onClose}>
          <div className="fab-dialog" onClick={e => e.stopPropagation()}>
            <div className="fab-head">
              <div>
                <div className="m-kicker">Quick Create</div>
                <h2 style={{ marginTop: 4 }}>快速创建</h2>
              </div>
              <button className="mclose" onClick={onClose} aria-label="关闭">
                <Mi name="close" />
              </button>
            </div>

            <div className="fab-tabs">
              <button className={'fab-tab' + (tab === 'task' ? ' on' : '')} onClick={() => setTab('task')}>
                轻量任务 · 写入飞书表格
              </button>
              <button className={'fab-tab' + (tab === 'module' ? ' on' : '')} onClick={() => setTab('module')}>
                学习模块
              </button>
            </div>

            {tab === 'task' ? (
              <div className="fab-body">
                <div className="fab-steps">
                  {[1, 2, 3].map(s => (
                    <span key={s} className={'fstep' + (step >= s ? ' on' : '')}>
                      {['任务名', '分类', '描述'][s - 1]}
                    </span>
                  ))}
                </div>

                {step === 1 ? (
                  <>
                    <label className="flabel">任务叫什么？</label>
                    <input
                      className="fab-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="例：搭建运营数据看板"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && toStep2()}
                    />
                    {error ? <p className="fab-error">{error}</p> : null}
                    <div className="fab-actions">
                      <span className="muted" style={{ fontSize: 12 }}>轻量版任务，记录在飞书多维表格</span>
                      <button className="fab-submit" onClick={toStep2}>下一步</button>
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <label className="flabel">属于哪个分类？</label>
                    <div className="fab-chips">
                      {TASK_CATEGORIES.map(c => (
                        <button
                          key={c}
                          className={'fab-chip' + (category === c ? ' on' : '')}
                          onClick={() => setCategory(c)}
                          type="button"
                        >
                          {c}
                        </button>
                      ))}
                      <button
                        className={'fab-chip' + (category === '自定义' ? ' on' : '')}
                        onClick={() => setCategory('自定义')}
                        type="button"
                      >
                        自定义…
                      </button>
                    </div>
                    {category === '自定义' ? (
                      <input
                        className="fab-input"
                        value={customCat}
                        onChange={e => setCustomCat(e.target.value)}
                        placeholder="输入自定义分类名（例：市场）"
                      />
                    ) : null}

                    <label className="flabel" style={{ marginTop: 12 }}>子分类（Background · 选填）</label>
                    <input
                      className="fab-input"
                      value={subcategory}
                      onChange={e => setSubcategory(e.target.value)}
                      placeholder={(SUB_HINTS[finalCategory] ?? ['通用'])[0]}
                    />
                    {(SUB_HINTS[finalCategory] ?? []).length > 0 ? (
                      <div className="fab-chips" style={{ marginTop: 8 }}>
                        {(SUB_HINTS[finalCategory] ?? []).map(h => (
                          <button key={h} className="fab-chip" type="button" onClick={() => setSubcategory(h)}>
                            {h}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <p className="fab-num">将创建为：<b>{previewTitle}</b></p>
                    {error ? <p className="fab-error">{error}</p> : null}
                    <div className="fab-actions">
                      <button className="fab-ghost" onClick={() => setStep(1)}>上一步</button>
                      <button className="fab-submit" onClick={toStep3}>下一步</button>
                    </div>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <label className="flabel">
                      补充描述 · <em>{previewTitle}</em>
                    </label>
                    <textarea
                      className="fab-input"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="这个任务要做什么、交付什么？（也可以上传参考图让 AI 写）"
                      rows={5}
                    />

                    <div className="fab-upload-row">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => {
                          addImages(e.target.files);
                          e.target.value = '';
                        }}
                      />
                      <button className="fab-ghost" onClick={() => fileRef.current?.click()} disabled={imgBusy}>
                        <Mi name="folder" /> 参考图（最多 3 张）
                      </button>
                      {images.length > 0 ? (
                        <button className="fab-img-gen" onClick={genDescFromImages} disabled={imgBusy}>
                          {imgBusy ? 'AI 读图中…' : 'AI 读图生成描述'}
                        </button>
                      ) : null}
                    </div>
                    {images.length > 0 ? (
                      <div className="fab-thumbs">
                        {images.map((f, i) => (
                          <span className="fab-thumb" key={`${f.name}-${i}`}>
                            <Image src={URL.createObjectURL(f)} alt={f.name} />
                            <button
                              className="fab-thumb-x"
                              onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                              aria-label="移除图片"
                            >
                              <Mi name="close" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="fab-upload-row" style={{ marginTop: 12 }}>
                      <button className="fab-img-gen" onClick={autoSplit} disabled={splitBusy}>
                        {splitBusy ? 'AI 拆分中…' : 'AI 自动拆分子任务'}
                      </button>
                      {subtasks.length > 0 ? (
                        <span className="muted" style={{ fontSize: 12 }}>{subtasks.length} 条子任务 · 同一背景收敛在同一条任务里</span>
                      ) : null}
                    </div>
                    {subtasks.length > 0 ? (
                      <ul className="fab-sublist">
                        {subtasks.map((s, i) => (
                          <li key={s.title}>
                            <span>
                              <b>{i + 1}. {s.title}</b>
                              {s.note ? <em>{s.note}</em> : null}
                            </span>
                            <button
                              className="fab-thumb-x"
                              onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))}
                              aria-label="移除子任务"
                            >
                              <Mi name="close" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {error ? <p className="fab-error">{error}</p> : null}
                    <div className="fab-actions">
                      <button className="fab-ghost" onClick={() => setStep(2)} disabled={submitting}>上一步</button>
                      <button className="fab-submit" onClick={submitTask} disabled={submitting}>
                        {submitting ? '写入飞书…' : '创建任务'}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="fab-body">
                <p className="m-desc">
                  描述你想要的模块，AI 自动生成内容并接上复习节奏：背单词走艾宾浩斯遗忘曲线
                  （1/2/4/7/15 天），测试题按第 1 天 · 24h · 48h · 1 周 · 1 个月滚动复测。
                </p>
                <div className="fab-chips">
                  {MODULE_PRESETS.map(p => (
                    <button key={p.label} className="fab-chip" type="button" onClick={() => setModText(p.text)}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="fab-input"
                  value={modText}
                  onChange={e => setModText(e.target.value)}
                  placeholder="例：做一个日语 N3 核心词背单词模块 / 做一个产品入职知识测试模块"
                  rows={3}
                  disabled={modLoading}
                />
                {modError ? <p className="fab-error">{modError}</p> : null}
                <div className="fab-actions">
                  {modLoading ? (
                    <span className="fab-loading">
                      <span className="fab-spin" />
                      AI 正在生成模块…
                    </span>
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>生成后可在「我的模块」里长期复习</span>
                  )}
                  <button className="fab-submit" onClick={submitModule} disabled={modLoading}>
                    {modLoading ? '生成中…' : '生成模块'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
