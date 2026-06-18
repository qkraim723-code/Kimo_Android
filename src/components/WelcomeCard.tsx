import React from "react";

export const WelcomeCard: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-luxury-primary to-[#2C1D07] rounded-3xl p-6 text-luxury-neutral shadow-lg border border-luxury-gold/30 my-4 animate-fade-in">
      {/* Absolute decorative glow background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-luxury-gold/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-luxury-gold/5 blur-xl pointer-events-none" />

      <div className="relative flex flex-col items-start gap-3">
        <span className="inline-block px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 rounded-full">
          مرحباً بك
        </span>
        <h2 className="text-2xl font-black text-luxury-neutral tracking-tight leading-tight">
          في عالم كيمو
        </h2>
        <p className="text-luxury-secondary/80 text-xs font-medium leading-relaxed max-w-[90%]">
          استكشف أحدث تطبيقات الأندرويد المتميزة، المشاريع المفتوحة، والمعدلة باحترافية تامة.
        </p>
      </div>
    </section>
  );
};
export default WelcomeCard;
