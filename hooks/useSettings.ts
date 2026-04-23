
import { useState, useEffect } from 'react';
import { SoundManager } from '../managers/SoundManager';

const SETTINGS_KEY = 'lumina_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Settings load error:", e);
      }
    }
    return {
      music: true,
      sound: true,
      highQuality: true
    };
  });

  const onUpdateSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    const sm = SoundManager.getInstance();
    sm.setMusicEnabled(newSettings.music);
    sm.setSoundEnabled(newSettings.sound);
    document.documentElement.setAttribute('data-quality', newSettings.highQuality ? 'high' : 'low');
  };

  // Apply settings initially
  useEffect(() => {
    const sm = SoundManager.getInstance();
    sm.setMusicEnabled(settings.music);
    sm.setSoundEnabled(settings.sound);
    document.documentElement.setAttribute('data-quality', settings.highQuality ? 'high' : 'low');
  }, []);

  return {
    settings,
    onUpdateSettings
  };
};
