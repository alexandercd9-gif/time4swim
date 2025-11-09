"use client";

interface WaveDividerProps {
  flip?: boolean;
  color?: string;
  gradient?: {
    from: string;
    via?: string;
    to: string;
    direction?: 'to-r' | 'to-b' | 'to-br';
    // Optional fine-tuning for where the color transitions happen (in percent 0-100)
    fromOffset?: number;
    viaOffset?: number;
    toOffset?: number;
  };
  // Small vertical adjustment (in pixels) to fine-tune visual alignment with next section
  yOffset?: number;
}

export default function WaveDivider({ flip = false, color = "#F8FAFC", gradient, yOffset = 0 }: WaveDividerProps) {
  const gradId = gradient
    ? `waveGrad-${(gradient.from + (gradient.via ?? '') + gradient.to).replace(/[#\s]/g, '')}-${flip ? 'f' : 'n'}`
    : undefined;
  // map direction to SVG coordinates
  const dir = gradient?.direction ?? 'to-br';
  const coords = {
    'to-r': { x1: 0, y1: 0, x2: 1, y2: 0 },
    'to-b': { x1: 0, y1: 0, x2: 0, y2: 1 },
    'to-br': { x1: 0, y1: 0, x2: 1, y2: 1 },
  }[dir];
  return (
    <div className={`w-full ${flip ? 'rotate-180' : ''} block leading-[0]`} style={{ marginBottom: yOffset ? `${yOffset - 2}px` : '-2px', lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block pointer-events-none border-0 outline-0"
        preserveAspectRatio="none"
        style={{ display: 'block', verticalAlign: 'bottom', lineHeight: 0 }}
      >
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
              <stop offset={`${gradient.fromOffset ?? 0}%`} stopColor={gradient.from} />
              {gradient.via && <stop offset={`${gradient.viaOffset ?? 50}%`} stopColor={gradient.via} />}
              <stop offset={`${gradient.toOffset ?? 100}%`} stopColor={gradient.to} />
            </linearGradient>
          </defs>
        )}
        <path
          d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
          fill={gradient ? `url(#${gradId})` : color}
        />
      </svg>
    </div>
  );
}
