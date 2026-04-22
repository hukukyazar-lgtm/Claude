
import React from 'react';
import { motion } from 'motion/react';
import { Cube3D } from './Cube3D';
import { PLANET_IMAGES } from '../constants';
import { useTheme } from '../ThemeProvider';

interface Portal3DProps {
  level: number;
  active: boolean;
  difficulty?: number; // DDS Katsayısı
  variant?: 'full' | 'sphere-only' | 'text-only';
}

export const Portal3D: React.FC<Portal3DProps> = ({ level, active, difficulty = 1.0, variant = 'full' }) => {
  const { palette } = useTheme();
  const planetUrl = PLANET_IMAGES[0]; // Use the first image from constants
  const isLumina = level >= 595;

  // Zorluğa göre renk belirleme (Local DDS Feedback)
  const getPortalColor = () => {
    if (difficulty > 1.6) return palette[4] || palette[0]; // Çok Zor (Mor)
    if (difficulty > 1.3) return palette[1] || palette[0]; // Zor (Turuncu/Pas)
    if (difficulty > 0.8) return palette[0]; // Orta (Siyan)
    return palette[3] || palette[0]; // Kolay (Altın)
  };

  const portalColor = getPortalColor();
  const rotationSpeed = 20 / difficulty; // Zorluk arttıkça hızlanır

  return (
    <div className={`relative w-64 h-64 flex items-center justify-center transition-all duration-1000 ${active ? 'scale-110 opacity-100 rotate-0' : 'scale-75 opacity-20 rotate-12'}`}>
      {/* Gezegen Görseli - Portalın içinde hafifçe görünür */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: active ? 1.2 : 0.8, opacity: active ? 0.15 : 0 }}
          src={planetUrl} 
          alt="" 
          className="w-48 h-48 object-contain blur-[2px] animate-planet-rotate"
          style={{ 
            clipPath: 'circle(48%)',
            maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)'
          }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Arka plan parıltıları - Daha sade */}
      <div 
        className="absolute inset-0 blur-[100px] rounded-full animate-pulse mix-blend-screen transition-colors duration-1000" 
        style={{ backgroundColor: `${portalColor}22` }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 -translate-y-12">
        {/* "GEZEGEN" yazısı */}
        <div className="mb-1 transition-all duration-500">
          <span className="text-[14px] font-[900] tracking-[1.2em] uppercase text-white opacity-90 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">GEZEGEN</span>
        </div>
        
        {/* Gezegen Numarası */}
        <span className="text-9xl font-[900] text-white tracking-tighter transition-transform duration-700 relative opacity-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {Math.ceil(level / 6)}
        </span>
      </div>

      <div 
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-52 h-16 blur-3xl rounded-full mix-blend-screen animate-pulse transition-colors duration-1000" 
        style={{ backgroundColor: `${portalColor}33` }}
      />

      <style>{`
        @keyframes portalDrift {
          0% { transform: rotate(0deg) translate(-5%, -5%); }
          100% { transform: rotate(360deg) translate(-5%, -5%); }
        }
        @keyframes planetDrift {
          0% { transform: rotate(0deg) scale(1.3) translateX(0); }
          50% { transform: rotate(10deg) scale(1.4) translateX(5px); }
          100% { transform: rotate(0deg) scale(1.3) translateX(0); }
        }
      `}</style>
    </div>
  );
};
