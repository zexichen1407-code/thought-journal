// Minimal line icons (1.6px stroke, currentColor) — keep the UI icon-consistent.

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export function IconMic({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

export function IconHistory({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3.5 9a9 9 0 1 1-1 5" />
      <path d="M3 4v5h5" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function IconThemes({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 18h6" />
      <path d="M10 21.5h4" />
      <path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.7.6 1 1.2 1 2.4h6c0-1.2.3-1.8 1-2.4A6.5 6.5 0 0 0 12 2.5Z" />
    </svg>
  );
}

export function IconChevron({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
