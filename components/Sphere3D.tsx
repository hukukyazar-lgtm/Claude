
import React from 'react';

interface Sphere3DProps {
  size?: number;
  color?: string;
  label?: string;
  isLocked?: boolean;
  isCurrent?: boolean;
  className?: string;
  imageUrl?: string;
}

export const Sphere3D: React.FC<Sphere3DProps> = ({ 
  size = 72, 
  color = "#22d3ee", 
  label = "", 
  isLocked = false, 
  isCurrent = false,
  className = "",
  imageUrl
}) => {
  const baseColor = isLocked ? "#475569" : color;
  
  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-1000 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Atmosphere Glow */}
      <div 
        className={`absolute inset-[-20%] rounded-full blur-2xl transition-all duration-1000 ${isCurrent ? 'opacity-60 scale-110' : 'opacity-20 scale-100'}`}
        style={{ backgroundColor: baseColor }}
      />
      
      {/* Sphere Body */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform duration-700"
        style={{ 
          background: imageUrl ? 'none' : `radial-gradient(circle at 30% 30%, ${baseColor} 0%, #000 100%)`,
          boxShadow: isCurrent ? `0 0 30px ${baseColor}80, inset 0 0 20px rgba(255,255,255,0.2)` : `inset 0 0 15px rgba(255,255,255,0.1)`,
          transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Planet" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 scale-110 rounded-full ${isLocked ? 'opacity-20 grayscale' : 'opacity-100'}`}
            style={{ 
              clipPath: 'circle(48%)',
              maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)'
            }}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Surface Texture Overlay */}
        {!imageUrl && <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />}
        
        {/* Specular Highlight */}
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm" />
        
        {/* Label Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-white font-[900] select-none pointer-events-none drop-shadow-lg"
            style={{ 
              fontSize: size * 0.4,
              opacity: isLocked ? 0.3 : 1
            }}
          >
            {label}
          </span>
        </div>
      </div>
      
      {/* Shadow Casting */}
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/40 blur-lg rounded-full"
      />
    </div>
  );
};
