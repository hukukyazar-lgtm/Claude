
import React from 'react';
import { motion } from 'motion/react';
import { X, Shield, Lock, Eye, Save, Trash2, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const sections = [
    {
      icon: Eye,
      title: "Veri Toplama",
      content: "Lumina, oyun deneyiminizi iyileştirmek ve ilerlemenizi kaydetmek için kullanıcı kimliği (UID), kazanılan yıldızlar, seviye ilerlemesi ve oyun içi istatistikleri toplar."
    },
    {
      icon: Save,
      title: "Veri Kullanımı",
      content: "Toplanan veriler, liderlik tablolarını yönetmek, başarımlarınızı senkronize etmek ve size kişiselleştirilmiş bir oyun deneyimi sunmak amacıyla kullanılır."
    },
    {
      icon: Lock,
      title: "Veri Güvenliği",
      content: "Verileriniz güvenli bulut servislerinde (Firebase/Supabase) şifrelenmiş olarak saklanır. Hiçbir veriniz üçüncü taraf reklam şirketlerine satılmaz veya devredilmez."
    },
    {
      icon: Mail,
      title: "İletişim ve Veri Silme",
      content: "Verilerinizin silinmesini talep etmek veya gizlilik politikamız hakkında sorularınız için hukukyazar@gmail.com adresi üzerinden bizimle iletişime geçebilirsiniz."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg glass-morphism rounded-[40px] border-white/10 flex flex-col overflow-hidden shadow-2xl max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase italic">GİZLİLİK</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">POLİTİKA VE ŞARTLAR</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors group"
          >
            <X className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {sections.map((section, idx) => (
            <div key={idx} className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <section.icon className="w-4 h-4 text-white/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[11px] font-black text-white/60 tracking-[0.2em] uppercase italic">{section.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </div>
          ))}

          <div className="p-6 rounded-[32px] bg-red-400/5 border border-red-400/10 flex items-start gap-4">
            <Trash2 className="w-5 h-5 text-red-400/60 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-black text-red-400/80 uppercase tracking-widest mb-1 italic">HESAP SİLMEME TALEBİ</h4>
              <p className="text-[11px] text-red-400/40 leading-relaxed font-medium">
                Oyun içindeki hesabınızı ve tüm verilerinizi silmek için ayarlardan çıkış yapıp bize e-posta gönderebilirsiniz. 24 saat içinde verileriniz kalıcı olarak temizlenir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white/[0.02] border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full h-16 rounded-2xl bg-white text-black font-black text-xs tracking-[0.3em] uppercase italic shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
          >
            ANLADIM
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
