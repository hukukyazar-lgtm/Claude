
import React, { useState } from 'react';
import { SoundManager } from '../managers/SoundManager';

interface SideMenuProps {
  onExit: () => void;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  isMinimal?: boolean; 
  expandDirection?: 'up' | 'down';
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  onExit, 
  onToggle, 
  className = "", 
  isMinimal = false,
  expandDirection = 'down'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const handleMuteToggle = () => {
    const newMuted = !musicMuted;
    setMusicMuted(newMuted);
    SoundManager.getInstance().setMute(newMuted);
  };

  const menuButtons = [
    {
      id: 'exit',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      ),
      color: "bg-white/5",
      borderColor: "border-white/10",
      onClick: () => {
        setIsOpen(false);
        if (onToggle) onToggle(false);
        onExit();
      }
    },
    {
      id: 'music',
      icon: (
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 opacity-40">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
          {musicMuted && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-0.5 bg-white/20 rotate-45 rounded-full" />}
        </div>
      ),
      color: "bg-white/5",
      borderColor: "border-white/10",
      onClick: handleMuteToggle
    }
  ];

  if (isMinimal) {
    const expandStyles = expandDirection === 'up' 
      ? 'bottom-[48px] origin-bottom' 
      : 'top-[48px] origin-top';

    return (
      <div className={`relative flex flex-col items-center z-[130] ${className}`}>
        <div className={`absolute ${expandStyles} flex flex-col gap-2 transition-all duration-500 z-[140] ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-[-10px] pointer-events-none'}`}>
          {menuButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className={`w-10 h-10 rounded-full bg-white/5 border-[0.5px] border-white/10 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all backdrop-blur-2xl relative overflow-hidden`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <button
          onClick={handleToggle}
          className={`w-10 h-10 rounded-full bg-white/5 backdrop-blur-2xl border-[0.5px] border-white/10 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all relative overflow-hidden z-[150] ${isOpen ? 'rotate-90' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 opacity-40">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 z-[130] flex flex-col items-center gap-4 ${className}`}>
      <div className={`flex flex-col gap-4 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}`}>
        {menuButtons.map((btn, i) => (
          <button
            key={btn.id}
            onClick={btn.onClick}
            className={`w-12 h-12 rounded-full bg-white/5 border-[0.5px] border-white/10 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all backdrop-blur-2xl relative overflow-hidden`}
            style={{ transitionDelay: `${(menuButtons.length - i) * 60}ms` }}
          >
            <div className="relative z-10">{btn.icon}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border-[0.5px] border-white/10 flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all relative overflow-hidden ${isOpen ? 'rotate-90' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 opacity-40 transition-transform duration-500">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
    </div>
  );
};
