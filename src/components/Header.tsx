import React from "react";

interface HeaderProps {
  profilePic: string;
  onSearchToggle: () => void;
  onShare: () => void;
  onOpenPrivacy?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profilePic,
  onSearchToggle,
  onShare,
  onOpenPrivacy,
  onOpenAbout,
  onOpenContact
}) => {
  return (
    <header className="sticky top-0 z-40 bg-luxury-secondary/90 backdrop-blur-md border-b border-luxury-gold/20 shadow-sm">
      <div className="max-w-[490px] mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-luxury-gold shadow-md flex-shrink-0 animate-fade-in">
            <img 
              src={profilePic || "https://ui-avatars.com/api/?name=K&background=503b18&color=d4af37&size=80"} 
              alt="كيمو أندرويد" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-black text-lg bg-gradient-to-l from-luxury-primary to-luxury-gold bg-clip-text text-transparent">
            كيمو أندرويد
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {onOpenPrivacy && (
            <button 
              type="button"
              onClick={onOpenPrivacy}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-luxury-primary/10 text-luxury-primary hover:bg-[#503B18] hover:text-white transition duration-200 active:scale-95"
              title="سياسة الخصوصية"
            >
              <span className="material-symbols-outlined text-lg">policy</span>
            </button>
          )}
          {onOpenAbout && (
            <button 
              type="button"
              onClick={onOpenAbout}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-luxury-primary/10 text-luxury-primary hover:bg-[#503B18] hover:text-white transition duration-200 active:scale-95"
              title="من نحن"
            >
              <span className="material-symbols-outlined text-lg">info</span>
            </button>
          )}
          {onOpenContact && (
            <button 
              type="button"
              onClick={onOpenContact}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-luxury-primary/10 text-luxury-primary hover:bg-[#503B18] hover:text-white transition duration-200 active:scale-95"
              title="اتصل بنا"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
            </button>
          )}
          <button 
            type="button"
            onClick={onSearchToggle}
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-luxury-primary/10 text-luxury-primary hover:bg-[#503B18] hover:text-white transition duration-200 active:scale-95"
            title="بحث"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
          <button 
            type="button"
            onClick={onShare}
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-luxury-primary/10 text-luxury-primary hover:bg-[#503B18] hover:text-white transition duration-200 active:scale-95"
            title="مشاركة التطبيق"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
