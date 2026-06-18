import React from "react";
import { AppItem, CategoryDetail } from "../types";

interface AppDetailModalProps {
  app: AppItem | null;
  categoryDetail: CategoryDetail | null;
  isOpen: boolean;
  tutorialLink?: string;
  onClose: () => void;
  onShare: (app: AppItem) => void;
  onDownload: (app: AppItem) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  categoryDetail,
  isOpen,
  tutorialLink = "",
  onClose,
  onShare,
  onDownload
}) => {
  if (!isOpen || !app || !categoryDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-dark/60 backdrop-blur-sm transition-all duration-300">
      {/* Click outside to close overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Sheet panel */}
      <div className="relative w-full max-w-[380px] bg-luxury-neutral border border-luxury-gold/25 rounded-3xl p-6 shadow-2xl animate-[fadeScaleIn_0.3s_cubic-bezier(.17,.67,.24,1.18)] text-center">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center w-full absolute top-4 left-0 right-0 px-5">
          {/* Close button on left */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-luxury-primary/5 text-luxury-primary border border-luxury-gold/15 hover:bg-luxury-primary hover:text-luxury-secondary transition duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
          
          {/* Share button on right */}
          <button
            type="button"
            onClick={() => onShare(app)}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-luxury-primary/5 text-luxury-primary border border-luxury-gold/15 hover:bg-luxury-primary hover:text-luxury-secondary transition duration-150 active:scale-95"
            title="مشاركة التطبيق"
          >
            <span className="material-symbols-outlined text-base">ios_share</span>
          </button>
        </div>

        {/* Category Graphic emblem */}
        <div 
          className="w-[72px] h-[72px] rounded-3xl mx-auto mt-6 mb-4 flex items-center justify-center shadow-md border-2 border-luxury-gold/20"
          style={{ backgroundColor: categoryDetail.bg }}
        >
          <span 
            className={`material-symbols-outlined text-4xl ${categoryDetail.fill ? "font-fill" : ""}`}
            style={{ color: categoryDetail.color }}
          >
            {categoryDetail.icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[17px] font-black text-luxury-dark leading-snug mb-1">
          {app.name}
        </h3>
        
        <p className="text-[11px] font-black text-luxury-gold tracking-wide uppercase mb-6 flex items-center justify-center gap-1 opacity-80">
          <span>• مجاني</span>
          <span>• رابط فوري</span>
          <span>• آمن ومحمي</span>
        </p>

        {/* Buttons Action Wrapper */}
        <div className="flex flex-col gap-3.5">
          {/* Secure Download trigger button */}
          <button
            type="button"
            onClick={() => onDownload(app)}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-luxury-primary to-[#2F210C] text-luxury-neutral font-black text-base shadow-[0_8px_24px_rgba(80,59,24,0.3)] hover:scale-[1.01] active:translate-y-0.5 active:shadow-[0_4px_12px_rgba(80,59,24,0.3)] transition-all duration-150"
          >
            <span className="material-symbols-outlined text-lg font-fill">download</span>
            <span>تحميل التطبيق</span>
          </button>

          {/* Download Guide Video tutorial link */}
          {tutorialLink && tutorialLink !== "#" && (
            <a
              href={tutorialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-luxury-primary/5 text-luxury-primary border-2 border-luxury-primary/20 font-black text-[14px] hover:bg-luxury-primary hover:text-luxury-secondary transition duration-150 active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg font-fill">play_circle</span>
              <span>شرح طريقة التحميل</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
export default AppDetailModal;
