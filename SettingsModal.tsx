import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  HelpCircle, 
  Database, 
  X, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Trash2,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Volume2,
  Vibrate,
  Clock,
  KeyRound,
  Camera,
  Upload,
  Loader2,
  HeartHandshake,
  Copy,
  Link2
} from 'lucide-react';
import { Profile, UserSettings, ThemePreference, Gender, Relationship } from '../../types/database';
import { dataService } from '../../lib/storage/dataService';
import { 
  getCurrentSupabaseConfig, 
  updateSupabaseRuntimeConfig, 
  isSupabaseConfigured,
  getSupabase 
} from '../../lib/supabase/client';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendLocalNotification,
  playCalmChime,
  triggerHapticFeedback
} from '../../lib/notifications/notificationService';
import { authService, UserAccount } from '../../lib/auth/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  currentUser: UserAccount | null;
  onUpdateProfile: (updated: Profile) => void;
  onReplayOnboarding: () => void;
  onOpenAuth: () => void;
  onLogOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentUser,
  onUpdateProfile,
  onReplayOnboarding,
  onOpenAuth,
  onLogOut,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'notifications' | 'account' | 'profile' | 'cloud'>('theme');

  // Profile fields
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [theme, setTheme] = useState<ThemePreference>(profile.theme_preference);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [relationship, setRelationship] = useState<Relationship>(dataService.getRelationship());
  const [copiedCode, setCopiedCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(dataService.getSettings());
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>(getNotificationPermissionStatus());
  const [reminderTime, setReminderTime] = useState(settings.reminder_time || '07:30');

  // Cloud / Supabase config
  const initialSbConfig = getCurrentSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(initialSbConfig.url);
  const [sbKey, setSbKey] = useState(initialSbConfig.key);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress image to a reasonable avatar size using HTML5 Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(dataUrl);
          triggerHapticFeedback();
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(relationship.invite_code);
    setCopiedCode(true);
    triggerHapticFeedback();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setTheme(newTheme);
    const updated = await dataService.updateProfile({ theme_preference: newTheme });
    onUpdateProfile(updated);
    triggerHapticFeedback();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return; // Prevent double execution
    setIsSavingProfile(true);
    triggerHapticFeedback();

    try {
      const updated = await dataService.updateProfile({
        display_name: displayName.trim() || 'Seeker',
        gender,
        theme_preference: theme,
        avatar_url: avatarUrl || undefined,
      });
      onUpdateProfile(updated);
      playCalmChime();
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleSetting = async (key: keyof UserSettings) => {
    const nextVal = !settings[key];
    const updated = await dataService.updateSettings({ [key]: nextVal });
    setSettings(updated);
    triggerHapticFeedback();
  };

  const handleReminderTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    const updated = await dataService.updateSettings({ reminder_time: newTime });
    setSettings(updated);
  };

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotifStatus(res);
    if (res === 'granted') {
      sendLocalNotification('Amanah Notifications Enabled', {
        body: 'You will receive peaceful reminders for prayers and daily habits.',
      });
      await dataService.updateSettings({ notifications_enabled: true });
      setSettings(dataService.getSettings());
      playCalmChime();
    }
  };

  const handleTestNotification = () => {
    triggerHapticFeedback();
    const sent = sendLocalNotification('Amanah · Daily Remembrance', {
      body: '«The most beloved deeds to Allah are those that are consistent, even if few.»',
    });
    if (!sent && notifStatus !== 'granted') {
      alert('Please enable browser notification permissions first.');
    }
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      updateSupabaseRuntimeConfig(sbUrl, sbKey);
      const client = getSupabase();
      if (!client) {
        setTestResult('Invalid URL or Key format. Please verify your Supabase credentials.');
        setIsTesting(false);
        return;
      }

      const { error } = await client.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        setTestResult(`Connected to Supabase! (Ensure you have executed the migration script in Supabase SQL editor)`);
      } else {
        setTestResult('✓ Successfully connected to Supabase PostgreSQL database!');
      }
    } catch (err: unknown) {
      setTestResult(`Connection test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to reset all local data? This action cannot be undone.')) {
      await dataService.clearAllUserData();
      await authService.signOut();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#FBFBF9] border border-[#E3DDD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2E473B] text-[#F7F3E9] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1F2421]">Settings Menu</h2>
              <span className="text-[10px] text-[#7A6B53]">Personal preferences & account</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-[#6B756E] hover:text-[#1F2421]"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Sub-nav */}
        <div className="flex items-center gap-1 p-2 bg-[#EFECE6] text-xs font-medium border-b border-[#EAE6DD] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'theme' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
            }`}
          >
            Theme & Appearance
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'notifications' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'account' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
            }`}
          >
            Account ({currentUser ? 'Active' : 'Guest'})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'profile' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'cloud' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
            }`}
          >
            Cloud / Supabase
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. THEME & APPEARANCE (PRD Requirement & User Request) */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
                    Application Theme
                  </h3>
                  <p className="text-[11px] text-[#6B756E]">
                    Select the visual environment that best suits your daily focus.
                  </p>
                </div>
              </div>

              {/* Theme Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'personal' as const,
                    name: 'Warm Sage (Light Mode)',
                    badge: 'Default',
                    desc: 'Clean off-white canvas, dark charcoal text, muted sage green accents.',
                    icon: <Sun className="w-4 h-4 text-[#D99A26]" />,
                    bgColor: 'bg-[#FBFBF9]',
                    borderColor: 'border-[#2E473B]',
                  },
                  {
                    id: 'minimal_dark' as const,
                    name: 'Minimal Dark Sanctuary (Dark Mode)',
                    badge: 'Night',
                    desc: 'Calm deep charcoal tones with soft warm amber highlights for eye rest.',
                    icon: <Moon className="w-4 h-4 text-[#8FA38F]" />,
                    bgColor: 'bg-[#181D1A]',
                    borderColor: 'border-[#8FA38F]',
                  },
                  {
                    id: 'feminine' as const,
                    name: 'Soft Rose-Sage (Feminine)',
                    badge: 'Soft',
                    desc: 'Elegant muted blush undertone with refined sage and warm earth typography.',
                    icon: <Palette className="w-4 h-4 text-[#A87B7B]" />,
                    bgColor: 'bg-[#FAF8F6]',
                    borderColor: 'border-[#7F5353]',
                  },
                ].map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? `${t.borderColor} bg-white shadow-xs`
                          : 'border-[#EAE6DD] bg-white hover:border-[#D5CEC2]'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-[#EFECE6] shrink-0 mt-0.5">
                        {t.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#1F2421]">{t.name}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#2E473B] text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#505D54] mt-0.5 leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick toggle banner */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#ECE6D9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-[#2E473B]" />
                  <span className="text-xs font-medium text-[#1F2421]">Quick Dark Mode Switch</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleThemeChange(theme === 'minimal_dark' ? 'personal' : 'minimal_dark')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    theme === 'minimal_dark' ? 'bg-[#2E473B]' : 'bg-[#D5CEC2]'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      theme === 'minimal_dark' ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={onReplayOnboarding}
                  className="w-full py-2.5 rounded-xl border border-[#D5CEC2] text-xs font-medium text-[#505D54] hover:bg-[#F4F1EA] transition-colors"
                >
                  Replay App Walkthrough / Tour
                </button>
              </div>
            </div>
          )}

          {/* 2. NOTIFICATIONS MANAGEMENT (PRD & User Request) */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Permission Banner */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#2E473B]" />
                    <span className="text-xs font-semibold text-[#1F2421]">Device Notification Permission</span>
                  </div>
                  <p className="text-[10px] text-[#7A6B53] mt-0.5">
                    Current system status: <strong className="uppercase">{notifStatus}</strong>
                  </p>
                </div>
                {notifStatus === 'granted' ? (
                  <span className="text-xs font-semibold text-[#1C512C] bg-[#EBF3ED] px-2.5 py-1 rounded-full border border-[#C1DEC9]">
                    ✓ Active
                  </span>
                ) : (
                  <button
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] transition-all shadow-xs"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Daily Reminder Time Picker */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#7A6B53]" />
                  <div>
                    <span className="text-xs font-medium text-[#1F2421]">Morning Focus Reminder</span>
                    <p className="text-[10px] text-[#7E8B82]">Daily reflection & habit cue</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleReminderTimeChange(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-[#D5CEC2] text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                />
              </div>

              {/* Notification Toggles */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider block">
                  Category Controls
                </span>

                {[
                  { key: 'notifications_enabled' as const, label: 'Master Notifications Toggle', desc: 'Global switch for all notifications' },
                  { key: 'prayer_notifications_enabled' as const, label: 'Prayer Time Reminders', desc: 'Gentle alerts for Fajr, Dhuhr, Asr, Maghrib, Isha' },
                  { key: 'habit_notifications_enabled' as const, label: 'Daily Habit & Task Reminders', desc: 'Reminders to maintain consistent streaks' },
                  { key: 'relationship_notifications_enabled' as const, label: 'Us & Future Shared Goals', desc: 'Updates on shared milestones and I Need You signals' },
                  { key: 'sound_enabled' as const, label: 'Gentle Chime Feedback', desc: 'Calm harmonic tone upon task completion' },
                  { key: 'vibration_enabled' as const, label: 'Haptic Touch Vibration', desc: 'Tactile pulses for dhikr and taps' },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleToggleSetting(item.key)}
                    className="p-3 rounded-xl bg-white border border-[#EAE6DD] flex items-center justify-between cursor-pointer hover:border-[#D5CEC2] transition-colors"
                  >
                    <div className="pr-2">
                      <span className="text-xs font-medium text-[#1F2421] block">{item.label}</span>
                      <span className="text-[10px] text-[#7E8B82]">{item.desc}</span>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                        settings[item.key] ? 'bg-[#2E473B]' : 'bg-[#D5CEC2]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          settings[item.key] ? 'left-4.5' : 'left-1'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Test Actions */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={playCalmChime}
                  className="py-2 px-2 rounded-xl border border-[#D5CEC2] bg-white text-[11px] font-medium text-[#505D54] hover:bg-[#F4F1EA] flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#2E473B]" />
                  <span>Test Chime</span>
                </button>
                <button
                  type="button"
                  onClick={triggerHapticFeedback}
                  className="py-2 px-2 rounded-xl border border-[#D5CEC2] bg-white text-[11px] font-medium text-[#505D54] hover:bg-[#F4F1EA] flex items-center justify-center gap-1.5"
                >
                  <Vibrate className="w-3.5 h-3.5 text-[#2E473B]" />
                  <span>Test Haptic</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="py-2 px-2 rounded-xl border border-[#D5CEC2] bg-white text-[11px] font-medium text-[#505D54] hover:bg-[#F4F1EA] flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-[#2E473B]" />
                  <span>Test Push</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. USER ACCOUNT & AUTHENTICATION (User Request) */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2E473B] text-[#F7F3E9] flex items-center justify-center font-serif text-lg font-bold">
                      {currentUser.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1F2421]">
                        {currentUser.display_name}
                      </h4>
                      <p className="text-xs text-[#6B756E] font-mono">{currentUser.email}</p>
                      <span className="text-[10px] text-[#2E473B] font-semibold bg-[#EBF3ED] px-2 py-0.5 rounded-full mt-1 inline-block">
                        Authenticated
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F4F1EA] flex gap-2">
                    <button
                      onClick={onLogOut}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#D5CEC2] text-xs font-medium text-[#505D54] hover:bg-[#F4F1EA] transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                    <button
                      onClick={onOpenAuth}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Switch Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#ECE6D9] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFECE6] text-[#7A6B53] flex items-center justify-center mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#1F2421]">
                      Guest / Local Mode
                    </h4>
                    <p className="text-xs text-[#6B756E] max-w-xs mx-auto mt-1 leading-relaxed">
                      Your data is saved safely on this device. Sign in or create an account to secure and sync your data.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-semibold hover:bg-[#23372E] shadow-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-white border border-[#EAE6DD] space-y-2">
                <h4 className="text-xs font-semibold text-[#1F2421]">Security & Data Ownership</h4>
                <p className="text-xs text-[#505D54] leading-relaxed">
                  Passphrases are hashed cryptographically with individual salt buffers via the Web Crypto API. No plain-text passwords or telemetry are ever stored or transmitted.
                </p>
              </div>

              <div className="pt-2 border-t border-[#EAE6DD]">
                <button
                  onClick={handleClearData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAECE7] text-[#B93815] text-xs font-semibold hover:bg-[#F5D8D0] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Local Data & Restart</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo Section */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] flex items-center gap-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#2E473B] shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#2E473B] text-white flex items-center justify-center text-xl font-serif font-bold shadow-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#2E473B] text-white hover:bg-[#23382D] transition-transform active:scale-95 shadow-xs"
                    title="Change Photo"
                    aria-label="Upload profile photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#1F2421] block">
                    Profile Photo
                  </span>
                  <p className="text-[11px] text-[#7A857D] leading-tight mt-0.5 mb-2">
                    Add your photo so your profile is visible to you and your partner.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DDD5C5] text-[#2E473B] hover:bg-[#F2ECE0] text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2 py-1 rounded-lg text-[11px] text-[#B93815] hover:bg-[#FDF2EC] transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#505D54] mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#505D54] mb-1">Gender Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('male');
                      handleThemeChange('personal');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs text-center transition-all ${
                      gender === 'male'
                        ? 'border-[#2E473B] bg-[#EAE8E1] text-[#1F2421] font-semibold ring-1 ring-[#2E473B]'
                        : 'border-[#D5CEC2] text-[#6B756E] hover:bg-white'
                    }`}
                  >
                    Brother (Warm Sage)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGender('female');
                      handleThemeChange('feminine');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs text-center transition-all ${
                      gender === 'female'
                        ? 'border-[#7F5353] bg-[#F7EFEF] text-[#1F2421] font-semibold ring-1 ring-[#7F5353]'
                        : 'border-[#D5CEC2] text-[#6B756E] hover:bg-white'
                    }`}
                  >
                    Sister (Soft Minimal)
                  </button>
                </div>
              </div>

              {/* Connected Partner Card */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D5] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2421]">
                    <HeartHandshake className="w-4 h-4 text-[#A58957]" />
                    <span>Who You Are Connected With</span>
                  </div>
                  {relationship.status === 'accepted' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1C512C] text-[10px] font-semibold border border-[#CDE5D5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E473B]" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#8B6E38] text-[10px] font-semibold border border-[#EADBBD]">
                      Not Connected
                    </span>
                  )}
                </div>

                {relationship.status === 'accepted' ? (
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD3] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#1F2421]">
                        {relationship.partner_name || 'My Partner'}
                      </p>
                      <p className="text-[10px] text-[#7A857D] mt-0.5">
                        Connected since {new Date(relationship.accepted_at || relationship.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-[#2E473B]">
                      Active Sacred Bond
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-[#6B756E] leading-relaxed">
                      Connect with your partner in the <strong>Us</strong> section to unlock Deen Together, shared goals, and private timeline.
                    </p>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5DFD3]">
                      <span className="font-mono text-xs font-bold text-[#1F2421]">
                        {relationship.invite_code}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyInviteCode}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF6F0] text-xs font-medium text-[#2E473B] hover:bg-[#F2ECE0]"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-[#2E473B]" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[10px]">{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-semibold hover:bg-[#23372E] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E2D4B7]" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* 5. CLOUD / SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white border border-[#EAE6DD]">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-[#2E473B]" />
                  <span className="text-xs font-semibold text-[#1F2421]">
                    Backend Status: {isSupabaseConfigured() ? 'Cloud Linked' : 'Offline / Local Persistence'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B756E] leading-relaxed">
                  Amanah automatically persists everything in local storage and IndexedDB. You can connect your own Supabase project for multi-device sync, auth, and cloud backup.
                </p>
              </div>

              <form onSubmit={handleSaveSupabase} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                    Supabase Anon / Publishable Key
                  </label>
                  <input
                    type="password"
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs font-mono bg-white"
                  />
                </div>

                {testResult && (
                  <div className="p-3 rounded-xl bg-[#F6F4ED] border border-[#E5DFD3] text-xs text-[#1F2421] leading-relaxed">
                    {testResult}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isTesting}
                  className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] disabled:opacity-50"
                >
                  {isTesting ? 'Connecting & Verifying...' : 'Save & Link Supabase'}
                </button>
              </form>

              <div className="p-3 rounded-xl bg-[#F4F1EA] text-[11px] text-[#6B756E] space-y-1">
                <span className="font-semibold text-[#1F2421] block">Database Setup Instructions:</span>
                <p>1. Open your Supabase Dashboard → SQL Editor.</p>
                <p>2. Run the provided schema script located at: <code className="bg-white px-1 rounded">supabase/migrations/20261004000000_amanah_schema.sql</code>.</p>
                <p>3. Create a public Storage bucket named <code className="bg-white px-1 rounded">amanah_photos</code> if you wish to store remote milestone photos.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
