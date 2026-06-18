import React from "react";
import { AppItem, CategoryDetail, CategoryKey } from "../types";

export const CATEGORIES: Record<CategoryKey, CategoryDetail> = {
  internet: { icon: "language", bg: "rgba(80,59,24,0.08)", color: "#503B18", fill: true, label: "إنترنت" },
  dev: { icon: "code", bg: "rgba(212,175,55,0.1)", color: "#B8860B", fill: false, label: "برمجة" },
  random: { icon: "casino", bg: "rgba(139,115,85,0.1)", color: "#8B7355", fill: true, label: "عشوائي" },
  apk: { icon: "package_2", bg: "rgba(141,110,99,0.12)", color: "#8D6E63", fill: true, label: "APK" },
  "": { icon: "help_center", bg: "rgba(180,83,9,0.1)", color: "#B45309", fill: true, label: "منوعة" }
};

interface AppsListProps {
  apps: AppItem[];
  targetedId?: string | null;
  onAppClick: (app: AppItem, categoryDetail: CategoryDetail) => void;
}

export const AppsList: React.FC<AppsListProps> = ({ apps, targetedId, onAppClick }) => {
  return (
    <div className="flex flex-col gap-3 py-2">
      {apps.map((app, index) => {
        const isNew = index < 3;
        const isTargeted = app.key === targetedId;
        const cat = CATEGORIES[app.category] || CATEGORIES[""];

        return (
          <div 
            key={app.key} 
            id={`app-${app.key}`} 
            className="flex flex-col"
          >
            {/* The Main Hoverable App Card */}
            <div 
              onClick={() => onAppClick(app, cat)}
              className={`relative z-10 flex items-center justify-between gap-4 p-4 rounded-3xl bg-luxury-secondary/40 hover:bg-luxury-secondary/75 border cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 ${
                isTargeted 
                  ? "border-luxury-gold ring-2 ring-luxury-gold/45 shadow-[0_8px_32px_rgba(212,175,55,0.22)]" 
                  : "border-luxury-gold/15 shadow-sm"
              }`}
            >
              {/* App Icon or Category Fallback */}
              <div 
                className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden border border-luxury-gold/10 bg-amber-50 shadow-sm"
              >
                {app.imageUrl ? (
                  <img
                    src={app.imageUrl}
                    alt={app.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${app.imageUrl ? "hidden" : "flex"}`}
                  style={{ backgroundColor: cat.bg }}
                >
                  <span 
                    className={`material-symbols-outlined text-xl ${cat.fill ? "font-fill" : ""}`}
                    style={{ color: cat.color }}
                  >
                    {cat.icon}
                  </span>
                </div>
              </div>

              {/* Title & Info tags */}
              <div className="flex-1 min-w-0 text-right">
                <h4 className="text-[13.5px] font-black text-luxury-dark mb-1.5 truncate">
                  {app.name}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-luxury-primary/10 text-luxury-primary border border-luxury-primary/15 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ✓ مجاني
                  </span>
                  <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-600/15 text-[10px] font-black px-2 py-0.5 rounded-full">
                    🔒 آمن
                  </span>
                  {isNew && (
                    <span className="bg-luxury-gold/15 text-luxury-primary border border-luxury-gold/25 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      🔥 جديد
                    </span>
                  )}
                </div>
              </div>

              {/* Angle sign button pointing left in RTL */}
              <span className="material-symbols-outlined text-luxury-gold/60 text-lg flex-shrink-0">
                chevron_left
              </span>
            </div>

            {/* Targeted Anchor Hovering Overlay */}
            {isTargeted && (
              <div className="relative mt-2 mb-4 mx-auto z-20 flex justify-center animate-[fade-in_0.4s_ease_0.8s_both]">
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-gradient-to-l from-luxury-primary to-luxury-gold text-luxury-neutral border-2 border-luxury-gold/30 shadow-[0_8px_24px_rgba(80,59,24,0.25)] select-none -rotate-2">
                  <span className="material-symbols-outlined text-sm font-fill">link</span>
                  <span className="text-[11px] font-black tracking-tight">هذا الرابط وجّهك مباشرة إلى هنا</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default AppsList;
