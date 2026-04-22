
import React, { useState, useEffect, useMemo } from 'react';
import { Cube3D } from '../components/Cube3D';
import { useTheme } from '../ThemeProvider';

interface LoadingScreenProps {
  backgroundUrl?: string;
  onFinished?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ backgroundUrl, onFinished }) => {
  const { palette } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isAssembling, setIsAssembling] = useState(false);
  const letters = "LUMINA".split("");
  
  const cubeColors = palette;

  const cubeConfigs = useMemo(() => [
    { dir: 1, speed: 1.8, offset: 0 },
    { dir: -1, speed: 2.2, offset: 5 },
    { dir: 1, speed: 1.5, offset: -10 },
    { dir: -1, speed: 2.5, offset: 8 },
    { dir: 1, speed: 2.0, offset: -5 },
    { dir: -1, speed: 1.6, offset: 12 }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = prev < 70 ? 1.2 : 0.6;
        return Math.min(prev + step, 100);
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsAssembling(true);
        const finishTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 1500);
        return () => clearTimeout(finishTimer);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  // Check if the current backgroundUrl is the one that has finished loading
  const isCurrentLoaded = backgroundUrl && loadedUrl === backgroundUrl;
  
  return (
    <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Planet Background for Loading Screen */}
      <div className={`absolute inset-0 pointer-events-none z-[5] transition-opacity duration-700 ${isCurrentLoaded ? 'opacity-30' : 'opacity-0'}`}>
        {backgroundUrl && (
          <img 
            key={backgroundUrl}
            src={backgroundUrl} 
            alt="" 
            onLoad={() => setLoadedUrl(backgroundUrl)}
            className="w-full h-full object-cover animate-[planetDrift_60s_linear_infinite] scale-110"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* Subtle Radial Vignette for legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(2,6,23,0.4)_70%)] pointer-events-none" />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.15)_0%,_transparent_60%)] animate-pulse" />

      {/* Title removed as per user request */}
      
      <div className="relative w-80 h-80 mb-32 z-30 flex items-center justify-center">
        {[0, 60, 120, 180, 240, 300].map((baseAngle, i) => {
          const config = cubeConfigs[i];
          const currentRotation = baseAngle + (progress * config.speed * config.dir);
          
          const assembleX = (i - 2.5) * 55;
          const assembleY = 0;

          const orbitTransform = `translate(-50%, -50%) rotate(${currentRotation}deg) translateY(-115px)`;
          const assembledTransform = `translate(calc(-50% + ${assembleX}px), calc(-50% + ${assembleY}px)) rotate(0deg)`;

          return (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 transition-all duration-[1000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                transform: isAssembling ? assembledTransform : orbitTransform,
                zIndex: isAssembling ? 100 : 10
              }}
            >
              <div 
                className="transition-transform duration-1000" 
                style={{ 
                  transform: isAssembling ? 'rotate(0deg)' : `rotate(${-currentRotation + config.offset}deg)` 
                }}
              >
                <Cube3D 
                  size={isAssembling ? 48 : 52} 
                  speed={isAssembling ? 0 : 2.5 + (i * 0.5)} 
                  opacity={0.8}
                  isGlassy={true}
                  color={cubeColors[i % cubeColors.length]}
                  label={letters[i]}
                  rotation={isAssembling ? 'rotateX(0deg) rotateY(0deg)' : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`w-full max-w-[280px] space-y-4 z-20 flex flex-col items-center transition-all duration-700 ${isAssembling ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
        <div className="h-2 w-full bg-black/40 backdrop-blur-xl rounded-full overflow-hidden border border-white/10 p-[2px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300 ease-out rounded-full relative shadow-[0_0_15px_rgba(56,189,248,0.5)]"
            style={{ width: `${progress}%` }}
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        
        <span className="text-[11px] font-[900] tracking-[0.8em] text-white uppercase mt-2 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]">
          YÜKLENİYOR
        </span>
      </div>
      <style>{`
        @keyframes planetDrift {
          0% { transform: rotate(0deg) scale(1.2); }
          50% { transform: rotate(5deg) scale(1.3); }
          100% { transform: rotate(0deg) scale(1.2); }
        }
      `}</style>
    </div>
  );
};
