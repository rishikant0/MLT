import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showText = true,
}) => {
  const sizeDimensions = {
    sm: { icon: 36, textMLT: 'text-base', textZone: 'text-[11px]' },
    md: { icon: 44, textMLT: 'text-xl', textZone: 'text-xs' },
    lg: { icon: 56, textMLT: 'text-2xl', textZone: 'text-sm' },
    xl: { icon: 72, textMLT: 'text-3xl', textZone: 'text-base' },
  };

  const dim = sizeDimensions[size];
  const mltColor = variant === 'dark' ? 'text-white' : 'text-[#0F284D]';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official MLT Hexagonal Medical Emblem */}
      <svg
        width={dim.icon}
        height={dim.icon}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105"
      >
        {/* Deep Navy Hexagon Base */}
        <path
          d="M100 12 L175 55 L175 145 L100 188 L25 145 L25 55 Z"
          fill="#0F284D"
          stroke="#1E3A8A"
          strokeWidth="3"
        />

        {/* Digital Pixel Grid Accents */}
        <rect x="135" y="30" width="10" height="10" rx="2" fill="#22C55E" />
        <rect x="148" y="30" width="10" height="10" rx="2" fill="#14B8A6" />
        <rect x="161" y="30" width="10" height="10" rx="2" fill="#0EA5E9" />
        <rect x="135" y="43" width="10" height="10" rx="2" fill="#0EA5E9" />
        <rect x="148" y="43" width="10" height="10" rx="2" fill="#22C55E" />
        <rect x="161" y="43" width="10" height="10" rx="2" fill="#14B8A6" />
        <rect x="148" y="56" width="10" height="10" rx="2" fill="#22C55E" />
        <rect x="161" y="56" width="10" height="10" rx="2" fill="#0EA5E9" />

        {/* Science Atom Orbit */}
        <ellipse cx="70" cy="50" rx="18" ry="8" transform="rotate(-30 70 50)" stroke="#38BDF8" strokeWidth="2" fill="none" />
        <ellipse cx="70" cy="50" rx="18" ry="8" transform="rotate(30 70 50)" stroke="#38BDF8" strokeWidth="2" fill="none" />
        <circle cx="70" cy="50" r="4" fill="#EAB308" />

        {/* Open Medical Textbook */}
        <path d="M40 75 Q70 82 70 108 L70 125 Q70 98 40 92 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M100 75 Q70 82 70 108 L70 125 Q70 98 100 92 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="55" cy="88" r="5" stroke="#16A34A" strokeWidth="1.5" fill="none" />
        <line x1="78" y1="84" x2="94" y2="84" stroke="#0F284D" strokeWidth="2" strokeLinecap="round" />
        <line x1="78" y1="91" x2="94" y2="91" stroke="#0F284D" strokeWidth="2" strokeLinecap="round" />
        <line x1="78" y1="98" x2="94" y2="98" stroke="#0F284D" strokeWidth="2" strokeLinecap="round" />
        <line x1="78" y1="105" x2="90" y2="105" stroke="#0F284D" strokeWidth="2" strokeLinecap="round" />

        {/* Microscope Icon */}
        <path d="M138 90 L125 110 L130 113 L143 93 Z" fill="#FFFFFF" />
        <circle cx="140" cy="85" r="5" fill="#16A34A" />
        <rect x="120" y="112" width="22" height="4" rx="1" fill="#FFFFFF" />
        <path d="M132 116 C132 125 140 125 140 133 L122 133 L122 138 L148 138 L148 133 C148 120 137 120 137 116 Z" fill="#FFFFFF" />

        {/* Test Tube */}
        <rect x="155" y="80" width="10" height="35" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M156 95 L164 95 L164 110 C164 113 160 114 156 113 Z" fill="#22C55E" />
        <circle cx="160" cy="90" r="1.5" fill="#22C55E" />
        <circle cx="158" cy="85" r="1" fill="#22C55E" />

        {/* ECG Line */}
        <path
          d="M10 130 L75 130 L85 110 L95 150 L105 120 L115 130 L190 130"
          stroke="#EAB308"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="10" cy="130" r="4" fill="#16A34A" />
        <circle cx="190" cy="130" r="4" fill="#16A34A" />
      </svg>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-emerald-500 rounded-full"></span>
            <span className={`font-black tracking-tight ${mltColor} ${dim.textMLT}`}>
              MLT
            </span>
            <span className="w-3 h-[2px] bg-emerald-500 rounded-full"></span>
          </div>
          <span className={`font-bold tracking-wide text-[#22C55E] mt-0.5 ${dim.textZone}`}>
            Learning Zone
          </span>
        </div>
      )}
    </div>
  );
};
