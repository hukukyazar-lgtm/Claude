
import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore
import { Vibrant } from 'node-vibrant/browser';
import { PLANET_IMAGES } from './constants';

interface ThemeContextType {
  palette: string[];
  isLoading: boolean;
}

const DEFAULT_PALETTE = ['#22d3ee', '#4ade80', '#fb923c', '#a855f7', '#1e1b4b'];

const ThemeContext = createContext<ThemeContextType>({
  palette: DEFAULT_PALETTE,
  isLoading: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode, planetImageUrl?: string }> = ({ children, planetImageUrl = PLANET_IMAGES[0] }) => {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const extractPalette = async () => {
      setIsLoading(true);
      try {
        // Use a proxy to bypass CORS issues for color extraction
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(planetImageUrl)}&w=200`;
        
        // node-vibrant v4 uses Vibrant.from()
        const swatches = await Vibrant.from(proxyUrl).getPalette();
        
        // Extract the most vibrant colors
        const colors = [
          swatches.Vibrant?.hex,
          swatches.LightVibrant?.hex,
          swatches.DarkVibrant?.hex,
          swatches.Muted?.hex,
          swatches.LightMuted?.hex,
          swatches.DarkMuted?.hex,
        ].filter(Boolean) as string[];

        // Ensure we have at least 5 colors, fallback if needed
        const finalPalette = colors.length >= 5 ? colors.slice(0, 5) : [...colors, ...DEFAULT_PALETTE].slice(0, 5);
        setPalette(finalPalette);
      } catch (error) {
        // Fallback to direct load if proxy fails
        try {
          const swatches = await Vibrant.from(planetImageUrl).getPalette();
          const colors = [
            swatches.Vibrant?.hex,
            swatches.LightVibrant?.hex,
            swatches.DarkVibrant?.hex,
            swatches.Muted?.hex,
            swatches.LightMuted?.hex,
            swatches.DarkMuted?.hex,
          ].filter(Boolean) as string[];
          const finalPalette = colors.length >= 5 ? colors.slice(0, 5) : [...colors, ...DEFAULT_PALETTE].slice(0, 5);
          setPalette(finalPalette);
        } catch (directError) {
          // Only log as warning to reduce noise for missing files
          console.warn('Palette extraction failed, using default palette:', planetImageUrl);
          setPalette(DEFAULT_PALETTE);
        }
      } finally {
        setIsLoading(false);
      }
    };

    extractPalette();
  }, [planetImageUrl]);

  return (
    <ThemeContext.Provider value={{ palette, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
