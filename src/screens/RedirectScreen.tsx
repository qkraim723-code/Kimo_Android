import React, { useState, useEffect, useRef } from "react";
import { AppItem, AdItem, AdUnits } from "../types";
import { db } from "../firebase";
import { ref, runTransaction, onValue, push } from "firebase/database";
import { AdShell } from "../components/AdShell";
import { CATEGORIES } from "../components/AppsList";
import { Shield, Sparkles, Send, Copy, AlertCircle, CheckCircle2, ChevronRight, Download, Eye, FileText, Globe, HelpCircle, Lock, Mail, Users, Smartphone } from "lucide-react";
import { encryptLink, decryptLink } from "../utils/crypto";

interface RedirectScreenProps {
  apps: AppItem[];
  ads: AdItem[];
  adUnits?: AdUnits;
  redirectTimeout?: boolean;
  telegramLink?: string;
  onNavigate: (route: string, queryParams?: Record<string, string>) => void;
  showToast: (msg: string) => void;
}

export const RedirectScreen: React.FC<RedirectScreenProps> = ({
  apps = [],
  ads,
  adUnits = {} as AdUnits,
  redirectTimeout = true,
  telegramLink = "#",
  onNavigate,
  showToast
}) => {
  const [appId, setAppId] = useState<string>("");
  const [appUrl, setAppUrl] = useState<string>("");
  const [appName, setAppName] = useState<string>("تطبيق كيمو أندرويد");
  const [appImageUrl, setAppImageUrl] = useState<string>("");
  const [mainImageFailed, setMainImageFailed] = useState<boolean>(false);

  const [paused, setPaused] = useState<boolean>(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(15);
  const [topTimeLeft, setTopTimeLeft] = useState<number>(15);
  const [topTimeFinished, setTopTimeFinished] = useState<boolean>(false);

  // Second Stage progress states
  const [secondTimeLeft, setSecondTimeLeft] = useState<number>(7);
  const [secondStageActive, setSecondStageActive] = useState<boolean>(false);
  const [secondStageDone, setSecondStageDone] = useState<boolean>(false);

  // Modal / Legal Screens active overlays
  const [activeOverlay, setActiveOverlay] = useState<"none" | "privacy" | "terms" | "about" | "contact">("none");

  // Contact Form states
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [adViewCounted, setAdViewCounted] = useState<boolean>(false);
  const [adClickCounted, setAdClickCounted] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const bottomSectionRef = useRef<HTMLDivElement>(null);

  // Guarantee page starts at the very top (scrolled to top on mount)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch URL queries on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToCheck = params.get("url") || "";
    const nameToCheck = params.get("name") || "";
    const idToCheck = params.get("id") || "";
    const imgToCheck = params.get("img") || "";

    if (idToCheck) setAppId(idToCheck);
    if (urlToCheck) setAppUrl(decryptLink(decodeURIComponent(urlToCheck)));
    if (nameToCheck) setAppName(decodeURIComponent(nameToCheck));
    if (imgToCheck) setAppImageUrl(decodeURIComponent(imgToCheck));
  }, []);

  // Resolve matching application
  const currentApp = apps.find((a) => a.key === appId) || {
    key: appId || "custom-link",
    name: appName || "ملف كيمو أندرويد",
    description: "قم بتحميل البرنامج وتثبيته للاستفادة من الميزات المتقدمة وتطبيقات الأندرويد لعام 2026 الحصرية والمطورة.",
    imageUrl: appImageUrl || "",
    category: "apk",
  };

  // Reset image status when current app or image URL changes
  useEffect(() => {
    setMainImageFailed(false);
  }, [currentApp.imageUrl, appImageUrl]);

  // Sync window title with application details
  useEffect(() => {
    document.title = `${currentApp.name} | محطة التحميل الآمن لكيمو أندرويد`;
  }, [currentApp.name]);

  // Tab focus tracking
  useEffect(() => {
    const handleVisibility = () => {
      const isHidden = document.hidden;
      setPaused(isHidden);
      if (isHidden && secondStageActive && !secondStageDone) {
        showToast("⏸️ تم الإيقاف المؤقت! يرجى العودة للصفحة لإتمام تدفق الرابط");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [secondStageActive, secondStageDone]);

  // Fetch the timer settings from RTDB dynamically
  useEffect(() => {
    const unsub = onValue(ref(db, "settings/timer"), (snapshot) => {
      const val = snapshot.val() || {};
      const enabled = val.enabled !== false;
      const duration = parseInt(val.duration) || 15;

      setTimerEnabled(enabled);
      setTimerDuration(duration);
      setTopTimeLeft(duration);

      if (!enabled || redirectTimeout === false) {
        setTopTimeFinished(true);
        setSecondStageDone(true);
      }
    }, (err) => {
      console.warn("Timer listener permission error:", err);
    });
    return () => unsub();
  }, [redirectTimeout]);

  // Top countdown tick listener
  useEffect(() => {
    if (!timerEnabled || topTimeFinished || paused) return;
    if (topTimeLeft <= 0) {
      setTopTimeFinished(true);
      showToast("✨ تم تجهيز معبر الانتقال بنجاح! تفضل بالضغط للذهاب للتحميل.");
      return;
    }

    const timer = setTimeout(() => {
      setTopTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [topTimeLeft, timerEnabled, topTimeFinished, paused]);

  // Dual edges meeting-in-center progress calculations (for 7-second cooldown)
  useEffect(() => {
    if (!secondStageActive || secondStageDone || paused) return;
    if (secondTimeLeft <= 0) {
      setSecondStageDone(true);
      showToast("✨ تم تهيئة ومعاينة رصيد الرابط المباشر النهائي!");
      return;
    }

    const timer = setTimeout(() => {
      setSecondTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondTimeLeft, secondStageActive, secondStageDone, paused]);

  // Ad selection mechanism
  const getSelectedAd = (): AdItem | null => {
    const now = Date.now();
    const activeAds = ads.filter((ad) => ad.active && (ad.isPermanent || ad.endTime > now));
    if (!activeAds.length) return null;

    const lastAdKey = localStorage.getItem("kimo_last_ad_key") || "";
    let pool = activeAds;
    if (activeAds.length > 1 && lastAdKey) {
      const filtered = activeAds.filter((ad) => ad.key !== lastAdKey);
      if (filtered.length) pool = filtered;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const adSelected = pool[randomIndex];
    try {
      localStorage.setItem("kimo_last_ad_key", adSelected.key);
    } catch {}
    return adSelected;
  };

  const currentRedirectAd = getSelectedAd();

  const handleAdClick = (ad: AdItem) => {
    if (adClickCounted) return;
    setAdClickCounted(true);
    const today = new Date().toISOString().split("T")[0];
    runTransaction(ref(db, `stats/adClicks/${ad.key}/total`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/adClicks/${ad.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});
  };

  const trackAdViewOnce = (ad: AdItem) => {
    if (adViewCounted) return;
    setAdViewCounted(true);
    const today = new Date().toISOString().split("T")[0];
    runTransaction(ref(db, `stats/adViews/${ad.key}/total`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/adViews/${ad.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});
  };

  useEffect(() => {
    if (currentRedirectAd) {
      trackAdViewOnce(currentRedirectAd);
    }
  }, [currentRedirectAd?.key]);

  // Execute Final Direct Download Redirection
  const executeFinalDownload = () => {
    const finalUrl = appUrl || currentApp.link;
    if (!finalUrl) {
      showToast("خطأ: رابط التحميل النهائي غير متوفر حالياً");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // DB increments for statistics
    runTransaction(ref(db, "stats/total_downloads"), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/daily/${today}/downloads`), (c) => (c || 0) + 1).catch(() => {});
    if (currentApp.key) {
      runTransaction(ref(db, `stats/appDownloads/${currentApp.key}/total`), (c) => (c || 0) + 1).catch(() => {});
      runTransaction(ref(db, `stats/appDownloads/${currentApp.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});
    }

    showToast("🚀 جاري توجيهك الآن للملف المباشر فائق السرعة...");
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 850);
  };

  // Trigger smooth scroll and transition to the second bottom progress stage
  const handleTransitionToBottom = () => {
    setSecondStageActive(true);
    showToast("🔽 جاري الانتقال لتحضير ملف التحميل الآمن...");
    setTimeout(() => {
      if (bottomSectionRef.current) {
        bottomSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  // Submit contact message ticket to real-time database (mocked as requested)
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast("يرجى ملء جميع الحقول المطلوبة للمتابعة");
      return;
    }

    setContactStatus("submitting");
    setTimeout(() => {
      setContactStatus("success");
      showToast("✓ تم إرسال تذكرتك بنجاح وبسرية تامة");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setTimeout(() => setContactStatus("idle"), 4000);
    }, 400);
  };

  // Edge-growing dual progress calculation (each side meets at 50% in the center)
  // secondTimeLeft counts down from 7 to 0
  const elapsed = 7 - secondTimeLeft;
  const growthPercentHalf = Math.min(50, Math.round((elapsed / 7) * 50));

  // Suggested app items filtering out currently parsed ID
  const suggestedApps = apps.filter((a) => a.key !== currentApp.key).slice(0, 3);

  return (
    <div className="min-h-screen bg-luxury-neutral pb-32 text-luxury-dark animate-fade-in text-right font-sans" dir="rtl">
      
      {/* Return Header menu */}
      <div className="bg-luxury-secondary/80 py-3 border-b border-luxury-gold/15 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[480px] mx-auto px-4 flex justify-between items-center text-xs select-none">
          <span className="font-black text-luxury-primary flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="material-symbols-outlined text-sm text-[#D4AF37] font-fill">verified_user</span>
            <span> {currentApp.name}</span>
          </span>
          <button 
            type="button"
            onClick={() => onNavigate("home")} 
            className="flex items-center gap-1 text-luxury-muted hover:text-luxury-primary font-black transition duration-150 cursor-pointer"
          >
            <span>الصفحة الرئيسية</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 mt-4">
        
        {/* Banner sponsorship (Ad Unit 1) */}
        {adUnits?.unit1?.active && (
          <div className="mb-5">
            <AdShell 
              label="إشهار مميز برعاية كيمو أندرويد"
              adCode={adUnits.unit1.code}
              telegramLink={telegramLink}
              position="top"
            />
          </div>
        )}

        {/* Dynamic App Center Profile Card */}
        <div className="bg-white border border-luxury-gold/15 rounded-3xl p-6 shadow-md relative overflow-hidden mt-3">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Visual Icon/Graphic frame */}
            {(currentApp.imageUrl || appImageUrl) && !mainImageFailed ? (
              <img
                src={currentApp.imageUrl || appImageUrl}
                alt={currentApp.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-luxury-gold shadow-md bg-amber-50"
                onError={() => {
                  setMainImageFailed(true);
                }}
              />
            ) : (
              (() => {
                const currentAppCat = CATEGORIES[currentApp.category as any] || CATEGORIES[""];
                return (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative border-2 border-luxury-gold/50"
                    style={{ backgroundColor: currentAppCat.bg }}
                  >
                    <span 
                      className={`material-symbols-outlined text-4xl ${currentAppCat.fill ? "font-fill" : ""}`}
                      style={{ color: currentAppCat.color }}
                    >
                      {currentAppCat.icon}
                    </span>
                    <div className="absolute inset-0 bg-white/5 rounded-2xl" />
                  </div>
                );
              })()
            )}

            {/* Top timer ad unit (Ad Unit 2) positioned exactly above the timer countdown */}
            {adUnits?.unit2?.active && (
              <div className="w-full my-3">
                <AdShell 
                  label="إعلان مميز (فوق التايمر) - برعاية كيمو أندرويد"
                  adCode={adUnits.unit2.code}
                  telegramLink={telegramLink}
                  position="top"
                />
              </div>
            )}

            {/* ──── DYNAMIC CENTERPIECE ACTION WORKFLOW (COUNTDOWN -> TRANSITION / DOWNLOAD) ──── */}
            {timerEnabled ? (
              /* If Timer is Active */
              !topTimeFinished ? (
                /* Countdown stage */
                <div className="w-full bg-[#503B18]/5 border-2 border-luxury-gold/25 p-4 rounded-2xl flex flex-col items-center gap-2 text-center animate-pulse max-w-sm">
                  <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-luxury-gold/10">
                    <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/25 border-t-[#503B18] animate-spin" />
                    <span className="text-xs font-black text-luxury-primary font-mono">{topTimeLeft}</span>
                  </div>
                  <div className="select-none">
                    <div className="text-[11.5px] font-black text-[#503B18]">جاري تجهيز وتحضير رابط التحميل الخاص بك...</div>
                    <div className="text-[9.5px] text-luxury-muted font-black mt-0.5">يرجى الانتظار، متبقي {topTimeLeft} ثانية لفتح الرابط</div>
                  </div>
                </div>
              ) : (
                /* Finished countdown -> Transition button replaces the countdown (SMALLER, SLEEK LUXURY DESIGN) */
                <div className="w-full flex flex-col items-center gap-2 max-w-sm">
                  <button
                    type="button"
                    onClick={handleTransitionToBottom}
                    className="px-6 py-2.5 rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#503B18] via-[#8c6d3b] to-[#503B18] text-[#FDFBF7] font-black text-[11px] hover:scale-[1.01] active:scale-[0.99] shadow-md duration-200 transition-all cursor-pointer animate-fade-in font-sans border border-[#D4AF37]/30"
                  >
                    <span>انقر هنا للذهاب للتحميل فورا</span>
                    <span className="material-symbols-outlined text-[14px] font-fill animate-bounce">expand_more</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-center mt-1">
                    <span className="material-symbols-outlined text-[12px] text-amber-600 font-fill">check_circle</span>
                    <span className="text-[9.5px] font-black text-amber-800">اكتمل تحضير معبر الكبسولة بنجاح!</span>
                  </div>
                </div>
              )
            ) : (
              /* If Timer is Disabled -> Instant Direct Download */
              <div className="w-full max-w-sm">
                <button
                  type="button"
                  onClick={executeFinalDownload}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 bg-gradient-to-r from-luxury-primary to-luxury-gold text-luxury-neutral font-black text-xs shadow-[0_8px_24px_rgba(80,59,24,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>تحميل مباشر مجاني وفوري (سريع وآمن)</span>
                </button>
              </div>
            )}

            <div>
              <h1 className="text-base font-black text-luxury-primary mt-1 tracking-tight leading-tight">
                {currentApp.name}
              </h1>
              <p className="text-[11px] text-[#A68F6C] font-mono mt-1 font-extrabold select-all">
                ID Reference: {currentApp.key}
              </p>
            </div>

            {/* Dynamic descriptions container height adapted to output length with rich breaks */}
            <div className="w-full bg-[rgba(80,59,24,0.03)] border border-luxury-gold/10 rounded-2xl p-4 text-[11.5px] font-bold text-luxury-dark/95 leading-relaxed text-right whitespace-pre-line">
              {currentApp.description || "لا يوجد وصف مدعوم لهذا التطبيق، لكن تم التحقق من سلامته وملائمته بنسبة 100% للتنزيل الفوري."}
            </div>

            {/* Technical specs table matching user layouts (only creator & security protocol) */}
            <div className="w-full bg-white/40 border border-luxury-gold/10 rounded-2xl p-4 text-xs flex flex-col gap-2.5">
              <div className="flex justify-between items-center py-1 border-b border-luxury-gold/5">
                <span className="font-extrabold text-luxury-muted">المنشئ والمطور</span>
                <span className="font-black text-luxury-primary">كيمو أندرويد</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-extrabold text-luxury-muted">مستوى بروتوكولات الأمان</span>
                <span className="font-black text-emerald-800 flex items-center gap-1">
                  <Shield size={11} className="fill-emerald-800" />
                  <span>فحص آمن ومطابق 100%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mid banner (Ad Unit 3) */}
        {adUnits?.unit3?.active && (
          <div className="my-5">
            <AdShell 
              label="إعلان برعاية كيمو أندرويد"
              adCode={adUnits.unit3.code}
              telegramLink={telegramLink}
              position="middle"
            />
          </div>
        )}

        {/* BOTTOM ACTIVE PROGRESS CONTAINER (REVEALED AND ONLY RENDERED WHEN CLILCKING "GO TO LINK" ON TIMER BOOT) */}
        {timerEnabled && secondStageActive && (
          <div 
            id="bottom-countdown-progress"
            ref={bottomSectionRef}
            className="bg-white border border-luxury-gold rounded-3xl p-5 shadow-xl md:shadow-2xl transition-all duration-300 ring-2 ring-luxury-gold/20 scale-100 opacity-100"
          >
            {/* Card header label */}
            <div className="flex justify-between items-center pb-2 border-b border-luxury-gold/10 mb-4 select-none">
              <span className="text-[10px] font-black text-luxury-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">download_done</span>
                <span>بناء وتوليد كبسولة التحميل المباشر</span>
              </span>
            </div>

            {!secondStageDone ? (
              /* PROGRESS CONTAINER FILLING FROM THE CENTER OUTWARDS */
              <div className="py-4 flex flex-col justify-center items-center gap-4 animate-fade-in text-center relative w-full">
                
                {/* Outward progress bar grow logic (starts at center 50% and fills sides) */}
                <div className="w-full mt-2 relative">
                  <div className="w-full bg-[#503B18]/10 h-5 rounded-full relative overflow-hidden select-none flex justify-center items-center">
                    
                    {/* Centered bar growing outwards to both sides */}
                    <div 
                      className="absolute h-full bg-gradient-to-r from-[#503B18] via-[#D4AF37] to-[#503B18] rounded-full shadow-md transition-all duration-300 ease-out" 
                      style={{ width: `${(elapsed / 7) * 100}%` }} 
                    />
                    
                    {/* Floating percentage progress indicator inside */}
                    <span className="absolute z-10 text-[9px] font-black text-white mix-blend-difference font-mono">
                      {Math.round((elapsed / 7) * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-black text-[#A68F6C] mt-2 select-none">
                    <span>مركز التحضير</span>
                    <span className="text-[9.5px] text-[#503B18] px-2 py-0.5 rounded-full bg-amber-500/5 border border-amber-500/10">جاري طبخ وتوليد الرابط الآمن...</span>
                    <span>تفريع الحواف</span>
                  </div>
                </div>

                {/* Signature / Copy block beneath loading bar as requested */}
                <div className="text-center text-[10px] text-luxury-muted font-bold select-none mt-2">
                  جميع الحقوق محفوظة لدى كيمو أندرويد
                </div>

              </div>
            ) : (
              /* DOWNLOAD CAP ACTION READY */
              <div className="py-2 flex flex-col gap-3.5 text-center animate-fade-in max-w-full">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-800">اكتمل التجهيز ومصادقة الملف!</h4>
                  <p className="text-[10px] text-luxury-muted font-bold mt-1">اضغط على الزر الذهبي لبدء التنزيل المباشر كليا.</p>
                </div>

                <div className="flex flex-col gap-2.5 mt-1 select-none">
                  <button
                    type="button"
                    onClick={executeFinalDownload}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-luxury-primary to-luxury-gold text-luxury-neutral font-black text-[12px] shadow-[0_8px_20px_rgba(80,59,24,0.25)] hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>اضغط لبدء التحميل النهائي الآن</span>
                  </button>
                  <button
                    type="button"
                    onClick={executeFinalDownload}
                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 bg-[#2F210C] text-luxury-gold border border-luxury-gold/15 font-black text-[10.5px] hover:bg-luxury-primary hover:text-luxury-neutral transition cursor-pointer"
                  >
                    <span>رابط تنزيل احتياطي ثانوي</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestion block of other apps - beautifully redesigned with robust fallback */}
        {suggestedApps.length > 0 && (
          <div className="mt-8 select-none bg-gradient-to-b from-white to-luxury-secondary/15 border border-luxury-gold/15 rounded-3xl p-5 shadow-md">
            <h4 className="text-xs font-black text-luxury-primary flex items-center gap-2 border-b border-luxury-gold/10 pb-3 mb-4">
              <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
              <span>قد يعجبك أيضاً: تطبيقات مجانية مميزة من كيمو أندرويد</span>
            </h4>
            
            <div className="flex flex-col gap-3">
              {suggestedApps.map((item) => {
                const hasFailedImg = failedImages[item.key] || !item.imageUrl;
                const itemCat = CATEGORIES[item.category] || CATEGORIES[""];

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      onNavigate("redirect", {
                        id: item.key,
                        name: encodeURIComponent(item.name),
                        url: encodeURIComponent(encryptLink(item.link)),
                        img: encodeURIComponent(item.imageUrl || "")
                      });
                    }}
                    className="bg-[#FDFBF7]/80 hover:bg-white border border-luxury-gold/10 hover:border-luxury-gold/40 shadow-xs hover:shadow-md rounded-2xl p-3 cursor-pointer flex items-center justify-between gap-4 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* App Image or Fallback */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-luxury-gold/15 bg-amber-50/50 flex items-center justify-center shrink-0 shadow-inner relative">
                        {!hasFailedImg ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={() => {
                              setFailedImages(prev => ({ ...prev, [item.key]: true }));
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: itemCat.bg }}
                          >
                            <span 
                              className={`material-symbols-outlined text-xl ${itemCat.fill ? "font-fill" : ""}`}
                              style={{ color: itemCat.color }}
                            >
                              {itemCat.icon}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* App Meta */}
                      <div className="min-w-0 text-right">
                        <span className="text-[11.5px] font-black text-luxury-primary block truncate mb-1">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-black text-emerald-800 bg-emerald-50 border border-emerald-500/10 rounded-full px-2 py-0.5">
                            تنزيل آمن
                          </span>
                          <span className="text-[8px] font-black text-[#A68F6C] bg-amber-50 border border-[#A68F6C]/10 rounded-full px-2 py-0.5">
                            تم الفحص الموثق
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Left Button call-to-action */}
                    <div className="shrink-0">
                      <div className="text-[9.5px] font-black text-[#503B18] bg-[rgba(80,59,24,0.06)] hover:bg-[#503B18] hover:text-[#FDFBF7] px-3.5 py-2 rounded-xl border border-[rgba(80,59,24,0.1)] transition duration-200">
                        تحميل مجاني
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info (Ad Unit 3) */}
        {adUnits?.unit3?.active && (
          <div className="mt-6">
            <AdShell 
              label="رعاية سفلي برعاية كيمو أندرويد"
              adCode={adUnits.unit3.code}
              telegramLink={telegramLink}
              position="bottom"
            />
          </div>
        )}

        {/* Floating social bar ad (Ad Unit 4) */}
        {adUnits?.unit4?.active && (
          <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 z-40 max-w-[340px] bg-luxury-[#FFFDF9]/95 border-2 border-luxury-gold/35 rounded-2xl p-4 shadow-2xl animate-[fadeScaleIn_0.3s_ease-out] text-right">
            <div className="flex justify-between items-center mb-2 border-b border-luxury-gold/15 pb-1 select-none">
              <span className="text-[10px] font-black text-luxury-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-luxury-gold font-fill">campaign</span>
                <span>إعلان هام برعاية المطور</span>
              </span>
              <button 
                onClick={(e) => {
                  const parent = (e.target as HTMLElement).closest(".fixed");
                  if (parent) parent.remove();
                }}
                className="text-luxury-primary hover:text-red-500 transition duration-150"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
            {adUnits.unit4.code ? (
              <div dangerouslySetInnerHTML={{ __html: adUnits.unit4.code }} className="overflow-y-auto max-h-[140px] text-xs font-semibold" />
            ) : (
              <div className="text-xs font-bold text-luxury-muted">
                مساحة ترويجية معلنة للتواصل.
              </div>
            )}
          </div>
        )}

      </div>

      {/* STATIC POLISHED PRIVACY FOOTER ROUTING */}
      <footer className="mt-16 py-6 border-t border-luxury-gold/15 select-none text-center">
        <div className="max-w-[480px] mx-auto px-4">
          <div className="flex justify-center items-center gap-4 flex-wrap text-[10.5px] font-extrabold text-luxury-muted">
            <button onClick={() => setActiveOverlay("privacy")} className="hover:text-luxury-primary cursor-pointer transition">سياسة الخصوصية</button>
            <span className="text-luxury-gold/30">•</span>
            <button onClick={() => setActiveOverlay("terms")} className="hover:text-luxury-primary cursor-pointer transition">شروط الاستخدام</button>
            <span className="text-luxury-gold/30">•</span>
            <button onClick={() => setActiveOverlay("about")} className="hover:text-luxury-primary cursor-pointer transition">من نحن</button>
            <span className="text-luxury-gold/30">•</span>
            <button onClick={() => setActiveOverlay("contact")} className="hover:text-luxury-primary cursor-pointer transition">اتصل بنا</button>
          </div>
          <p className="text-[9.5px] font-black text-luxury-muted/75 mt-3 leading-relaxed">
            كبائن التحويل المباشر لعام 2026 مبرمجة سحابياً لتوصيل فوري كلياً. جميع الحقوق والملكية محفوظة لدى كيمو أندرويد.
          </p>
        </div>
      </footer>

      {/* ──── OVERLAY WIDGET DIALOGS MODALS (ABOUT, PRIVACY, TERMS, CONTACT) ──── */}
      {activeOverlay !== "none" && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF9] border-2 border-luxury-gold/25 rounded-[30px] w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-4 text-right animate-[fadeScaleIn_0.25s_ease-out]">
            
            {/* Header overlay */}
            <div className="flex justify-between items-center select-none pb-2 border-b border-luxury-gold/10">
              <h4 className="text-xs font-black text-luxury-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm font-fill text-luxury-gold">
                  {activeOverlay === "privacy" && "gavel"}
                  {activeOverlay === "terms" && "rule"}
                  {activeOverlay === "about" && "info"}
                  {activeOverlay === "contact" && "contact_mail"}
                </span>
                <span>
                  {activeOverlay === "privacy" && "وثيقة سياسة الخصوصية للمستقبل المعولم"}
                  {activeOverlay === "terms" && "اتفاقية ومصطلحات شروط الاستخدام المتبادلة"}
                  {activeOverlay === "about" && "قصتنا ومبادئ منصة كيمو أندرويد"}
                  {activeOverlay === "contact" && "تذكرة اتصال فوري بالمطور"}
                </span>
              </h4>
              <button
                onClick={() => {
                  setActiveOverlay("none");
                  setContactStatus("idle");
                }}
                className="w-7 h-7 rounded-lg bg-[rgba(80,59,24,0.08)] hover:bg-red-500 hover:text-white text-[#503B18] flex items-center justify-center cursor-pointer transition duration-150"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Content overlay */}
            <div className="text-xs font-semibold text-luxury-muted space-y-4 leading-relaxed overflow-y-auto max-h-[60vh] pr-1">
              {activeOverlay === "privacy" && (
                <div className="space-y-3.5">
                  <h5 className="font-extrabold text-[#2C1810] text-[13px] border-b border-luxury-gold/10 pb-1">مقدمة سياسة الخصوصية العالمية</h5>
                  <p>
                    في منصة تطبيق ومتجر <strong>كيمو أندرويد</strong>، نضع سرية وخصوصية مستخدمينا وزوار موقعنا على رأس سلم أولوياتنا التنظيمية. تحدد وثيقة سياسة الخصوصية هذه بالتفصيل أنواع المعلومات الشخصية والتقنية التي نجمعها ونسجلها، وكيف نستخدمها من أجل تحسين تجربة التصفح الموثوقة.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">ملفات السجل القياسية (Log Files)</h5>
                  <p>
                    مثل العديد من مواقع الويب الاحترافية الأخرى، يتبع متجر كيمو أندرويد إجراءً موحداً يعتمد على استخدام ملفات السجل لتتبع الحركات الإحصائية العامة للزائرين. تشمل المعلومات المسجلة داخل هذه الملفات ما يلي:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] bg-luxury-secondary/10 p-3 rounded-xl border border-luxury-gold/10 mr-2">
                    <li>عناوين بروتوكول الإنترنت (IP Addresses)</li>
                    <li>نوع المتصفح ونظام التشغيل المستعمل (مثل هاتف أندرويد، متصفح كروم)</li>
                    <li>موفر خدمة الإنترنت المعتمد (ISP)</li>
                    <li>طوابع التاريخ والوقت بدقة (Date & Time Stamps)</li>
                    <li>صفحات الإحالة وصفحات الخروج وربما عدد النقرات الإحصائية</li>
                  </ul>
                  <p>
                    نحيطكم علماً بأن كافة هذه البيانات والمعرّفات المسجلة سحابياً لا ترتبط بأي حال من الأحوال بأي معلومات شخصية محددة للهوية أو البيانات البايومترية أو الملفات الحساسة للمستخدم.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">ملفات تعريف الارتباط (Cookies) ومنارات الويب</h5>
                  <p>
                    يستخدم متجر كيمو أندرويد ملفات تعريف الارتباط المحدودة (Cookies) لتخزين تفضيلات زوارنا الكرام، وقيام المتجر بتخصيص محتويات صفحات الويب بناءً على نوع المتصفح المستعمل أو أي معلومات وإجراءات رقمية مشفرة يرسلها زائرنا عبر المتصفح.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">شريك الإعلانات الخارجي: Google AdSense وملف DART</h5>
                  <p>
                    تعد شركة جوجل (Google) أحد بائعي وإعلانيي الجهات الخارجية المرموقة في منصتنا. نحن ملتزمون بجميع قواعد ومعايير جوجل للتوزيع الرقمي:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] bg-luxury-secondary/10 p-3 rounded-xl border border-luxury-gold/10 mr-2">
                    <li>تستخدم شركة Google ملفات تعريف الارتباط المعروفة باسم ملف <strong>DART Cookie</strong> لتقديم الإعلانات لزوار موقعنا بناءً على زيارتهم لمتجر كيمو أندرويد ومواقع وتطبيقات الإنترنت الأخرى بمختلف فئات تخصصها.</li>
                    <li>يمكن لزوارنا ومستخدمينا إيقاف أو تعطيل ملفات DART الإعلانية من خلال زيارة سياسة خصوصية شبكة إعلانات Google والمحتوى التابعة لها على الرابط المخصص.</li>
                    <li>قد يستخدم شركاء الإعلانات لدينا مثل (Google AdSense) أدوات أخرى كمنارات الويب وملفات الكوكيز وجافا سكريبت لقياس مدة فعالية الحملات الإعلانية ومحتواها.</li>
                  </ul>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">سياسات خصوصية الجهات الخارجية والروابط الإعلانية</h5>
                  <p>
                    نوصيكم بالرجوع الدائم إلى سياسات الخصوصية الخاصة بخوادم الجهات الخارجية المذكورة للحصول على معلومات كافية حول كيفية معالجة وتوجيه أنشطتها الاستهلاكية للإعلانات، إضافة إلى الحصول على تعليمات مفصلة لخيارات إلغاء الاشتراك من ميزات معينة.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">موافقة المستخدم التامة</h5>
                  <p>
                    باستخدامك وتصفحك الفعال لمنصة تطبيق ومتجر كيمو أندرويد، فإنك تقر وتعلن بموجب هذا عن موافقتك التامة وغير المشروطة على كافة بنود سياسة الخصوصية المعتمدة والتزامك بتطبيق بنودها القانونية والفنية المصممة لحمايتك.
                  </p>
                </div>
              )}

              {activeOverlay === "terms" && (
                <div className="space-y-3.5">
                  <h5 className="font-extrabold text-[#2C1810] text-[13px] border-b border-luxury-gold/10 pb-1">تمهيد ومقدمة شروط الخدمة والاتفاقية</h5>
                  <p>
                    يرجى قراءة هذه البنود بتمعن قبل البدء في استخدام متجر <strong>كيمو أندرويد</strong>. تشكل شروط استخدام هذا الموقع عقداً قانونياً ملزماً بينك كأحد الزوار وبين إدارة المنصة المطورة. بمجرد وصولك للموقع واستخدامه لتنزيل التطبيقات أو معاينة الأكواد والمشاريع، فإنك تقبل وتوافق على الخضوع لهذه الأحكام القانونية.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">ترخيص الاستخدام والملكية الفكرية للمشاريع</h5>
                  <p>
                    نحن نقدم كافة مشاريع الأندرويد، وأكواد سكتشوير (Sketchware Pro) المبرمجة بالكامل، والملفات المفتوحة المصدر كأدوات تعليمية وتحفيزية موجهة لدعم التطوير وصناع البرمجيات العرب:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] bg-luxury-secondary/10 p-3 rounded-xl border border-luxury-gold/10 mr-2">
                    <li>يُمنح المستخدم ترخيصاً مؤقتاً ومحدوداً لتصريف وتجريب الملفات الرقمية في نطاق فردي وتعليمي وعادل تماماً دون الحق في بيع أو نسخ الموقع ومحتوياته بالكامل لأغراض الاستغلال التجاري المخل.</li>
                    <li>الملكية الفكرية والعلامات البرمجية والأفكار الخاصة بكل تطبيق مطور تظل عائدة لمصمميها الأصليين والمنصة ما لم يتم الإشارة لشريك برمجي آخر.</li>
                  </ul>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">سلوك المستخدم والمحظورات القانونية</h5>
                  <p>
                    أثناء استخدامك لمتجرنا، تلتزم التزاماً كاملاً وثابتاً بالامتناع عن الأفعال الرقمية الضارة والخطرة التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] bg-luxury-secondary/10 p-3 rounded-xl border border-luxury-gold/10 mr-2">
                    <li>محاولة قرصنة المتجر أو التلاعب بأنظمة البيانات المشفرة أو الهجوم على قواعد بيانات سيرفر لوحة التحكم أو Firebase.</li>
                    <li>نشر أو إعادة توزيع محتويات الأكواد الرقمية بنوايا ضارة كزرع ملفات تتبع أو فيروسات برمجية تضر بخصوصية الهواتف.</li>
                    <li>إساءة استخدام نموذج التواصل والشكاوى "اتصل بنا" عبر إرسال رسائل عشوائية أو ترويجية أو منتحلة لشخصيات وهمية.</li>
                  </ul>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">إخلاء المسؤولية الكامل للموقع والمطور</h5>
                  <p>
                    يتم تقديم كافة البرمجيات وتطبيقات Sketchware Pro والمشروعات الرقمية "كما هي" دون أي ضمانات قانونية صريحة أو ضمنية تشمل على سبيل المثال جودة الأداء دون توقف دائم. منصة كيمو أندرويد وإدارتها التقنية تخلي مسؤوليتها القانونية المدنية والجنائية بالكامل عن أي أضرار جانبية أو خسائر برمجية أو فقدان في الملفات قد يطرأ على هاتف الاندرويد الخاص بك جراء التحميل الخاطئ أو العبث غير المدروس بملفات التطبيقات.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">تعديل اتفاقيات الاستخدام مستقبلاً</h5>
                  <p>
                    تمتلك إدارة متجر كيمو أندرويد الحق الحصري والتام في تعديل كافة بنود شروط الخدمة والاستخدام هذه في أي وقت وبدون سابق إشعار مبرم للزوار. يحثكم موقعنا على التحقق الدوري المستمر من هذه الصفحة لضمان درايتكم بآخر القواعد والنماذج المنظمة للمتجر.
                  </p>
                </div>
              )}

              {activeOverlay === "about" && (
                <div className="space-y-3.5">
                  <h5 className="font-extrabold text-[#2C1810] text-[13px] border-b border-luxury-gold/10 pb-1">رسالتنا في سماء البرمجيات العربية</h5>
                  <p>
                    مرحباً بكم في متجر ومنصة <strong>كيمو أندرويد</strong>، بوابتكم الذهبية والتعليمية الرائدة المتخصصة في بناء وتطوير برمجيات ومشاريع هاتف الاندرويد بواسطة بيئة <strong>Sketchware Pro</strong> الاحترافية المفتوحة والشهيرة. نحن نمثل حاضنة عربية مستقلة تهدف لتبسيط آليات تصميم الألعاب والبرامج بشكل غاية في السلاسة.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">من هو المطور كيمو أندرويد؟</h5>
                  <p>
                    المؤسس والمبرمج والمدون التكنولوجي كيمو أندرويد هو مطور يمتلك خبرة ومعرفة برمجية مكثفة بأدوات سكتشوير sketchware وتوليد ملفات APK الآمنة والناجزة. من شغف بسيط بالتعلم، قرر المطور إقامة هذا المتجر الشامل ليوفر مشاريع وأكواد تم فحصها وحقنها بأساليب البرمجة النقية لضمان وصول المبرمجين الطامحين لأفكار متطورة لحل مشاكل برمجتهم.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">رؤيتنا وبوصلة تطلعاتنا المستقبلية</h5>
                  <p>
                    نسعى لبناء وتنشئة مجتمع تكنولوجي عربي ناضج يبني برمجيات أندرويد عالية الجودة بالاعتماد على الهواتف والألواح الذكية وحدها لتقديم حلول حقيقية ومنع احتكار المعرفة. نحن نعمل على توفير شروحات مصورة واحترافية متماسكة تساعد كل مهتم بتقنيات سكتشوير من بلوغ مستويات الاحتراف البرمجي التام.
                  </p>

                  <h5 className="font-extrabold text-[#2C1810] text-[13px] pt-2 border-b border-luxury-gold/10 pb-1">معايير السلامة والجودة والشفافية العالية</h5>
                  <p>
                    تنزيل الملفات عبر منصتنا يخضع للبنود الفنية والموثوقية المطلقة:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] bg-luxury-secondary/10 p-3 rounded-xl border border-luxury-gold/10 mr-2">
                    <li>فحص سحابي آلي دوري متقدم لكامل حزم APK والمشاريع للتأكد من خلوها المطلق من أي فيروسات أو أكواد تتبع خبيثة.</li>
                    <li>الأمان المبرهن والشرح الوافي لكل ما يتعلق بالمشاريع لتأهيلك لصنع تطبيقات قادرة على تصدير ملفات برمجية دقيقة للآخرين.</li>
                    <li>مواكبة برمجية وتصحيحات دائمة تلائم آخر إصدارات SDK المتطورة والخاصة بنظام التشغيل أندرويد.</li>
                  </ul>
                </div>
              )}

              {activeOverlay === "contact" && (
                <div className="w-full">
                  {contactStatus === "success" ? (
                    <div className="flex flex-col items-center text-center gap-3 py-6 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl animate-fade-in">
                      <CheckCircle2 className="text-emerald-700 animate-bounce" size={32} />
                      <div className="text-xs font-black text-emerald-800">نشكر تواصلك معنا!</div>
                      <p className="text-[10px] text-emerald-700 font-medium px-4">
                        تم إرسال تذكرتك بنجاح ومزامنتها على السيرفر، وسيقوم المطور كيمو أندرويد بمراجعتها والرد عليك في أقرب وقت.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10.5px] font-black text-[#6E5F4A] block mb-1">الاسم الكامل</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full p-2.5 bg-[#F5F0E6] border border-luxury-gold/15 rounded-xl outline-none text-xs font-extrabold text-[#2C1810]"
                          placeholder="مثال: كريم رجب"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-[#6E5F4A] block mb-1">البريد الإلكتروني للرد</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full p-2.5 bg-[#F5F0E6] border border-luxury-gold/15 rounded-xl outline-none text-xs font-extrabold text-[#2C1810] font-sans"
                          placeholder="kareem@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-[#6E5F4A] block mb-1">وصف المشكلة / الاقتراح</label>
                        <textarea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          rows={4}
                          className="w-full p-2.5 bg-[#F5F0E6] border border-luxury-gold/15 rounded-xl outline-none text-xs font-semibold text-[#2C1810]"
                          placeholder="اكتب تفاصيل طلبك أو المشكلة التي واجهتك أثناء التنزيل..."
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactStatus === "submitting"}
                        className="w-full h-11 bg-luxury-primary disabled:bg-luxury-muted text-[#FFFDF9] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Send size={12} />
                        <span>{contactStatus === "submitting" ? "جاري الإرسال للتأكيد..." : "إرسال التذكرة الآن"}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stylized Keyframe rules */}
      <style>{`
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

    </div>
  );
};

export default RedirectScreen;
