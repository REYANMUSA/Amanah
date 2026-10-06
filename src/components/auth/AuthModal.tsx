import React, { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff, X, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { authService, UserAccount } from '../../lib/auth/authService';
import { playCalmChime, triggerHapticFeedback } from '../../lib/notifications/notificationService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setResetSuccess(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setError(null);
    setLoading(true);
    triggerHapticFeedback();

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }
        const res = await authService.signUp(email, password, displayName);
        if (res.error) {
          setError(res.error);
        } else {
          playCalmChime();
          onAuthSuccess(res.user);
          onClose();
        }
      } else if (mode === 'login') {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          playCalmChime();
          onAuthSuccess(res.user);
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await authService.resetPassword(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          setResetSuccess(true);
          playCalmChime();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-[#FBFBF9] border border-[#E3DDD1] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B756E] hover:text-[#1F2421] hover:bg-[#EFECE6] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#283A2E] text-[#E2D4B7] flex items-center justify-center mx-auto mb-2 shadow-xs">
            <span className="font-serif font-bold text-lg">أ</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1F2421]">
            {mode === 'login' && 'Sign in to Amanah'}
            {mode === 'signup' && 'Create your Account'}
            {mode === 'forgot' && 'Reset your Password'}
          </h2>
          <p className="text-xs text-[#7A6B53] mt-0.5">
            {mode === 'login' && 'Continue your private daily growth journey.'}
            {mode === 'signup' && 'Securely store and sync your habits, dhikr, and goals.'}
            {mode === 'forgot' && 'Enter your email to update your secure password.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-xl text-xs font-medium mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-[#1F2421] font-semibold shadow-xs' : 'text-[#6B756E]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FAECE7] border border-[#F3C7B9] text-xs text-[#B93815] leading-relaxed">
            {error}
          </div>
        )}

        {resetSuccess ? (
          <div className="p-4 rounded-xl bg-[#EBF3ED] border border-[#C1DEC9] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2E473B] mx-auto" />
            <h4 className="text-sm font-semibold text-[#1C512C]">Password Updated</h4>
            <p className="text-xs text-[#405646]">Your password has been securely reset. You can now sign in.</p>
            <button
              onClick={() => {
                setMode('login');
                setResetSuccess(false);
                setPassword('');
              }}
              className="mt-2 w-full py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A958E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ibrahim / Maryam"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5CEC2] bg-white text-xs text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A958E] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5CEC2] bg-white text-xs text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-[#505D54]">
                  {mode === 'forgot' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[10px] text-[#2E473B] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A958E] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#D5CEC2] bg-white text-xs text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8A958E] hover:text-[#1F2421]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A958E] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5CEC2] bg-white text-xs text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-semibold hover:bg-[#23372E] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E2D4B7]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Reset Password'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="w-full py-1.5 text-[11px] text-[#6B756E] hover:text-[#1F2421] text-center"
              >
                Back to Sign In
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
