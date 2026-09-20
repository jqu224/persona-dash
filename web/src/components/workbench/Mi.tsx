import { ICON_PATHS } from '@/data/onboarding';

interface MiProps {
  name: string;
}

/** Material Icons 内联 SVG（零网络依赖），复刻原始 MI() 渲染 */
export default function Mi({ name }: MiProps) {
  return (
    <svg className="mi" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}
