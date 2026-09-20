import Mi from '@/components/workbench/Mi';

interface WorkbenchHeaderProps {
  theme: 'light' | 'dark';
  pageName: string;
  avatar: string;
  onToggleTheme: () => void;
  onBell: () => void;
  onAvatar: () => void;
}

export default function WorkbenchHeader({ theme, pageName, avatar, onToggleTheme, onBell, onAvatar }: WorkbenchHeaderProps) {
  return (
    <header>
      <div className="htitle">
        <span className="script">Onboarding</span>
        <span className="divider" />
        <div>
          <div className="kicker">每日成长工作台</div>
          <div className="hname">{pageName}</div>
        </div>
      </div>
      <div className="hright">
        <button className="hbtn" title="切换明暗" aria-label="切换深色模式" onClick={onToggleTheme}>
          <Mi name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
        </button>
        <button className="hbtn bell" title="通知" aria-label="通知" onClick={onBell}>
          <svg className="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="dot" />
        </button>
        <button className="avatar" title="切换身份" onClick={onAvatar}>
          {avatar}
        </button>
      </div>
    </header>
  );
}
