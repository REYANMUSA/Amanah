import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Heart, 
  Compass, 
  BookOpen, 
  ShieldAlert, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { Gender, ThemePreference } from '../../types/database';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { displayName: string; gender: Gender; theme: ThemePreference }) => void;
  onClose?: () => void;
}

interface StepContent {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepContent[] = [
  {
    title: 'Welcome to Amanah',
    subtitle: 'أمانة — Trust & Responsibility',
    description: 'Amanah is a private, calm companion built around one principle: Becoming better, one day at a time.',
    icon: <Sparkles className="w-8 h-8 text-[#988158]" />
  },
  {
    title: 'Home & Daily Focus',
    subtitle: 'Start with calm clarity',
    description: 'Every morning brings today’s priorities, meaningful reminders, and peaceful daily guidance.',
    icon: <Clock className="w-8 h-8 text-[#2E473B]" />
  },
  {
    title: 'Habits & Today’s Tasks',
    subtitle: 'Disciplined consistency',
    description: 'Track genuine habits with real streaks. Missing a day is part of life—restarting without guilt is what matters.',
    icon: <CheckCircle className="w-8 h-8 text-[#2E473B]" />
  },
  {
    title: 'Personal Goals',
    subtitle: 'Purpose over distraction',
    description: 'Establish tangible milestones across deen, character, education, career, and physical health.',
    icon: <Compass className="w-8 h-8 text-[#2E473B]" />
  },
  {
    title: 'Deen & Spiritual Sanctuary',
    subtitle: 'Grounded in authentic sources',
    description: 'Authentic Bukhari & Muslim daily hadiths, interactive Istighfar dhikr counter, prayer times, and daily Quran Muraaja.',
    icon: <BookOpen className="w-8 h-8 text-[#988158]" />
  },
  {
    title: 'Us & Shared Goals',
    subtitle: 'Growing separately, together',
    description: 'A dignified space to prepare for a halal marriage and future life without social noise or dating-app distractions.',
    icon: <Heart className="w-8 h-8 text-[#7F5353]" />
  },
  {
    title: 'I Need You',
    subtitle: 'Immediate, calm reassurance',
    description: 'When either of you faces a moment of vulnerability or emergency, send an urgent notification with one tap.',
    icon: <ShieldAlert className="w-8 h-8 text-[#9A3412]" />
  },
  {
    title: 'Your Preferences',
    subtitle: 'Make it yours',
    description: 'Choose your name and preferred aesthetic tone to complete your setup.',
    icon: <SlidersHorizontal className="w-8 h-8 text-[#2E473B]" />
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [theme, setTheme] = useState<ThemePreference>('personal');

  if (!isOpen) return null;

  const isFinalStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isFinalStep) {
      onComplete({
        displayName: name.trim() || 'Seeker',
        gender,
        theme,
      });
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    onComplete({
      displayName: name.trim() || 'Seeker',
      gender,
      theme,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#FBFBF9] border border-[#E3DDD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#6B756E] uppercase">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose || handleSkip}
            className="text-xs text-[#7F8A82] hover:text-[#1F2421] transition-colors p-1"
          >
            Skip
          </button>
        </div>

        {/* Step Progress indicators */}
        <div className="px-6 py-1">
          <div className="grid grid-cols-8 gap-1.5 h-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'bg-[#2E473B]' : 'bg-[#E3DDD1]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EFECE6] border border-[#E3DDD1] mx-auto mb-4 flex items-center justify-center shadow-xs">
            {STEPS[currentStep].icon}
          </div>

          <h2 className="text-xl font-serif font-bold text-[#1F2421] mb-1">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-xs font-medium text-[#7D6B4E] mb-3">
            {STEPS[currentStep].subtitle}
          </p>
          <p className="text-sm text-[#4A554D] leading-relaxed max-w-xs mx-auto mb-4">
            {STEPS[currentStep].description}
          </p>

          {/* Form controls on the last step */}
          {isFinalStep && (
            <div className="mt-2 space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-[#4A554D] mb-1.5">
                  What is your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ibrahim, Maryam..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A554D] mb-1.5">
                  Gender & Theme Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('male');
                      setTheme('personal');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                      gender === 'male'
                        ? 'border-[#2E473B] bg-[#EAE8E1] text-[#1F2421] font-semibold'
                        : 'border-[#D5CEC2] text-[#6B756E] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    Brother · Warm Sage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGender('female');
                      setTheme('feminine');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                      gender === 'female'
                        ? 'border-[#7F5353] bg-[#F7EFEF] text-[#1F2421] font-semibold'
                        : 'border-[#D5CEC2] text-[#6B756E] hover:bg-[#F4F1EA]'
                    }`}
                  >
                    Sister · Soft Minimal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#EAE6DD] bg-[#F7F5EE] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-[#505D54] hover:text-[#1F2421]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs font-medium px-5 py-2.5 rounded-xl bg-[#2E473B] text-[#F7F3E9] hover:bg-[#23372E] shadow-sm active:scale-95 transition-all"
          >
            <span>{isFinalStep ? "Enter Amanah" : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
