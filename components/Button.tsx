
import React from 'react';
import { SoundManager } from '../managers/SoundManager';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'indigo' | 'pink' | 'amber' | 'green' | 'coral' | 'white';
  color?: string; // Custom hex color
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'cyan', 
  color,
  className = '',
  size = 'md',
  disabled = false
}) => {
  const handleInternalClick = () => {
    if (!disabled) {
      SoundManager.getInstance().playClick();
      if (onClick) {
        onClick();
      }
    }
  };

  const baseStyles = "relative font-bold uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center overflow-hidden select-none active:scale-95 transition-all duration-500 ease-out";
  
  const variants = {
    cyan: "bg-white/5 text-[#22d3ee] border-[1px] border-[#22d3ee]/20 backdrop-blur-2xl hover:bg-[#22d3ee]/10 hover:border-[#22d3ee]/40 shadow-xl shadow-cyan-500/5",
    indigo: "bg-white/5 text-[#818cf8] border-[1px] border-[#818cf8]/20 backdrop-blur-2xl hover:bg-[#818cf8]/10 hover:border-[#818cf8]/40 shadow-xl shadow-indigo-500/5",
    pink: "bg-white/5 text-[#f472b6] border-[1px] border-[#f472b6]/20 backdrop-blur-2xl hover:bg-[#f472b6]/10 hover:border-[#f472b6]/40 shadow-xl shadow-pink-500/5",
    amber: "bg-white/5 text-[#fbbf24] border-[1px] border-[#fbbf24]/20 backdrop-blur-2xl hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/40 shadow-xl shadow-amber-500/5",
    green: "bg-white/5 text-[#4ade80] border-[1px] border-[#4ade80]/20 backdrop-blur-2xl hover:bg-[#4ade80]/10 hover:border-[#4ade80]/40 shadow-xl shadow-green-500/5",
    coral: "bg-white/5 text-[#f87171] border-[1px] border-[#f87171]/20 backdrop-blur-2xl hover:bg-[#f87171]/10 hover:border-[#f87171]/40 shadow-xl shadow-red-500/5",
    white: "bg-white/5 text-white border-[1px] border-white/10 backdrop-blur-2xl hover:bg-white/10 hover:border-white/30 shadow-xl shadow-white/5"
  };

  const customStyle = color ? {
    background: `linear-gradient(to bottom, ${color}33, transparent)`,
    color: color,
    borderColor: `${color}66`,
    boxShadow: `0 10px 15px -3px ${color}1a`
  } : {};

  const sizes = {
    sm: "px-5 py-2.5 text-[10px]",
    md: "px-8 py-4 text-sm",
    lg: "px-10 py-5 text-base"
  };

  return (
    <button 
      onClick={handleInternalClick} 
      disabled={disabled}
      style={customStyle}
      className={`
        ${baseStyles} 
        ${!color ? (variants[variant as keyof typeof variants] || variants.cyan) : ''} 
        ${sizes[size]} 
        ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
};
