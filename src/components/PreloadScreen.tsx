import Sigma from "../assets/sigma.jpeg"
import React, { useEffect, useState } from 'react';

interface PreloadScreenProps {
  onComplete: () => void;
}

const PreloadScreen: React.FC<PreloadScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Random glitch effects
    const glitchTimer = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(glitchTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-electric-lime flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-black animate-pulse"
              style={{
                animationDelay: `${(i * 50) % 2000}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 bg-black rotate-45 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center">
        {/* Image with crazy effects */}
        <div className="relative mb-8">
          <div className={`
            transform transition-all duration-300
            ${glitchActive ? 'scale-110 rotate-2 hue-rotate-180' : 'scale-100 rotate-0'}
          `}>
            <img
              src={Sigma}
              alt="Loading"
              className={`
                w-48 h-48 object-cover border-8 border-black shadow-brutal-lg
                ${glitchActive ? 'filter brightness-200 contrast-150 saturate-200' : ''}
                animate-pulse-electric
              `}
              style={{
                clipPath: progress > 50 ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)',
                transition: 'clip-path 0.5s ease-out'
              }}
            />
          </div>
          
          {/* Glitch overlay */}
          {glitchActive && (
            <div className="absolute inset-0 bg-electric-blue opacity-50 mix-blend-multiply animate-ping" />
          )}
        </div>

        {/* Loading text with typewriter effect */}
        <div className="mb-6">
          <h1 className="text-6xl font-black uppercase tracking-wider text-black animate-bounce">
            LOADING
          </h1>
          <div className="flex justify-center mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-black rounded-full mx-1 animate-bounce"
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar with crazy styling */}
        <div className="w-80 mx-auto">
          <div className="bg-black border-4 border-black h-8 relative overflow-hidden shadow-brutal">
            <div
              className="h-full bg-electric-orange transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated stripes */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            </div>
            {/* Progress text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono font-black text-white mix-blend-difference">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Crazy moving text */}
        <div className="mt-8 overflow-hidden">
          <div className="animate-bounce">
            <p className="text-2xl font-black uppercase text-black tracking-widest">
              SIGMA-WALLET
            </p>
          </div>
        </div>
      </div>

      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-black to-transparent opacity-10 animate-pulse" 
             style={{
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
               animation: 'slide-down 2s linear infinite'
             }} 
        />
      </div>
    </div>
  );
};

export default PreloadScreen;
