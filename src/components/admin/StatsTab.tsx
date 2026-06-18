import React, { useState } from "react";
import { AppItem, VisitStat } from "../../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StatsTabProps {
  stats: VisitStat | any;
  apps: AppItem[];
  onNavigateToApps?: () => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({ stats, apps, onNavigateToApps }) => {
  // Master Selected Detail View: "none" (Main Dashboard) or "v" (Visits), "c" (Clicks), "d" (Downloads/Tanzilat), "r" (Countries)
  const [detailTab, setDetailTab] = useState<"none" | "v" | "c" | "d" | "r">("none");
  
  // Specific Sub-Tab within the selected detail view: "today" | "week" | "month" | "all"
  const [filterMode, setFilterMode] = useState<"today" | "week" | "month" | "all">("today");

  const todayKey = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getDayOffset = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const WD = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const CTR: Record<string, [string, string]> = {
    Egypt: ["مصر", "🇪🇬"],
    "Saudi Arabia": ["السعودية", "🇸🇦"],
    Iraq: ["العراق", "🇮🇶"],
    Jordan: ["الأردن", "🇯🇴"],
    "United Arab Emirates": ["الإمارات", "🇦🇪"],
    Morocco: ["المغرب", "🇲🇦"],
    Algeria: ["الجزائر", "🇩🇿"],
    Tunisia: ["تونس", "🇹🇳"],
    Libya: ["ليبيا", "🇱🇾"],
    Kuwait: ["الكويت", "🇰🇼"],
    Qatar: ["قطر", "🇶🇦"],
    Palestine: ["فلسطين", "🇵🇸"],
    Lebanon: ["لبنان", "🇱🇧"],
    Syria: ["سوريا", "🇸🇾"],
    Yemen: ["اليمن", "🇾🇪"],
    Sudan: ["السودان", "🇸🇩"],
    Somalia: ["الصومال", "🇸🇴"],
    Turkey: ["تركيا", "🇹🇷"],
    India: ["الهند", "🇮🇳"],
    "United States": ["الولايات المتحدة", "🇺🇸"],
    "United Kingdom": ["المملكة المتحدة", "🇬🇧"],
    Germany: ["ألمانيا", "🇩🇪"],
    France: ["فرنسا", "🇫🇷"],
    Unknown: ["غير معروف", "🌍"],
  };

  const cn = (k: string) => (CTR[k] || [k, "🌍"])[0];
  const cf = (k: string) => (CTR[k] || [k, "🌍"])[1];

  // 1. Visits Analytics Calculations
  const getVisitsSummary = () => {
    const today = todayKey();
    const yesterday = getDayOffset(1);
    let todayVal = 0;
    let yesterdayVal = 0;
    let totalVal = 0;

    if (stats?.daily) {
      Object.entries(stats.daily).forEach(([date, dayValue]: [string, any]) => {
        const count = typeof dayValue === "object" ? (dayValue.visits || dayValue.total || 0) : (dayValue || 0);
        totalVal += count;
        if (date === today) todayVal = count;
        if (date === yesterday) yesterdayVal = count;
      });
    }
    return { today: todayVal, yesterday: yesterdayVal, total: totalVal };
  };

  // 2. Click Analytics Calculations
  const getClicksSummary = () => {
    const today = todayKey();
    const yesterday = getDayOffset(1);
    let todayVal = 0;
    let yesterdayVal = 0;
    let totalVal = 0;

    if (stats?.appClicks) {
      Object.entries(stats.appClicks).forEach(([_, clickValue]: [string, any]) => {
        if (clickValue && typeof clickValue === "object") {
          totalVal += clickValue.total || 0;
          if (clickValue.daily) {
            if (clickValue.daily[today]) todayVal += clickValue.daily[today];
            if (clickValue.daily[yesterday]) yesterdayVal += clickValue.daily[yesterday];
          }
        } else if (typeof clickValue === "number") {
          totalVal += clickValue;
        }
      });
    }
    return { today: todayVal, yesterday: yesterdayVal, total: totalVal };
  };

  // 3. Downloads Analytics Calculations
  const getDownloadsSummary = () => {
    const today = todayKey();
    const yesterday = getDayOffset(1);
    let todayVal = 0;
    let yesterdayVal = 0;
    let totalVal = 0;

    if (stats?.appDownloads) {
      Object.entries(stats.appDownloads).forEach(([_, val]: [string, any]) => {
        if (val && typeof val === "object") {
          totalVal += val.total || 0;
          if (val.daily) {
            if (val.daily[today]) todayVal += val.daily[today];
            if (val.daily[yesterday]) yesterdayVal += val.daily[yesterday];
          }
        }
      });
    }
    return { today: todayVal, yesterday: yesterdayVal, total: totalVal };
  };

  const visits = getVisitsSummary();
  const clicks = getClicksSummary();
  const downloads = getDownloadsSummary();

  const getTopCountryText = () => {
    const cm = mergeCountries("all");
    const sorted = Object.entries(cm).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const top = sorted[0];
      return `${cf(top[0])} ${cn(top[0])}`;
    }
    return "-";
  };

  const mergeCountries = (filt: string) => {
    const m: Record<string, number> = {};
    if (!stats?.countries) return m;

    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const w = new Date(t);
    w.setDate(w.getDate() - 7);
    const mo = new Date(t.getFullYear(), t.getMonth(), 1);

    const checkFit = (ds: string): boolean => {
      const d = new Date(ds);
      d.setHours(0, 0, 0, 0);
      if (filt === "today") return d.getTime() === t.getTime();
      if (filt === "week") return d >= w && d <= t;
      if (filt === "month") return d >= mo && d <= t;
      return true;
    };

    Object.entries(stats.countries).forEach(([c, v]: [string, any]) => {
      let tot = 0;
      if (typeof v === "number") {
        if (filt === "all") tot = v;
      } else if (typeof v === "object") {
        if (v.daily) {
          Object.entries(v.daily).forEach(([d, dv]: [string, any]) => {
            if (checkFit(d)) {
              tot += typeof dv === "object" ? (dv.visits || dv.total || 0) : dv || 0;
            }
          });
        }
        if (!tot && filt === "all") {
          tot = v.visits || v.total || 0;
        }
      }
      if (tot > 0) m[c] = (m[c] || 0) + tot;
    });

    return m;
  };

  // Recharts Trends Line For Last 7 Days
  const getTrendData = () => {
    const dataPoints = [];
    for (let i = 6; i >= 0; i--) {
      const dateKey = getDayOffset(i);
      const today = new Date();
      today.setDate(today.getDate() - i);
      const dayLabel = WD[today.getDay()];

      let vCount = 0;
      if (stats?.daily && stats.daily[dateKey]) {
        const item = stats.daily[dateKey];
        vCount = typeof item === "object" ? (item.visits || item.total || 0) : item || 0;
      }

      let dCount = 0;
      if (stats?.appDownloads) {
        Object.values(stats.appDownloads).forEach((appVal: any) => {
          if (appVal?.daily && appVal.daily[dateKey]) {
            dCount += appVal.daily[dateKey] || 0;
          }
        });
      }

      let cCount = 0;
      if (stats?.appClicks) {
        Object.values(stats.appClicks).forEach((appVal: any) => {
          if (appVal?.daily && appVal.daily[dateKey]) {
            cCount += appVal.daily[dateKey] || 0;
          }
        });
      }

      dataPoints.push({
        name: dayLabel,
        "زيارات": vCount,
        "نقرات": cCount,
        "تحميلات": dCount,
      });
    }
    return dataPoints;
  };

  // Country Pie Data Setup
  const getCountryPieData = () => {
    const cm = mergeCountries("all");
    return Object.entries(cm)
      .map(([name, value]) => ({ name: `${cf(name)} ${cn(name)}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const trendData = getTrendData();
  const pieData = getCountryPieData();
  const colors = ["#503B18", "#D4AF37", "#7A5C30", "#A07840", "#C8A050"];

  // Helper groupings
  const getWeeklyLogs = () => {
    // Generate previous 6 weeks with sum of visits
    const list = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const start = new Date(today);
      start.setDate(today.getDate() - (i * 7) - 6);
      const end = new Date(today);
      end.setDate(today.getDate() - (i * 7));

      let count = 0;
      // loop dates through this range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (stats?.daily && stats.daily[dateKey]) {
          const item = stats.daily[dateKey];
          count += typeof item === "object" ? (item.visits || item.total || 0) : item || 0;
        }
      }

      const rangeStr = `من ${start.toLocaleDateString("ar-EG", { month: "short", day: "numeric" })} إلى ${end.toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}`;
      list.push({ range: rangeStr, count });
    }
    return list;
  };

  const getMonthlyLogs = () => {
    // Group observations by month and year
    const monthlyGroups: Record<string, number> = {};
    if (stats?.daily) {
      Object.entries(stats.daily).forEach(([date, dayValue]: [string, any]) => {
        const count = typeof dayValue === "object" ? (dayValue.visits || dayValue.total || 0) : (dayValue || 0);
        const [year, month] = date.split("-");
        if (year && month) {
          const key = `${year}-${month}`;
          monthlyGroups[key] = (monthlyGroups[key] || 0) + count;
        }
      });
    }

    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    return Object.entries(monthlyGroups)
      .map(([key, count]) => {
        const [year, month] = key.split("-");
        const idx = parseInt(month) - 1;
        const monthLabel = `${monthNames[idx]} ${year}`;
        return { label: monthLabel, count, rawKey: key };
      })
      .sort((a, b) => b.rawKey.localeCompare(a.rawKey));
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none animate-fade-in text-right">
      {detailTab === "none" ? (
        <>
          {/* Main Informative Stats Bento Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { key: "v" as const, dataKey: "زيارات" as const, title: "زيارات اليوم", val: visits.today, icon: "visibility", textAll: `المجموع الكلي: ${visits.total}`, bg: "rgba(80,59,24,.09)", color: "#503B18" },
              { key: "c" as const, dataKey: "نقرات" as const, title: "نقرات اليوم", val: clicks.today, icon: "touch_app", textAll: `المجموع الكلي: ${clicks.total}`, bg: "rgba(212,175,55,.12)", color: "#D4AF37" },
              { key: "d" as const, dataKey: "تحميلات" as const, title: "تحميلات اليوم", val: downloads.today, icon: "download", textAll: `المجموع الكلي: ${downloads.total}`, bg: "rgba(80,59,24,.09)", color: "#503B18" },
            ].map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setDetailTab(card.key);
                  setFilterMode("today");
                }}
                className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-4 text-right shadow-[0_8px_28px_rgba(80,59,24,0.06)] hover:-translate-y-0.5 active:scale-95 transition flex flex-col gap-3 duration-200"
              >
                <div className="flex justify-between items-center w-full">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bg }}
                  >
                    <span className="material-symbols-outlined font-fill text-[16px] animate-pulse" style={{ color: card.color }}>
                      {card.icon}
                    </span>
                  </div>
                  <span className="text-[8.5px] font-black text-[#D4AF37] border border-amber-500/10 rounded-full px-1.5 py-0.5 bg-amber-500/5">
                    القرية الأخيرة ٧ أيام
                  </span>
                </div>
                
                <div className="text-[10px] font-black text-[#503B18]/60 -mb-1">{card.title}</div>
                
                <div className="flex items-end justify-between gap-1.5 w-full mt-1">
                  <div className="text-right">
                    <div className="text-xl font-black text-[#2C1810] font-mono leading-none mb-1">
                      {card.val}
                    </div>
                    <div className="text-[8.5px] text-[#6E5F4A] font-bold leading-tight truncate max-w-[110px]">
                      {card.textAll}
                    </div>
                  </div>
                  
                  {/* Micro sparkline bar representational of the last 7 calendar days */}
                  <div className="w-16 h-8 shrink-0 select-none pointer-events-none opacity-85">
                    <BarChart width={64} height={32} data={trendData}>
                      <Bar 
                        dataKey={card.dataKey} 
                        fill={card.color} 
                        radius={[2, 2, 0, 0]} 
                      />
                    </BarChart>
                  </div>
                </div>
              </button>
            ))}

            {/* Static Apps Link Card Section ("قسم تطبيقات اللي في الواجهة لما أضغط عليه يحولني لقسم التطبيقات") */}
            <button
              type="button"
              onClick={onNavigateToApps}
              className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-4 text-right shadow-[0_8px_28px_rgba(80,59,24,0.06)] hover:-translate-y-0.5 active:scale-95 transition flex flex-col gap-3.5 duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <span className="material-symbols-outlined font-fill text-lg">apps</span>
              </div>
              <div>
                <div className="text-[10px] font-black text-[#503B18]/60 mb-0.5">التطبيقات</div>
                <div className="text-2xl font-black text-[#2C1810] leading-none mb-1">
                  {apps.length}
                </div>
                <div className="text-[9.5px] text-amber-800 font-extrabold flex items-center gap-0.5">
                  <span>إدارة ونشر التطبيقات حالياً</span>
                  <span className="material-symbols-outlined text-xs">arrow_left</span>
                </div>
              </div>
            </button>
          </div>

          {/* Top Country Strip */}
          <button
            onClick={() => {
              setDetailTab("r");
              setFilterMode("all");
            }}
            className="w-full bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-4 flex items-center justify-between shadow-[0_8px_24px_rgba(80,59,24,0.04)] hover:border-amber-400 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined font-fill text-lg">public</span>
              </div>
              <div>
                <div className="text-[10px] font-black text-[#503B18]/60">الدولة المكتسحة لحملات الزيارة</div>
                <div className="text-sm font-black text-[#2C1810] mt-0.5">{getTopCountryText()}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-sm text-[rgba(80,59,24,.3)]">chevron_left</span>
          </button>

          {/* Daily Activity (Last 7 Days) */}
          <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-4.5 shadow-[0_8px_24px_rgba(80,59,24,0.04)]">
            <h3 className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3.5 border-b border-[rgba(80,59,24,0.07)] pb-2.5">
              <span className="material-symbols-outlined text-[#503B18] text-base">calendar_month</span>
              <span>نشاط العمليات اليومية الأخير (مختصر)</span>
            </h3>

            <div className="flex flex-col gap-2 divide-y divide-[rgba(80,59,24,0.06)]">
              {Array.from({ length: 7 }, (_, i) => {
                const dateKey = getDayOffset(6 - i);
                const day = new Date();
                day.setDate(day.getDate() - (6 - i));
                const dayName = WD[day.getDay()];

                let vCount = 0;
                if (stats?.daily && stats.daily[dateKey]) {
                  const item = stats.daily[dateKey];
                  vCount = typeof item === "object" ? (item.visits || item.total || 0) : item || 0;
                }

                let dCount = 0;
                if (stats?.appDownloads) {
                  Object.values(stats.appDownloads).forEach((appVal: any) => {
                    if (appVal?.daily && appVal.daily[dateKey]) {
                      dCount += appVal.daily[dateKey] || 0;
                    }
                  });
                }

                let cCount = 0;
                if (stats?.appClicks) {
                  Object.values(stats.appClicks).forEach((appVal: any) => {
                    if (appVal?.daily && appVal.daily[dateKey]) {
                      cCount += appVal.daily[dateKey] || 0;
                    }
                  });
                }

                return (
                  <div key={i} className="flex items-center justify-between pt-2 first:pt-0 text-[11px] font-bold">
                    {/* Day & Date info */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#503B18] font-mono min-w-[20px] text-right">{day.getDate()}</span>
                      <span className="text-[10px] text-[#8B6914] font-black bg-[rgba(80,59,24,0.05)] px-2 py-0.5 rounded-lg">{dayName}</span>
                      <span className="text-[9.5px] text-gray-400 font-mono hidden sm:inline">{dateKey}</span>
                    </div>

                    {/* Compact comparative stats values */}
                    <div className="flex items-center gap-2.5 select-none font-mono">
                      <span className="text-[#503B18] bg-amber-500/5 px-2.5 py-0.5 rounded-lg border border-amber-500/10 text-[10.5px] min-w-[48px] text-center" title="المشاهدات / الزيارات">
                        👁 {vCount}
                      </span>
                      <span className="text-[#D4AF37] bg-yellow-500/5 px-2.5 py-0.5 rounded-lg border border-yellow-500/10 text-[10.5px] min-w-[48px] text-center" title="النقرات">
                        👆 {cCount}
                      </span>
                      <span className="text-[#EA580C] bg-orange-500/5 px-2.5 py-0.5 rounded-lg border border-orange-500/10 text-[10.5px] min-w-[48px] text-center" title="التحميلات">
                        ⬇ {dCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recharts Bar Graph (TRIPLE PERFORMANCE INDICES: VISITS, CLICKS, DOWNLOADS) */}
          <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-5 shadow-[0_8px_28px_rgba(80,59,24,0.06)] animate-fade-in">
            <h3 className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-4 border-b border-[rgba(80,59,24,0.08)] pb-3">
              <span className="material-symbols-outlined text-[#503B18] font-fill text-sm">bar_chart</span>
              <span>رسم بياني ثلاثي المؤشرات: تفاعل الأسبوع المنصرم</span>
            </h3>
            <p className="text-[9.5px] text-[#6E5F4A] font-extrabold mb-3 leading-snug">
              مخطط بياني يظهر حجم المشاهدات العامة (زيارات) مقارنة بنقر وحقن كبسولة الأكواد (نقرات) وعمليات التنزيل الفعلية (تحميلات).
            </p>
            <div className="w-full h-56 select-none font-sans min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={trendData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(80,59,24,0.05)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6E5F4A", fontWeight: "900", fontSize: 9.5 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6E5F4A", fontWeight: "900", fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FDFBF7", borderRadius: "16px", border: "1.5px solid rgba(80,59,24,0.15)", fontFamily: "sans-serif", fontSize: 11 }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9.5, fontWeight: "900", marginTop: 8 }} />
                  <Bar dataKey="زيارات" fill="#503B18" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="نقرات" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="تحميلات" fill="#EA580C" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recharts Pie Circle (GEO-TRAFFIC DISTRIBUTION DONUT CHIP) */}
          <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-5 shadow-[0_8px_28px_rgba(80,59,24,0.06)]">
            <h3 className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3 border-b border-[rgba(80,59,24,0.08)] pb-3">
              <span className="material-symbols-outlined text-[#D4AF37] text-sm">donut_large</span>
              <span>رسم بياني: المخطط الدائري لتوزيع الزوار</span>
            </h3>
            <div className="w-full h-52 flex justify-center items-center font-sans select-none relative min-w-0 min-h-0">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={48} 
                      outerRadius={68} 
                      paddingAngle={5} 
                      dataKey="value"
                      cornerRadius={4}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#FDFBF7", borderRadius: "14px", border: "1px solid rgba(80,59,24,0.12)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-[11px] font-black text-[#6E5F4A]/50">لا توجد سجلات كافية بعد لرسم المخطط</span>
              )}

              {/* Graphical Center label decorations for elegant layout */}
              {pieData.length > 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
                  <div className="text-[14px] font-black text-[#2C1810] font-mono leading-none">
                    {pieData.reduce((prev, cur) => prev + cur.value, 0)}
                  </div>
                  <div className="text-[7.5px] text-[#6E5F4A] font-black mt-0.5 tracking-tight">إجمالي المرور</div>
                </div>
              )}
            </div>

            {/* Pristine Country tables layout explaining colors to replace messy legends */}
            {pieData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[rgba(80,59,24,0.06)] text-right">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10.5px] font-black text-[#2C1810]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-[#6E5F4A] bg-[#503B18]/5 px-2 rounded-md">
                      {item.value} زيارة
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Detailed Analytical Screens (Visits, Clicks, Downloads) */
        <div className="w-full flex flex-col gap-4 animate-fade-in select-none text-right">
          <button
            onClick={() => setDetailTab("none")}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.12)] rounded-xl text-[#503B18] cursor-pointer hover:bg-[#503B18] hover:text-[#FDFBF7] transition w-fit"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <span>رجوع للوحة المتابعة الرئيسية</span>
          </button>

          <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[22px] p-5 shadow-lg">
            <h4 className="text-sm font-black text-[#2C1810] flex items-center gap-2 mb-3 pb-3 border-b border-[rgba(80,59,24,0.08)]">
              <span className="material-symbols-outlined text-[#D4AF37]">analytics</span>
              <span>
                {detailTab === "v" && "تفاصيل البيانات الجغرافية والزيارات"}
                {detailTab === "c" && "تقرير معدل الضغط على روابط الأزرار"}
                {detailTab === "d" && "تفاصيل سجلات الكبسولات ومؤشرات التنزيل"}
                {detailTab === "r" && "تفصيل الزوار حسب الدول الجغرافية"}
              </span>
            </h4>

            {/* Filter segments (ONLY show relevant parameters for selected detail tabs) */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 select-none pr-0.5">
              {[
                { k: "today" as const, l: "اليوم والتحميل مقارنة بالأمس" },
                { k: "week" as const, l: "السجل الأسبوعي للمنصة" },
                { k: "month" as const, l: "السجل الشهري للأرقام" },
                { k: "all" as const, l: "تراكم الكل والتطبيق تفصيلياً" },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFilterMode(f.k)}
                  className={`px-4 py-2 text-[11px] font-black rounded-full border transition cursor-pointer shrink-0 ${
                    filterMode === f.k
                      ? "bg-[#503B18] border-[#503B18] text-[#FDFBF7]"
                      : "bg-[rgba(80,59,24,0.05)] border-[rgba(80,59,24,0.12)] text-[#503B18] hover:bg-[rgba(80,59,24,0.1)]"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>

            {/* Renderer Lists based on chosen subtabs */}
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              
              {/* ========================================= */}
              {/* TODAY TAB (PERFORMANCE COMPARISON + TODAY DOWNLOADED APPS ONLY) */}
              {/* ========================================= */}
              {filterMode === "today" && (
                <div className="flex flex-col gap-3.5">
                  {/* Performance compare stats */}
                  <div className="grid grid-cols-2 gap-3 pb-2 select-none">
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-center">
                      <div className="text-[10px] font-black text-[#503B18]/60 mb-0.5">سجل اليوم لـ {detailTab === "v" ? "الزيارات" : detailTab === "c" ? "النقرات" : "التحميلات"}</div>
                      <div className="text-2xl font-black text-emerald-800 font-mono">
                        {detailTab === "v" ? visits.today : detailTab === "c" ? clicks.today : downloads.today}
                      </div>
                    </div>
                    <div className="bg-[rgba(80,59,24,0.04)] border border-[rgba(80,59,24,0.12)] rounded-2xl p-4 text-center">
                      <div className="text-[10px] font-black text-[#503B18]/60 mb-0.5">سجل أمس المماثل</div>
                      <div className="text-2xl font-black text-[#2C1810] font-mono">
                        {detailTab === "v" ? visits.yesterday : detailTab === "c" ? clicks.yesterday : downloads.yesterday}
                      </div>
                    </div>
                  </div>

                  {/* Today downloaded apps / Clicked apps list ONLY */}
                  <div>
                    <h5 className="text-[11px] font-black text-[#2C1810] mb-2.5 flex items-center gap-1.5 opacity-80">
                      <span className="material-symbols-outlined text-[13px] text-amber-800">local_fire_department</span>
                      <span>
                        {detailTab === "v" ? "قائمة حضور وفحوصات اليوم" : detailTab === "c" ? "التطبيقات التي تم النقر عليها اليوم" : "التطبيقات التي تم تحميلها اليوم فقط"}
                      </span>
                    </h5>
                    
                    {(() => {
                      const today = todayKey();
                      const items = apps.filter((app) => {
                        if (detailTab === "d") {
                          const val = stats?.appDownloads?.[app.key];
                          return val?.daily?.[today] && val.daily[today] > 0;
                        } else {
                          const val = stats?.appClicks?.[app.key];
                          return val?.daily?.[today] && val.daily[today] > 0;
                        }
                      });

                      if (detailTab === "v") {
                        const visitsCount = stats?.daily?.[today];
                        const amount = typeof visitsCount === "object" ? visitsCount.visits || visitsCount.total || 0 : visitsCount || 0;
                        return (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center text-xs font-black text-emerald-800">
                             إجمالي حضور مستخدمي المنصة اليوم يعادل {amount} زيارة فحص سحابي ناجحة
                          </div>
                        );
                      }

                      if (!items.length) {
                        return (
                          <div className="text-center text-[11px] text-[#6E5F4A]/50 py-8 bg-[rgba(80,59,24,0.02)] border border-dashed border-[rgba(80,59,24,0.1)] rounded-2xl">
                             لا توجد نشاطات على المنصة للتطبيقات اليوم حتى الآن
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-2">
                          {items.map((app) => {
                            const val = detailTab === "d" ? stats?.appDownloads?.[app.key] : stats?.appClicks?.[app.key];
                            const countToday = val?.daily?.[today] || 0;
                            return (
                              <div key={app.key} className="flex justify-between items-center p-3.5 bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.12)] rounded-xl text-xs">
                                <div>
                                  <div className="font-extrabold text-[#2C1810]" style={{ overflowWrap: "anywhere" }}>{app.name}</div>
                                  <div className="text-[9.5px] text-[#6E5F4A] mt-0.5">ID: {app.key}</div>
                                </div>
                                <span className="font-black text-emerald-800 bg-emerald-600/15 px-3 py-1 rounded-full text-xs font-mono">
                                  {countToday} {detailTab === "d" ? "تحميل اليوم" : "نقرة اليوم"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* WEEK TAB (HISTORICAL WEEKS STATS LIST) */}
              {/* ========================================= */}
              {filterMode === "week" && (
                <div className="flex flex-col gap-2.5">
                  <h5 className="text-[11px] font-black text-[#6E5F4A] mb-1">تراكم الأرقام مقسمة بكل 7 أيام</h5>
                  {getWeeklyLogs().map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-[#F5F0E6] border border-luxury-gold/15 rounded-2xl text-xs">
                      <div className="flex items-center gap-2 font-extrabold text-[#2C1810]">
                        <span className="w-5 h-5 bg-[#503B18]/10 text-[#503B18] rounded-full flex items-center justify-center font-mono text-[9.5px]">#{idx + 1}</span>
                        <span>{item.range}</span>
                      </div>
                      <span className="font-black text-[#503B18] font-mono text-sm">{item.count} مشاهدة</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ========================================= */}
              {/* MONTH TAB (HISTORICAL MONTHS VISITS LIST) */}
              {/* ========================================= */}
              {filterMode === "month" && (
                <div className="flex flex-col gap-2.5">
                  <h5 className="text-[11px] font-black text-[#6E5F4A] mb-1">التقرير الشهري لمشاهدات المنصة</h5>
                  {getMonthlyLogs().length > 0 ? (
                    getMonthlyLogs().map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-[#F5F0E6] border border-luxury-gold/15 rounded-2xl text-xs">
                        <span className="font-extrabold text-[#2C1810] flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm font-fill text-luxury-gold">calendar_today</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="font-black text-[#503B18] font-mono text-sm">{item.count} مشاهدة</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs py-8 text-luxury-muted">لا يوجد سجلات أشهر كافية حتى الآن</div>
                  )}
                </div>
              )}

              {/* ========================================= */}
              {/* ALL TIME TAB (CUMULATIVE VIEW OF ALL APPS NUMBERS) */}
              {/* ========================================= */}
              {filterMode === "all" && (
                <div className="flex flex-col gap-3">
                  {detailTab === "r" ? (
                    (() => {
                      const cm = mergeCountries("all");
                      const sorted = Object.entries(cm).sort((a, b) => b[1] - a[1]);
                      const maxVal = Math.max(...sorted.map(([_, v]) => v), 1);
                      return sorted.map(([c, v], i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 bg-[#F5F0E6] border border-luxury-gold/15 rounded-2xl text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-[#2C1810] text-sm flex items-center gap-1.5">
                              <span className="inline-block text-lg leading-none">{cf(c)}</span>
                              <span>{cn(c)}</span>
                            </span>
                            <span className="font-black text-[#503B18] font-mono">{v} زيارة فحص</span>
                          </div>
                          <div className="w-full h-1.5 bg-[rgba(80,59,24,0.1)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#503B18] to-[#D4AF37] rounded-full transition-all duration-700"
                              style={{ width: `${(v / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <>
                      <h5 className="text-[11px] font-black text-[#6E5F4A] mb-1">الرسم التفصيلي لجميع التطبيقات المنشورة</h5>
                      {apps.length > 0 ? (
                        apps.map((app) => {
                          const today = todayKey();
                          const valD = stats?.appDownloads?.[app.key];
                          const totalDls = valD ? valD.total || 0 : 0;
                          const todayDls = valD?.daily?.[today] || 0;

                          const valC = stats?.appClicks?.[app.key];
                          const totalClicks = valC ? (typeof valC === "object" ? valC.total || 0 : valC) : 0;
                          const todayClicks = valC && typeof valC === "object" && valC.daily?.[today] ? valC.daily[today] : 0;

                          return (
                            <div key={app.key} className="p-4 bg-[#FDFBF7] border border-[rgba(80,59,24,0.14)] rounded-2xl shadow-sm text-xs flex flex-col gap-2.5">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-black text-[#2C1810] text-sm leading-tight mb-0.5" style={{ overflowWrap: "anywhere" }}>{app.name}</div>
                                  <div className="text-[9.5px] font-mono text-[#6E5F4A]">معرّف الكوع: {app.key}</div>
                                </div>
                                <span className="bg-[#503B18]/10 text-[#503B18] px-2.5 py-0.5 rounded-full text-[9.5px] font-black">جاهز</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                                <div className="bg-[rgba(80,59,24,0.03)] border border-[rgba(80,59,24,0.08)] rounded-xl p-2.5 text-center">
                                  <div className="text-[#7A5C30] font-black text-xs">إحصاء التنزيل</div>
                                  <div className="text-sm font-black text-[#2C1810] font-mono mt-0.5">الكل: {totalDls}</div>
                                  <div className="text-[9px] text-emerald-700 font-bold">طازج اليوم: {todayDls}</div>
                                </div>
                                <div className="bg-[rgba(80,59,24,0.03)] border border-[rgba(80,59,24,0.08)] rounded-xl p-2.5 text-center">
                                  <div className="text-[#8B6914] font-black text-xs">معدل النقرات</div>
                                  <div className="text-sm font-black text-[#2C1810] font-mono mt-0.5">الكل: {totalClicks}</div>
                                  <div className="text-[9px] text-[#8B6914] font-bold">طازج اليوم: {todayClicks}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-xs py-8">لا يوجد تطبيقات لقياس المعدلات</div>
                      )}
                    </>
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
