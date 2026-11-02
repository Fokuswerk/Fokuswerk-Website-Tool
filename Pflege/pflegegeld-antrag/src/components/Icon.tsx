type Props = { size?: number; className?: string };

const g = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.75,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
});

export function Schloss({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function Siegel({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <path d="M12 3.2l7 2.6v5.4c0 4.3-2.9 8.1-7 9.6-4.1-1.5-7-5.3-7-9.6V5.8z" />
      <path d="M9 12.2l2.1 2.1L15.4 10" />
    </svg>
  );
}

export function Paragraf({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <path d="M15 6.2A3.4 3.4 0 0 0 11.6 3C9.6 3 8.3 4.3 8.3 6.1c0 3.6 7.4 4.3 7.4 8.6 0 2.4-1.8 4.3-4.2 4.3A4 4 0 0 1 7.5 16" />
      <path d="M5.5 9h13M5.5 14.5h13" />
    </svg>
  );
}

export function Uhr({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.3V12l3 1.8" />
    </svg>
  );
}

export function Haken({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M8.4 12.2l2.5 2.5 4.7-5" />
    </svg>
  );
}

export function Pfeil({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  );
}

export function Augenmass({ size = 15, className }: Props) {
  return (
    <svg {...g(size)} className={className}>
      <path d="M12 4.5v15M5 8.5h14" />
      <path d="M5 8.5L2.8 14a2.6 2.6 0 0 0 4.4 0z" />
      <path d="M19 8.5L16.8 14a2.6 2.6 0 0 0 4.4 0z" />
      <path d="M9 19.5h6" />
    </svg>
  );
}
