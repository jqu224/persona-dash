// EXPORTS: IconName, ICON_PATHS, IDopColor, DOP, DOP_DARK, dopOf, IPeopleRole, ROLES, IPhase, PHASES, ITrack, TRACKS, trackById, ISeedTask, SEED_TASKS, ITaskView, IMyTask, IQaRow, QA_ROWS, IGuide, GUIDES, ILink, LINKS, IWidget, WIDGETS, IQuizItem, QUIZ, FACTS, TOPICS, REFRESH, WORDS, TaskFilter, ViewName, ModalState

/* Google Material Icons 官方 path（内联 SVG，零网络依赖），复刻自原始文件 */
export type IconName =
  | 'groups' | 'widgets' | 'trending' | 'folder' | 'forum' | 'air' | 'touch'
  | 'psychology' | 'target' | 'chatbubble' | 'casino' | 'bolt' | 'snow' | 'abc'
  | 'map' | 'chat' | 'code' | 'book' | 'brush' | 'home' | 'palette' | 'ticket'
  | 'barchart' | 'send' | 'check' | 'chevron' | 'expandmore' | 'expandless'
  | 'hand' | 'schedule' | 'checkcircle' | 'light_mode' | 'dark_mode' | 'close';

export const ICON_PATHS: Record<string, string> = {
  groups: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  widgets: 'M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm10 0v8h8V3h-8z',
  trending: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  folder: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  forum: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z',
  air: 'M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H2v-2h9.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 8 15.5 8H2v2h13.5c1.93 0 3.5-1.57 3.5-3.5zm-.5 4.5H2v2h16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5v2c1.93 0 3.5-1.57 3.5-3.5S20.43 11 18.5 11z',
  touch: 'M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z',
  psychology: 'M15.5 10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S14 8.17 14 9s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7.5 8.5 7.5 7 8.17 7 9s.67 1.5 1.5 1.5zm3.5-9C8.68 1.5 5 5.18 5 9.5c0 2.35 1.05 4.28 2.5 5.5V21c0 .55.45 1 1 1h2v-4h1v4h2c.55 0 1-.45 1-1v-5.59c1.7-.88 3-2.79 3-4.91 0-4.32-3.68-8-7.5-8z',
  target: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  chatbubble: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
  casino: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18C6.12 18 5 16.88 5 15.5S6.12 13 7.5 13 10 14.12 10 15.5 8.88 18 7.5 18zm0-6C6.12 12 5 10.88 5 9.5S6.12 7 7.5 7 10 8.12 10 9.5 8.88 12 7.5 12zm4.5 3c-.83 0-1.5-.67-1.5-1.5S11.17 12 12 12s1.5.67 1.5 1.5S12.83 15 12 15zm0-6c-.83 0-1.5-.67-1.5-1.5S11.17 6 12 6s1.5.67 1.5 1.5S12.83 9 12 9zm4.5 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
  bolt: 'M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.4 0 .56.33.47.51C12.97 17.55 12 21 12 21h-1z',
  snow: 'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22v-2z',
  abc: 'M21 11h-1.5v-.5h-2v3h2V13H21v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zM7.5 8H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.5c.83 0 1.5-.67 1.5-1.5v-3C9 8.67 8.33 8 7.5 8zm0 4.5H6v-3h1.5v3zm8-4.5h-2.75c-.41 0-.75.34-.75.75v4.5c0 .41.34.75.75.75H15.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5zm0 4.5H14v-3h1.5v3zM3 5v14h18V5H3z',
  map: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z',
  chat: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z',
  code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4 1.4z',
  book: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
  brush: 'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  palette: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm5.5 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3-4C13.67 9 13 8.33 13 7.5S13.67 6 14.5 6 16 6.67 16 7.5 15.33 9 14.5 9zm-5 0C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm-3 4c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13z',
  ticket: 'M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.89-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z',
  barchart: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  chevron: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  expandmore: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  expandless: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
  hand: 'M13 12c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1zm-8 0c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1zm4 0c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1zm11-1c-.55 0-1 .45-1 1v4c0 2.76-2.24 5-5 5h-2.26c-1.69 0-3.31-.84-4.29-2.23l-2.85-4.04c-.26-.37-.21-.87.12-1.19.36-.34.93-.31 1.26.06L9 15.3V4.5C9 3.67 9.67 3 10.5 3S12 3.67 12 4.5V11h.5c.28 0 .5.22.5.5V9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v2.5c.28 0 .5.22.5.5V11c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v2.5c.28 0 .5.22.5.5V12c0-.55.45-1 1-1z',
  schedule: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  checkcircle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  light_mode: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z',
  dark_mode: 'M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.87 0-7-3.13-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
};

/* 多巴胺色板（每张卡一对主色/浅底） */
export interface IDopColor {
  fg: string;
  bg: string;
}

export const DOP: Record<string, IDopColor> = {
  green: { fg: '#16a34a', bg: '#dcfce7' },
  blue: { fg: '#0e7490', bg: '#cffafe' },
  yellow: { fg: '#b45309', bg: '#fef3c2' },
  orange: { fg: '#ea580c', bg: '#ffedd5' },
  pink: { fg: '#db2777', bg: '#fce7f3' },
  cyan: { fg: '#0e7490', bg: '#cffafe' },
  lime: { fg: '#4d7c0f', bg: '#ecfccb' },
  red: { fg: '#dc2626', bg: '#fee2e2' },
  teal: { fg: '#0f766e', bg: '#ccfbf1' },
  amber: { fg: '#d97706', bg: '#fef3c7' },
};

/* 深色主题用的霓虹变体（高亮荧光色 + 半透明深底） */
export const DOP_DARK: Record<string, IDopColor> = {
  green: { fg: '#6ee7a0', bg: 'rgba(34,197,94,.16)' },
  blue: { fg: '#4dd4e8', bg: 'rgba(6,190,215,.18)' },
  yellow: { fg: '#ffd166', bg: 'rgba(255,210,31,.14)' },
  orange: { fg: '#ff9a5c', bg: 'rgba(255,138,40,.16)' },
  pink: { fg: '#ff7ab6', bg: 'rgba(255,88,150,.16)' },
  cyan: { fg: '#4dd4e8', bg: 'rgba(6,190,215,.14)' },
  lime: { fg: '#b6e34d', bg: 'rgba(152,225,40,.14)' },
  red: { fg: '#ff7a7c', bg: 'rgba(255,86,88,.16)' },
  teal: { fg: '#5ee0c4', bg: 'rgba(20,162,152,.16)' },
  amber: { fg: '#ffc766', bg: 'rgba(255,210,31,.14)' },
};

export function dopOf(key: string, isDark: boolean): IDopColor {
  return (isDark ? DOP_DARK : DOP)[key] ?? DOP.green;
}

/* ===== 员工身份（演示） ===== */
export interface IPeopleRole {
  id: string;
  name: string;
  team: string;
  role: string;
  day: number;
  hi: string;
  avatar: string;
}

export const ROLES: IPeopleRole[] = [
  { id: 'zhang', name: '张小明', team: '产品部', role: '产品经理 · P6', day: 3, hi: '早上好，张小明', avatar: '张' },
  { id: 'li', name: '李一诺', team: '研发部', role: '前端工程师 · P5', day: 8, hi: '早上好，李一诺', avatar: '李' },
  { id: 'wang', name: '王雨桐', team: '设计部', role: '交互设计师 · P6', day: 15, hi: '早上好，王雨桐', avatar: '王' },
  { id: 'chen', name: '陈小满', team: '运营部', role: '用户运营 · P5', day: 22, hi: '早上好，陈小满', avatar: '陈' },
];

/* ===== Onboarding 五站旅程 ===== */
export interface IPhase {
  n: string;
  p: number;
  d: string;
}

export const PHASES: IPhase[] = [
  { n: '破冰', p: 30, d: '认识工友与团队' },
  { n: '工具', p: 60, d: '装好软件跑通流程' },
  { n: '提问', p: 85, d: '知道去哪问怎么问' },
  { n: '规划', p: 0, d: '30-60-90 天计划' },
  { n: '压力', p: 15, d: '状态管理与放松' },
];

/* ===== 四条成长线 ===== */
export interface ITrack {
  id: string;
  name: string;
  icon: string;
  ckey: string;
  ds: string;
  t: string;
  done: number;
  total: number;
}

export const TRACKS: ITrack[] = [
  { id: 't1', name: '熟悉工友', icon: 'groups', ckey: 'green', ds: '认识导师、Leader、协作方，约 1 对 1 破冰。', t: '11 项 · 已做 4', done: 4, total: 11 },
  { id: 't2', name: '熟悉工具', icon: 'widgets', ckey: 'blue', ds: '装好 P0/P1 软件，跑通构建与提交流程。', t: '9 项 · 已做 3', done: 3, total: 9 },
  { id: 't3', name: '熟悉业务', icon: 'trending', ckey: 'orange', ds: '读懂团队目标、指标口径与产品脉络。', t: '8 项 · 已做 1', done: 1, total: 8 },
  { id: 't4', name: '熟悉项目', icon: 'folder', ckey: 'pink', ds: '跑通需求到上线的完整链路。', t: '10 项 · 已做 2', done: 2, total: 10 },
];

export function trackById(id: string): ITrack {
  return TRACKS.find(t => t.id === id) ?? TRACKS[0];
}

/* ===== 种子任务 ===== */
export interface ISeedTask {
  id: string;
  t: string;
  tr: string;
  w: string;
  d: string;
  by: string;
}

export const SEED_TASKS: ISeedTask[] = [
  { id: 's1', t: '完成安全培训与账号开通', tr: 't2', w: 'today', d: '跟着《入职日程》Day 0 完成，领完电脑后 30 分钟可搞定。', by: '成长系统 Base · 入职日程' },
  { id: 's2', t: '安装飞书、代码平台、VPN', tr: 't2', w: 'today', d: 'P0 软件清单前三项，安装遇到权限问题走 IT 工单。', by: '成长系统 Base · 软件清单' },
  { id: 's3', t: '约导师 1 对 1，聊本周任务', tr: 't1', w: 'today', d: '带上「我想知道团队在做什么 + 我第一周做什么」。', by: 'HR Base · 待办明细' },
  { id: 's4', t: '跑通本地构建与单元测试', tr: 't2', w: 'todo', d: '按团队 wiki 的前端项目规范执行，卡住先查 README。', by: '成长系统 Base · 软件清单' },
  { id: 's5', t: '认识产品、设计、数据三方接口人', tr: 't1', w: 'todo', d: '约 15 分钟认识你的上下游，记住谁管什么。', by: '成长系统 Base · 提问路径' },
  { id: 's6', t: '读懂团队 OKR 与指标口径', tr: 't3', w: 'todo', d: '先对齐「指标怎么算」，再讨论数字才有意义。', by: '成长系统 Base · 术语表' },
  { id: 's7', t: '走完第一个真实 case 的提交流程', tr: 't4', w: 'todo', d: '修 bug 或写小功能，完成第一个 MR/PR。', by: '成长系统 Base · 入职日程' },
];

/* ===== 任务视图模型（种子 + 我的待办合并） ===== */
export interface ITaskView {
  id: string;
  t: string;
  tr: string;
  w: string;
  d: string;
  by: string;
  self: boolean;
}

export interface IMyTask extends ITaskView {
  done: boolean;
}

/* ===== 提问路径 ===== */
export interface IQaRow {
  t: string;
  e: string;
  w: string;
  r: string;
}

export const QA_ROWS: IQaRow[] = [
  { t: '工具使用', e: '飞书怎么建日程、文档权限怎么设', w: '先问 AI 伙伴 → 查文档中心 → 再问同事', r: '即时' },
  { t: '账号 / 权限 / 网络', e: '邮箱登不上、Wi-Fi 连不上、没权限', w: 'IT 工单系统（工单：it.example.com）', r: '1 个工作日' },
  { t: '业务 / 流程', e: '报销怎么走、审批怎么发起', w: '直属 Leader 或业务文档（知识库）', r: '当日' },
  { t: '技术问题', e: '代码报错、接口不通、组件用法', w: '技术群 @ 模块 owner → 代码库 / 文档', r: '1–4 小时' },
  { t: '制度 / 福利', e: '年假、社保、差旅标准', w: 'HR 伙伴或制度文档（福利站）', r: '1 个工作日' },
  { t: '产品 / 需求', e: '需求冲突、优先级不明', w: '产品负责人，带上证据和影响面', r: '当日' },
];

/* ===== 软件指南 ===== */
export interface IGuide {
  name: string;
  icon: string;
  ckey: string;
  steps: string[];
}

export const GUIDES: IGuide[] = [
  { name: '飞书与协作', icon: 'chat', ckey: 'green', steps: ['用企业邮箱登录，加入部门群', '把常用文档与知识库加入收藏', '把「提问路径表」存进书签'] },
  { name: '代码与构建', icon: 'code', ckey: 'blue', steps: ['装 Git + 公司代码平台客户端', 'clone 团队仓库，跑通一次本地构建', '完成第一个 MR/PR 提交流程'] },
  { name: '设计稿与组件', icon: 'brush', ckey: 'pink', steps: ['装 Figma 桌面版并加入团队库', '看设计系统与组件库文档', '按规范标注、取值、切图'] },
  { name: '数据与看板', icon: 'barchart', ckey: 'teal', steps: ['收藏数据看板与监控页', '学会看指标口径说明', '上线前熟悉发布与回滚只读操作'] },
];

/* ===== 常用网址 ===== */
export interface ILink {
  n: string;
  u: string;
  d: string;
  ckey: string;
}

export const LINKS: ILink[] = [
  { n: '内网主页', u: 'home.example.com', d: '所有内部系统入口', ckey: 'green' },
  { n: '知识库 Wiki', u: 'wiki.example.com', d: '团队文档与制度', ckey: 'blue' },
  { n: '代码平台', u: 'code.example.com', d: '仓库 / MR / CI', ckey: 'orange' },
  { n: '工单系统', u: 'it.example.com', d: '账号 / 权限 / 设备', ckey: 'red' },
  { n: '设计系统', u: 'design.example.com', d: '色彩字体组件规范', ckey: 'pink' },
  { n: '组件库文档', u: 'ui.example.com/components', d: 'props 示例与版本', ckey: 'cyan' },
  { n: 'API 文档中心', u: 'api.example.com', d: '接口定义与鉴权', ckey: 'teal' },
  { n: '数据看板', u: 'data.example.com', d: '业务指标与报表', ckey: 'lime' },
  { n: '发布平台', u: 'release.example.com', d: '发布 / 灰度 / 回滚', ckey: 'amber' },
  { n: '福利站', u: 'benefits.example.com', d: '福利制度咨询入口', ckey: 'green' },
];

/* ===== 每日小站 ===== */
export interface IWidget {
  id: string;
  name: string;
  d: string;
  icon: string;
  ckey: string;
}

export const WIDGETS: IWidget[] = [
  { id: 'quiz', name: '答题闯关', d: '5 题快速测验，检验你对工具与团队的了解', icon: 'psychology', ckey: 'blue' },
  { id: 'break', name: '破冰话题', d: '随机一个话题，认识工友也能用', icon: 'casino', ckey: 'orange' },
  { id: 'bgta', name: 'BGTA 提问生成', d: '把问题组织成四段式，一次问清楚', icon: 'forum', ckey: 'green' },
  { id: 'breathe', name: '方块呼吸', d: '4-4-4-4 呼吸引导，60 秒平静下来', icon: 'air', ckey: 'cyan' },
  { id: '478', name: '4-7-8 助眠呼吸', d: '吸 4 秒 · 屏 7 秒 · 呼 8 秒', icon: 'snow', ckey: 'teal' },
  { id: 'muscle', name: '握拳放松', d: '绷紧 5 秒松开 10 秒，自动倒计时', icon: 'hand', ckey: 'amber' },
  { id: 'five', name: '54321 着陆', d: '用五种感官把注意力拉回当下', icon: 'touch', ckey: 'pink' },
  { id: 'mindful', name: '正念数息', d: '观呼吸数到 8，走神就轻轻拉回', icon: 'target', ckey: 'turquoise' },
  { id: 'scan', name: '身体扫描', d: '从脚到脸，一个部位一个部位松下来', icon: 'home', ckey: 'green' },
  { id: 'hangman', name: '猜单词', d: 'CET 英文词库，26 键字母键盘', icon: 'abc', ckey: 'lime' },
  { id: 'energy', name: '提神站', d: '100 张 emoji 像素画，换一张醒一醒', icon: 'bolt', ckey: 'orange' },
  { id: 'fact', name: '冷知识', d: '抽一条冷知识，涨点奇怪的知识', icon: 'book', ckey: 'blue' },
];

/* ===== 答题闯关题库 ===== */
export interface IQuizItem {
  q: string;
  opts: string[];
  a: number;
  why: string;
}

export const QUIZ: IQuizItem[] = [
  { q: '网络连不上，第一时间应该去哪里问？', opts: ['随便找个同事问', 'IT 工单系统，附设备型号和错误截图', '发到部门大群', '等第二天再说'], a: 1, why: '账号、权限、网络类问题统一走 IT 工单，1 个工作日响应。' },
  { q: '想确认需求优先级，应该找谁、带什么？', opts: ['产品负责人，带上证据和影响面', '直接问技术群', '找 HR 伙伴', '自己拍板'], a: 0, why: '产品与需求类问题找产品负责人，一次给足背景。' },
  { q: '「BGTA」中的 T 指什么？', opts: ['Topic 话题', 'Team 团队', 'Tried 已尝试', 'Time 时间'], a: 2, why: 'B 背景、G 目标、T 已尝试、A 请求，四段式提问。' },
  { q: '代码仓库和提交流程在哪个平台看？', opts: ['home.example.com', 'code.example.com', 'benefits.example.com', 'data.example.com'], a: 1, why: '代码平台统一管理仓库、MR/PR 与 CI。' },
  { q: '入职 Day 1 的完成标准是什么？', opts: ['把软件全装完', '能说清团队在做什么、自己第一周做什么', '做完一个需求', '写完年度规划'], a: 1, why: 'Day 1 加部门群、见 Leader、读 wiki，能说清目标即可。' },
];

/* ===== BGTA 示例素材 / 破冰话题 / 提神建议 / 猜词词库 ===== */
export const FACTS: string[] = [
  '产品部本周在冲刺 9 月的「新人工具链」专项，技术群里 @ 王芳可以快速拿到组件库更新说明。',
  '前端项目规范在 wiki.example.com/frontend-guide，提交前先看一遍，避免 MR 被打回。',
  '报销标准里有一条：300 元以下无需附发票，直接走 expense 快速通道。',
];

export const TOPICS: string[] = [
  '如果你是产品经理，怎么给新人设计入职第一天？',
  '分享一个你入职时踩过的坑，和当时的解法。',
  '你最近在学什么新东西？为什么想学它？',
  '如果要把团队 wiki 变成一门课，你会先讲哪一章？',
];

export const REFRESH: string[] = [
  '站起来，走到窗边看 20 秒远处，眼睛会舒服很多。',
  '喝半杯水，顺便活动一下手腕和肩膀。',
  '把今天的任务重排一下：先做最不确定的那件。',
  '深呼吸三次：吸气 4 秒，呼气 6 秒。',
];

export const WORDS: string[] = ['BGTA', 'MR', '灰度', '复盘', 'OKR', '冒烟', '排期', '对齐', '水位', 'Oncall'];

/* ===== UI 状态类型 ===== */
export type TaskFilter = 'today' | 'todo' | 'done';
export type ViewName = 'home' | 'people' | 'tools' | 'games' | 'tasks' | 'modules' | 'progress' | 'settings';
export type ModalState =
  | { type: 'task'; taskId: string }
  | { type: 'add' }
  | { type: 'msg'; who: string }
  | { type: 'role' }
  | { type: 'widget'; id: string }
  | null;
