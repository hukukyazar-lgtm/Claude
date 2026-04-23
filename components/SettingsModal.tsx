
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, HelpCircle, Globe, Shield, Info, X, ChevronRight, Cpu } from 'lucide-react';
import { SoundManager } from '../managers/SoundManager';

interface SettingsModalProps {
  onClose: () => void;
  settings: any;
  onUpdateSettings: (s: any) => void;
  onOpenPrivacy: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, settings, onUpdateSettings, onOpenPrivacy }) => {

  const ModernToggle = ({ label, value, onToggle, icon: Icon, desc }: { label: string, value: boolean, onToggle: () => void, icon: any, desc: string }) => {
    return (
      <motion.button 
        onClick={() => {
          onToggle();
          SoundManager.getInstance().playClick('onay');
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-[28px] border transition-all duration-500 flex items-center gap-4 relative overflow-hidden
          ${value 
            ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' 
            : 'bg-black/40 border-white/5 opacity-60'
          }`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
          ${value ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-white/40'}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-sm font-black text-white tracking-widest uppercase italic">{label}</span>
          <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider truncate">{desc}</span>
        </div>

        <div className={`w-12 h-6 rounded-full relative transition-all duration-500 border
          ${value ? 'bg-emerald-500/20 border-emerald-400/40' : 'bg-white/5 border-white/10'}`}>
          <motion.div 
            animate={{ x: value ? 24 : 4 }}
            className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${value ? 'bg-emerald-400' : 'bg-white/20'}`}
          />
        </div>
      </motion.button>
    );
  };

  return (
    <>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
        
        {/* Header Section */}
        <div className="absolute top-0 left-0 right-0 px-6 h-20 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-lg font-bold text-white tracking-[0.4em] uppercase italic">
              AYARLAR
            </h1>
          </motion.div>

          <button 
            onClick={onClose}
            className="absolute right-6 w-10 h-10 glass-morphism-bright rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group"
          >
            <X className="w-5 h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 px-6 space-y-8 overflow-y-auto custom-scrollbar pb-32 z-10 pt-24">
          {/* Audio & Visual Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">SES VE GÖRSEL</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <ModernToggle 
                icon={Music} 
                label="Müzik" 
                desc="Arka plan müziklerini yönet"
                value={settings.music} 
                onToggle={() => onUpdateSettings({...settings, music: !settings.music})} 
              />
              <ModernToggle 
                icon={Volume2} 
                label="Ses Efektleri" 
                desc="Aksiyon seslerini kontrol et"
                value={settings.sound} 
                onToggle={() => onUpdateSettings({...settings, sound: !settings.sound})} 
              />
              <ModernToggle 
                icon={Cpu} 
                label="Yüksek Kalite" 
                desc="Gelişmiş görsel efektleri aç"
                value={settings.highQuality} 
                onToggle={() => onUpdateSettings({...settings, highQuality: !settings.highQuality})} 
              />
            </div>
          </div>


          {/* Info Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 px-2 mb-4">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">BİLGİ</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            
            {[
              { icon: Globe, label: "DİL", value: "TÜRKÇE", action: () => {} },
              { icon: HelpCircle, label: "REHBERİ TEKRARLA", action: () => {
                localStorage.removeItem('eva_tutorial_seen');
                alert('Rehber sıfırlandı! Bir sonraki oyunda tekrar göreceksiniz.');
              } },
              { icon: Shield, label: "GİZLİLİK POLİTİKASI", action: () => onOpenPrivacy() },
              { icon: Info, label: "VERSİYON", value: "1.0.4", action: () => {} }
            ].map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  SoundManager.getInstance().playClick('onay');
                  item.action();
                }}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="w-full h-14 glass-morphism rounded-2xl px-5 flex items-center justify-between border-white/5 group"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-black text-white/40 group-hover:text-white transition-colors tracking-widest uppercase italic">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{item.value}</span>}
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Support Section */}
          <div className="pt-4">
            <motion.button 
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => {
                SoundManager.getInstance().playClick('onay');
                window.location.href = 'mailto:hukukyazar@gmail.com';
              }}
              className="w-full h-28 glass-morphism rounded-[32px] flex flex-col items-center justify-center gap-2 border-white/5 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-inner">
                <HelpCircle className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.4em] italic transition-colors">YARDIM & DESTEK</span>
              <span className="text-[8px] text-white/20 group-hover:text-white/40 uppercase tracking-[0.2em] font-medium transition-colors">hukukyazar@gmail.com</span>
            </motion.button>
          </div>
        </div>

        {/* Footer Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-20" />

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 0px;
            display: none;
          }
        `}</style>
      </motion.div>
    </>
  );
};

