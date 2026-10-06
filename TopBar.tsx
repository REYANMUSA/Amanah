import React from 'react';
import { Settings, HeartHandshake, User, LogIn } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { UserAccount } from '../../lib/auth/authService';
import { Profile } from '../../types/database';

interface TopBarProps {
  currentUser: UserAccount | null;
  profile?: Profile;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenINeedYou: () => void;
  unreadAlertCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  profile,
  onOpenSettings,
  onOpenAuth,
  onOpenINeedYou,
  unreadAlertCount = 0,
}) => {
  const displayName = profile?.display_name || currentUser?.display_name || 'Account';
  const avatarUrl = profile?.avatar_url;
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#EBE7DF] px-4 py-2.5 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#283A2E] flex items-center justify-center text-[#E2D4B7] shadow-xs">
            <span className="font-serif font-bold text-sm tracking-tighter">أ</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-tight text-[#1F2421] leading-none">
              Amanah
            </span>
            <span className="text-[10px] text-[#7A6B53] tracking-widest uppercase font-mono mt-0.5">
              أمانة
            </span>
          </div>
        </div>

        {/* Zone 2 & 3: Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* User Sign In / Profile Avatar */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-[#D5CEC2] bg-white text-xs text-[#1F2421] hover:bg-[#F4F1EA] transition-all shadow-2xs"
            title={`Account: ${displayName}`}
            aria-label="User Account"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-5 h-5 rounded-full object-cover border border-[#C5BCAB]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#2E473B] text-white flex items-center justify-center text-[10px] font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline font-medium text-[11px] truncate max-w-[80px]">
              {displayName}
            </span>
          </button>

          {/* Quick "I NEED YOU" Halal Premarital Connection trigger */}
          <button
            onClick={onOpenINeedYou}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-2xs ${
              unreadAlertCount > 0
                ? 'bg-[#2E473B] text-white border border-[#2E473B]'
                : 'bg-[#FAF6F0] text-[#2E473B] border border-[#E0D7C6] hover:bg-[#F2ECE0]'
            }`}
            title="Reach out with sacred intention"
            aria-label="I Need You halal connection trigger"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#A58957]" />
            <span className="text-[11px] font-semibold">I Need You</span>
            {unreadAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E2C785] ml-0.5 animate-pulse" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg border border-[#DDD7CB] flex items-center justify-center text-[#505D54] hover:text-[#1F2421] hover:bg-[#EFECE6] active:scale-95 transition-all"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

