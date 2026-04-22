
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Eye, Image as ImageIcon, Search, Filter, MoreVertical, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface BucketModalProps {
  onClose: () => void;
}

const BUCKET_FILES = [
  { name: '1775070049812.png', size: '1.2 MB', type: 'image/png', date: '2026-03-28' },
  { name: '177507280605.png', size: '0.8 MB', type: 'image/png', date: '2026-03-29' },
  { name: '1775070391909.png', size: '2.1 MB', type: 'image/png', date: '2026-03-30' },
  { name: '1775070413586.png', size: '1.5 MB', type: 'image/png', date: '2026-03-31' },
  { name: '1775070424530.png', size: '0.9 MB', type: 'image/png', date: '2026-04-01' },
  { name: 'Planet1.png', size: '3.4 MB', type: 'image/png', date: '2026-03-25' },
  { name: 'Planet5.png', size: '2.8 MB', type: 'image/png', date: '2026-03-26' },
];

export const BucketModal: React.FC<BucketModalProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-5xl h-[85vh] glass-morphism border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <ImageIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight italic">LUMINA BUCKET</h2>
              <p className="text-xs text-white/40 font-medium tracking-widest uppercase">Storage Explorer / Public Assets</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/2">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-black text-white/30 tracking-widest uppercase">7 Files / 12.7 MB</div>
             <div className="w-px h-4 bg-white/10" />
             <Button variant="cyan" size="sm" className="px-6" onClick={() => {}}>
                Upload Files
             </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {BUCKET_FILES.map((file, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative glass-morphism border-white/5 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-lg"
              >
                {/* Preview */}
                <div className="aspect-[4/3] relative overflow-hidden bg-white/5">
                  <img 
                    src={`https://picsum.photos/seed/${file.name}/800/600`} 
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate pr-2">{file.name}</span>
                    <button className="text-white/20 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">{file.size}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">{file.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/2 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Connected to Lumina-Storage-S3</span>
           </div>
           <div className="text-[10px] font-black text-white/20 tracking-widest uppercase italic">© 2026 LUMINA</div>
        </div>
      </motion.div>
    </motion.div>
  );
};
