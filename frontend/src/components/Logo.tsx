import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'light' }) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${sizeClasses[size]} font-sans`}>
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/logo.jpg"
          alt="Allied Learning Zone Logo"
          className={`${
            size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
          } rounded-xl object-contain shadow-sm border border-gray-200/40 bg-white`}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-brand-darkNavy'}`}>
          ALLIED <span className="text-brand-teal">Learning Zone</span>
        </span>
        <span className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-brand-muted'}`}>
          Complete Allied Healthcare Education
        </span>
      </div>
    </div>
  );
};

