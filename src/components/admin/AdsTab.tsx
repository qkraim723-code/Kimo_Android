import React, { useState } from "react";
import { AdItem, AdUnits } from "../../types";
import { db } from "../../firebase";
import { ref, set } from "firebase/database";

interface AdsTabProps {
  ads: AdItem[];
  adUnits: AdUnits;
  antiAdblock: boolean;
  onToggleAntiAdblock: () => void;
  onSaveAdUnit: (key: string, code: string, active: boolean) => void;
  onAddAd: (
    username: string,
    adTitle: string,
    adLink: string,
    topCode: string,
    bottomCode: string,
    hours: number,
    isPermanent: boolean
  ) => void;
  onEditAd: (ad: AdItem) => void;
  onDeleteAd: (id: string) => void;
  onCopyAdLink: (id: string) => void;
  onShowAdStats: (ad: AdItem) => void;
}

export const AdsTab: React.FC<AdsTabProps> = ({
  ads,
  adUnits,
  antiAdblock,
  onToggleAntiAdblock,
  onSaveAdUnit,
  onEditAd,
  onDeleteAd,
  onCopyAdLink,
  onShowAdStats,
}) => {
  // Tabs for managing ads list: "active" is live campaigns, "archived" is manual archived ads
  const [adsSectionTab, setAdsSectionTab] = useState<"live" | "archived">("live");

  // Edit Code Unit States
  const [editingUnitKey, setEditingUnitKey] = useState<string | null>(null);
  const [editingUnitCode, setEditingUnitCode] = useState("");

  // Dialogue Box explaining what each ad unit is and setup tips
  const [explainingUnitKey, setExplainingUnitKey] = useState<string | null>(null);

  // Defining the exact 7 customized ad units with Arabic details
  const CUSTOM_AD_UNITS = [
    {
      key: "unit1",
      label: "إعلان ❶: كود Monetag الذكي الموحد (Multitag / Head Script)",
      description: "✦ مكان الظهور: يندمج تلقائياً في خلفية المتجر ويعمل كـ Popunder أو إعلان بيني ذكي متجاوب.\n✦ عمله: يجمع كل أشكال الإعلانات المربحة في كود موحد من Monetag، ويضمن لك تحقيق أرباح سلبية دون إفساد تجربة المستخدم بشكل مباشر.",
      requirements: "كود Monetag الموحد الذكي (Multitag) فقط."
    },
    {
      key: "unit2",
      label: "إعلان ❷: البنر العلوي لصفحة الانتظار (Top Banner - فوق التايمر)",
      description: "✦ مكان الظهور: يظهر في أعلى صفحة التحويل (صفحة الانتظار) مباشرةً فوق كرت العداد والتطبيق الأساسي.\n✦ عمله: يجلب انتباه الزائر بمجرد دخوله لانتظار الرابط المباشر. يفضل استخدام مقاسات مرنة مثل (320x50 أو 300x250) لتحقيق أعلى عائد لكل ألف ظهور.",
      requirements: "كود البنر الإعلاني من شركة Publishers أو Adsterra."
    },
    {
      key: "unit3",
      label: "إعلان ❸: البنر الأوسط لصفحة الانتظار (Middle Banner - أسفل الوصف)",
      description: "✦ مكان الظهور: يظهر داخل صفحة الانتظار مباشرة بعد وصف ملف التطبيق وجدول البيانات الأمنية.\n✦ عمله: يقع في منتصف نظر الزائر تماماً أثناء قراءة مواصفات الملف، مما يجعل نسبة النقر على هذا الإعلان مرتفعة للغاية.",
      requirements: "كود بنر بمقاس 300x250 أو بنر متجاوب من Publishers أو Adsterra."
    },
    {
      key: "unit4",
      label: "إعلان ❹: البنر السفلي لصفحة الانتظار (Bottom Banner - بجانب زر التحميل)",
      description: "✦ مكان الظهور: يظهر في الجزء السفلي لصفحة الانتظار مباشرة فوق أو بجانب الأزرار النهائية لتنزيل الملف بعد تقدم كبسولة الرابط.\n✦ عمله: يستهدف الزائرين الذين يستعدون للنقر والتحميل، ويحقق معدلات تفاعل ممتازة.",
      requirements: "كود بنر سفلي متجاوب للجوال من Publishers."
    },
    {
      key: "unit5",
      label: "إعلان ❺: شريط الجوال اللاصق العائم السفلي (Sticky Mobile Floating Banner)",
      description: "✦ مكان الظهور: يظهر ملتصقاً بأسفل شاشة الهاتف الذكي بشكل عائم ومستمر عبر جميع صفحات المتجر.\n✦ عمله: يتحرك صعوداً ونزولاً مع تمرير الزائر، مما يوفر فرصة نقر دائمة وأرباحاً تصاعدية ممتازة.",
      requirements: "شفرة بنر بمقاس 320x50 مبرمجة للاستقرار بأسفل شاشة الهاتف."
    },
    {
      key: "unit6",
      label: "إعلان ❻: نافذة البوب اندر المنبثقة الخلفية (Popunder / Direct Smart Link)",
      description: "✦ مكان الظهور: ينبثق خلف الشاشة فجأة للزائر عندما يضغط على أي منطقة فارغة أو زر في المتجر لأول مرة.\n✦ عمله: يُعد من أقوى الإعلانات ربحية على الإطلاق، حيث يدعم الروابط الذكية المباشرة (Smart Links).",
      requirements: "رابط مباشر ذكي (Direct Link) أو سكريبت Popunder ذكي من Adsterra أو Monetag."
    },
    {
      key: "unit7",
      label: "إعلان ❼: زر التحميل الترويجي الوهمي المطور (Fake Download Banner / Smart link)",
      description: "✦ مكان الظهور: كرت إعلاني يحاكي كبسة 'زر تحميل مباشر مجاني' مدمجة في صفحة الانتظار والتحويلات.\n✦ عمله: مصمم بشكل مغري وجذاب يوحي بأنه الزر الفعلي لتنزيل الملف، وينقل الزائر لعروضك الترويجية أو روابط الأرباح المباشرة.",
      requirements: "رابط مباشر ذكي (Smart Link) أو كود بنر نيتف ترويجي."
    }
  ];

  const getUnitLabel = (key: string) => {
    const item = CUSTOM_AD_UNITS.find(u => u.key === key);
    return item ? item.label : `الوحدة الإعلانية ${key}`;
  };

  const handleSaveUnit = () => {
    if (!editingUnitKey) return;
    const currentActive = adUnits[editingUnitKey]?.active ?? false;
    onSaveAdUnit(editingUnitKey, editingUnitCode, currentActive);
    setEditingUnitKey(null);
  };

  // Archive and Unarchive triggers directly executed into Realtime Database
  const handleArchiveAd = (adKey: string, archiveState: boolean) => {
    set(ref(db, `ads/${adKey}/archived`), archiveState).catch(() => {});
  };

  const now = Date.now();
  
  // Filter campaign lists in real-time
  const liveAds = ads.filter(ad => !ad.archived);
  const archivedAds = ads.filter(ad => ad.archived === true);

  const shownAdsList = adsSectionTab === "live" ? liveAds : archivedAds;

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-fade-in" dir="rtl">
      
      {/* 1. COMPACT ADBLOCK PROTECTION PANEL (POLISHED DESIGN) */}
      <div className="bg-[#FFFDFC] border-2 border-red-200/55 rounded-[22px] p-5 shadow-[0_8px_24px_rgba(239,68,68,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-right">
          <div className="w-11 h-11 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined font-fill text-xl animate-pulse">shield_locked</span>
          </div>
          <div>
            <div className="text-xs font-black text-[#2C1810]">أنظمة حماية وتفادي AdBlock</div>
            <div className="text-[10px] text-[#6E5F4A] font-extrabold leading-tight mt-1">
              إغلاق المتجر تماماً في وجه الزوار الذين يستعملون حاصبات ومانعات الإعلانات لكسب أرباح نقية 100%.
            </div>
          </div>
        </div>

        {/* Improved switch styling to prevent stretching */}
        <div className="flex items-center gap-2 select-none h-6 shrink-0 z-10">
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={antiAdblock} 
              onChange={onToggleAntiAdblock} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-250 border border-gray-300/40 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#D4AF37] transition-colors" />
          </label>
          <span className="text-[10px] font-black text-[#503B18] px-2 bg-amber-100 rounded-full">
            {antiAdblock ? "مفعل" : "معطل"}
          </span>
        </div>
      </div>

      {/* 2. THE 7 CUSTOM DEFINED UNIT MODULE PANEL */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[24px] p-5 shadow-[0_10px_35px_rgba(80,59,24,0.05)] flex flex-col gap-4">
        <div className="border-b border-[rgba(80,59,24,0.08)] pb-3 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-amber-500 block" />
            <h3 className="text-xs font-black text-[#2C1810]">
              تهيئة وإدارة البنرات الوحدات الإعلانية السحابية
            </h3>
          </div>
          <span className="text-[9.5px] font-black text-[#D4AF37]">7 وحدات جاهزة</span>
        </div>

        <p className="text-[10px] text-[#6E5F4A] font-extrabold leading-relaxed -mt-1 select-none">
          جميع الوحدات الإعلانية التالية مغلقة وتكون مقفلة وتعمل بسويتش تفعيل ترويجي خاص، اضغط على زر المعاينة لمعرفة متطلبات ومكان حقن كود كل إعلان بالتفاصيل العربية الميسرة:
        </p>

        <div className="flex flex-col gap-3.5 mt-1">
          {CUSTOM_AD_UNITS.map((unit) => {
            const u = adUnits[unit.key];
            const code = u?.code || "";
            const active = u?.active === true;

            return (
              <div 
                key={unit.key} 
                className="flex items-center justify-between gap-3 p-3.5 bg-[rgba(80,59,24,0.035)] border border-[rgba(80,59,24,0.1)] rounded-[16px] hover:border-amber-400/50 transition duration-150"
              >
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-[11.5px] font-black text-[#2C1810] flex items-center gap-1.5 flex-wrap">
                    <span>{unit.label}</span>
                    <button
                      type="button"
                      onClick={() => setExplainingUnitKey(unit.key)}
                      className="w-5 h-5 rounded-full bg-amber-100 hover:bg-[#503B18] text-amber-900 hover:text-[#FDFBF7] flex items-center justify-center transition cursor-pointer"
                      title="تفاصيل هذا الإعلان"
                    >
                      <span className="material-symbols-outlined text-[12px] font-fill">help</span>
                    </button>
                  </div>
                  <div className="text-[9px] text-[#6E5F4A] font-extrabold truncate mt-1">
                    {unit.description}
                  </div>
                </div>

                {/* Control elements */}
                <div className="flex items-center gap-2 shrink-0 select-none">
                  {/* Edit HTML/JS Code Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUnitKey(unit.key);
                      setEditingUnitCode(code);
                    }}
                    className="w-8 h-8 rounded-lg bg-[rgba(80,59,24,0.08)] hover:bg-[#503B18] text-[#503B18] hover:text-[#FDFBF7] flex items-center justify-center transition cursor-pointer"
                    title="تعديل الكود البرمجي"
                  >
                    <span className="material-symbols-outlined text-[15px]">code</span>
                  </button>

                  {/* Predefined Dynamic Switches */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => onSaveAdUnit(unit.key, code, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-gray-250 border border-gray-300/40 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[3px] after:left-[2.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#D4AF37] transition-colors" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CAMPAIGN DIRECT MANAGEMENT (ACTIVE & ARCHIVE DEPARTMENTS) */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#503B18] block" />
            <h3 className="text-xs font-black text-[#2C1810]">إدارة وأرشفة إعلانات الجسور الذكية</h3>
          </div>

          {/* Filtering Active vs Archived tabs */}
          <div className="flex gap-1.5 select-none bg-neutral-100 p-1 rounded-full border border-gray-200">
            <button
              onClick={() => setAdsSectionTab("live")}
              className={`px-3 py-1.5 text-[10px] font-black rounded-full transition cursor-pointer ${
                adsSectionTab === "live"
                  ? "bg-[#503B18] text-[#FDFBF7]"
                  : "text-[#503B18] hover:bg-neutral-200"
              }`}
            >
              الحملات النشطة ({liveAds.length})
            </button>
            <button
              onClick={() => setAdsSectionTab("archived")}
              className={`px-3 py-1.5 text-[10px] font-black rounded-full transition cursor-pointer ${
                adsSectionTab === "archived"
                  ? "bg-amber-600 text-[#FDFBF7]"
                  : "text-[#503B18] hover:bg-neutral-200"
              }`}
            >
              الأرشيف والمؤرشفة ({archivedAds.length})
            </button>
          </div>
        </div>

        {shownAdsList.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {shownAdsList.map((ad, i) => {
              const activeStyle = ad.active && (ad.isPermanent || (ad.endTime && ad.endTime > now));
              const finalViews = ad.views || 0;
              const finalClicks = ad.clicks || 0;

              return (
                <div
                  key={ad.key}
                  className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[20px] p-4 flex flex-col gap-3.5 shadow-md relative overflow-hidden"
                >
                  <div className="flex gap-3 items-start justify-between">
                    <div className="flex-1 min-w-0" onClick={() => onShowAdStats(ad)}>
                      <div className="text-xs font-black text-[#2C1810] mb-1 flex items-center gap-1.5 cursor-pointer hover:text-[#503B18]">
                        <span>#{i + 1} - {ad.adTitle}</span>
                        <span className="text-[10px] text-[#6E5F4A] bg-[rgba(80,59,24,0.06)] px-2 py-0.5 rounded-full font-mono">
                          مفتاح: {ad.key.slice(0, 7)}
                        </span>
                      </div>
                      <div className="text-[9.5px] font-bold text-[#6E5F4A]/70 flex gap-2 flex-wrap mb-1">
                        <span>العميل: @{ad.username}</span>
                        <span>شروع: {new Date(ad.startTime).toLocaleDateString("ar-EG")}</span>
                        <span>
                          نهاية: {ad.isPermanent ? "دائم ومستمر" : new Date(ad.endTime).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>

                    {/* Live Status indicator */}
                    <div>
                      {ad.archived ? (
                        <div className="text-[9px] font-black text-amber-800 bg-amber-100 rounded-full px-2 py-0.5 select-none">
                          مؤرشف تلقائي
                        </div>
                      ) : activeStyle ? (
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black text-emerald-800 bg-emerald-500/10 rounded-full px-2.5 py-0.5 select-none">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span>بث حي</span>
                        </div>
                      ) : (
                        <div className="text-[9.5px] font-black text-red-600 bg-red-100 rounded-full px-2.5 py-0.5 select-none">
                          منقضي
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini-stat block */}
                  <div className="grid grid-cols-2 gap-2 text-center select-none" onClick={() => onShowAdStats(ad)}>
                    <div className="bg-[rgba(80,59,24,0.03)] border border-[rgba(80,59,24,0.06)] rounded-xl py-1.5 cursor-pointer">
                      <div className="text-sm font-black text-[#2C1810] font-mono">{finalViews}</div>
                      <div className="text-[8.5px] text-[#6E5F4A] font-extrabold">مجموع المشاهدات</div>
                    </div>
                    <div className="bg-[rgba(212,175,55,0.06)] border border-transparent rounded-xl py-1.5 cursor-pointer">
                      <div className="text-sm font-black text-[#8B6914] font-mono">{finalClicks}</div>
                      <div className="text-[8.5px] text-[#6E5F4A] font-extrabold">التحويلات الكلية</div>
                    </div>
                  </div>

                  {/* Visual Control Tray incorporating the Archive Toggle */}
                  <div className="flex justify-end gap-1.5 w-full mt-1 border-t border-[rgba(80,59,24,0.06)] pt-3 select-none">
                    <button
                      onClick={() => onCopyAdLink(ad.key)}
                      className="flex-1 h-8 text-[10px] font-black rounded-lg bg-[rgba(80,59,24,0.06)] hover:bg-[#503B18] text-[#503B18] hover:text-[#FDFBF7] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">link</span>
                      <span>نسخ الرابط</span>
                    </button>
                    <button
                      onClick={() => onEditAd(ad)}
                      className="flex-1 h-8 text-[10px] font-black rounded-lg bg-[rgba(212,175,55,0.1)] hover:bg-[#D4AF37] text-[#8B6914] hover:text-[#FDFBF7] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">edit</span>
                      <span>تعديل</span>
                    </button>

                    {/* Dynamic Archived state button */}
                    {ad.archived ? (
                      <button
                        onClick={() => handleArchiveAd(ad.key, false)}
                        className="flex-1 h-8 text-[10px] font-black rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                        title="إعادة تنشيط هذا الإعلان وإخراجه من الأرشيف"
                      >
                        <span className="material-symbols-outlined text-[13px]">unarchive</span>
                        <span>إلغاء الأرشيف</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveAd(ad.key, true)}
                        className="flex-1 h-8 text-[10px] font-black rounded-lg bg-amber-100 hover:bg-amber-600 text-amber-800 hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                        title="أرشفة هذا الإعلان في قسم الأرشيف منفصلاً"
                      >
                        <span className="material-symbols-outlined text-[13px]">archive</span>
                        <span>أرشفة</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteAd(ad.key)}
                      className="flex-1 h-8 text-[10px] font-black rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">delete</span>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs py-10 text-[#6E5F4A]/40 bg-[#FDFBF7] border border-[rgba(80,59,24,0.08)] rounded-[22px]">
            {adsSectionTab === "live" ? "لا توجد حملات إعلانية نشطة مدرجة حالياً" : "الأرشيف فارغ حالياً من أي إعلانات مؤرشفة."}
          </div>
        )}
      </div>

      {/* 4. MODAL DETAILED INFOGRAPHIC EXPLANATIONS (ARABIC) */}
      {explainingUnitKey && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF9] rounded-[24px] w-full max-w-sm p-6 shadow-2xl border-2 border-luxury-gold/20 flex flex-col gap-4 text-right">
            {(() => {
              const unit = CUSTOM_AD_UNITS.find(u => u.key === explainingUnitKey);
              if (!unit) return null;
              return (
                <>
                  <div className="flex justify-between items-center select-none pb-2 border-b border-luxury-gold/10">
                    <h4 className="text-xs font-black text-luxury-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm font-fill text-luxury-gold font-fill">help</span>
                      <span>معاينة: {unit.label}</span>
                    </h4>
                    <button
                      onClick={() => setExplainingUnitKey(null)}
                      className="w-7 h-7 rounded-lg bg-[rgba(80,59,24,0.08)] font-bold text-[#503B18] flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div className="text-xs font-semibold text-luxury-muted space-y-3.5 leading-relaxed">
                    <div>
                      <span className="font-black text-[#2C1810] block mb-1">💡 ما هو هذا الإعلان؟</span>
                      <p>{unit.description}</p>
                    </div>
                    <div>
                      <span className="font-black text-[#503B18] block mb-1">🔗 الأكواد المطلوبة لتشغيله:</span>
                      <p className="p-2.5 bg-amber-50 rounded-xl border border-luxury-gold/10 font-bold text-[#8B6914] text-[10.5px]">
                        {unit.requirements}
                      </p>
                    </div>
                    <div className="text-[10px] text-[#A68F6C] font-extrabold p-2 bg-neutral-100 rounded-xl text-center">
                      * اضغط على زر الكود ومفتاح التفعيل لتعديل أو تنشيط الإشهار سحابياً.
                    </div>
                  </div>

                  <button
                    onClick={() => setExplainingUnitKey(null)}
                    className="w-full py-2.5 bg-[#503B18] text-[#FDFBF7] text-xs font-black rounded-xl cursor-pointer"
                  >
                    مفهوم وممتاز
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. EDIT CODE MODAL */}
      {editingUnitKey && (
        <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-[24px] w-full max-w-sm p-6 shadow-2xl border border-[rgba(80,59,24,0.15)] flex flex-col gap-4 text-right animate-[fadeScaleIn_0.25s_ease-out]">
            <div className="flex justify-between items-center select-none pb-1 border-b border-[rgba(80,59,24,0.08)]">
              <h4 className="text-xs font-black text-[#2C1810]">
                تعديل سكريبت: <span className="text-[#503B18]">{getUnitLabel(editingUnitKey)}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingUnitKey(null)}
                className="w-7 h-7 rounded-lg bg-[rgba(80,59,24,0.08)] font-bold text-[#503B18] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {(() => {
              const unit = CUSTOM_AD_UNITS.find(u => u.key === editingUnitKey);
              if (!unit) return null;
              return (
                <div className="bg-amber-100/40 border border-luxury-gold/15 p-3 rounded-xl text-[10.5px] select-text">
                  <span className="font-black text-[#503B18] block mb-1">💡 تفاصيل والمنصات المناسبة لهذه الوحدة:</span>
                  <p className="text-[#6E5F4A] leading-relaxed font-bold">{unit.description}</p>
                  <p className="mt-1.5 text-[#8B6914] font-black">الشفرة ونوع الكود: {unit.requirements}</p>
                </div>
              );
            })()}

            <div>
              <label className="text-[11px] font-black text-[#6E5F4A] block mb-1.5">أدخل كود سكريبت الإعلان البرمجي (JS / HTML):</label>
              <textarea
                value={editingUnitCode}
                onChange={(e) => setEditingUnitCode(e.target.value)}
                className="w-full h-36 p-3.5 bg-[#1b1509] text-amber-100 rounded-xl outline-none text-[10.5px] font-mono select-text"
                placeholder="الصق كود إعلانك هنا..."
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveUnit}
                className="flex-1 py-3 bg-[#503B18] text-[#FDFBF7] text-xs font-black rounded-xl hover:shadow transition cursor-pointer"
              >
                حفظ التغييرات
              </button>
              <button
                type="button"
                onClick={() => setEditingUnitKey(null)}
                className="flex-1 py-3 bg-[rgba(80,59,24,0.08)] border border-[rgba(80,59,24,0.12)] text-[#503B18] text-xs font-black rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
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
export default AdsTab;
