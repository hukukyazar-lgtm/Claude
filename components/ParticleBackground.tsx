
import React, { useEffect, useRef, memo, useMemo } from 'react';

interface ParticleBackgroundProps {
  speedMultiplier?: number;
  level?: number;
  themeColor?: string;
}

// Kelly Boesch esintili vintage/technicolor palet
const KELLY_PALETTE = [
  '#F5F5DC', // Beige
  '#2F4F4F', // Dark Slate
  '#8B4513', // Saddle Brown
  '#BC8F8F', // Rosy Brown
  '#556B2F', // Dark Olive
  '#4682B4', // Steel Blue
  '#D2691E', // Chocolate
];

export const ParticleBackground: React.FC<ParticleBackgroundProps> = memo(({ 
  speedMultiplier = 1, 
  level = 1,
  themeColor = '#0E7490'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    
    // Collage dots (halftone style or scattered)
    let dots: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
    }> = [];

    // Paper stains (irregular blobs)
    let stains: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      scaleX: number;
      scaleY: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      const isHighQuality = document.documentElement.getAttribute('data-quality') !== 'low';
      dots = [];
      const dotCount = isHighQuality ? 60 : 20;
      for (let i = 0; i < dotCount; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.4 + 0.1,
          color: KELLY_PALETTE[Math.floor(Math.random() * KELLY_PALETTE.length)]
        });
      }

      stains = [];
      const stainCount = isHighQuality ? 4 : 2;
      for (let i = 0; i < stainCount; i++) {
        stains.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 200 + 150,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          opacity: Math.random() * 0.08 + 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.001,
          scaleX: 1 + Math.random() * 0.5,
          scaleY: 0.8 + Math.random() * 0.4
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Stains (Paper stains / Nebula-like blobs)
      stains.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.scale(s.scaleX, s.scaleY);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.radius);
        grad.addColorStop(0, `${themeColor}${Math.floor(s.opacity * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(0.6, `${themeColor}00`);
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        s.x += s.vx * speedMultiplier;
        s.y += s.vy * speedMultiplier;
        s.rotation += s.rotationSpeed * speedMultiplier;
        
        // Wrapping logic for stains
        if (s.x < -s.radius * 2) s.x = canvas.width + s.radius * 2;
        if (s.x > canvas.width + s.radius * 2) s.x = -s.radius * 2;
        if (s.y < -s.radius * 2) s.y = canvas.height + s.radius * 2;
        if (s.y > canvas.height + s.radius * 2) s.y = -s.radius * 2;
      });

      // Draw Dots (Halftone / Collage elements)
      dots.forEach((d) => {
        ctx.globalAlpha = d.opacity;
        ctx.fillStyle = d.color;
        
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();

        d.x += d.vx * speedMultiplier;
        d.y += d.vy * speedMultiplier;

        // Wrapping logic for dots
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
      });
      
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speedMultiplier, themeColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
});
