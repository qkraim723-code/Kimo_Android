import React, { useEffect, useState } from "react";

interface PreloaderProps {
  subText?: string;
  active?: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ subText = "المنصة الرسمية", active = true }) => {
  const [shouldRender, setShouldRender] = useState(active);
  const [fadeOut, setFadeOut] = useState(false);
  const [phase, setPhase] = useState<number>(1); // Phases: 1 (char drop), 2 (fade out letters), 3 (Android arrives), 4 (Android shifts, Kimo emerges), 5 (final sweep & exit check)

  useEffect(() => {
    // Phase 1 to 2 transition: Letters drop, then fade out
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 1100);

    // Phase 2 to 3 transition: Bring in "Android" word/icon
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 1500);

    // Phase 3 to 4 transition: Android swerves forward/side, Kimo emerges from its side
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 2100);

    // Phase 4 to 5 transition: Fully formed state, launch loading indicator
    const t5 = setTimeout(() => {
      setPhase(5);
    }, 2800);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Monitor the actual loading stream completion
  useEffect(() => {
    if (!active) {
      // Once data is loaded, wait until at least Phase 5 (or transition fast if long elapsed)
      const checkExit = setInterval(() => {
        if (phase >= 4) {
          setFadeOut(true);
          clearInterval(checkExit);
          const finishTimer = setTimeout(() => {
            setShouldRender(false);
          }, 500);
          return () => clearTimeout(finishTimer);
        }
      }, 100);
      return () => clearInterval(checkExit);
    } else {
      setShouldRender(true);
      setFadeOut(false);
    }
  }, [active, phase]);

  if (!shouldRender) return null;

  const titleText = "Kimo Android";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDFBF7] select-none transition-all duration-500 ease-in-out ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      dir="rtl"
    >
      {/* Luxury aesthetic gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(80,59,24,0.06)_0%,transparent_50%)] pointer-events-none" />

      {/* Decorative floating grids */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#805924_1px,transparent_1px),linear-gradient(to_bottom,#805924_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-9 text-center w-full max-w-lg px-6 h-[220px] justify-center">
        
        {/* PHASE 1 & 2: Letter Drop-down */}
        {(phase === 1 || phase === 2) && (
          <div 
            className={`flex items-center justify-center gap-1.5 select-none transition-all duration-350 ${
              phase === 2 ? "opacity-0 scale-95 translate-y-[-10px] blur-sm" : "opacity-100"
            }`} 
            dir="ltr"
          >
            {titleText.split("").map((char, index) => {
              if (char === " ") {
                return <span key={index} className="w-3" />;
              }
              return (
                <span
                  key={index}
                  className="text-4xl sm:text-5xl font-black text-luxury-primary font-mono opacity-0 animate-[charDropIn_0.4s_cubic-bezier(0.17,0.67,0.24,1.18)_forwards]"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        )}

        {/* PHASE 3 & 4 & 5: Kinetic Android / Kimo Emergence Logo */}
        {phase >= 3 && (
          <div className="relative flex flex-col items-center justify-center w-full select-none" dir="ltr">
            
            {/* The brand visual container */}
            <div className="flex items-center justify-center h-24 relative overflow-visible">
              
              {/* Emerging KIMO word */}
              <span
                className={`text-4xl sm:text-5xl font-black text-luxury-primary font-mono tracking-tight transition-all duration-700 ease-out-back ${
                  phase >= 4
                    ? "opacity-100 translate-x-[0px] scale-100"
                    : "opacity-0 translate-x-[40px] scale-75"
                }`}
                style={{
                  marginRight: "12px"
                }}
              >
                Kimo
              </span>

              {/* Glowing Center Android Icon that leads the swerve */}
              <div
                className={`flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-luxury-primary to-[#7A5C30] text-[#FDFBF7] shadow-lg transition-all duration-700 ease-out-back ${
                  phase >= 4
                    ? "scale-90 rotate-[360deg] opacity-100"
                    : "scale-110 rotate-0 opacity-100"
                }`}
                style={{
                  marginRight: "10px"
                }}
              >
                <svg className="w-7 h-7 animate-pulse" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.523 15.341c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm-11.046 0c-.458 0-.832-.374-.832-.832s.374-.832.832-.832.832.374.832.832-.374.832-.832.832zm11.41-6.585l1.67-2.892a.346.346 0 0 0-.126-.473.347.347 0 0 0-.474.126l-1.694 2.933A10.237 10.237 0 0 0 12 7.6a10.237 10.237 0 0 0-4.263.85L6.043 5.517a.347.347 0 0 0-.474-.126.346.346 0 0 0-.126.473l1.67 2.892C4.422 9.98 2.75 12.276 2.75 15h18.5c0-2.724-1.672-5.02-4.363-6.244z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              {/* Word ANDROID */}
              <span
                className={`text-4xl sm:text-5xl font-black text-luxury-primary font-mono tracking-tight transition-all duration-700 ease-out-back ${
                  phase === 3 
                    ? "opacity-100 scale-110 filter drop-shadow-[0_0_12px_rgba(212,175,55,0.15)]" 
                    : phase >= 4 
                    ? "opacity-100 translate-x-[0px] scale-100" 
                    : "opacity-0 scale-75"
                }`}
              >
                Android
              </span>

            </div>

            {/* Custom high-tech indicator underneath */}
            <div className={`mt-4 w-48 transition-all duration-500 flex flex-col items-center gap-2 ${phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              {/* Premium micro loading timeline */}
              <div className="w-full h-[3px] bg-luxury-gold/15 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 bg-gradient-to-r from-luxury-primary to-luxury-gold rounded-full w-2/3 animate-[fastSweep_1s_infinite_ease-in-out]" />
              </div>
              <span className="text-[10px] text-luxury-muted font-black tracking-widest uppercase">
                {subText}
              </span>
            </div>

          </div>
        )}

      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes charDropIn {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.6);
            filter: blur(4px);
          }
          60% {
            opacity: 0.9;
            transform: translateY(12px) scale(1.05);
            filter: none;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fastSweep {
          0% { left: -50%; width: 30%; }
          50% { width: 50%; }
          100% { left: 110%; width: 20%; }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
