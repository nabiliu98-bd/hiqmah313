import React from 'react';

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  color?: string;
  textColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 180,
  strokeWidth = 14,
  label = 'TODAY',
  subLabel = '',
  color,
  textColor = 'text-white',
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const gradientId = `circleGradient-${size}-${strokeWidth}`;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#062E22"
          strokeOpacity="0.35"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || `url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-[10px] font-extrabold tracking-widest text-emerald-300 uppercase">
          {label}
        </span>
        <span className={`text-3xl sm:text-4xl font-black ${textColor} tracking-tight`}>
          {clamped}%
        </span>
        {subLabel && (
          <span className="text-[10px] font-bold text-amber-300 mt-0.5 max-w-[120px] truncate">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};
