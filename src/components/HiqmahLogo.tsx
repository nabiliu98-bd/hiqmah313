import React from 'react';

interface HiqmahLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon' | 'horizontal';
  showSubtitle?: boolean;
}

export const HiqmahLogo: React.FC<HiqmahLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
}) => {
  // Size mapping
  const sizeMap = {
    xs: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 38, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 48, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 64, text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 84, text: 'text-3xl', sub: 'text-base' },
  };

  const { icon, text, sub } = sizeMap[size];

  // The official vector badge matching the "Youth of hiqmah" official logo
  const LogoIcon = (
    <div
      className="relative shrink-0 select-none transition-transform active:scale-95"
      style={{ width: icon, height: icon }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Emerald Background Gradient */}
          <linearGradient id="emeraldTileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E4E3C" />
            <stop offset="40%" stopColor="#0A3C2F" />
            <stop offset="100%" stopColor="#042018" />
          </linearGradient>

          {/* Golden Sun Gradient */}
          <linearGradient id="goldSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Fresh Spring Leaf Green Gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="45%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Soft Shadow for White Calligraphy Monogram */}
          <filter id="hShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#02140F" floodOpacity="0.4" />
          </filter>

          {/* Subtle Outer Border Stroke */}
          <linearGradient id="tileBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. Rounded App Tile (Squircle) */}
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#emeraldTileGrad)"
          stroke="url(#tileBorderGrad)"
          strokeWidth="1.5"
        />

        {/* Inner Top Highlight Curve for Glass/3D feel */}
        <path
          d="M 16 28 C 16 18 24 10 36 8 L 84 8 C 96 10 104 18 104 28 C 85 36 35 36 16 28 Z"
          fill="#FFFFFF"
          opacity="0.07"
        />

        {/* 2. Golden Sun Disc in Background */}
        <circle cx="66" cy="40" r="23" fill="url(#goldSunGrad)" />

        {/* 3. Mosque Minaret & Dome Silhouette inside Sun */}
        <g fill="#073024">
          {/* Main Dome */}
          <path d="M 62 44 C 62 35 68 31 71 27 C 74 31 80 35 80 44 Z" />
          {/* Minaret Tower */}
          <rect x="58" y="32" width="5" height="15" rx="1" />
          <path d="M 58 32 L 60.5 25 L 63 32 Z" />
          {/* Small Crescent / Finial dot */}
          <circle cx="60.5" cy="23" r="1.2" fill="#FDE047" />
        </g>

        {/* 4. White Stylized Calligraphy 'H' / 'ح' Monogram */}
        <g filter="url(#hShadow)">
          {/* Left Vertical Pillar */}
          <path
            d="M 28 34 
               C 28 26 34 23 44 23 
               C 47 23 48 27 48 33 
               L 48 83 
               C 48 89 44 91 38 91 
               C 31 91 28 87 28 80 
               Z"
            fill="#FFFFFF"
          />

          {/* Right Arch & Dynamic Branch */}
          <path
            d="M 48 40 
               C 58 32 76 34 84 45 
               C 92 56 89 71 80 80 
               L 68 91 
               C 62 91 58 87 58 81 
               L 58 64 
               C 65 57 74 53 74 46 
               C 74 41 68 39 60 41 
               C 54 43 50 48 48 52 
               Z"
            fill="#FFFFFF"
          />
        </g>

        {/* 5. Lush Spring Leaf Accent Sweeping Across */}
        <path
          d="M 49 61 
             C 62 50 82 54 94 65 
             C 86 78 68 83 51 79 
             C 56 74 54 67 49 61 Z"
          fill="url(#leafGrad)"
        />
        {/* Leaf Central Vein */}
        <path
          d="M 54 68 C 66 65 78 67 89 72"
          stroke="#86EFAC"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );

  // Icon only
  if (variant === 'icon') {
    return LogoIcon;
  }

  // Compact or Horizontal
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span className={`font-black tracking-tight text-[#093427] font-sans ${text} leading-tight`}>
            Youth <span className="font-serif italic font-normal text-[#16A34A] text-[85%]">of</span>{' '}
            <span className="text-[#093427] font-extrabold relative">
              hiqmah
              <span className="absolute -top-1 right-2 w-2 h-2 text-[#22C55E]">🍃</span>
            </span>
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-bold tracking-wide text-[#16A34A] ${sub} leading-tight`}>
            আত্মউন্নয়ন ও ধারাবাহিক অগ্রগতি
          </span>
        )}
      </div>
    </div>
  );
};
