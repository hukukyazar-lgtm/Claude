
import React from 'react';
import { Button } from './Button';

interface QuitConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const QuitConfirmationModal: React.FC<QuitConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl">
      <div className="bg-white/5 border-[0.5px] border-white/20 backdrop-blur-2xl rounded-[40px] p-10 w-full max-w-sm shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border-[0.5px] border-red-500/20 shadow-lg relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 tracking-widest uppercase opacity-90 relative z-10">DİKKAT!</h2>
        <p className="text-white/40 mb-10 leading-relaxed text-xs uppercase tracking-widest relative z-10">
          Şu an çıkarsan <span className="text-red-400 font-bold">1 Can</span> kaybedeceksin. Ayrılmak istediğine emin misin?
        </p>
        
        <div className="w-full space-y-4 relative z-10">
          <Button 
            variant="white"
            onClick={onCancel}
            className="w-full !py-5 !rounded-2xl !bg-white !text-indigo-950 font-bold tracking-widest"
          >
            OYUNA DEVAM ET
          </Button>
          
          <button 
            onClick={onConfirm}
            className="w-full py-4 text-red-400/40 hover:text-red-400 text-[10px] font-bold uppercase tracking-[0.3em] transition-all active:scale-95"
          >
            EVET, AYRIL
          </button>
        </div>
      </div>
    </div>
  );
};
