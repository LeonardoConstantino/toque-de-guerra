import React from 'react';
import { Rival } from '../types/game';

interface RivalAvatarProps {
  rival: Rival;
  state?: 'idle' | 'listening' | 'critical' | 'defeated' | 'triumphant';
  size?: 'sm' | 'md' | 'lg';
}

export const RivalAvatar: React.FC<RivalAvatarProps> = ({
  rival,
  state = 'idle',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-40 sm:h-40',
  }[size];

  // Specific pixel/svg styling based on rival character archetype
  return (
    <div className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center border-2 border-[#2a2e35] shadow-lg transition-transform duration-200`}
      style={{
        backgroundColor: `${rival.avatarColor}20`,
        borderColor: rival.avatarColor,
      }}
    >
      {/* Background glow / aura */}
      <div
        className="absolute inset-0 rounded-2xl opacity-20 blur-sm pointer-events-none"
        style={{ backgroundColor: rival.avatarColor }}
      />

      {/* Character Pixel-Vector Head */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {rival.id === 'bully' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Cap backwards */}
            <path d="M12 24 L52 24 L56 30 L8 30 Z" fill="#B84D4D" />
            <rect x="36" y="20" width="22" height="6" fill="#8c3636" rx="2" />
            {/* Head */}
            <rect x="16" y="28" width="32" height="26" fill="#e8b897" rx="4" />
            {/* Angry Brow & Eyes */}
            <path d="M20 36 L28 40 M44 36 L36 40" stroke="#222" strokeWidth="3" strokeLinecap="round" />
            <circle cx="25" cy="42" r="2.5" fill="#111" />
            <circle cx="39" cy="42" r="2.5" fill="#111" />
            {/* Grin / Smirk */}
            {state === 'critical' || state === 'defeated' ? (
              <path d="M26 50 Q32 46 38 50" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M26 48 Q32 54 38 48" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}
            {/* Shadow band */}
            <path d="M16 48 L48 48 L48 54 L16 54 Z" fill="#cf9d7c" opacity="0.4" />
          </svg>
        )}

        {rival.id === 'cdf' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Neat Hair */}
            <path d="M14 34 Q32 12 50 34 L52 24 Q32 8 12 24 Z" fill="#2d1e18" />
            {/* Head */}
            <rect x="18" y="26" width="28" height="28" fill="#f2cbaf" rx="4" />
            {/* Glasses */}
            <rect x="20" y="34" width="10" height="8" fill="none" stroke="#4C7D9E" strokeWidth="2" rx="1" />
            <rect x="34" y="34" width="10" height="8" fill="none" stroke="#4C7D9E" strokeWidth="2" rx="1" />
            <line x1="30" y1="38" x2="34" y2="38" stroke="#4C7D9E" strokeWidth="2" />
            {/* Eyes behind glasses */}
            <circle cx="25" cy="38" r="1.5" fill="#111" />
            <circle cx="39" cy="38" r="1.5" fill="#111" />
            {/* Mouth */}
            {state === 'critical' || state === 'defeated' ? (
              <ellipse cx="32" cy="48" rx="3" ry="4" fill="#111" />
            ) : (
              <line x1="28" y1="48" x2="36" y2="48" stroke="#111" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        )}

        {rival.id === 'emo' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Head */}
            <rect x="18" y="26" width="28" height="28" fill="#f8ded1" rx="4" />
            {/* Emo Hair covering half face */}
            <path d="M12 20 Q32 10 52 24 L52 38 L40 46 L26 36 L12 42 Z" fill="#1b1c20" />
            {/* Visible Eye with eyeliner */}
            <circle cx="40" cy="38" r="2.5" fill="#111" />
            <path d="M35 34 Q40 32 46 36" stroke="#111" strokeWidth="2.5" fill="none" />
            <path d="M38 43 L42 43" stroke="#6B4C9E" strokeWidth="2" />
            {/* Tear drop if defeated/critical */}
            {(state === 'critical' || state === 'defeated') && (
              <circle cx="41" cy="46" r="1.5" fill="#6B4C9E" />
            )}
            {/* Downward mouth */}
            <path d="M26 50 Q32 46 38 50" stroke="#111" strokeWidth="2" fill="none" />
          </svg>
        )}

        {rival.id === 'skater' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Beanie Hat */}
            <path d="M14 28 Q32 14 50 28 L52 32 L12 32 Z" fill="#D5B84A" />
            {/* Head */}
            <rect x="18" y="30" width="28" height="26" fill="#e5b28d" rx="3" />
            {/* Wild Eyes & Bandage */}
            <circle cx="26" cy="38" r="2" fill="#111" />
            <circle cx="38" cy="38" r="2" fill="#111" />
            <rect x="33" y="44" width="7" height="3" fill="#faf5eb" transform="rotate(-15 35 45)" />
            {/* Open smile */}
            {state === 'critical' || state === 'defeated' ? (
              <circle cx="32" cy="48" r="3.5" fill="#111" />
            ) : (
              <path d="M26 46 Q32 54 38 46 Z" fill="#111" />
            )}
          </svg>
        )}

        {rival.id === 'gossip' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Head & Ponytail */}
            <circle cx="16" cy="24" r="6" fill="#7a3e1a" />
            <rect x="18" y="26" width="28" height="28" fill="#fad3b8" rx="4" />
            <path d="M14 26 Q32 16 50 26 L50 32 Q32 24 14 32 Z" fill="#7a3e1a" />
            {/* Big Expressive Eyes */}
            <ellipse cx="25" cy="36" rx="3" ry="4" fill="#111" />
            <ellipse cx="39" cy="36" rx="3" ry="4" fill="#111" />
            <circle cx="26" cy="35" r="1" fill="#fff" />
            <circle cx="40" cy="35" r="1" fill="#fff" />
            {/* Chatty Open Mouth */}
            <ellipse cx="32" cy="48" rx="4" ry="3" fill="#B84D4D" />
          </svg>
        )}

        {rival.id === 'metalhead' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Long wild black hair */}
            <path d="M10 20 L54 20 L58 56 L48 50 L40 58 L32 48 L24 58 L16 50 L6 56 Z" fill="#121314" />
            {/* Head */}
            <rect x="20" y="26" width="24" height="26" fill="#e2d2c8" rx="3" />
            {/* Wristband style eyes & brow */}
            <path d="M22 36 L29 38 M42 36 L35 38" stroke="#111" strokeWidth="2.5" />
            <circle cx="26" cy="40" r="1.5" fill="#111" />
            <circle cx="38" cy="40" r="1.5" fill="#111" />
            {/* Metal grimace */}
            <path d="M26 48 L38 48" stroke="#111" strokeWidth="3" strokeLinecap="square" />
          </svg>
        )}

        {rival.id === 'boss' && (
          <svg viewBox="0 0 64 64" className="w-4/5 h-4/5">
            {/* Inspector Cap with golden badge */}
            <path d="M12 24 L52 24 L56 30 L8 30 Z" fill="#1A1C1E" />
            <path d="M16 16 L48 16 L52 24 L12 24 Z" fill="#2d3238" />
            <circle cx="32" cy="22" r="3" fill="#D5B84A" />
            {/* Head & Mustache */}
            <rect x="18" y="28" width="28" height="28" fill="#eac7af" rx="4" />
            {/* Stern Eyes */}
            <line x1="22" y1="36" x2="28" y2="38" stroke="#111" strokeWidth="2.5" />
            <line x1="42" y1="36" x2="36" y2="38" stroke="#111" strokeWidth="2.5" />
            <circle cx="26" cy="40" r="2" fill="#111" />
            <circle cx="38" cy="40" r="2" fill="#111" />
            {/* Thick Inspector Mustache */}
            <path d="M22 47 Q32 43 42 47 Q32 52 22 47 Z" fill="#3a3028" />
          </svg>
        )}
      </div>

      {/* State Badge Overlay */}
      {state === 'critical' && (
        <div className="absolute -top-2 -right-2 bg-[#B84D4D] text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow animate-bounce">
          CRITICAL!
        </div>
      )}
      {state === 'defeated' && (
        <div className="absolute -top-2 -right-2 bg-[#4C7D9E] text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
          DERROTADO
        </div>
      )}
      {state === 'listening' && (
        <div className="absolute -top-2 -right-2 bg-[#D5B84A] text-black font-bold text-[10px] px-1.5 py-0.5 rounded shadow animate-pulse">
          OUVINDO...
        </div>
      )}
    </div>
  );
};
