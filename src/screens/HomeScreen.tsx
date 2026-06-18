import React, { useState, useEffect } from "react";
import { AppItem, AdItem, CategoryDetail, AdUnits } from "../types";
import { db } from "../firebase";
import { ref, runTransaction, push } from "firebase/database";
import { Header } from "../components/Header";
import { WelcomeCard } from "../components/WelcomeCard";
import { SocialBar } from "../components/SocialBar";
import { AdShell } from "../components/AdShell";
import { AppsList, CATEGORIES } from "../components/AppsList";
import { AppDetailModal } from "../components/AppDetailModal";
import { CheckCircle2, Send, Smartphone } from "lucide-react";
import { encryptLink } from "../utils/crypto";

interface HomeScreenProps {
  apps: AppItem[];
  ads: AdItem[];
  adUnits?: AdUnits;
  targetedId: string | null;
  profilePic?: string;
  youtubeLink?: string;
  telegramLink?: string;
  contactLink?: string;
  tutorialLink?: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  showToast: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  apps,
  ads,
  adUnits = {} as AdUnits,
  targetedId,
  profilePic = "",
  youtubeLink = "#",
  telegramLink = "#",
  contactLink = "#",
  tutorialLink = "",
  onNavigate,
  showToast
}) => {
  const [searchOpen, setSearchToggle] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(window.location.search.includes("id=") ? "" : "");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [selectedCatDetail, setSelectedCatDetail] = useState<CategoryDetail | null>(null);

  // Overlay dialogues state
  const [activeOverlay, setActiveOverlay] = useState<"none" | "privacy" | "terms" | "about" | "contact">("none");

  // Contact modal state
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Lookup matching targeted app to display the special "التطبيق جابك هنا" welcome card
  const targetedApp = targetedId ? apps.find((a) => a.key === targetedId) : null;

  // Pick a single active ad specifically for the homepage
  const getSelectedAd = (): AdItem | null => {
    const now = Date.now();
    const activeAds = ads.filter((ad) => ad.active && (ad.isPermanent || ad.endTime > now));
    if (!activeAds.length) return null;

    // Standardized random picker
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    return activeAds[randomIndex];
  };

  const currentHomeAd = getSelectedAd();

  // Track ad metrics safely
  const trackAdView = (ad: AdItem) => {
    const today = new Date().toISOString().split("T")[0];
    runTransaction(ref(db, `stats/adViews/${ad.key}/total`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/adViews/${ad.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});
  };

  // Run view tracking once ad behaves as loaded
  useEffect(() => {
    if (currentHomeAd) {
      trackAdView(currentHomeAd);
    }
  }, [currentHomeAd?.key]);

  const handleAppClick = (app: AppItem, categoryDetail: CategoryDetail) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Register app click transaction details
    runTransaction(ref(db, "stats/total_clicks"), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/daily/${today}/clicks`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/appClicks/${app.key}/total`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/appClicks/${app.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});

    setSelectedApp(app);
    setSelectedCatDetail(categoryDetail);
  };

  const handleAppShare = (app: AppItem) => {
    const baseShareUrl = `${window.location.origin}${window.location.pathname}?id=${app.key}`;
    if (navigator.share) {
      navigator.share({
        title: `${app.name} - كيمو أندرويد`,
        url: baseShareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(baseShareUrl).then(() => {
        showToast("✓ تم نسخ الرابط لمشاركته بنجاح");
      });
    }
  };

  const handleMainPageShare = () => {
    const baseShareUrl = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      navigator.share({
        title: "متجر كيمو أندرويد التطويري الفخم",
        url: baseShareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(baseShareUrl).then(() => {
        showToast("✓ تم نسخ رابط المتجر لمشاركته بنجاح");
      });
    }
  };

  const handleNavigateToRedirect = (app: AppItem) => {
    const today = new Date().toISOString().split("T")[0];
    runTransaction(ref(db, "stats/total_downloads"), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/daily/${today}/downloads`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/appDownloads/${app.key}/total`), (c) => (c || 0) + 1).catch(() => {});
    runTransaction(ref(db, `stats/appDownloads/${app.key}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});

    onNavigate("redirect", {
      id: app.key,
      name: encodeURIComponent(app.name),
      url: encodeURIComponent(encryptLink(app.link)),
      img: encodeURIComponent(app.imageUrl || "")
    });
  };

  const handleGoToTargetedApp = () => {
    if (!targetedApp) return;
    const element = document.getElementById(`app-${targetedApp.key}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("🌸 جاري توجيهك للتطبيق بالأسفل...");
    } else {
      const parent = document.getElementById("apps-catalog-title");
      if (parent) parent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Submit contact message to Firebase (mocked as requested)
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("submitting");
    setTimeout(() => {
      setContactStatus("success");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      showToast("✉️ تم إرسال رسالتك بنجاح! شكراً لك.");
    }, 400);
  };

  // Filter apps safely by search query
  const filteredApps = apps.filter((app) => {
    const nameMatch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = app.key.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || idMatch;
  });

  return (
    <div className="min-h-screen bg-luxury-neutral text-luxury-dark pb-28 animate-fade-in" dir="rtl" id="home-view">
      {/* Polished header with modular callbacks */}
      <Header 
        profilePic={profilePic}
        onSearchToggle={() => setSearchToggle(!searchOpen)}
        onShare={handleMainPageShare}
        onOpenPrivacy={() => setActiveOverlay("privacy")}
        onOpenAbout={() => setActiveOverlay("about")}
        onOpenContact={() => setActiveOverlay("contact")}
      />

      {/* Expandable search container */}
      {searchOpen && (
        <div className="bg-luxury-secondary/70 border-b border-luxury-gold/15 py-3.5 px-4 sticky top-[62px] z-30 transition-all duration-300">
          <div className="max-w-[480px] mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-luxury-neutral border border-luxury-gold/30 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm font-semibold transition duration-150"
              placeholder="ابحث عن تطبيق مميز..."
            />
            <span className="material-symbols-outlined text-luxury-primary absolute left-4 top-1/2 -translate-y-1/2 select-none text-xl">
              search
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[480px] mx-auto px-4">
        {/* Welcome card banner */}
        <WelcomeCard />

        {/* Social channels connect and yt */}
        <SocialBar 
          youtubeLink={youtubeLink}
          telegramLink={telegramLink}
          contactLink={contactLink}
        />

        {/* ──── DYNAMIC HIGHLIGHTED REFERRAL CARD ("التطبيق جابك هنا") ──── */}
        {targetedApp && (
          <div className="w-full mt-4 bg-gradient-to-br from-[#FFFDF8] to-[#FFF9EE] border-2 border-[#D4AF37]/50 rounded-[28px] p-5 shadow-[0_12px_28px_rgba(212,175,55,0.12)] select-none text-right animate-[fadeScaleIn_0.3s_ease-out] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-3.5 mt-2">
              <div className="w-12 h-12 rounded-xl border border-luxury-gold/25 overflow-hidden shrink-0 flex items-center justify-center shadow-md bg-amber-50">
                {targetedApp.imageUrl ? (
                  <img
                    src={targetedApp.imageUrl}
                    alt={targetedApp.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {(() => {
                  const targetedCat = CATEGORIES[targetedApp.category] || CATEGORIES[""];
                  return (
                    <div 
                      className={`w-full h-full flex items-center justify-center ${targetedApp.imageUrl ? "hidden" : "flex"}`}
                      style={{ backgroundColor: targetedCat.bg }}
                    >
                      <span 
                        className={`material-symbols-outlined text-[20px] ${targetedCat.fill ? "font-fill" : ""}`}
                        style={{ color: targetedCat.color }}
                      >
                        {targetedCat.icon}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div>
                <span className="text-[10px] font-black text-[#8B6914] bg-[#FFEFA6] px-2.5 py-0.5 rounded-full select-none">
                  تطبيق جابك هنا:
                </span>
                <h4 className="text-[14px] font-black text-[#2C1810] mt-1">
                  {targetedApp.name}
                </h4>
              </div>
            </div>
            
            <p className="text-[11px] text-[#6E5F4A] font-extrabold leading-relaxed mb-4">
              أهلاً بك يا بطل! كيمو أندرويد يرحب بك وبيتمنى لك تجربة ممتعة وآمنة. لقد أحضرك تطبيق <strong className="text-amber-900">({targetedApp.name})</strong> إلى معبرنا الحصري. البرنامج مبرمج وتم تنظيفه بالكامل ليكون جاهزًا للتحميل الفوري لعام 2026. لا تتردد في المتابعة من هنا!
            </p>

            <button
              onClick={handleGoToTargetedApp}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#503B18] to-[#503B18]/90 text-white font-black text-xs hover:scale-[1.015] active:scale-[0.985] transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_15px_rgba(80,59,24,0.25)] border border-amber-500/20"
            >
              <span className="material-symbols-outlined text-[15px] font-fill animate-bounce">arrow_downward</span>
              <span>انقر للذهاب إلى التطبيق</span>
            </button>
          </div>
        )}

        {/* Top active banner ad shell (Ad Unit 1) */}
        {adUnits?.unit1?.active && (
          <AdShell 
            label="إشهار برعاية كيمو أندرويد"
            adCode={adUnits.unit1.code}
            telegramLink={telegramLink}
            position="top"
          />
        )}

        {/* Listing Title */}
        <div className="mt-6 mb-4 flex justify-between items-center select-none animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-luxury-gold block" />
            <span className="font-black text-lg text-luxury-primary">
              باقة البرامج الحصرية
            </span>
          </div>
          <span className="text-[10px] font-mono font-black text-luxury-muted/90 bg-luxury-secondary px-3 py-1 rounded-full border border-luxury-gold/10">
            {apps.length} تطبيق
          </span>
        </div>

        {/* Banner Ad Unit 2 (Rendered above apps list if active) */}
        {adUnits?.unit2?.active && (
          <div className="mb-4">
            <AdShell 
              label="إعلان راعي مميز"
              adCode={adUnits.unit2.code}
              telegramLink={telegramLink}
              position="target"
            />
          </div>
        )}

        {/* Primary Apps dynamic catalogs list */}
        {filteredApps.length > 0 ? (
          <AppsList 
            apps={filteredApps}
            targetedId={targetedId}
            onAppClick={handleAppClick}
          />
        ) : (
          <div className="text-center py-10 bg-luxury-secondary/20 rounded-3xl border border-dashed border-luxury-gold/20 animate-fade-in">
            <span className="material-symbols-outlined text-luxury-gold text-4xl mb-2 font-fill">
              warning
            </span>
            <p className="text-sm font-black text-luxury-muted">لا توجد تطبيقات تطابق بحثك حالياً.</p>
          </div>
        )}

        {/* Bottom promo banner ad shell (Ad Unit 3) */}
        {adUnits?.unit3?.active && (
          <AdShell 
            label="إشهار سفلي"
            adCode={adUnits.unit3.code}
            telegramLink={telegramLink}
            position="bottom"
          />
        )}

        {/* Notification Alert (Ad Unit 4) */}
        {adUnits?.unit4?.active && (
          <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 z-40 max-w-sm bg-luxury-secondary/95 border-2 border-luxury-gold/35 rounded-2xl p-4 shadow-2xl animate-[fadeScaleIn_0.3s_ease-out] text-right">
            <div className="flex justify-between items-center mb-2 border-b border-luxury-gold/15 pb-1 select-none">
              <span className="text-[10px] font-black text-luxury-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-luxury-gold font-fill">campaign</span>
                <span>إشعار إعلاني مميز</span>
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
                مساحة إعلانية نشطة وشاغرة لشركة المطور الإعلانية.
              </div>
            )}
          </div>
        )}

        {/* ──── FOOTER SYSTEM LINKS AT THE BOTTOM ──── */}
        <footer className="mt-16 py-6 border-t border-luxury-gold/15 select-none text-center">
          <div className="max-w-[480px] mx-auto">
            <div className="flex justify-center items-center gap-4 flex-wrap text-[10.5px] font-extrabold text-luxury-muted">
              <button onClick={() => setActiveOverlay("privacy")} className="hover:text-luxury-primary cursor-pointer transition">سياسة الخصوصية</button>
              <span className="text-luxury-gold/30">•</span>
              <button onClick={() => setActiveOverlay("terms")} className="hover:text-luxury-primary cursor-pointer transition">شروط الاستخدام</button>
              <span className="text-luxury-gold/30">•</span>
              <button onClick={() => setActiveOverlay("about")} className="hover:text-luxury-primary cursor-pointer transition">من نحن</button>
              <span className="text-luxury-gold/30">•</span>
              <button onClick={() => setActiveOverlay("contact")} className="hover:text-luxury-primary cursor-pointer transition">اتصل بنا</button>
            </div>
            <p className="text-[9.5px] font-black text-luxury-muted/70 mt-3 leading-relaxed">
              كبائن تنزيل الملفات لعام 2026 مبرمجة سحابياً لتوصيل فوري كلياً. جميع الحقوق محفوظة كيمو أندرويد.
            </p>
          </div>
        </footer>
      </main>

      {/* App item visual detail popup card */}
      <AppDetailModal
        app={selectedApp}
        categoryDetail={selectedCatDetail}
        isOpen={selectedApp !== null}
        tutorialLink={tutorialLink}
        onClose={() => setSelectedApp(null)}
        onShare={handleAppShare}
        onDownload={handleNavigateToRedirect}
      />

      {/* ──── OVERLAY WIDGET DIALOGS MODALS (ABOUT, PRIVACY, TERMS, CONTACT) ──── */}
      {activeOverlay !== "none" && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-right">
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
                        تم إرسال تذكرتك بنجاح ومزامنتها على السيرفر، وسيقوم المطور كيمو أندرويد بمراجعتها والرد عليك في أقرب وقت عبر البريد الإلكتروني.
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
    </div>
  );
};
export default HomeScreen;
