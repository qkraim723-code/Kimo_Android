import React, { useEffect, useRef } from "react";

interface AdShellProps {
  label: string;
  adCode?: string;
  adLink?: string;
  telegramLink?: string;
  onAdClick?: () => void;
  position: "top" | "bottom" | "target";
}

export const AdShell: React.FC<AdShellProps> = ({
  label,
  adCode = "",
  adLink = "",
  telegramLink = "",
  onAdClick,
  position
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !adCode) return;

    // Clear and set HTML content safely
    containerRef.current.innerHTML = adCode;

    // Execute scripts if any exist in the code
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr: any) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Style any images or wrapper structures to remain strictly bounded in container
    const imgs = containerRef.current.querySelectorAll("img");
    imgs.forEach((img) => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "12px";
      img.style.display = "block";
      img.style.margin = "0 auto";
    });
  }, [adCode]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // If user clicks a marketing button, do not capture as ad-click
    const target = e.target as HTMLElement;
    if (target.closest("button")?.getAttribute("id") === "marketing-btn") return;

    if (adLink && onAdClick) {
      onAdClick();
      window.open(adLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleMarketingClick = () => {
    if (telegramLink) {
      window.open(telegramLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="my-4 border border-luxury-gold/25 rounded-2xl bg-luxury-secondary/40 shadow-sm overflow-hidden text-right select-none animate-fade-in">
      {/* Ad Label Bar */}
      <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-luxury-gold/15 bg-luxury-secondary/60 text-[10px] font-black text-luxury-primary">
        <span className="material-symbols-outlined text-xs font-fill">campaign</span>
        <span>{label}</span>
      </div>

      {adCode ? (
        /* Render Live Ad Frame safely inside bounded spacing */
        <div 
          ref={containerRef}
          onClick={handleContainerClick}
          className="p-3 min-h-[72px] flex items-center justify-center flex-col w-full text-center overflow-hidden transition-all duration-200 active:scale-[0.99] cursor-pointer"
        />
      ) : (
        /* Empty / Promo Self-Promotion Design */
        <div className="p-4 flex items-center justify-between gap-3 text-right">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-luxury-primary mb-1">
              مساحة إعلانية شاغرة
            </h4>
            <p className="text-[11px] text-luxury-muted leading-relaxed font-semibold line-clamp-2">
              ضع إعلانك أو منتجك هنا أمام ملايين الزوار يومياً. تواصل معنا للحجز فوراً.
            </p>
          </div>
          {telegramLink && (
            <button
              id="marketing-btn"
              type="button"
              onClick={handleMarketingClick}
              className="flex-shrink-0 px-3.5 py-2 text-[11px] font-black rounded-xl bg-luxury-primary text-luxury-neutral hover:bg-luxury-gold hover:text-luxury-primary transition duration-150 active:scale-95 shadow-sm"
            >
              تواصل معنا
            </button>
          )}
        </div>
      )}
    </section>
  );
};
export default AdShell;
