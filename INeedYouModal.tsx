import React, { useState } from 'react';
import { HeartHandshake, Send, CheckCircle2, X, Loader2 } from 'lucide-react';
import { EmergencyRequest } from '../../types/database';
import { dataService } from '../../lib/storage/dataService';
import { playCalmChime, triggerHapticFeedback } from '../../lib/notifications/notificationService';

interface INeedYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: (req: EmergencyRequest) => void;
}

const PRESET_MESSAGES = [
  {
    title: 'Please make Du’a for me right now',
    desc: 'Facing a trial or difficult moment; need your sincere prayers.',
  },
  {
    title: 'I need to speak with you · Important for our future',
    desc: 'An important matter regarding our future and marriage steps.',
  },
  {
    title: 'Struggling with patience · Need your support',
    desc: 'Seeking encouragement to stay strong and steadfast.',
  },
  {
    title: 'Family & Marriage Preparation Update',
    desc: 'Progress or news regarding parents, arrangements, or next steps.',
  },
  {
    title: 'Thinking of our future together',
    desc: 'A quiet reminder of why we work hard and stay patient.',
  },
];

export const INeedYouModal: React.FC<INeedYouModalProps> = ({
  isOpen,
  onClose,
  onSent,
}) => {
  const [step, setStep] = useState<'confirm' | 'sending' | 'sent'>('confirm');
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [recentRequest, setRecentRequest] = useState<EmergencyRequest | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (isSubmitting) return; // Strictly prevent double submission
    setIsSubmitting(true);
    setSendError(null);
    setStep('sending');
    triggerHapticFeedback();

    const chosenPreset = PRESET_MESSAGES[selectedPreset];
    const finalMessage = customNote.trim()
      ? `${chosenPreset.title} — "${customNote.trim()}"`
      : chosenPreset.title;

    try {
      const req = await dataService.sendEmergencyRequest(finalMessage);
      if (!req || !req.id) {
        throw new Error('Message delivery failed');
      }
      playCalmChime();
      setRecentRequest(req);
      setStep('sent');
      if (onSent) onSent(req);
    } catch (err) {
      console.error('I Need You dispatch error:', err);
      setSendError('Could not deliver message. Please check your connection and try again.');
      setStep('confirm'); // Never show 'sent' if it didn't succeed!
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('confirm');
    setCustomNote('');
    setSendError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-[#FAF8F3] border border-[#E8E2D5] shadow-2xl p-5 text-left relative overflow-hidden">
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E473B]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B756E] hover:text-[#1F2421] hover:bg-black/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2E473B] text-white flex items-center justify-center shadow-xs shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#E2C785]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1F2421] leading-tight">
                  I Need You
                </h3>
                <p className="text-[11px] text-[#7A6B53]">
                  Reach out with clear intention when you need support
                </p>
              </div>
            </div>

            {/* Respectful Notice */}
            <div className="p-3 rounded-2xl bg-[#F0ECE1] border border-[#E2DCce] text-[11px] text-[#4A554E] leading-relaxed">
              <span className="font-semibold text-[#1F2421] block mb-0.5">
                Building our future the right way:
              </span>
              Because we are holding back from casual texting to protect our boundaries, reach out here whenever you genuinely need each other.
            </div>

            {sendError && (
              <div className="p-3 rounded-xl bg-[#FAECE7] border border-[#F3C7B9] text-xs text-[#B93815] font-medium leading-relaxed">
                {sendError}
              </div>
            )}

            {/* Presets List */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A6B53]">
                Select Reason:
              </label>
              {PRESET_MESSAGES.map((preset, idx) => {
                const isSelected = selectedPreset === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback();
                      setSelectedPreset(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-white border-[#2E473B] ring-1 ring-[#2E473B] shadow-xs'
                        : 'bg-white/60 border-[#E8E2D5] text-[#556358] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 text-[10px] ${
                        isSelected
                          ? 'bg-[#2E473B] text-white'
                          : 'border border-[#C5BCAB]'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1F2421] leading-tight">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-[#7A857D] mt-0.5 leading-tight">
                        {preset.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Note */}
            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                Additional Note (Optional):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Brief message..."
                maxLength={100}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#2E473B] hover:bg-[#23382D] disabled:opacity-50 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E2C785]" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Partner</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 rounded-xl border border-[#DCD6C8] text-xs font-medium text-[#6B756E] hover:bg-[#F4F1EA] transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-3 border-[#2E473B] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-serif font-semibold text-[#1F2421]">
              Sending your message...
            </p>
            <p className="text-xs text-[#7A6B53]">
              Delivering to your connected partner
            </p>
          </div>
        )}

        {step === 'sent' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EBF5EE] border border-[#CDE5D5] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#2E473B]" />
            </div>

            <div>
              <h4 className="text-lg font-serif font-bold text-[#1F2421] mb-1">
                Message Delivered
              </h4>
              <p className="text-xs text-[#505D54] leading-relaxed max-w-xs mx-auto">
                Your message has been delivered to your partner. May Allah grant you patience and bring you together in goodness.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E8E2D5] text-left text-xs space-y-1">
              <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider block">
                Message Sent:
              </span>
              <p className="font-medium text-[#1F2421]">
                {recentRequest?.message || PRESET_MESSAGES[selectedPreset].title}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23382D] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
