import React from "react";

interface SocialBarProps {
  youtubeLink?: string;
  telegramLink?: string;
  contactLink?: string;
}

export const SocialBar: React.FC<SocialBarProps> = ({
  youtubeLink = "#",
  telegramLink = "#",
  contactLink = "#"
}) => {
  return (
    <section className="flex flex-row items-center justify-between gap-4 my-4 animate-fade-in">
      {/* Contact Button (Right Align in RTL) */}
      <a 
        href={contactLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl bg-luxury-primary/10 text-luxury-primary border-2 border-luxury-primary/20 hover:bg-luxury-primary hover:text-luxury-neutral hover:border-luxury-primary transition duration-200 shadow-sm scroll-smooth active:scale-95"
      >
        <span>للتواصل معنا</span>
        <span className="material-symbols-outlined text-xs font-black animate-[ping-short_1.5s_infinite] select-none">
          arrow_back_ios
        </span>
      </a>

      {/* Social Platforms Icons (Left Align in RTL) */}
      <div className="flex items-center gap-2.5">
        {youtubeLink && youtubeLink !== "#" && (
          <a 
            href={youtubeLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-2xl bg-luxury-secondary text-red-600 border border-luxury-gold/20 flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-md hover:border-red-600/30 transition duration-200"
            title="يوتيوب"
          >
            {/* YouTube Clean Minimalist SVGs */}
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        )}

        {telegramLink && telegramLink !== "#" && (
          <a 
            href={telegramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-2xl bg-luxury-secondary text-[#24A1DE] border border-luxury-gold/20 flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-md hover:border-[#24A1DE]/30 transition duration-200"
            title="تيليجرام"
          >
            {/* Telegram Clean SVG */}
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm5.83 8.167a.465.465 0 0 1 .158.42l-1.07 5.037c-.084.39-.317.485-.644.301l-1.636-1.205-1.579 1.517c-.175.175-.322.321-.66.321l.235-3.336 6.073-5.485c.264-.235-.057-.366-.41-.132L10.74 10.963 7.507 9.954c-.703-.22-.716-.703.146-1.041l12.637-4.87c.585-.213 1.098.136.884 1.124z"/>
            </svg>
          </a>
        )}
      </div>
    </section>
  );
};
export default SocialBar;
