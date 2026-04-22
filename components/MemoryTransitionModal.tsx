
import React from 'react';
import { Button } from './Button';
import { Cube3D } from './Cube3D';
import { useTheme } from '../ThemeProvider';

interface MemoryTransitionModalProps {
  onConfirm: () => void;
  onExit?: () => void;
}

export const MemoryTransitionModal: React.FC<MemoryTransitionModalProps> = ({ onConfirm, onExit }) => {
  const { palette } = useTheme();
  const themeColor = palette[0];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-8 bg-transparent backdrop-blur-3xl animate-[fadeIn_0.6s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor}33 0%, transparent 70%)` }} />
      
      {/* Arka Plan Hareketli Çizgiler */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full animate-[scanline_4s_linear_infinite]" style={{ backgroundColor: themeColor }} />
        <div className="absolute top-0 left-3/4 w-[1px] h-full animate-[scanline_4s_linear_infinite_2s]" style={{ backgroundColor: themeColor }} />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center z-10">
        {/* Odaklanma İkonu */}
        <div className="mb-16 relative group">
          <div className="absolute inset-[-60px] blur-[80px] animate-pulse rounded-full" style={{ backgroundColor: `${themeColor}1a` }} />
          <div className="relative transform group-hover:scale-110 transition-all duration-700" style={{ filter: `drop-shadow(0 0 30px ${themeColor}66)` }}>
            <Cube3D 
              size={80} 
              color={themeColor} 
              speed={20} 
              isGlassy={true} 
              rotationAxis="TUMBLE" 
              faceLabels={['L', 'U', 'M', 'I', 'N', 'A']}
            />
          </div>
        </div>

        {/* Ana Metin */}
        <div className="mb-20 relative">
          <div className="absolute -inset-4 blur-2xl rounded-full" style={{ backgroundColor: `${themeColor}0d` }} />
          <h2 className="relative text-white text-5xl font-[900] tracking-tighter uppercase leading-[1] italic transform -skew-x-6 drop-shadow-lg">
            5 DOĞRU KELİMENİ <br/>
            <span className="drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] text-4xl mt-2 block" style={{ color: themeColor }}>HATIRLIYOR MUSUN?</span>
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full mt-6 animate-pulse" style={{ backgroundColor: `${themeColor}4d` }} />
        </div>

        {/* Aksiyon */}
        <div className="w-full relative group">
          <div className="absolute inset-[-20px] blur-3xl group-hover:opacity-100 transition-all rounded-full" style={{ backgroundColor: `${themeColor}1a` }} />
          <Button 
            variant="custom" 
            onClick={onConfirm} 
            className="w-full !py-8 !text-4xl !rounded-[48px] !border-b-[14px] !border-x-[4px] active:!border-b-[4px] active:!translate-y-2 transition-all group overflow-hidden relative"
            style={{ 
                backgroundColor: themeColor,
                borderColor: `${themeColor}cc`,
                boxShadow: `0 20px 40px ${themeColor}66`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="font-black italic tracking-tight relative z-10 text-white">HAZIRIM</span>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
