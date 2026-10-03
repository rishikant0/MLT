import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeDimensions = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const dim = sizeDimensions[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Official MLT Learning Zone Brand Logo */}
      <img
        src="/logo.jpg"
        alt="MLT Learning Zone Logo"
        className={`${dim} w-auto object-contain flex-shrink-0 drop-shadow-md rounded-lg transition-transform duration-200 hover:scale-105`}
      />
    </div>
  );
};

