
import React, { useState } from 'react';

interface TermsModalProps {
  onAccept: () => void;
}

type ViewState = 'main' | 'terms' | 'privacy';

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  const [view, setView] = useState<ViewState>('main');

  const termsOfService = [
    "Geçit erişimi ve kullanımı tamamen kişisel kullanım içindir.",
    "Yazılımın tersine mühendislik yoluyla kopyalanması kesinlikle yasaktır.",
    "Kullanıcı verileri Lumina güvenlik protokolleri çerçevesinde saklanır.",
    "Hile veya manipülasyon kullanımı geçit erişiminin kalıcı olarak kesilmesine neden olur.",
    "Uygulama içi satın alımlar dijital içerik kapsamındadır ve iade edilemez.",
    "Lumina, hizmet kalitesini artırmak için güncellemeleri otomatik uygular.",
    "Geçit platformu kullanımı için minimum yaş sınırı 13 olarak belirlenmiştir.",
    "Sunucu kaynaklı geçici kesintilerden Lumina platformu sorumlu tutulamaz.",
    "Kullanıcı hesabı ve şifre güvenliğinin sağlanması kullanıcının sorumluluğundadır.",
    "Hizmet koşulları önceden haber verilmeksizin Lumina tarafından güncellenebilir."
  ];

  const privacyPolicy = [
    "Verileriniz KVKK standartlarına uygun olarak şifrelenmiş halde işlenir.",
    "Konum verileri sadece yerel geçit sıralamaları için opsiyonel kullanılır.",
    "Oyun içi istatistikler anonim olarak performans iyileştirme amaçlı toplanır.",
    "Kullanıcı verileri üçüncü taraf şahıslarla asla ticari amaçla paylaşılmaz.",
    "Kullanıcıların verilerine erişim, düzeltme ve silme hakları saklıdır.",
    "Reklam deneyimini iyileştirmek için temel cihaz kimliği bilgileri kullanılır.",
    "Ödeme işlemleri yüksek güvenlikli dış altyapılar üzerinden gerçekleştirilir.",
    "Geçit oturum yönetimi için gerekli teknik çerezler kullanılmaktadır.",
    "Olası veri ihlali durumlarında kullanıcılar 72 saat içinde bilgilendirilir.",
    "Veri saklama süresi, kullanıcı hesabı aktif olduğu sürece devam eder."
  ];

  const renderMainView = () => (
    <div className="flex flex-col items-center w-full animate-[popIn_0.3s_ease-out]">
      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border-[0.5px] border-white/20 shadow-2xl backdrop-blur-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>

      <h2 className="text-3xl font-[900] text-white mb-2 tracking-tighter uppercase text-center opacity-90">YASAL PROSEDÜR</h2>
      <p className="text-white/20 text-[9px] font-[900] tracking-[0.4em] uppercase mb-10">LUMINA GEÇİT PROTOKOLLERİ</p>

      <div className="w-full space-y-4 mb-12">
        <button 
          onClick={() => setView('terms')}
          className="w-full p-6 bg-white/5 border-[0.5px] border-white/10 rounded-[28px] flex items-center justify-between group active:scale-95 transition-all backdrop-blur-xl"
        >
          <span className="text-white/60 font-[900] text-xs tracking-widest uppercase">Hizmet Koşulları</span>
          <span className="text-white/20 font-black text-lg group-hover:translate-x-1 transition-transform">➔</span>
        </button>

        <button 
          onClick={() => setView('privacy')}
          className="w-full p-6 bg-white/5 border-[0.5px] border-white/10 rounded-[28px] flex items-center justify-between group active:scale-95 transition-all backdrop-blur-xl"
        >
          <span className="text-white/60 font-[900] text-xs tracking-widest uppercase">Aydınlatma Metni</span>
          <span className="text-white/20 font-black text-lg group-hover:translate-x-1 transition-transform">➔</span>
        </button>
      </div>

      <button 
        onClick={onAccept}
        className="w-full py-6 bg-white text-[#0f172a] font-[900] uppercase tracking-[0.2em] text-sm rounded-[32px] active:scale-95 transition-all shadow-2xl relative overflow-hidden group"
      >
        KABUL EDİYORUM
      </button>
    </div>
  );

  const renderListView = (title: string, items: string[], accentColor: string) => (
    <div className="flex flex-col w-full h-full animate-[slideIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <button 
          onClick={() => setView('main')}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform backdrop-blur-xl"
        >
          <span className="text-white opacity-40 text-xl">←</span>
        </button>
        <h3 className="text-white font-[900] text-[11px] tracking-[0.4em] uppercase opacity-60">{title}</h3>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-8">
        {items.map((text, i) => (
          <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <span className={`font-black text-[12px] opacity-40`} style={{ color: accentColor }}>{String(i + 1).padStart(2, '0')}</span>
            <p className="text-white/40 text-[10px] leading-relaxed font-[500]">{text}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setView('main')}
        className="w-full py-5 bg-white/5 text-white/40 font-[900] uppercase tracking-[0.2em] text-xs rounded-2xl border border-white/10 active:scale-95 transition-all backdrop-blur-xl"
      >
        GERİ DÖN
      </button>
    </div>
  );

  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 bg-transparent backdrop-blur-xl">
      <div className="bg-gradient-to-b from-white/10 to-transparent border-[0.5px] border-white/20 backdrop-blur-3xl rounded-[48px] p-10 w-full max-w-sm h-[640px] shadow-2xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {view === 'main' && renderMainView()}
        {view === 'terms' && renderListView("Hizmet Koşulları", termsOfService, "#ffffff")}
        {view === 'privacy' && renderListView("Aydınlatma Metni", privacyPolicy, "#ffffff")}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
