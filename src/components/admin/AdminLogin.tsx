import React, { useState } from "react";

interface AdminLoginProps {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPass: string;
  setLoginPass: (pass: string) => void;
  loginError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  loginEmail,
  setLoginEmail,
  loginPass,
  setLoginPass,
  loginError,
  onSubmit,
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4 animate-fade-in relative overflow-hidden" dir="rtl">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,59,24,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-[370px] bg-[#FDFBF7] border border-[rgba(212,175,55,0.25)] rounded-[28px] px-6 py-9 shadow-[0_24px_64px_rgba(80,59,24,0.16)] text-center select-none"
      >
        {/* Brand visual badge */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#503B18] to-[#7A5C30] rounded-3xl mx-auto mb-6 flex items-center justify-center text-[#FDFBF7] shadow-[0_12px_36px_rgba(80,59,24,0.28)]" style={{ transform: "rotate(-10deg)" }}>
          <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.523 15.341c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm-11.046 0c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm11.41-6.585l1.67-2.892a.346.346 0 0 0-.126-.473.347.347 0 0 0-.474.126l-1.694 2.933A10.237 10.237 0 0 0 12 7.6a10.237 10.237 0 0 0-4.263.85L6.043 5.517a.347.347 0 0 0-.474-.126.346.346 0 0 0-.126.473l1.67 2.892C4.422 9.98 2.75 12.276 2.75 15h18.5c0-2.724-1.672-5.02-4.363-6.244z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h3 className="text-[22px] font-black text-[#2C1810] mb-1">مرحباً بعودتك</h3>
        <p className="text-xs text-[#6E5F4A]/60 font-semibold mb-6">سجّل دخولك للوحة الإدارة</p>

        <div className="flex flex-col gap-4 text-right">
          <div className="relative">
            <span className="material-symbols-outlined text-lg text-[#6E5F4A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              mail
            </span>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full py-3.5 pl-4 pr-12 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-full outline-none focus:border-[#503B18] text-xs font-semibold text-[#2C1810]"
              placeholder="البريد الإلكتروني"
              required
            />
          </div>

          <div className="relative">
            <span className="material-symbols-outlined text-lg text-[#6E5F4A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              lock
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full py-3.5 pl-12 pr-12 bg-[rgba(80,59,24,0.06)] border border-[rgba(80,59,24,0.16)] rounded-full outline-none focus:border-[#503B18] text-xs font-semibold text-[#2C1810] font-mono"
              placeholder="كلمة المرور"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E5F4A] hover:text-[#503B18] transition p-1"
            >
              <span className="material-symbols-outlined text-lg">
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {loginError && (
            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 justify-center animate-[shake_0.4s] mt-1">
              <span className="material-symbols-outlined text-xs">error</span>
              <span>{loginError}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-r from-[#503B18] to-[#7A5C30] text-[#FDFBF7] font-black text-xs hover:shadow-[0_14px_32px_rgba(80,59,24,0.38)] hover:-translate-y-[1px] shadow-[0_8px_24px_rgba(80,59,24,0.3)] transition duration-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>دخول</span>
          </button>
        </div>
      </form>
    </div>
  );
};
