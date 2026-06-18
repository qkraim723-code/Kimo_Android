import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { ref, set, onValue } from "firebase/database";

interface SettingsTabProps {
  tutorialLink: string;
  profilePic: string;
  youtubeLink: string;
  telegramLink: string;
  contactLink: string;
  onSaveSetting: (path: string, val: string, label: string) => void;
  onDeleteSetting: (path: string, label: string) => void;
  onDownloadBackup: () => void;
  showToast: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  tutorialLink,
  profilePic,
  youtubeLink,
  telegramLink,
  contactLink,
  onSaveSetting,
  onDeleteSetting,
  onDownloadBackup,
  showToast,
}) => {
  // Input fields hook values
  const [pic, setPic] = useState(profilePic);
  const [tut, setTut] = useState(tutorialLink);
  const [yt, setYt] = useState(youtubeLink);
  const [tg, setTg] = useState(telegramLink);
  const [contact, setContact] = useState(contactLink);

  // Timer configuration variables
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(15);

  // Sync inputs with loaded configurations
  useEffect(() => { setPic(profilePic); }, [profilePic]);
  useEffect(() => { setTut(tutorialLink); }, [tutorialLink]);
  useEffect(() => { setYt(youtubeLink); }, [youtubeLink]);
  useEffect(() => { setTg(telegramLink); }, [telegramLink]);
  useEffect(() => { setContact(contactLink); }, [contactLink]);

  // Load timer settings
  useEffect(() => {
    const unsub = onValue(ref(db, "settings/timer"), (snapshot) => {
      const d = snapshot.val() || {};
      setTimerEnabled(d.enabled !== false);
      if (d.duration) setTimerDuration(d.duration);
    }, (err) => {
      console.warn("Settings timer permission denial:", err);
    });
    return () => unsub();
  }, []);

  const handleSaveTimerSetting = (key: string, val: any) => {
    set(ref(db, `settings/timer/${key}`), val).then(() => {
      showToast("✓ تم حفظ إعداد التايمر والمؤقت بنجاح");
    });
  };

  const setTimerPreset = (s: number) => {
    setTimerDuration(s);
    set(ref(db, "settings/timer/duration"), s).then(() => {
      showToast(`✓ تم ضبط مدة الانتظار على ${s} ثانية`);
    });
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none animate-fade-in" dir="rtl">
      
      {/* 1. PROFILE PIC OPTION */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#503B18]">person</span>
          <span>صورة الملف الشخصي</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={pic}
            onChange={(e) => setPic(e.target.value)}
            className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-bold focus:border-[#503B18]"
            placeholder="رابط الصورة المباشر..."
          />
          <button
            onClick={() => onSaveSetting("profilePic", pic, "صورة الملف")}
            className="px-4 bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black rounded-lg hover:shadow transition duration-150 cursor-pointer"
          >
            حفظ
          </button>
        </div>

        {profilePic && (
          <div className="flex items-center justify-between mt-3 bg-neutral-100 p-2.5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2.5">
              <img src={profilePic} alt="profile" className="w-[40px] h-[40px] rounded-xl object-cover shrink-0" />
              <span className="text-[11px] font-black text-[#503B18]">✓ الصورة الحالية نشطة</span>
            </div>
            <button
              onClick={() => onDeleteSetting("profilePic", "صورة الملف")}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition rounded-full text-[10px] font-black cursor-pointer"
            >
              حذف الصورة
            </button>
          </div>
        )}
      </div>

      {/* 2. EXPLANATION TUTORIAL VIDEO */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#503B18]">play_circle</span>
          <span>فيديو الشرح المرفق</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tut}
            onChange={(e) => setTut(e.target.value)}
            className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-bold focus:border-[#503B18]"
            placeholder="رابط يوتيوب..."
          />
          <button
            onClick={() => onSaveSetting("tutorial", tut, "فيديو الشرح")}
            className="px-4 bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black rounded-lg hover:shadow transition duration-150 cursor-pointer"
          >
            حفظ
          </button>
        </div>

        {tutorialLink && (
          <div className="flex items-center justify-between mt-3 bg-neutral-100 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-black text-[#503B18]">✓ فيديو يوتيوب المرفق جاهز</span>
            <button
              onClick={() => onDeleteSetting("tutorial", "فيديو الشرح")}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition rounded-full text-[10px] font-black cursor-pointer"
            >
              حذف الفيديو
            </button>
          </div>
        )}
      </div>

      {/* 3. YOUTUBE CHANNEL LINK */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-red-600 font-fill">smart_display</span>
          <span>رابط قناة اليوتيوب</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={yt}
            onChange={(e) => setYt(e.target.value)}
            className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-bold focus:border-[#503B18]"
            placeholder="رابط القناة..."
          />
          <button
            onClick={() => onSaveSetting("youtubeLink", yt, "رابط اليوتيوب")}
            className="px-4 bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black rounded-lg hover:shadow transition duration-150 cursor-pointer"
          >
            حفظ
          </button>
        </div>

        {youtubeLink && youtubeLink !== "#" && (
          <div className="flex items-center justify-between mt-3 bg-neutral-100 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-black text-[#503B18]">✓ رابط يوتيوب مفعل بالمتجر</span>
            <button
              onClick={() => onDeleteSetting("youtubeLink", "رابط اليوتيوب")}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition rounded-full text-[10px] font-black cursor-pointer"
            >
              حذف الرابط
            </button>
          </div>
        )}
      </div>

      {/* 4. TELEGRAM CHANNEL LINK */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#24A1DE] font-fill">send</span>
          <span>رابط ملاذ وقناة التيليجرام</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tg}
            onChange={(e) => setTg(e.target.value)}
            className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-bold focus:border-[#503B18]"
            placeholder="رابط التيليجرام المباشر..."
          />
          <button
            onClick={() => onSaveSetting("telegramLink", tg, "رابط تيليجرام")}
            className="px-4 bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black rounded-lg hover:shadow transition duration-150 cursor-pointer"
          >
            حفظ
          </button>
        </div>

        {telegramLink && telegramLink !== "#" && (
          <div className="flex items-center justify-between mt-3 bg-neutral-100 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-black text-[#503B18]">✓ رابط التيليجرام مسجل</span>
            <button
              onClick={() => onDeleteSetting("telegramLink", "رابط تيليجرام")}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition rounded-full text-[10px] font-black cursor-pointer"
            >
              حذف الرابط
            </button>
          </div>
        )}
      </div>

      {/* 5. CONTACT CHAT LINK */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)]">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#503B18]">contact_support</span>
          <span>رابط الدعم والتواصل المباشر</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-bold focus:border-[#503B18]"
            placeholder="رابط واتساب أو تيليجرام..."
          />
          <button
            onClick={() => onSaveSetting("contactLink", contact, "رابط الدعم")}
            className="px-4 bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] text-xs font-black rounded-lg hover:shadow transition duration-150 cursor-pointer"
          >
            حفظ
          </button>
        </div>

        {contactLink && contactLink !== "#" && (
          <div className="flex items-center justify-between mt-3 bg-neutral-100 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[11px] font-black text-[#503B18]">✓ رابط دعم الزوار مفعّل</span>
            <button
              onClick={() => onDeleteSetting("contactLink", "رابط الدعم")}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition rounded-full text-[10px] font-black cursor-pointer"
            >
              حذف الرابط
            </button>
          </div>
        )}
      </div>

      {/* 6. REDIRECT TIMER LAYOUT CONFIGURATION */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)] flex flex-col gap-3">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#503B18]">timer</span>
          <span>صفحة الانتظار والتايمر</span>
        </div>

        {/* Counter Toggle */}
        <div className="flex justify-between items-center p-3 bg-[rgba(80,59,24,0.04)] border border-[rgba(80,59,24,0.12)] rounded-xl">
          <div>
            <div className="text-xs font-extrabold text-[#2C1810]">تفعيل عداد الانتظار</div>
            <div className="text-[9px] text-[#6E5F4A] font-medium leading-tight mt-0.5">لما يكتمل العداد تظهر أزرار التحميل</div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => {
                setTimerEnabled(e.target.checked);
                handleSaveTimerSetting("enabled", e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-250 border border-gray-300/50 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#D4AF37] transition-colors" />
          </label>
        </div>

        {/* Duration configuration input */}
        {timerEnabled && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#6E5F4A] mb-0.5">مدة عداد التنازلي بالثواني</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={timerDuration}
                onChange={(e) => {
                  const s = Math.max(1, parseInt(e.target.value) || 1);
                  setTimerDuration(s);
                  handleSaveTimerSetting("duration", s);
                }}
                className="flex-1 p-3 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.14)] rounded-xl outline-none text-xs font-black focus:border-[#503B18]"
                placeholder="مدة العداد..."
                min="1"
              />
            </div>

            {/* Quick Helper Chips */}
            <div className="flex gap-1.5 flex-wrap mt-1">
              {[10, 15, 20, 30, 60].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTimerPreset(s)}
                  className="px-2.5 py-1.5 text-[10px] font-black rounded-lg bg-[rgba(80,59,24,0.07)] border border-[rgba(80,59,24,0.12)] text-[#503B18] active:scale-95 transition"
                >
                  {s} ثواني
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. FULL DATA BACKUP DOWNLOAD CARD */}
      <div className="bg-[#FDFBF7] border border-[rgba(80,59,24,.12)] rounded-[18px] p-4 shadow-[0_8px_28px_rgba(80,59,24,0.1)] select-none">
        <div className="text-xs font-black text-[#2C1810] flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#503B18]">cloud_download</span>
          <span>نسخ احتياطية وتصدير السحابة</span>
        </div>

        <button
          onClick={onDownloadBackup}
          className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] font-black text-xs shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm font-fill">cloud_download</span>
          <span>تحميل وحفظ نسخة البيانات المتكاملة JSON</span>
        </button>

        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#6E5F4A] font-bold">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          <span>آخر فحص وتحديث دوري: {new Date().toLocaleTimeString("ar-EG")}</span>
        </div>
      </div>
    </div>
  );
};
