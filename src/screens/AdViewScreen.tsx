import React, { useState, useEffect } from "react";
import { AdItem } from "../types";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

interface AdViewScreenProps {
  onNavigate: (route: string) => void;
  showToast: (msg: string) => void;
}

export const AdViewScreen: React.FC<AdViewScreenProps> = ({ onNavigate, showToast }) => {
  const [adKey, setAdKey] = useState<string>("");
  const [adData, setAdData] = useState<AdItem | null>(null);
  const [liveViews, setLiveViews] = useState<number>(0);
  const [liveClicks, setLiveClicks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Extract ad key query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyToCheck = params.get("key") || "";
    if (keyToCheck) {
      setAdKey(keyToCheck);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch target ad details and live statistics in real-time
  useEffect(() => {
    if (!adKey) return;

    setLoading(true);
    const adRef = ref(db, `ads/${adKey}`);
    const unsubscribeAd = onValue(adRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAdData({ key: adKey, ...data });
      } else {
        setAdData(null);
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    // Real-time counter streams
    const viewsRef = ref(db, `stats/adViews/${adKey}/total`);
    const unsubscribeViews = onValue(viewsRef, (s) => {
      setLiveViews(s.val() || 0);
    }, (err) => {
      console.warn("Views listener permission denial:", err);
    });

    const clicksRef = ref(db, `stats/adClicks/${adKey}/total`);
    const unsubscribeClicks = onValue(clicksRef, (s) => {
      setLiveClicks(s.val() || 0);
    }, (err) => {
      console.warn("Clicks listener permission denial:", err);
    });

    return () => {
      unsubscribeAd();
      unsubscribeViews();
      unsubscribeClicks();
    };
  }, [adKey]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("✓ تم نسخ الرابط بنجاح");
    });
  };

  const handleShareLink = () => {
    if (navigator.share && adData) {
      navigator.share({
        title: `${adData.adTitle} - كيمو أندرويد`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "غير محدد";
    return new Date(timestamp).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-neutral flex flex-col justify-center items-center gap-4 text-luxury-primary" dir="rtl">
        <svg className="animate-spin h-8 w-8 text-luxury-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-extrabold">جاري قراءة تفاصيل الإحصائيات...</span>
      </div>
    );
  }

  if (!adKey || !adData) {
    return (
      <div className="min-h-screen bg-luxury-neutral flex flex-col justify-center items-center p-6 text-center select-none" dir="rtl">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-3 font-fill">error</span>
        <h3 className="text-lg font-black text-luxury-dark mb-1">الإعلان غير عثور عليه</h3>
        <p className="text-xs text-luxury-muted max-w-[280px] leading-relaxed mb-6">
          لم يتم العثور على هذا الإعلان في قاعدة البيانات، ربما تم حذفه أو تغييره من قبل الإدارة.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="px-5 py-2.5 rounded-xl bg-luxury-primary text-luxury-neutral text-xs font-black hover:scale-103 transition duration-150"
        >
          العودة للمنصة الرسمية
        </button>
      </div>
    );
  }

  const now = Date.now();
  const isPermanent = !!adData.isPermanent;
  const isActive = adData.active && (isPermanent || adData.endTime > now);

  const totalDuration = isPermanent ? 0 : adData.endTime - adData.startTime;
  const usedDuration = isPermanent ? 0 : now - adData.startTime;
  const progressRatio = isPermanent ? 100 : Math.max(0, Math.min(100, Math.round((usedDuration / totalDuration) * 100)));

  const remainingHours = isPermanent ? 0 : Math.max(0, adData.endTime - now);
  const remHList = Math.floor(remainingHours / 3600000);
  const remMList = Math.floor((remainingHours % 3600000) / 60000);

  return (
    <div className="min-h-screen bg-luxury-neutral pb-24 text-luxury-dark animate-fade-in" dir="rtl">
      {/* Upper sub nav link */}
      <div className="bg-luxury-secondary/60 py-3.5 border-b border-luxury-gold/15 select-none">
        <div className="max-w-[480px] mx-auto px-4 flex justify-between items-center text-xs">
          <span className="font-black text-luxury-primary">إحصائيات الحملة الإعلانية</span>
          <button 
            onClick={() => onNavigate("home")} 
            className="flex items-center gap-1 text-luxury-muted hover:text-luxury-primary font-bold transition duration-150"
          >
            <span>المنصة الرئيسية</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      <main className="max-w-[480px] mx-auto px-4 mt-6">
        <div className="bg-luxury-secondary/45 border border-luxury-gold/15 rounded-3xl p-6 shadow-md relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-luxury-gold/5 blur-lg pointer-events-none" />

          {/* Ad Head Card */}
          <div className="text-center flex flex-col items-center mb-6">
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-luxury-primary to-[#2C1D07] flex items-center justify-center shadow-md border-2 border-luxury-gold/20 mb-3.5 animate-pulse">
              <span className="material-symbols-outlined text-luxury-gold text-3xl font-fill">campaign</span>
            </div>
            
            <h2 className="text-lg font-black text-luxury-dark mb-1">
              {adData.adTitle}
            </h2>
            <p className="text-xs text-luxury-gold font-extrabold mb-4">
              @{adData.username}
            </p>

            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600/10 text-emerald-800 border border-emerald-600/20 text-xs font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[ping_1.5s_infinite] block" />
                <span>نشط الآن</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-600/10 text-red-800 border border-red-600/20 text-xs font-black">
                <span>منتهي الصلاحية</span>
              </span>
            )}
          </div>

          {/* Dates & Time info collection list */}
          <div className="flex flex-col gap-3">
            {[
              { icon: "schedule", text: "تاريخ وبدء النشر", value: formatDate(adData.startTime), color: "text-luxury-primary" },
              { icon: "event", text: "تاريخ انتهاء الحملة", value: isPermanent ? "عرض دائم ومستمر" : formatDate(adData.endTime), color: "text-red-700" },
              { icon: "timer", text: "الفترة الزمنية الإجمالية", value: isPermanent ? "غير محددة (دائم)" : `${adData.hours} ساعة صالحة`, color: "text-luxury-primary" }
            ].map((d, idx) => (
              <div key={idx} className="p-3.5 bg-luxury-neutral/60 border border-luxury-gold/10 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-luxury-primary/10 select-none flex-shrink-0">
                  <span className={`material-symbols-outlined font-fill text-lg ${d.color}`}>{d.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] font-black text-luxury-muted mb-0.5">{d.text}</div>
                  <div className="text-xs font-black text-luxury-dark">{d.value}</div>
                </div>
              </div>
            ))}

            {/* Hours countdown remainder item */}
            {isActive && !isPermanent && (
              <div className="p-3.5 bg-luxury-neutral/60 border border-luxury-gold/10 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 select-none flex-shrink-0">
                  <span className="material-symbols-outlined font-fill text-lg text-amber-700">hourglass_bottom</span>
                </div>
                <div>
                  <div className="text-[10px] font-black text-luxury-muted mb-0.5">الوقت المتبقي لانتهاء الحملة</div>
                  <div className="text-xs font-black text-luxury-dark">{remHList} ساعة و {remMList} دقيقة</div>
                </div>
              </div>
            )}
          </div>

          {/* Core Analytics Figures Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6 mb-5">
            <div className="bg-luxury-primary/10 border border-luxury-primary/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black text-luxury-primary mb-1 select-none tabular-nums">
                {liveViews}
              </div>
              <div className="text-[10px] font-black text-luxury-primary/80">إجمالي المشاهدات</div>
            </div>

            <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black text-emerald-700 mb-1 select-none tabular-nums">
                {liveClicks}
              </div>
              <div className="text-[10px] font-black text-emerald-800/80">إجمالي النقرات</div>
            </div>
          </div>

          {/* Time progress bar index indicator */}
          {!isPermanent && (
            <div className="mt-4">
              <div className="flex justify-between items-center text-[10px] font-black text-luxury-muted mb-2">
                <span>مسار تقدم الإعلان</span>
                <span>{progressRatio}% منقضي</span>
              </div>
              <div className="w-full bg-luxury-gold/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    progressRatio >= 85 ? "bg-red-500" : progressRatio >= 60 ? "bg-amber-500" : "bg-gradient-to-r from-luxury-primary to-luxury-gold"
                  }`}
                  style={{ width: `${progressRatio}%` }}
                />
              </div>
            </div>
          )}

          {/* Share widgets */}
          <div className="flex gap-3 border-t border-luxury-gold/10 pt-5 mt-6">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-luxury-primary/10 text-luxury-primary border-2 border-luxury-primary/20 font-black text-xs hover:bg-luxury-primary hover:text-luxury-secondary transition duration-150 active:scale-98"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
              <span>نسخ الرابط</span>
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-bl from-luxury-primary to-[#2C1D07] text-luxury-neutral font-black text-xs shadow-md hover:scale-102 transition duration-150 active:scale-98"
            >
              <span className="material-symbols-outlined text-base font-fill">ios_share</span>
              <span>مشاركة الحملة</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdViewScreen;
