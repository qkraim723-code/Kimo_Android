import React, { useState } from "react";
import { AppItem, CategoryKey } from "../../types";

interface AppsTabProps {
  apps: AppItem[];
  stats: any;
  onEditApp: (app: AppItem) => void;
  onDeleteApp: (app: AppItem) => void;
  onAddApp: (name: string, link: string, cat: CategoryKey, desc: string, imageUrl: string) => void;
  onCopyLink: (key: string) => void;
}

export const AppsTab: React.FC<AppsTabProps> = ({
  apps,
  stats,
  onEditApp,
  onDeleteApp,
  onAddApp,
  onCopyLink,
}) => {
  const [search, setSearch] = useState("");
  // Form states for adding brand-new entries
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [cat, setCat] = useState<CategoryKey>("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const CATS: Record<string, { icon: string; bg: string; color: string; fill: boolean; label: string }> = {
    internet: { icon: "language", bg: "rgba(80,59,24,.09)", color: "#503B18", fill: true, label: "إنترنت" },
    dev: { icon: "code", bg: "rgba(212,175,55,.12)", color: "#8B6914", fill: false, label: "برمجة" },
    random: { icon: "casino", bg: "rgba(122,92,48,.09)", color: "#7A5C30", fill: true, label: "عشوائي" },
    apk: { icon: "package_2", bg: "rgba(44,24,16,.08)", color: "#2C1810", fill: true, label: "APK" },
  };

  const DEF_CAT = { icon: "help_center", bg: "rgba(80,59,24,.07)", color: "#503B18", fill: true, label: "بدون هوية" };

  const filteredApps = apps.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.key || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) return;
    onAddApp(name, link, cat, desc, imageUrl);
    // Reset Form
    setName("");
    setLink("");
    setCat("");
    setDesc("");
    setImageUrl("");
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-fade-in" dir="rtl">
      {/* SECTION 1: ADD NEW ENTRY FORM */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,.1)] text-right">
        <h3 className="text-xs font-black text-[#503B18] flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined font-fill text-lg">add_circle</span>
          <span>نشر تطبيق جديد</span>
        </h3>

        <form onSubmit={handlePublish} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">اسم التطبيق</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-[14px] outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
              placeholder="مثال: تطبيق VPN Pro"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">رابط التحميل</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-[14px] outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18]"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">رابط صورة/شعار التطبيق (اختياري)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-[14px] outline-none text-xs font-extrabold text-[#2C1810] focus:border-[#503B18] font-sans"
              placeholder="https://example.com/icon.png (اختياري)"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-[#6E5F4A] block mb-1">وصف التطبيق</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, 7000))}
              className="w-full p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-[14px] outline-none text-xs font-semibold text-[#2C1810] min-h-[90px] focus:border-[#503B18]"
              placeholder="اكتب وصفاً تفصيلياً للتطبيق..."
            />
            <div className="text-[10px] text-left text-[#6E5F4A] font-bold mt-1">
              <span>{desc.length}</span> / 7000 حرف
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-[#6E5F4A] block mb-1.5">الفئة والأيقونة</label>
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
                  onClick={() => setCat(chip.k)}
                  className={`px-3 py-2 text-[11px] font-bold rounded-full border flex items-center gap-1.5 transition cursor-pointer ${
                    cat === chip.k
                      ? "bg-[#503B18] border-[#503B18] text-[#FDFBF7]"
                      : "bg-[rgba(80,59,24,0.07)] border-[rgba(80,59,24,0.14)] text-[#2C1810] hover:bg-[rgba(80,59,24,0.12)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] font-fill">{chip.i}</span>
                  <span>{chip.l}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined font-fill text-sm">cloud_upload</span>
            <span>نشر التطبيق</span>
          </button>
        </form>
      </div>

      {/* SECTION 2: APPS DYNAMIC LIST (CRITICAL: REVERTED TO VERTICAL LIST PER USER FEEDBACK) */}
      <div className="flex flex-col gap-4 text-right">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black text-[#2C1810]">قائمة التطبيقات المضافة</h3>
          <span className="text-[11px] font-black text-[#503B18] bg-[rgba(80,59,24,0.09)] px-3 py-1 rounded-full border border-[rgba(80,59,24,0.16)]">
            {filteredApps.length} تطبيق
          </span>
        </div>

        {/* Search Filter input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3.5 pl-4 pr-11 bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-2xl outline-none text-xs font-semibold text-[#2C1810] placeholder-[rgba(80,59,24,0.4)] shadow-[0_8px_28px_rgba(80,59,24,.1)]"
            placeholder="ابحث عن تطبيق باسمه أو معرّفه..."
          />
          <span className="material-symbols-outlined text-lg text-[#503B18] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
        </div>

        {/* Vertical Sleek List Configuration instead of the square grids */}
        {filteredApps.length > 0 ? (
          <div className="flex flex-col gap-3">
            {[...filteredApps].reverse().map((app, i) => {
              const catConfig = CATS[app.category || ""] || DEF_CAT;
              const fv = catConfig.fill ? "'FILL' 1" : "'FILL' 0";

              // clicks & downloads analytics
              const totalDls = stats?.appDownloads?.[app.key]?.total || 0;
              const clicksData = stats?.appClicks?.[app.key];
              const totalClicks = clicksData ? (typeof clicksData === "object" ? clicksData.total || 0 : clicksData) : 0;

              return (
                <div
                  key={app.key}
                  className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[20px] p-4 flex items-center justify-between gap-3 shadow-[0_8px_24px_rgba(80,59,24,.06)] hover:-translate-y-0.5 hover:shadow-md transition duration-200 animate-[verticalSlideIn_0.3s_ease_both]"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon or Image Graphic */}
                    {app.imageUrl ? (
                      <img
                        src={app.imageUrl}
                        alt={app.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-[rgba(80,59,24,0.15)] bg-amber-50"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: catConfig.bg }}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ color: catConfig.color, fontVariationSettings: fv }}
                        >
                          {catConfig.icon}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#2C1810] truncate">{app.name}</div>
                      <div className="text-[10px] text-[#6E5F4A] font-mono mt-0.5 truncate">
                        ID: {app.key}
                      </div>

                      {/* Download statistics */}
                      <div className="flex gap-2.5 mt-1 select-none">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#6E5F4A]/80">
                          <span className="material-symbols-outlined text-[11px]">download</span>
                          <span>{totalDls} تحميل</span>
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#6E5F4A]/80">
                          <span className="material-symbols-outlined text-[11px]">touch_app</span>
                          <span>{totalClicks} نقرة</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions vertical right button row */}
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button
                      onClick={() => onEditApp(app)}
                      className="w-8 h-8 rounded-lg bg-[rgba(80,59,24,0.06)] hover:bg-[#503B18] text-[#503B18] hover:text-[#FDFBF7] transition cursor-pointer flex items-center justify-center"
                      title="تعديل التطبيق"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button
                      onClick={() => onCopyLink(app.key)}
                      className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.1)] hover:bg-[#D4AF37] text-[#8B6914] hover:text-[#FDFBF7] transition cursor-pointer flex items-center justify-center"
                      title="نسخ الرابط للمشاركة"
                    >
                      <span className="material-symbols-outlined text-[15px]">link</span>
                    </button>
                    <button
                      onClick={() => onDeleteApp(app)}
                      className="w-8 h-8 rounded-lg bg-[rgba(220,38,38,0.06)] hover:bg-red-600 text-red-600 hover:text-white transition cursor-pointer flex items-center justify-center"
                      title="حذف نهائي"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs py-12 text-[#6E5F4A]/40 bg-[#FDFBF7] border border-[rgba(80,59,24,0.12)] rounded-2xl shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
            لا توجد تطبيقات تتطابق مع مدخلات البحث حالياً
          </div>
        )}
      </div>

      <style>{`
        @keyframes verticalSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
