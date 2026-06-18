import React from "react";

interface AdminAlertProps {
  isOpen: boolean;
  title: string;
  msg: string;
  type: "success" | "danger" | "info" | "warn";
  onConfirm: (() => void) | null;
  onClose: () => void;
}

export const AdminAlert: React.FC<AdminAlertProps> = ({
  isOpen,
  title,
  msg,
  type,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const config = {
    success: { icon: "check_circle", color: "text-emerald-600", bg: "bg-emerald-50", btn: "bg-emerald-600 hover:bg-emerald-700" },
    danger: { icon: "error_med", color: "text-red-600", bg: "bg-red-50", btn: "bg-red-600 hover:bg-red-700" },
    warn: { icon: "warning", color: "text-[#D4AF37]", bg: "bg-amber-100/40", btn: "bg-[#503B18] hover:bg-[#2C1810]" },
    info: { icon: "info", color: "text-blue-600", bg: "bg-blue-50", btn: "bg-blue-600 hover:bg-blue-700" },
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-5 select-none animate-fade-in" dir="rtl">
      <div className="bg-[#FDFBF7] rounded-[24px] max-w-xs w-full p-6 text-center border border-[rgba(80,59,24,0.15)] shadow-[0_20px_60px_rgba(44,24,16,0.2)] animate-[alertPop_0.34s_cubic-bezier(.17,.67,.24,1.22)]">
        
        {/* Warning Icon Container */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${current.bg}`}>
          <span className={`material-symbols-outlined font-fill text-2xl ${current.color}`}>
            {current.icon}
          </span>
        </div>

        <h3 className="text-base font-black text-[#2C1810] mb-1">{title}</h3>
        <p className="text-[11px] text-[#6E5F4A] leading-relaxed mb-5 font-bold">{msg}</p>

        {/* Buttons Trigger Actions */}
        <div className="flex gap-2.5">
          {onConfirm && (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-[#FDFBF7] text-xs font-black transition cursor-pointer active:scale-95 ${current.btn}`}
            >
              تأكيد
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[rgba(80,59,24,0.09)] border border-[rgba(80,59,24,0.18)] text-[#503B18] text-xs font-black transition cursor-pointer active:scale-95"
          >
            {onConfirm ? "إلغاء" : "حسناً"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes alertPop {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
export default AdminAlert;
