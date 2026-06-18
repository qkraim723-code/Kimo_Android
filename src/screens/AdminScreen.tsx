import React, { useState, useEffect } from "react";
import { AppItem, AdItem, CategoryKey, AdUnits, UserReport } from "../types";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, set, update, push, remove, onValue } from "firebase/database";

import { AdminLogin } from "../components/admin/AdminLogin";
import { AdminHeader } from "../components/admin/AdminHeader";
import { StatsTab } from "../components/admin/StatsTab";
import { AppsTab } from "../components/admin/AppsTab";
import { AdsTab } from "../components/admin/AdsTab";
import { SettingsTab } from "../components/admin/SettingsTab";
import { AdminAlert } from "../components/admin/AdminAlert";

interface AdminScreenProps {
  apps: AppItem[];
  ads: AdItem[];
  adUnits?: AdUnits;
  antiAdblock?: boolean;
  redirectTimeout?: boolean;
  stats: any;
  tutorialLink: string;
  profilePic: string;
  youtubeLink: string;
  telegramLink: string;
  contactLink: string;
  onNavigate: (route: string) => void;
  showToast: (msg: string) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  apps,
  ads,
  adUnits = {} as AdUnits,
  antiAdblock = false,
  redirectTimeout = true,
  stats,
  tutorialLink,
  profilePic,
  youtubeLink,
  telegramLink,
  contactLink,
  onNavigate,
  showToast,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("kareemkodob11@gmail.com");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Tabs layout navigation
  const [activeTab, setActiveTab] = useState<"stats" | "apps" | "ads" | "settings">("stats");

  // EDIT APP SHEET STATES
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [editNewAppId, setEditNewAppId] = useState("");
  const [editAppName, setEditAppName] = useState("");
  const [editAppLink, setEditAppLink] = useState("");
  const [editAppCat, setEditAppCat] = useState<CategoryKey>("");
  const [editAppDescription, setEditAppDescription] = useState("");
  const [editAppImageUrl, setEditAppImageUrl] = useState("");

  // USER REPORTS INBOX LISTINGS
  const [reports, setReports] = useState<UserReport[]>([]);

  // EDIT AD CAMPAIGN STATES
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [editAdUsername, setEditAdUsername] = useState("");
  const [editAdTitle, setEditAdTitle] = useState("");
  const [editAdLink, setEditAdLink] = useState("");
  const [editAdCodeTop, setEditAdCodeTop] = useState("");
  const [editAdCodeBottom, setEditAdCodeBottom] = useState("");
  const [editAdIsPerm, setEditAdIsPerm] = useState(false);
  const [editAdHours, setEditAdHours] = useState("");

  // DETAIL POPUP AD VIEW STATE
  const [viewingAdDetail, setViewingAdDetail] = useState<AdItem | null>(null);

  // CUSTOM DIALOG SYSTEM STATE
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    msg: string;
    type: "success" | "danger" | "info" | "warn";
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: "",
    msg: "",
    type: "info",
    onConfirm: null,
  });

  const triggerAlert = (
    title: string,
    msg: string,
    type: "success" | "danger" | "info" | "warn",
    onConfirm?: () => void
  ) => {
    setAlert({
      isOpen: true,
      title,
      msg,
      type,
      onConfirm: onConfirm || null,
    });
  };

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === "kareemkodob11@gmail.com") {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // User complaint tickets listener removed as requested

  // LOGIN FUNCTION
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    signInWithEmailAndPassword(auth, loginEmail, loginPass)
      .then((res) => {
        setUser(res.user);
        showToast("✓ تم تسجيل الدخول بنجاح وبسرية تامة");
      })
      .catch(() => {
        setLoginError("معذرة! البريد الإلكتروني أو كلمة المرور غير صحيحة");
      });
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    triggerAlert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج الآن؟", "danger", () => {
      signOut(auth).then(() => {
        showToast("تم تسجيل الخروج بنجاح");
      });
    });
  };

  // ADD NEW APP CATALOG entry
  const handleAddApp = (name: string, link: string, cat: CategoryKey, desc: string, imageUrl: string) => {
    push(ref(db, "apps"), {
      name: name.trim(),
      link: link.trim(),
      category: cat,
      description: desc.trim(),
      imageUrl: imageUrl.trim(),
      addedAt: Date.now(),
    }).then(() => {
      showToast("✓ تم نشر التطبيق الجديد بنجاح");
    }).catch((err) => {
      console.error("Nesting error:", err);
      showToast("❌ فشل النشر: تحقق من صلاحيات الخادم من لوحة تحكم Firebase");
    });
  };

  // EDIT APP TRIGGER MODAL
  const openEditApp = (app: AppItem) => {
    setEditingApp(app);
    setEditAppName(app.name);
    setEditAppLink(app.link);
    setEditAppCat(app.category);
    setEditAppDescription(app.description || "");
    setEditAppImageUrl(app.imageUrl || "");
    setEditNewAppId("");
  };

  const handleUpdateApp = () => {
    if (!editingApp) return;

    const data = {
      name: editAppName.trim(),
      link: editAppLink.trim(),
      category: editAppCat,
      description: editAppDescription.trim(),
      imageUrl: editAppImageUrl.trim(),
    };

    const targetIdNew = editNewAppId.trim().replace(/\s+/g, "-");

    if (targetIdNew && targetIdNew !== editingApp.key) {
      set(ref(db, `apps/${targetIdNew}`), data).then(() => {
        remove(ref(db, `apps/${editingApp.key}`)).then(() => {
          setEditingApp(null);
          showToast("✓ تم تحديث التطبيق ونقل المعرّف بنجاح");
        }).catch((err) => {
          console.error(err);
          showToast("❌ فشل إزالة المعرّف القديم: تحقق من الصلاحيات");
        });
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل نقل المعرّف: تحقق من الصلاحيات");
      });
    } else {
      update(ref(db, `apps/${editingApp.key}`), data).then(() => {
        setEditingApp(null);
        showToast("✓ تم حفظ تعديلات التطبيق");
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل التحديث: تأكد من صلاحيات الكتابة بقاعدة البيانات");
      });
    }
  };

  // DELETE APP CATALOG
  const handleDeleteApp = (app: AppItem) => {
    triggerAlert("حذف التطبيق", `هل متأكد من إزالة تطبيق "${app.name}" بشكل نهائي؟`, "danger", () => {
      remove(ref(db, `apps/${app.key}`)).then(() => {
        showToast("✓ تم حذف التطبيق من الخادم");
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل حذف التطبيق: تحقق من الصلاحيات");
      });
    });
  };

  // COPY APP CONFIGURED LINKS
  const handleCopyAppLink = (key: string) => {
    const url = `${window.location.origin}/index.html?id=${encodeURIComponent(key)}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("✓ تم نسخ كرت التحويل للمشاركة");
    });
  };

  // MARK ISSUE TICKET AS RESOLVED (DELETE IT)
  const handleResolveReport = (key: string) => {
    triggerAlert("تم حل المشكلة", "هل تريد مسح هذا البلاغ نهائياً وتأكيد حله؟", "warn", () => {
      remove(ref(db, `contact_messages/${key}`)).then(() => {
        showToast("✓ تم وضع البلاغ كمحلول وحذفه بنجاح");
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل حذف البلاغ: تحقق من الصلاحيات");
      });
    });
  };

  // ADMIN CONFIGURATION SETTINGS MAPPING
  const handleSaveSetting = (path: string, val: string, label: string) => {
    set(ref(db, `settings/${path}`), val.trim()).then(() => {
      showToast(`✓ تم حفظ ${label} بنجاح`);
    }).catch((err) => {
      console.error(err);
      showToast("❌ فشل حفظ الإعداد: تحقق من الصلاحيات");
    });
  };

  const handleDeleteSetting = (path: string, label: string) => {
    triggerAlert(`حذف ${label}`, "هل تؤود طمس وحذف خيار هذا الإعداد؟", "danger", () => {
      remove(ref(db, `settings/${path}`)).then(() => {
        showToast(`تم إزالة إعداد ${label}`);
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل حذف الإعداد: تحقق من الصلاحيات");
      });
    });
  };

  // DOWNLOAD FULL SYSTEM BACKUP
  const handleDownloadBackup = () => {
    import("firebase/database").then(({ get, ref }) => {
      get(ref(db, "/")).then((snap) => {
        const d = snap.val();
        const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `kimo_backup_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("✓ تم تصدير وتحميل النسخة الاحتياطية سحابياً");
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل جلب النسخة الاحتياطية: تحقق من الصلاحيات");
      });
    });
  };

  // ANTI ADBLOCK SWITCH TOGGLER
  const handleToggleAntiAdblock = () => {
    set(ref(db, "settings/antiAdblock"), !antiAdblock).then(() => {
      showToast(!antiAdblock ? "✓ نظام منع AdBlock مفعّل بالمتجر" : "✓ تم فك حماية ميكانيكيات الإعلانات");
    }).catch((err) => {
      console.error(err);
      showToast("❌ فشل التبديل: تحقق من الصلاحيات");
    });
  };

  // CHIPS & STATIC AD UNITS SAVINGS
  const handleSaveAdUnit = (key: string, code: string, active: boolean) => {
    set(ref(db, `ads/units/${key}`), { code, active }).then(() => {
      showToast("✓ تم إدراج الشفرة الإعلانية بنجاح");
    }).catch((err) => {
      console.error(err);
      showToast("❌ فشل التعديل: تحقق من صلاحيات الخادم");
    });
  };

  // ADD NEW DYNAMIC MANUAL AD
  const handleAddAdCampaign = (
    username: string,
    title: string,
    link: string,
    top: string,
    bottom: string,
    hoursVal: number,
    isPerm: boolean
  ) => {
    const nowStamp = Date.now();
    const computedEnd = isPerm ? 0 : nowStamp + hoursVal * 3600000;

    push(ref(db, "ads"), {
      username: username.trim(),
      adTitle: title.trim(),
      adLink: link.trim(),
      topCode: top.trim(),
      bottomCode: bottom.trim(),
      hours: isPerm ? 0 : hoursVal,
      startTime: nowStamp,
      endTime: computedEnd,
      isPermanent: isPerm,
      active: true,
      views: 0,
      clicks: 0,
    }).then(() => {
      showToast("✓ تم حجز وإدراج الحملة الإعلانية بنجاح");
    }).catch((err) => {
      console.error(err);
      showToast("❌ فشل النشر الإعلاني: تحقق من الصلاحيات");
    });
  };

  // EDIT DYNAMIC AD CAMPAIGN
  const openEditAd = (ad: AdItem) => {
    setEditingAd(ad);
    setEditAdUsername(ad.username);
    setEditAdTitle(ad.adTitle);
    setEditAdLink(ad.adLink);
    setEditAdCodeTop(ad.topCode || "");
    setEditAdCodeBottom(ad.bottomCode || "");
    setEditAdIsPerm(!!ad.isPermanent);
    setEditAdHours("");
  };

  const handleUpdateAdCampaign = () => {
    if (!editingAd) return;

    const extra = parseFloat(editAdHours) || 0;
    let newEnd = editingAd.endTime;
    let computedHours = editingAd.hours;

    if (editAdIsPerm) {
      newEnd = 0;
      computedHours = 0;
    } else {
      const rightNow = Date.now();
      if (editingAd.isPermanent) {
        newEnd = rightNow + (extra || 24) * 3600000;
        computedHours = extra || 24;
      } else {
        if (newEnd < rightNow) newEnd = rightNow;
        newEnd += extra * 3600000;
        computedHours += extra;
      }
    }

    update(ref(db, `ads/${editingAd.key}`), {
      username: editAdUsername.trim(),
      adTitle: editAdTitle.trim(),
      adLink: editAdLink.trim(),
      topCode: editAdCodeTop.trim(),
      bottomCode: editAdCodeBottom.trim(),
      isPermanent: editAdIsPerm,
      endTime: newEnd,
      hours: computedHours,
      active: true,
    }).then(() => {
      setEditingAd(null);
      showToast("✓ تم تحديث الحملة الإعلانية بنجاح");
    }).catch((err) => {
      console.error(err);
      showToast("❌ فشل حفظ تعديل الإعلان: تحقق من الصلاحيات");
    });
  };

  // DELETE AD CAMPAIGN
  const handleDeleteAdCampaign = (id: string) => {
    triggerAlert("حذف الإعلان", "هل متأكد من إلغاء الإعلان المتطابق بالكامل من السحابة؟", "danger", () => {
      remove(ref(db, `ads/${id}`)).then(() => {
        showToast("✓ تم إلغاء الإعلان وشطب السجلات");
      }).catch((err) => {
        console.error(err);
        showToast("❌ فشل الحذف الإعلاني: تحقق من الصلاحيات");
      });
    });
  };

  // COPY DIRECT AD CAMPAIGN VIEW URL
  const handleCopyAdLink = (key: string) => {
    const url = `${window.location.origin}/adview.html?key=${encodeURIComponent(key)}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("✓ تم نسخ الرابط المباشر للمشاركة");
    });
  };

  if (authLoading) return null; // Controlled by loading overlay in App.tsx

  if (!user) {
    return (
      <AdminLogin
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPass={loginPass}
        setLoginPass={setLoginPass}
        loginError={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] pb-24" dir="rtl">
      <main className="max-w-[480px] mx-auto px-4 pt-5 select-none text-right">
        
        {/* Masthead Header Bento */}
        <AdminHeader onLogout={handleLogout} />

        {/* Tab Modules Content representation */}
        {activeTab === "stats" && (
          <StatsTab stats={stats} apps={apps} onNavigateToApps={() => setActiveTab("apps")} />
        )}
        
        {activeTab === "apps" && (
          <AppsTab
            apps={apps}
            stats={stats}
            onEditApp={openEditApp}
            onDeleteApp={handleDeleteApp}
            onAddApp={handleAddApp}
            onCopyLink={handleCopyAppLink}
          />
        )}

        {activeTab === "ads" && (
          <AdsTab
            ads={ads}
            adUnits={adUnits}
            antiAdblock={antiAdblock}
            onToggleAntiAdblock={handleToggleAntiAdblock}
            onSaveAdUnit={handleSaveAdUnit}
            onAddAd={handleAddAdCampaign}
            onEditAd={openEditAd}
            onDeleteAd={handleDeleteAdCampaign}
            onCopyAdLink={handleCopyAdLink}
            onShowAdStats={(ad) => setViewingAdDetail(ad)}
          />
        )}

        {/* User issue ticket reporting inbox list has been removed as requested */}

        {activeTab === "settings" && (
          <SettingsTab
            tutorialLink={tutorialLink}
            profilePic={profilePic}
            youtubeLink={youtubeLink}
            telegramLink={telegramLink}
            contactLink={contactLink}
            onSaveSetting={handleSaveSetting}
            onDeleteSetting={handleDeleteSetting}
            onDownloadBackup={handleDownloadBackup}
            showToast={showToast}
          />
        )}
      </main>

      {/* STICKY BOTTOM NAVIGATION BAR TIMING MENU */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[rgba(80,59,24,0.12)] flex justify-around items-center py-2 pb-max(12px,env(safe-area-inset-bottom)) select-none">
        {[
          { k: "stats" as const, l: "الإحصائيات", i: "query_stats" },
          { k: "apps" as const, l: "التطبيقات", i: "apps" },
          { k: "ads" as const, l: "الإعلانات", i: "campaign" },
          { k: "settings" as const, l: "الإعدادات", i: "settings" },
        ].map((tab) => {
          return (
            <button
              key={tab.k}
              type="button"
              onClick={() => setActiveTab(tab.k)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border border-transparent transition cursor-pointer min-w-[75px] relative ${
                activeTab === tab.k ? "bg-[rgba(80,59,24,0.08)] text-[#503B18]" : "text-[rgba(80,59,24,0.4)]"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.k ? "font-fill" : ""}`}>
                {tab.i}
              </span>
              <span className="text-[9px] font-black">{tab.l}</span>
            </button>
          );
        })}
      </nav>

      {/* ──── SHEETS & DIALOGS OVERLAY POPUPS MODULES ──── */}

      {/* MODAL SHEET 1: APP EDITOR SHEET UPDATE */}
      {editingApp && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-t-[28px] md:rounded-[24px] w-full max-w-md p-6 shadow-2xl border border-[rgba(80,59,24,0.15)] flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-[sheetSlideUp_0.35s_cubic-bezier(0.17,0.67,0.24,1.18)]">
            <div className="flex justify-between items-center select-none">
              <h4 className="text-sm font-black text-[#2C1810]">تعديل كرت التطبيق</h4>
              <button
                onClick={() => setEditingApp(null)}
                className="w-8 h-8 rounded-lg bg-[rgba(80,59,24,0.08)] text-[#503B18] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-right">
              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">المعرّف الحالي للدلالة</label>
                <input
                  type="text"
                  value={editingApp.key}
                  disabled
                  className="w-full p-3 bg-neutral-100 border border-neutral-300 rounded-xl outline-none text-xs font-mono text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">تغيير معرّف كرت التحويل (ID)</label>
                <input
                  type="text"
                  value={editNewAppId}
                  onChange={(e) => setEditNewAppId(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-semibold text-[#2C1810] focus:border-[#503B18]"
                  placeholder="مثال: custom-app-id"
                />
                <span className="text-[9px] text-[#6E5F4A] font-bold mt-1 block">اتركه فارغاً للاحتفاظ بالمعرّف القديم</span>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">اسم التطبيق</label>
                <input
                  type="text"
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">رابط التحميل</label>
                <input
                  type="url"
                  value={editAppLink}
                  onChange={(e) => setEditAppLink(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">رابط صورة/شعار التطبيق (اختياري)</label>
                <input
                  type="url"
                  value={editAppImageUrl}
                  onChange={(e) => setEditAppImageUrl(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18] font-sans"
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">الوصف المترابط</label>
                <textarea
                  value={editAppDescription}
                  onChange={(e) => setEditAppDescription(e.target.value.slice(0, 7000))}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-semibold text-[#2C1810] min-h-[90px] focus:border-[#503B18]"
                />
                <div className="text-[10px] text-left text-[#6E5F4A] font-bold mt-1">
                  <span>{editAppDescription.length}</span> / 7000 حرف
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1.5">فئات التصنيف والأيقونات</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { k: "" as const, l: "بدون هوية", i: "help_center" },
                    { k: "internet" as const, l: "إنترنت", i: "language" },
                    { k: "dev" as const, l: "برمجة", i: "code" },
                    { k: "random" as const, l: "عشوائي", i: "casino" },
                    { k: "apk" as const, l: "APK", i: "package_2" },
                  ].map((chip) => (
                    <button
                      key={chip.k}
                      type="button"
                      onClick={() => setEditAppCat(chip.k)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5 transition cursor-pointer ${
                        editAppCat === chip.k
                          ? "bg-[#503B18] border-[#503B18] text-[#FDFBF7]"
                          : "bg-[rgba(80,59,24,0.07)] border-[rgba(80,59,24,0.14)] text-[#2C1810]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px] font-fill">{chip.i}</span>
                      <span>{chip.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-2 select-none">
                <button
                  type="button"
                  onClick={handleUpdateApp}
                  className="flex-1 py-3 bg-[#503B18] text-[#FDFBF7] text-xs font-black rounded-xl hover:shadow cursor-pointer"
                >
                  تأكيد التعديل
                </button>
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="flex-1 py-3 bg-[rgba(80,59,24,0.08)] text-[#503B18] text-xs font-black rounded-xl border border-[rgba(80,59,24,0.12)] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHEET 2: MANUAL AD EDIT SHEET UPDATE */}
      {editingAd && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-t-[28px] md:rounded-[24px] w-full max-w-md p-6 shadow-2xl border border-[rgba(80,59,24,0.15)] flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-[sheetSlideUp_0.35s_cubic-bezier(0.17,0.67,0.24,1.18)]">
            <div className="flex justify-between items-center select-none">
              <h4 className="text-sm font-black text-[#2C1810]">تعديل حملة إعلانية</h4>
              <button
                onClick={() => setEditingAd(null)}
                className="w-8 h-8 rounded-lg bg-[rgba(80,59,24,0.08)] text-[#503B18] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-right">
              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">اسم المُعلِن</label>
                <input
                  type="text"
                  value={editAdUsername}
                  onChange={(e) => setEditAdUsername(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">عنوان الإعلان</label>
                <input
                  type="text"
                  value={editAdTitle}
                  onChange={(e) => setEditAdTitle(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">رابط التحويل</label>
                <input
                  type="url"
                  value={editAdLink}
                  onChange={(e) => setEditAdLink(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">كود الإعلان العلوي</label>
                <textarea
                  value={editAdCodeTop}
                  onChange={(e) => setEditAdCodeTop(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-semibold text-[#2C1810] focus:border-[#503B18] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">كود الإعلان السفلي</label>
                <textarea
                  value={editAdCodeBottom}
                  onChange={(e) => setEditAdCodeBottom(e.target.value)}
                  className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-semibold text-[#2C1810] focus:border-[#503B18] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#6E5F4A] block mb-2">تاريخ انتهاء الإعلان</label>
                <div className="flex gap-2 items-center flex-wrap mb-1.5">
                  <label className="flex items-center gap-1.5 bg-[rgba(80,59,24,0.07)] border border-[rgba(80,59,24,0.14)] rounded-full px-3 py-2 text-[11px] font-bold text-[#503B18] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAdIsPerm}
                      onChange={(e) => setEditAdIsPerm(e.target.checked)}
                      className="rounded border-gray-300 accent-[#503B18]"
                    />
                    <span>بدون تاريخ انتهاء (دائم)</span>
                  </label>
                </div>

                {!editAdIsPerm && (
                  <input
                    type="number"
                    value={editAdHours}
                    onChange={(e) => setEditAdHours(e.target.value)}
                    className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-xl outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
                    placeholder="إضافة ساعات إضافية للعداد..."
                  />
                )}
              </div>

              <div className="flex gap-2 select-none">
                <button
                  type="button"
                  onClick={handleUpdateAdCampaign}
                  className="flex-1 py-3 bg-[#503B18] text-[#FDFBF7] text-xs font-black rounded-xl hover:shadow cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="flex-1 py-3 bg-[rgba(80,59,24,0.08)] text-[#503B18] text-xs font-black rounded-xl border border-[rgba(80,59,24,0.12)] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHEET 3: AD DETAILED INSIGHT DIALOG */}
      {viewingAdDetail && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-t-[28px] md:rounded-[24px] w-full max-w-sm p-6 shadow-2xl border border-[rgba(80,59,24,0.15)] flex flex-col gap-4 animate-[sheetSlideUp_0.35s_cubic-bezier(0.17,0.67,0.24,1.18)]">
            <div className="flex justify-between items-center select-none">
              <h4 className="text-sm font-black text-[#2C1810]">بيانات الإعلان تفصيلياً</h4>
              <button
                onClick={() => setViewingAdDetail(null)}
                className="w-8 h-8 rounded-lg bg-[rgba(80,59,24,0.08)] text-[#503B18] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="text-center flex flex-col gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#503B18] to-[#7A5C30] text-[#FDFBF7] rounded-[18px] flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-[28px] font-fill animate-pulse">campaign</span>
              </div>
              <div>
                <h4 className="text-base font-black text-[#2C1810]" style={{ overflowWrap: "anywhere" }}>
                  {viewingAdDetail.adTitle}
                </h4>
                <p className="text-[11px] text-[#6E5F4A] font-bold mt-1">المعلّن: @{viewingAdDetail.username}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-3 bg-neutral-100 rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-[#503B18] text-lg font-fill">schedule</span>
                <div>
                  <div className="text-[9px] text-[#6E5F4A] font-bold leading-normal">تاريخ البدء</div>
                  <div className="text-xs font-black text-[#2C1810]">
                    {new Date(viewingAdDetail.startTime).toLocaleString("ar-EG")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-neutral-100 rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-red-600 text-lg font-fill">event</span>
                <div>
                  <div className="text-[9px] text-[#6E5F4A] font-bold leading-normal">تاريخ الانتهاء</div>
                  <div className="text-xs font-black text-[#2C1810]">
                    {viewingAdDetail.isPermanent ? "طويل الأمد / لا نهائي" : new Date(viewingAdDetail.endTime).toLocaleString("ar-EG")}
                  </div>
                </div>
              </div>

              {/* Views & Clicks Stats Box */}
              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                <div className="bg-[#503B18]/5 border border-[rgba(80,59,24,0.1)] rounded-xl py-3 text-center">
                  <div className="text-xl font-black text-[#503B18] leading-none mb-0.5 font-mono">
                    {viewingAdDetail.views || 0}
                  </div>
                  <div className="text-[10px] text-[rgba(80,59,24,0.5)] font-extrabold">مشاهدة</div>
                </div>
                <div className="bg-[#D4AF37]/5 border border-[rgba(212,175,55,0.12)] rounded-xl py-3 text-center">
                  <div className="text-xl font-black text-[#8B6914] leading-none mb-0.5 font-mono">
                    {viewingAdDetail.clicks || 0}
                  </div>
                  <div className="text-[10px] text-[rgba(80,59,24,0.5)] font-extrabold">ضغط وحضور</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCopyAdLink(viewingAdDetail.key);
                  setViewingAdDetail(null);
                }}
                className="w-full py-3 mt-1.5 bg-[#503B18] hover:bg-[#3E2D12] text-[#FDFBF7] text-xs font-black rounded-xl transition cursor-pointer"
              >
                نسخ شفرة رابط الحملة الإعلانية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LEVEL CUSTOM PROMPT BOX ALERT */}
      <AdminAlert
        isOpen={alert.isOpen}
        title={alert.title}
        msg={alert.msg}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
      />

      <style>{`
        @keyframes sheetSlideUp {
          from {
            transform: translateY(60%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
