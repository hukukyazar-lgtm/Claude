
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPlanetImages, fetchPlanetNames } from './lib/supabase';
import { PLANET_IMAGES } from './constants';

interface PlanetContextType {
  planetImages: string[];
  planetNames: Record<number, string>;
  isLoading: boolean;
}

const PlanetContext = createContext<PlanetContextType>({
  planetImages: PLANET_IMAGES,
  planetNames: {},
  isLoading: true,
});

export const usePlanets = () => useContext(PlanetContext);

export const PlanetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [planetImages, setPlanetImages] = useState<string[]>(PLANET_IMAGES);
  const [planetNames, setPlanetNames] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlanetData = async () => {
      try {
        console.log("PlanetProvider: Veriler yükleniyor...");
        const [images, names] = await Promise.all([
          fetchPlanetImages(),
          fetchPlanetNames()
        ]);
        
        console.log(`PlanetProvider: ${images.length} görsel, ${Object.keys(names).length} isim yüklendi.`);

        if (images.length > 0) {
          setPlanetImages(images);
        }
        
        setPlanetNames(names);
      } catch (error) {
        console.error("Failed to load planet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanetData();
  }, []);

  return (
    <PlanetContext.Provider value={{ planetImages, planetNames, isLoading }}>
      {children}
    </PlanetContext.Provider>
  );
};
