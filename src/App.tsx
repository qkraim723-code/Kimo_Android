import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, runTransaction } from "firebase/database";
import { AppItem, AdItem, VisitStat, AdUnits } from "./types";
import { ShieldAlert, Copy, Check } from "lucide-react";

// Import Modular Components and Screens
import { Preloader } from "./components/Preloader";
import HomeScreen from "./screens/HomeScreen";
import RedirectScreen from "./screens/RedirectScreen";
import AdViewScreen from "./screens/AdViewScreen";
import { AdminScreen } from "./screens/AdminScreen";

type Route = "home" | "redirect" | "admink2005" | "adview";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>("home");
  const [targetedId, setTargetedId] = useState<string | null>(null);

  // Database Data States
  const [apps, setApps] = useState<AppItem[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [stats, setStats] = useState<VisitStat | null>(null);
  const [adUnits, setAdUnits] = useState<AdUnits>({});

  // Settings configs
  const [profilePic, setProfilePic] = useState<string>("");
  const [tutorialLink, setTutorialLink] = useState<string>("");
  const [youtubeLink, setYoutubeLink] = useState<string>("#");
  const [telegramLink, setTelegramLink] = useState<string>("#");
  const [contactLink, setContactLink] = useState<string>("#");

  const [antiAdblock, setAntiAdblock] = useState<boolean>(false);
  const [redirectTimeout, setRedirectTimeout] = useState<boolean>(true);
  const [adblockDetected, setAdblockDetected] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [showPermissionWizard, setShowPermissionWizard] = useState<boolean>(false);
  const [copiedRules, setCopiedRules] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // ──── Highly Intelligent Routing Parser for Legacy Pages Compatibility ────
  const parseRoute = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Track targeted app ID from direct queries like index.html?id=xxx
    const idParam = params.get("id");
    if (idParam) {
      setTargetedId(idParam);
    }

    if (path.includes("redirect.html") || path.includes("redirect")) {
      setCurrentRoute("redirect");
    } else if (path.includes("admink2005.html") || path.includes("admink2005") || path.includes("admin")) {
      setCurrentRoute("admink2005");
    } else if (path.includes("adview.html") || path.includes("adview")) {
      setCurrentRoute("adview");
    } else {
      setCurrentRoute("home");
    }
  };

  useEffect(() => {
    parseRoute();
    
    // Listen to history changes to preserve SPA navigation
    const handlePopState = () => parseRoute();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (route: Route, queryParams?: Record<string, string>) => {
    let newPath = "/";
    if (route === "redirect") newPath = "/redirect.html";
    else if (route === "admink2005") newPath = "/admink2005.html";
    else if (route === "adview") newPath = "/adview.html";

    if (queryParams) {
      const q = new URLSearchParams(queryParams).toString();
      newPath += `?${q}`;
    }

    window.history.pushState(null, "", newPath);
    setCurrentRoute(route);
    
    // Clear targeted query triggers if they navigate away
    if (route !== "home") setTargetedId(null);
  };

  // ──── Realtime Database Listeners with Intelligent Permission Auditing ────
  useEffect(() => {
    const handleDbError = (error: any) => {
      console.warn("Database connection/permissions error:", error);
      if (error && error.message && (error.message.includes("PERMISSION_DENIED") || error.message.includes("Permission denied") || error.code === "PERMISSION_DENIED")) {
        setPermissionError(true);
        setApps([
          {
            key: "whatsapp-gold",
            name: "واتساب الذهبي كيمو",
            link: "https://www.whatsapp.com",
            category: "apk",
            description: "تطبيق واتساب الذهبي بلس بميزات الخصوصية الكاملة، تحميل الحالات، وضد الحظر المطور بالكامل.",
            imageUrl: ""
          },
          {
            key: "kimo-tool",
            name: "أداة كيمو التقنية برو",
            link: "https://github.com",
            category: "dev",
            description: "مساعد برمجيات كيمو أندرويد لتثبيت وتفعيل التطبيقات التقنية بكفاءة وحرية تامة.",
            imageUrl: ""
          },
          {
            key: "pro-vpn",
            name: "برو في بي إن فائق السرعة",
            link: "https://www.google.com",
            category: "internet",
            description: "تصفح شبكة الإنترنت بأعلى تشفير وأقوى حماية للبيانات مع تخطي القيود الجغرافية بسلاسة.",
            imageUrl: ""
          },
          {
            key: "kimo-templates",
            name: "متجر مشاريع كيمو أندرويد",
            link: "https://github.com",
            category: "dev",
            description: "متجر ومجمع كامل مخصص لتحميل قوالب وأكواد ومشاريع الأندرويد والويب مفتوحة المصدر.",
            imageUrl: ""
          }
        ]);
        setAds([
          {
            key: "demo-ad-1",
            username: "مؤسسة كيمو للإلكترونيات",
            adTitle: "تخفيضات كبرى تصل إلى 50% على شاشات وكاميرات الأندرويد مع التوصيل السريع لكافة المحافظات!",
            adLink: "https://www.google.com",
            topCode: "",
            bottomCode: "",
            hours: 24,
            startTime: Date.now(),
            endTime: Date.now() + 86400000,
            isPermanent: true,
            active: true,
            views: 1840,
            clicks: 420
          }
        ]);
        setAdUnits({
          unit1: { code: "<!-- AdUnit 1 -->", active: false },
          unit2: { code: "<!-- AdUnit 2 -->", active: false },
          unit3: { code: "<!-- AdUnit 3 -->", active: false },
          unit4: { code: "<!-- AdUnit 4 -->", active: false },
          unit5: { code: "<!-- AdUnit 5 -->", active: false }
        });
        setStats({
          total: 10500,
          daily: {},
          countries: {}
        });
        setLoading(false);
      }
    };

    // 1. Fetch apps catalog
    const unsubscribeApps = onValue(ref(db, "apps"), (snapshot) => {
      const appList: AppItem[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val && val.name && val.link) {
          appList.push({
            key: child.key || "",
            name: val.name,
            link: val.link,
            category: val.category || "",
            description: val.description || "",
            imageUrl: val.imageUrl || ""
          });
        }
      });
      setApps(appList.reverse());
    }, handleDbError);

    // 2. Fetch ad campaigns
    const unsubscribeAds = onValue(ref(db, "ads"), (snapshot) => {
      const adList: AdItem[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val) {
          adList.push({
            key: child.key || "",
            ...val
          });
        }
      });
      setAds(adList);
    }, handleDbError);

    // 3. Fetch public settings
    const unsubscribeSettings = onValue(ref(db, "settings"), (snapshot) => {
      const val = snapshot.val() || {};
      if (val.profilePic) setProfilePic(val.profilePic);
      if (val.tutorial) setTutorialLink(val.tutorial);
      if (val.youtubeLink) setYoutubeLink(val.youtubeLink);
      if (val.telegramLink) setTelegramLink(val.telegramLink);
      if (val.contactLink) setContactLink(val.contactLink);
      
      setAntiAdblock(!!val.antiAdblock);
      setRedirectTimeout(val.redirectTimeout !== false);
    }, handleDbError);

    // 4. Fetch 5 static ad units
    const unsubscribeAdUnits = onValue(ref(db, "ads/units"), (snapshot) => {
      setAdUnits(snapshot.val() || {});
    }, handleDbError);

    // 5. Fetch general analytics stats
    const unsubscribeStats = onValue(ref(db, "stats"), (snapshot) => {
      setStats(snapshot.val() || {});
      setLoading(false); // Done loading initial streams
    }, handleDbError);

    return () => {
      unsubscribeApps();
      unsubscribeAds();
      unsubscribeSettings();
      unsubscribeAdUnits();
      unsubscribeStats();
    };
  }, []);

  // ──── Visitor Geo IP Trace Analytics ────
  useEffect(() => {
    // Register visitor only once per browser session
    const isSessionTracked = sessionStorage.getItem("kimo_tracked_visit");
    if (isSessionTracked) return;

    const trackVisit = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const geoVal = await res.json();
        const country = (geoVal.country_name || "Unknown").replace(/[.#$\[\]/]/g, "_");
        const today = new Date().toISOString().split("T")[0];

        // Increment database visit records inside transactional blocks
        runTransaction(ref(db, "stats/total_visits"), (c) => (c || 0) + 1).catch(() => {});
        runTransaction(ref(db, `stats/daily/${today}/visits`), (c) => (c || 0) + 1).catch(() => {});
        runTransaction(ref(db, `stats/countries/${country}/visits`), (c) => (c || 0) + 1).catch(() => {});
        runTransaction(ref(db, `stats/countries/${country}/daily/${today}`), (c) => (c || 0) + 1).catch(() => {});

        sessionStorage.setItem("kimo_tracked_visit", "true");
      } catch (e) {
        // Fallback for offline or errors
        const today = new Date().toISOString().split("T")[0];
        runTransaction(ref(db, "stats/total_visits"), (c) => (c || 0) + 1).catch(() => {});
        runTransaction(ref(db, `stats/daily/${today}/visits`), (c) => (c || 0) + 1).catch(() => {});
      }
    };

    trackVisit();
  }, []);

  // ──── Dynamic Head Script Injector for Unit 5 ────
  useEffect(() => {
    // Clear old script containers if any exists
    const existing = document.getElementById("kimo-head-scripts");
    if (existing) existing.remove();

    if (adUnits?.unit5?.active && adUnits.unit5.code) {
      const scriptContainer = document.createElement("div");
      scriptContainer.id = "kimo-head-scripts";
      scriptContainer.style.display = "none";
      scriptContainer.innerHTML = adUnits.unit5.code;
      document.head.appendChild(scriptContainer);
      
      const scripts = scriptContainer.querySelectorAll("script");
      scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        document.head.appendChild(newScript);
      });
    }
  }, [adUnits]);

  // ──── Ad Blocker Detection Engine ────
  useEffect(() => {
    if (!antiAdblock) {
      setAdblockDetected(false);
      return;
    }

    // Try to append a test element mimicking an advertisement
    const testAd = document.createElement("div");
    testAd.innerHTML = "&nbsp;";
    testAd.className = "adsbygoogle ad-banner ad-wrapper adsbox doubleclick-ad";
    testAd.style.position = "absolute";
    testAd.style.left = "-9999px";
    testAd.style.top = "-9999px";
    testAd.style.width = "1px";
    testAd.style.height = "1px";
    document.body.appendChild(testAd);

    const checkTimeout = setTimeout(() => {
      // Check if element was hidden or removed by adblocker
      const isBlocked = 
        testAd.offsetHeight === 0 || 
        testAd.offsetWidth === 0 || 
        window.getComputedStyle(testAd).display === "none" || 
        window.getComputedStyle(testAd).visibility === "hidden";
      
      setAdblockDetected(isBlocked);
      document.body.removeChild(testAd);
    }, 1500);

    return () => clearTimeout(checkTimeout);
  }, [antiAdblock, currentRoute]);

  return (
    <div className="min-h-screen bg-luxury-neutral font-sans relative antialiased selection:bg-luxury-gold selection:text-luxury-primary">
      {/* Visual Loader Overlay */}
      <Preloader active={loading} subText="المنصة الرسمية" />

      {/* Adblocker Enforcement overlay screen */}
      {adblockDetected && antiAdblock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-dark/95 backdrop-blur-md p-6 select-none" dir="rtl">
          <div className="max-w-md w-full bg-luxury-neutral border-2 border-red-600/35 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-red-600/10 text-red-600 border border-red-600/20 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
              <span className="material-symbols-outlined text-4xl">block</span>
            </div>
            <h2 className="text-xl font-black text-red-700 mb-3 font-sans">تنبيه: تم اكتشاف مانع الإعلانات!</h2>
            <p className="text-xs text-luxury-muted font-bold leading-relaxed mb-6 font-semibold">
              نحن نعتمد بشكل كامل على الإعلانات لتوفير التطبيقات والتحميلات مجانية وآمنة 100% للجميع. لقد قمت بتفعيل مانع الإعلانات (AdBlocker) أو تستخدم متصفحاً يمنع الإعلانات تلقائياً (مثل Brave).
            </p>
            <div className="bg-luxury-secondary/50 border border-luxury-gold/10 p-4 rounded-2xl mb-8 text-right">
              <h4 className="text-xs font-extrabold text-luxury-primary mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-fill">verified</span>
                <span>كيفية حل المشكلة للاستمرار:</span>
              </h4>
              <ul className="text-[11px] text-luxury-dark font-semibold list-decimal list-inside space-y-1.5">
                <li>يرجى تعطيل ملحقات منع الإعلانات في المتصفح الخاص بك.</li>
                <li>إذا كنت تستخدم متصفح Brave، يرجى إيقاف ميزة Shields.</li>
                <li>تأكد من عدم استخدام ميزة DNS مانع إعلانات (SDN) على هاتفك.</li>
                <li>قم بإعادة تحديث الصفحة بعد القيام بالخطوات السابقة لفتح الرابط.</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-xs hover:from-red-700 hover:to-red-950 shadow-md active:scale-98 transition duration-150"
            >
              إعادة فحص الصفحة من جديد
            </button>
          </div>
        </div>
      )}

      {/* Database Security / Permission Resolution Wizard */}
      {showPermissionWizard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-luxury-dark/95 backdrop-blur-md p-4 overflow-y-auto" dir="rtl">
          <div className="max-w-2xl w-full bg-white border border-luxury-gold/35 rounded-3xl p-6 md:p-8 shadow-2xl my-8 relative overflow-hidden text-right">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#503B18] via-[#D4AF37] to-[#503B18]" />
            
            <button
              onClick={() => setShowPermissionWizard(false)}
              className="absolute top-4 left-4 p-1.5 text-[#A68F6C] hover:text-[#503B18] hover:bg-[#503B18]/5 rounded-xl transition duration-150 cursor-pointer"
              title="إغلاق وتصفح في وضع العرض التجريبي"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 border-b border-luxury-gold/15 pb-4 mb-4 mt-2">
              <div className="w-12 h-12 bg-amber-500/10 text-[#503B18] rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-luxury-primary">تنبيه قواعد Firebase مغلقة (Permission Denied)</h2>
                <p className="text-[10px] md:text-[11px] text-[#A68F6C] font-semibold">حل خطأ الصلاحيات لتفعيل المنصة والتحميلات فورا</p>
              </div>
            </div>

            <p className="text-xs text-luxury-dark font-bold leading-relaxed mb-4">
              أهلاً بك مطور المنصة! تظهر هذه الرسالة لأن قاعدة بيانات <span className="text-[#503B18] underline font-black">Firebase Realtime Database</span> الخاصة بك مضبوطة حالياً على <span className="text-red-700 font-extrabold">الوضع المغلق (Locked Mode)</span>، مما يمنع الزوار غير المسجلين من قراءة تطبيقات وعناصر المنصة.
            </p>

            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl mb-4 text-right">
              <h4 className="text-xs font-extrabold text-[#503B18] mb-1.5">خطوات تفعيل قاعدة البيانات في ثوانٍ معدودة:</h4>
              <ol className="text-[11px] text-luxury-muted font-bold list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>افتح لوحة تحكم مشروعك في <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-amber-700 underline font-black">Firebase Console</a></li>
                <li>انتقل إلى قسم <strong className="text-luxury-primary">Realtime Database</strong> من القائمة الجانبية.</li>
                <li>اضغط على تبويب <strong className="text-luxury-primary">Rules (القواعد)</strong> في الأعلى.</li>
                <li>قم بنسخ واستبدال الكود الحالي بالقواعد الآمنة المقترحة بالأسفل لتشغيل المنصة بسلاسة.</li>
                <li>اضغط على زر <strong className="text-emerald-700 font-black">Publish (نشر)</strong> لحفظ التغييرات.</li>
              </ol>
            </div>

            <div className="relative mb-5">
              <div className="flex justify-between items-center bg-luxury-secondary border-t border-r border-l border-luxury-gold/15 px-4 py-2 rounded-t-xl select-none">
                <span className="text-[10px] font-mono text-[#503B18] font-black">database.rules.json</span>
                <button
                  onClick={() => {
                    const rtdbRules = JSON.stringify({
                      "rules": {
                        "apps": {
                          ".read": "true",
                          ".write": "auth != null"
                        },
                        "ads": {
                          ".read": "true",
                          ".write": "auth != null"
                        },
                        "settings": {
                          ".read": "true",
                          ".write": "auth != null"
                        },
                        "stats": {
                          ".read": "true",
                          ".write": "true"
                        },
                        "contact_messages": {
                          ".read": "auth != null",
                          ".write": "true"
                        },
                        "user_reports": {
                          ".read": "auth != null",
                          ".write": "true"
                        }
                      }
                    }, null, 2);
                    navigator.clipboard.writeText(rtdbRules);
                    setCopiedRules(true);
                    showToast("تم نسخ القواعد بنجاح! الصقها في Firebase Console");
                    setTimeout(() => setCopiedRules(false), 3000);
                  }}
                  className="px-3 py-1 bg-[#503B18]/10 text-[#503B18] hover:bg-[#503B18]/25 rounded-md text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all duration-150"
                  title="نسخ القواعد البرمجية"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRules ? "تم النسخ!" : "نسخ القواعد"}</span>
                </button>
              </div>
              <pre className="text-left font-mono text-[9.5px] text-zinc-200 bg-zinc-900 border border-luxury-gold/15 p-4 rounded-b-xl overflow-x-auto max-h-[180px] leading-relaxed">
{`{
  "rules": {
    "apps": {
      ".read": "true",
      ".write": "auth != null"
    },
    "ads": {
      ".read": "true",
      ".write": "auth != null"
    },
    "settings": {
      ".read": "true",
      ".write": "auth != null"
    },
    "stats": {
      ".read": "true",
      ".write": "true"
    },
    "contact_messages": {
      ".read": "auth != null",
      ".write": "true"
    },
    "user_reports": {
      ".read": "auth != null",
      ".write": "true"
    }
  }
}`}
              </pre>
            </div>

            <div className="flex gap-3 justify-between items-center flex-wrap">
              <span className="text-[10px] text-[#A68F6C] font-semibold max-w-sm">بمجرد قيامك بنشر القواعد في Firebase، ستعمل المنصة لديك تلقائياً دون الحاجة لإعادة رفع الكود.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPermissionWizard(false)}
                  className="px-4 py-2 rounded-full border border-[#503B18]/25 text-[#503B18] font-bold text-xs hover:bg-[#503B18]/5 transition duration-150 cursor-pointer"
                >
                  تصفح ببيانات تجريبية
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#503B18] to-[#8C6D3B] text-white font-black text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition duration-150 cursor-pointer border border-[#D4AF37]/20"
                >
                  تحديث الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Firebase Rules Setup */}
      {permissionError && !showPermissionWizard && (
        <button
          onClick={() => setShowPermissionWizard(true)}
          className="fixed bottom-6 left-6 z-[100] px-4 py-3 bg-[#503B18] text-[#D4AF37] border border-[#D4AF37]/45 rounded-full shadow-2xl hover:bg-[#6E5F4A] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 font-black text-xs animate-pulse cursor-pointer shadow-amber-500/10"
          dir="rtl"
        >
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>تفعيل قاعدة البيانات ⚙️</span>
        </button>
      )}

      {/* Unified Custom Route Router */}
      {!loading && (
        <div className="relative">
          {currentRoute === "home" && (
            <HomeScreen
              apps={apps}
              ads={ads}
              adUnits={adUnits}
              targetedId={targetedId}
              profilePic={profilePic}
              youtubeLink={youtubeLink}
              telegramLink={telegramLink}
              contactLink={contactLink}
              tutorialLink={tutorialLink}
              onNavigate={(r, q) => navigateTo(r as Route, q)}
              showToast={showToast}
            />
          )}

          {currentRoute === "redirect" && (
            <RedirectScreen
              apps={apps}
              ads={ads}
              adUnits={adUnits}
              redirectTimeout={redirectTimeout}
              telegramLink={telegramLink}
              onNavigate={(r, q) => navigateTo(r as Route, q)}
              showToast={showToast}
            />
          )}

          {currentRoute === "adview" && (
            <AdViewScreen
              onNavigate={(r) => navigateTo(r as Route)}
              showToast={showToast}
            />
          )}

          {currentRoute === "admink2005" && (
            <AdminScreen
              apps={apps}
              ads={ads}
              adUnits={adUnits}
              antiAdblock={antiAdblock}
              redirectTimeout={redirectTimeout}
              stats={stats}
              tutorialLink={tutorialLink}
              profilePic={profilePic}
              youtubeLink={youtubeLink}
              telegramLink={telegramLink}
              contactLink={contactLink}
              onNavigate={(r) => navigateTo(r as Route)}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* Global Interactive Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-luxury-dark text-luxury-neutral border border-luxury-gold/30 text-xs font-black shadow-2xl flex items-center gap-2 select-none animate-[fadeScaleIn_0.2s_ease-out]">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
