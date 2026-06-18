import React, { useState, useEffect } from "react";

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const n = new Date();
      // Format as "hh:mm:ss AP · Day dd Month yyyy" in Arabic
      try {
        const timeStr = n.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        const dateStr = n.toLocaleDateString("ar-EG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setCurrentTime(`${timeStr} · ${dateStr}`);
      } catch (e) {
        setCurrentTime(n.toLocaleString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-5 rounded-[24px] bg-gradient-to-br from-[#1b1509] via-[#2C1810] to-[#503B18] text-[#FDFBF7] border border-[rgba(212,175,55,0.25)] shadow-[0_16px_44px_rgba(80,59,24,0.22)] overflow-hidden select-none mb-4 animate-fade-in">
      {/* Background elegant circles */}
      <div className="absolute top-[-40px] left-[-40px] width-[140px] height-[140px] rounded-full bg-[rgba(212,175,55,0.15)] pointer-events-none" />

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          {/* Rotated Android Icon Container */}
          <div
            className="w-11 h-11 bg-[rgba(253,251,247,0.15)] border border-[rgba(253,251,247,0.25)] rounded-[14px] flex items-center justify-center text-[#FDFBF7]"
            style={{ transform: "rotate(-10deg)" }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M17.523 15.341c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm-11.046 0c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm11.41-6.585l1.67-2.892a.346.346 0 0 0-.126-.473.347.347 0 0 0-.474.126l-1.694 2.933A10.237 10.237 0 0 0 12 7.6a10.237 10.237 0 0 0-4.263.85L6.043 5.517a.347.347 0 0 0-.474-.126.346.346 0 0 0-.126.473l1.67 2.892C4.422 9.98 2.75 12.276 2.75 15h18.5c0-2.724-1.672-5.02-4.363-6.244z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-[#FDFBF7] tracking-wider">Kimo Android</h1>
            <p className="text-[10px] text-[rgba(253,251,247,0.70)] font-bold">لوحة الإدارة والمتاجر الكبرى</p>
          </div>
        </div>

        {/* Beautiful Logout Buttons */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-full bg-[rgba(253,251,247,0.15)] border border-[rgba(253,251,247,0.25)] text-[#FDFBF7] cursor-pointer transition hover:bg-[rgba(253,251,247,0.28)]"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>خروج</span>
        </button>
      </div>

      <div className="border-t border-[rgba(253,251,247,0.12)] pt-3.5 mt-3.5 text-[11px] font-bold text-[rgba(253,251,247,0.60)]">
        {currentTime}
      </div>
    </div>
  );
};
