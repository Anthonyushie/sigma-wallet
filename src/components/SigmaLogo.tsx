
import React from 'react';

interface SigmaLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

const SigmaLogo: React.FC<SigmaLogoProps> = ({ 
  size = 64, 
  color = '#000000', 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sigmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#sigmaGradient)"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Sigma symbol */}
      <path
        d="M16 18 L48 18 L32 32 L48 46 L16 46 L16 42 L40 42 L28 32 L40 22 L16 22 Z"
        fill={color}
        strokeWidth="1"
        stroke="white"
      />
      
      {/* Lightning bolt accent */}
      <path
        d="M38 12 L44 12 L36 24 L42 24 L32 40 L36 28 L30 28 L38 12 Z"
        fill="#FFD700"
        opacity="0.8"
      />
    </svg>
  );
};

export default SigmaLogo;
