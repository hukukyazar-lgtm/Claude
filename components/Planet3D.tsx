
import React from 'react';

interface Planet3DProps {
  imageUrl: string;
  size?: number;
  className?: string;
  tilt?: number;
  speed?: number;
}

export const Planet3D: React.FC<Planet3DProps> = ({ 
  imageUrl, 
  size = 400, 
  className = "", 
  tilt = 23.5,
  speed = 40
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        transform: `rotate(${tilt}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Outer Atmosphere Glow */}
      <div 
        className="absolute inset-[-10%] rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`,
        }}
      />

      {/* The Sphere Container */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
        style={{ 
          boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.8), inset 10px 10px 30px rgba(255,255,255,0.2)',
          backgroundColor: '#000'
        }}
      >
        {/* Rotating Texture Layer */}
        <div 
          className="absolute inset-0 w-[200%] h-full flex"
          style={{ 
            animation: `planet-texture-scroll ${speed}s linear infinite`,
          }}
        >
          <div 
            className="w-1/2 h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div 
            className="w-1/2 h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>

        {/* Shading Overlay (Fixed relative to light source) */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{ 
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.6) 0%, transparent 80%)
            `,
            boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.7), inset 15px 15px 40px rgba(255,255,255,0.05)'
          }}
        />
      </div>

      <style>{`
        @keyframes planet-texture-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
