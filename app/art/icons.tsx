import type { CSSProperties, FC } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

export const ScoreIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M12 3l2.4 5.1 5.6.7-4.1 3.9 1 5.6L12 15.7 6.9 18.3l1-5.6-4.1-3.9 5.6-.7L12 3Z" fill="none" stroke="#ffd400" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const ComboIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#ff4fa3" />
  </svg>
);

export const TimerIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="13" r="8" fill="none" stroke="#3ecbc9" strokeWidth="1.8" />
    <path d="M12 9v4l3 2" stroke="#3ecbc9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 2h5" stroke="#3ecbc9" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const TargetIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="#ffd400" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="4.5" fill="none" stroke="#ffd400" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="1.4" fill="#ffd400" />
  </svg>
);

export const TrophyIcon: FC<P> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="none" stroke="#ffd400" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" fill="none" stroke="#ffd400" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 15h4v3h-4z" fill="none" stroke="#ffd400" strokeWidth="1.8" /><path d="M8 21h8" stroke="#ffd400" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const XIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M3 3l7.6 9.9L3.4 21h2.3l5.8-6.7L16.6 21H21l-8-10.4L20.4 3h-2.3l-5.4 6.2L7.7 3H3Z" fill="currentColor" />
  </svg>
);
