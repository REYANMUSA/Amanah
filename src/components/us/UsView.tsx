import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Copy, 
  Check, 
  Link2, 
  Unlink, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  Heart, 
  Loader2,
  BookOpen,
  Flame,
  Award,
  ArrowRight,
  X
} from 'lucide-react';
import { 
  SharedGoal, 
  Goal, 
  Relationship, 
  EmergencyRequest, 
  SharedGoalCategory, 
  Memory,
  Profile,
  QuranTask,
  DailyQuizRecord
} from '../../types/database';
import { dataService, getTodayKey, DailyQuizProgress } from '../../lib/storage/dataService';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';
import { CouplesGallery } from './CouplesGallery';
import confetti from 'canvas-confetti';

interface UsViewProps {
  onOpenINeedYou: () => void;
  profile?: Profile;
  onNavigateToDeen?: () => void;
}

const CATEGORIES: SharedGoalCategory[] = [
  'Marriage preparation',
  'Deen',
  'Character',
  'Family',
  'Education',
  'Career',
  'Money',
  'Health',
];

export const UsView: React.FC<UsViewProps> = ({ 
  onOpenINeedYou, 
  profile,
  onNavigateToDeen 
}) => {
  const currentProfile = profile || dataService.getProfile();
  const [relationship, setRelationship] = useState<Relationship>(dataService.getRelationship());
  const [personalGoals, setPersonalGoals] = useState<Goal[]>(dataService.getGoals());
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>(dataService.getSharedGoals());
  const [memories, setMemories] = useState<Memory[]>(dataService.getMemories());
  const [partnerGoals, setPartnerGoals] = useState<Goal[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(dataService.getEmergencyRequests());

  // Deen Together State
  const [quranTask, setQuranTask] = useState<QuranTask>(dataService.getQuranTask());
  const [quranStreak, setQuranStreak] = useState<number>(dataService.calculateQuranStreak());
  const [quranStreakSource, setQuranStreakSource] = useState<'cloud' | 'local' | 'unavailable'>('local');
  const [ownQuizProgress, setOwnQuizProgress] = useState<DailyQuizProgress | null>(null);
  const [partnerQuranTask, setPartnerQuranTask] = useState<QuranTask | null>(null);
  const [partnerQuranProgressAvailable, setPartnerQuranProgressAvailable] = useState(false);
  const [partnerQuizScore, setPartnerQuizScore] = useState<DailyQuizProgress | null>(null);
  const [partnerQuizProgressAvailable, setPartnerQuizProgressAvailable] = useState(false);
  const [quizRecord, setQuizRecord] = useState<DailyQuizRecord>(dataService.getDailyQuizRecord());
  const [showQuranModal, setShowQuranModal] = useState(false);
  const [isLoggingQuran, setIsLoggingQuran] = useState(false);
  const [quranNotice, setQuranNotice] = useState<string | null>(null);

  // Tabs: Deen Together -> Our Goals -> Her Goals -> My Goals -> Our Journey -> Gallery -> Connection
  const [activeTab, setActiveTab] = useState<'deen_together' | 'our_goals' | 'her_goals' | 'my_goals' | 'journey' | 'gallery' | 'link'>('deen_together');
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputInviteCode, setInputInviteCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isCreatingSharedGoal, setIsCreatingSharedGoal] = useState(false);
  const [isCreatingPersonalGoal, setIsCreatingPersonalGoal] = useState(false);
  const [isSavingMoment, setIsSavingMoment] = useState(false);
  const [postSuccessBanner, setPostSuccessBanner] = useState<string | null>(null);

  // Add / Edit Shared Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<SharedGoalCategory>('Marriage preparation');
  const [newProgress, setNewProgress] = useState(0);

  // Add Personal Goal Modal
  const [showPersonalGoalModal, setShowPersonalGoalModal] = useState(false);
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalDesc, setPersonalDesc] = useState('');
  const [personalCategory, setPersonalCategory] = useState('Deen');

  // Our Journey add-moment form
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [journeyTitle, setJourneyTitle] = useState('');
  const [journeyDescription, setJourneyDescription] = useState('');
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().slice(0, 10));
  const [journeyEventType, setJourneyEventType] = useState<Memory['event_type']>('Important date');

  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  const loadData = async () => {
    const rel = await dataService.loadRelationship();
    setRelationship(rel);
    setPersonalGoals(dataService.getGoals());
    setSharedGoals(await dataService.loadSharedGoals(rel));
    setMemories(await dataService.loadMemories(rel));
    setEmergencyRequests(await dataService.loadEmergencyRequests());
    setPartnerGoals(await dataService.loadPartnerGoals(rel));
    const deenProgress = await dataService.loadDeenTogetherProgress(rel);
    setQuranTask(deenProgress.quranTask);
    setQuranStreak(deenProgress.quranStreak);
    setQuranStreakSource(deenProgress.quranStreakSource);
    setOwnQuizProgress(deenProgress.ownQuizScore);
    setPartnerQuranTask(deenProgress.partnerQuranTask);
    setPartnerQuranProgressAvailable(deenProgress.partnerQuranAvailable);
    setPartnerQuizScore(deenProgress.partnerQuizScore);
    setPartnerQuizProgressAvailable(deenProgress.partnerQuizAvailable);
    setQuizRecord(dataService.getDailyQuizRecord());
  };

  useEffect(() => {
    void loadData();
    const unsubscribeUs = dataService.subscribeToUsChanges(() => {
      void loadData();
    });
    const unsubscribeQuiz = dataService.subscribeQuizScore((record) => {
      setQuizRecord(record);
    });
    return () => {
      unsubscribeUs();
      unsubscribeQuiz();
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(relationship.invite_code);
    setCopiedCode(true);
    triggerHapticFeedback();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConnectPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConnecting) return; // Strictly prevent double tap
    const cleanCode = inputInviteCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === relationship.invite_code.trim().toUpperCase()) {
      setConnectError('You cannot connect with your own invitation code.');
      triggerHapticFeedback();
      return;
    }

    setConnectError(null);
    setIsConnecting(true);
    triggerHapticFeedback();

    try {
      const updated = await dataService.connectRelationship(cleanCode);
      if (!updated || updated.status !== 'accepted') {
        // If not successfully verified, never falsely show linked!
        setConnectError('Invalid invite code. Could not link with this code. Please check and try again.');
        triggerHapticFeedback();
        return;
      }
      setRelationship(updated);
      setInputInviteCode('');
      await loadData();
      playCalmChime();
      setPostSuccessBanner('Connected successfully with your partner.');
      setTimeout(() => setPostSuccessBanner(null), 3500);
    } catch {
      setConnectError('Connection failed. Please check network and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    if (!confirm('Disconnect from your partner? This will keep your data private.')) return;
    setIsDisconnecting(true);
    triggerHapticFeedback();
    try {
      const updated = await dataService.updateRelationship({
        status: 'disconnected',
        partner_name: undefined,
        user_b: undefined,
      });
      setRelationship(updated);
      await loadData();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCreateSharedGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreatingSharedGoal) return;
    setIsCreatingSharedGoal(true);
    try {
      const created = await dataService.createSharedGoal({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        progress: newProgress,
        status: 'in_progress',
      });
      setSharedGoals((prev) => [...prev, created]);
      setNewTitle('');
      setNewDesc('');
      setNewProgress(0);
      setShowGoalModal(false);
      playCalmChime();
    } finally {
      setIsCreatingSharedGoal(false);
    }
  };

  const handleCreatePersonalGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalTitle.trim() || isCreatingPersonalGoal) return;
    setIsCreatingPersonalGoal(true);
    try {
      const created = await dataService.createGoal({
        title: personalTitle.trim(),
        description: personalDesc.trim(),
        category: personalCategory,
        progress: 0,
        status: 'in_progress',
      });
      setPersonalGoals((prev) => [...prev, created]);
      setPersonalTitle('');
      setPersonalDesc('');
      setShowPersonalGoalModal(false);
      playCalmChime();
    } finally {
      setIsCreatingPersonalGoal(false);
    }
  };

  const handleUpdateSharedProgress = async (goalId: string, currentProg: number, step: number) => {
    triggerHapticFeedback();
    const nextVal = Math.min(100, Math.max(0, currentProg + step));
    const updated = await dataService.updateSharedGoal(goalId, { progress: nextVal });
    if (updated) {
      setSharedGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    }
  };

  const handleDeleteSharedGoal = async (goalId: string) => {
    if (confirm('Delete this shared goal?')) {
      await dataService.deleteSharedGoal(goalId);
      setSharedGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  };

  const handleAddJourneyMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyTitle.trim() || isSavingMoment) return;
    setIsSavingMoment(true);
    triggerHapticFeedback();
    try {
      const created = await dataService.createMemory({
        title: journeyTitle.trim(),
        description: journeyDescription.trim(),
        event_date: journeyDate,
        event_type: journeyEventType,
        image_url: '',
      });
      setMemories((prev) => [created, ...prev]);
      setJourneyTitle('');
      setJourneyDescription('');
      setJourneyDate(new Date().toISOString().slice(0, 10));
      setJourneyEventType('Important date');
      setShowJourneyModal(false);
      playCalmChime();
      setPostSuccessBanner('Milestone successfully posted to your timeline.');
      setTimeout(() => setPostSuccessBanner(null), 3500);
    } finally {
      setIsSavingMoment(false);
    }
  };

  const handleDeleteJourneyMoment = async (id: string) => {
    if (!confirm('Delete this moment from your private journey?')) return;
    await dataService.deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeletePersonalGoal = async (goalId: string) => {
    if (confirm('Delete this personal goal?')) {
      await dataService.deleteGoal(goalId);
      setPersonalGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const updated = await dataService.acknowledgeEmergencyRequest(alertId);
    if (updated) {
      setEmergencyRequests((prev) =>
        prev.map((r) => (r.id === alertId ? updated : r))
      );
    }
  };

  // Log Quran reading action with intentional choices
  const handleLogQuran = async (status: 'completed' | 'busy') => {
    if (isLoggingQuran) return; // Prevent double tap!
    setIsLoggingQuran(true);
    triggerHapticFeedback();

    try {
      const res = await dataService.logQuranStatus(status);
      setQuranTask(res.task);
      setQuranStreak(res.streak);
      if (status === 'completed') {
        playCalmChime();
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#2E473B', '#E2D4B7', '#8F9E8B'],
          });
        } catch {}
        setQuranNotice(null);
      } else {
        setQuranNotice(
          'May Allah put barakah in your time. The most beloved deeds to Allah are regular ones, even if small. Try reciting even 1 ayah before sleep.'
        );
      }
      setShowQuranModal(false);
    } finally {
      setIsLoggingQuran(false);
    }
  };

  const isLinked = relationship.status === 'accepted';
  const partnerDisplayName = relationship.partner_name || (currentProfile.gender === 'male' ? 'Her' : 'Him');
  const activeAlerts = emergencyRequests.filter((r) => r.status === 'active');

  const localQuizAnsweredCount = Object.keys(quizRecord.answers || {}).length;
  const cloudQuizHasMoreAnswers = Boolean(
    ownQuizProgress && ownQuizProgress.answered_count > localQuizAnsweredCount
  );
  const ownQuizAnsweredCount = Math.max(
    localQuizAnsweredCount,
    ownQuizProgress?.answered_count || 0
  );
  const ownQuizTotal = cloudQuizHasMoreAnswers ? ownQuizProgress!.total : quizRecord.total;
  const ownQuizScore = cloudQuizHasMoreAnswers ? ownQuizProgress!.score : quizRecord.score;
  const ownQuizCompleted = Boolean(quizRecord.completed || ownQuizProgress?.completed);
  const ownQuizProgressWidth = `${Math.min(100, Math.max(0, (ownQuizAnsweredCount / Math.max(1, ownQuizTotal)) * 100))}%`;
  const ownQuizScoreLabel = ownQuizCompleted
    ? `${ownQuizScore}/${ownQuizTotal}`
    : `${ownQuizAnsweredCount}/${ownQuizTotal}`;
  const ownQuizStatusLabel = ownQuizCompleted
    ? 'Completed Today ✓'
    : ownQuizAnsweredCount > 0
    ? 'In Progress'
    : 'Not logged yet';

  const partnerQuizScoreLabel = !isLinked
    ? '🔒'
    : !partnerQuizProgressAvailable
    ? '—'
    : partnerQuizScore
    ? `${partnerQuizScore.score}/${partnerQuizScore.total}`
    : 'Pending';
  const partnerQuizStatusLabel = !isLinked
    ? 'Connect partner'
    : !partnerQuizProgressAvailable
    ? 'Unable to load'
    : !partnerQuizScore
    ? 'Not logged yet'
    : partnerQuizScore.completed
    ? 'Completed Today ✓'
    : partnerQuizScore.answered_count > 0
    ? 'In Progress'
    : 'Not logged yet';
  const partnerQuizProgressWidth = partnerQuizScore && partnerQuizProgressAvailable
    ? `${Math.min(100, Math.max(0, (partnerQuizScore.answered_count / Math.max(1, partnerQuizScore.total)) * 100))}%`
    : '0%';
  const partnerQuranBusy = Boolean(
    partnerQuranTask &&
    !partnerQuranTask.completed &&
    (partnerQuranTask.notes || '').toLowerCase().includes('busy')
  );
  const partnerQuranStatusLabel = !isLinked
    ? 'Connect partner'
    : !partnerQuranProgressAvailable
    ? 'Unable to load'
    : !partnerQuranTask
    ? 'Not logged yet'
    : partnerQuranTask.completed
    ? 'Alhamdulillah, completed ✓'
    : partnerQuranBusy
    ? 'Busy today'
    : partnerQuranTask.pages_completed > 0
    ? `In progress · ${partnerQuranTask.pages_completed}/${partnerQuranTask.pages_target} pages`
    : 'Not logged yet';
  const partnerQuranBadgeLabel = !isLinked
    ? '🔒 Private'
    : !partnerQuranProgressAvailable
    ? 'Unavailable'
    : !partnerQuranTask
    ? 'Not logged'
    : partnerQuranTask.completed
    ? 'Completed'
    : partnerQuranBusy
    ? 'Insha’Allah later'
    : partnerQuranTask.pages_completed > 0
    ? 'In progress'
    : 'Pending';
  const partnerQuranBadgeClass = isLinked && partnerQuranProgressAvailable && partnerQuranTask?.completed
    ? 'bg-[#EBF5EE] text-[#1C512C] border border-[#CDE5D5]'
    : partnerQuranBusy && isLinked && partnerQuranProgressAvailable
    ? 'bg-[#FAF0E6] text-[#8B6E38] border border-[#EADBBD]'
    : 'bg-[#F2EFE9] text-[#7A857D]';
  const quranStreakLabel = quranStreakSource === 'unavailable'
    ? 'Streak unavailable'
    : quranStreakSource === 'local'
    ? `${quranStreak}d Local Streak`
    : `${quranStreak}d Quran Streak`;
  const mutualDeenChallengeCompleted = Boolean(
    ownQuizCompleted &&
    isLinked &&
    partnerQuizProgressAvailable &&
    partnerQuizScore?.completed
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HeartHandshake className="w-5 h-5 text-[#7F5353]" />
          <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
            Us · Halal Future
          </h1>
        </div>
        <p className="text-xs text-[#7A6B53]">
          «Growing separately. Growing together.» Preparing with dignity and restraint.
        </p>
      </div>

      {/* Prominent Connection Profile Card: Shows WHO You Are Connected With */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-white to-[#FAF8F3] border border-[#E8E2D5] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-[#7A6B53]">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Sacred Premarital Profiles
          </span>
          {isLinked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF5EE] text-[#1C512C] text-[10px] font-semibold border border-[#CDE5D5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E473B] animate-pulse" />
              Connected & Synchronized
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#8B6E38] text-[10px] font-semibold border border-[#EADBBD]">
              Awaiting Partner Link
            </span>
          )}
        </div>

        {/* Both Profiles Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Your Profile */}
          <div className="p-3 rounded-2xl bg-[#F6F4EE] border border-[#E5DFD3] flex items-center gap-2.5">
            {currentProfile.avatar_url ? (
              <img
                src={currentProfile.avatar_url}
                alt={currentProfile.display_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#2E473B] shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2E473B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {currentProfile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#7A6B53] font-medium block">You</span>
              <p className="text-xs font-bold text-[#1F2421] truncate">
                {currentProfile.display_name}
              </p>
            </div>
          </div>

          {/* Partner's Profile */}
          <div className="p-3 rounded-2xl bg-[#F6F4EE] border border-[#E5DFD3] flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#A58957] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {isLinked ? (relationship.partner_name || 'P').charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#7A6B53] font-medium block">Partner</span>
              <p className="text-xs font-bold text-[#1F2421] truncate">
                {isLinked ? relationship.partner_name || 'My Partner' : 'Not Connected Yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Status explanation */}
        <p className="text-[11px] text-[#6B756E] leading-relaxed">
          {isLinked
            ? `Connected since ${new Date(relationship.accepted_at || relationship.created_at).toLocaleDateString()}. Goals, milestones, and Deen consistency are shared.`
            : `Your private invitation code is ${relationship.invite_code}. Connect below or share your code to sync.`}
        </p>
      </div>

      {/* Success banner if triggered */}
      {postSuccessBanner && (
        <div className="p-3 rounded-xl bg-[#EBF3ED] border border-[#C1DEC9] text-xs text-[#1C512C] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2E473B] shrink-0" />
          <span>{postSuccessBanner}</span>
        </div>
      )}

      {/* I Need You Banner */}
      <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5DDD0] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E473B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <HeartHandshake className="w-5 h-5 text-[#E2C785]" />
          </div>
          <div>
            <h2 className="text-xs font-serif font-bold text-[#1F2421]">
              I Need You
            </h2>
            <p className="text-[11px] text-[#6B756E] leading-snug">
              Reach out with clear intention when you need Du'a or spiritual support.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenINeedYou}
          className="px-3.5 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium whitespace-nowrap hover:bg-[#23382D] active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
        >
          <HeartHandshake className="w-3.5 h-3.5 text-[#E2C785]" />
          <span>I Need You</span>
        </button>
      </div>

      {/* Active Partner Requests (if any) */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-2xl bg-[#F4F8F5] border border-[#CDE5D5] flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E2EFE6] text-[#2E473B] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-[#2E473B]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1F2421] block">
                    {relationship.partner_name || 'Partner'} reached out: "{alert.message}"
                  </span>
                  <p className="text-[10px] text-[#6B756E]">
                    Sent at {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAcknowledgeAlert(alert.id)}
                className="px-3 py-1.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23382D] whitespace-nowrap"
              >
                Made Du’a ✓
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-xl text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('deen_together')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'deen_together'
              ? 'bg-[#2E473B] text-white shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#E2C785]" />
          <span>Deen Together</span>
        </button>
        <button
          onClick={() => setActiveTab('our_goals')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'our_goals'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          Our Goals ({sharedGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('her_goals')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'her_goals'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          {partnerDisplayName}'s Goals {isLinked ? `(${partnerGoals.length})` : '🔒'}
        </button>
        <button
          onClick={() => setActiveTab('my_goals')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'my_goals'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          My Goals ({personalGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'journey'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          Our Journey
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'gallery'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          Gallery ({memories.length})
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'link'
              ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
              : 'text-[#6B756E] hover:text-[#1F2421]'
          }`}
        >
          Connection {isLinked ? '✓' : ''}
        </button>
      </div>

      {/* 0. DEEN TOGETHER (Dedicated Quran reading block with its own streak & mutual Hadith Challenge score) */}
      {activeTab === 'deen_together' && (
        <div className="space-y-4">
          {/* A. Mutual Hadith Challenge Daily Score */}
          <div className="p-4 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF0E6] border border-[#EADBBD] flex items-center justify-center text-[#8B6E38]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-bold text-[#1F2421]">
                    Daily 365 Hadith Deen Challenge
                  </h3>
                  <p className="text-[10px] text-[#7A6B53]">
                    Mutual knowledge & daily score
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#6B756E]">
                Day {dayOfYear}
              </span>
            </div>

            {/* Side-by-Side Scores */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Your Score */}
              <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D5] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F2421]">
                    {currentProfile.display_name}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#2E473B]">
                    {ownQuizScoreLabel}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E8E3D7] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#2E473B] transition-all"
                    style={{ width: ownQuizProgressWidth }}
                  />
                </div>
                <p className="text-[10px] text-[#7A857D]">
                  {ownQuizStatusLabel}
                </p>
              </div>

              {/* Partner's Score */}
              <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D5] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F2421]">
                    {partnerDisplayName}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#8B6E38]">
                    {partnerQuizScoreLabel}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E8E3D7] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#8B6E38] transition-all"
                    style={{ width: partnerQuizProgressWidth }}
                  />
                </div>
                <p className="text-[10px] text-[#7A857D]">
                  {partnerQuizStatusLabel}
                </p>
              </div>
            </div>

            {/* Mutual Barakah Celebration Banner */}
            {mutualDeenChallengeCompleted && (
              <div className="p-3 rounded-xl bg-[#EBF5EE] border border-[#CDE5D5] text-xs text-[#1C512C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2E473B] shrink-0" />
                <span>Alhamdulillah, both of you completed today’s Deen Challenge. May Allah increase you in wisdom.</span>
              </div>
            )}

            {!ownQuizCompleted && onNavigateToDeen && (
              <button
                onClick={onNavigateToDeen}
                className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23382D] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Answer Today’s Hadith Challenge in Deen Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* B. Shared Quran Reading Block with ITS OWN STREAK */}
          <div className="p-4 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAE8E1] border border-[#D5CEC2] flex items-center justify-center text-[#2E473B]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-bold text-[#1F2421]">
                    Shared Quran Reading Block
                  </h3>
                  <p className="text-[10px] text-[#7A6B53]">
                    Daily portion · ورد القرآن الكريم
                  </p>
                </div>
              </div>

              {/* Dedicated Quran Streak Counter */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-xs font-semibold text-[#8B6E38]">
                <Flame className="w-3.5 h-3.5 fill-[#D99A26] text-[#D99A26]" />
                <span>{quranStreakLabel}</span>
              </div>
            </div>

            {/* Both Partners' Quran Reading Status for Today */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Your Status */}
              <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-[#EAE6DD] space-y-1">
                <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider block">
                  {currentProfile.display_name}
                </span>
                <p className="text-xs font-medium text-[#1F2421]">
                  {quranTask.completed
                    ? 'Alhamdulillah, I did it ✓'
                    : (quranTask.notes || '').toLowerCase().includes('busy')
                    ? 'Busy today'
                    : quranTask.pages_completed > 0
                    ? `In progress · ${quranTask.pages_completed}/${quranTask.pages_target} pages`
                    : 'Not logged yet'}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  quranTask.completed
                    ? 'bg-[#EBF5EE] text-[#1C512C] border border-[#CDE5D5]'
                    : (quranTask.notes || '').toLowerCase().includes('busy')
                    ? 'bg-[#FAF0E6] text-[#8B6E38] border border-[#EADBBD]'
                    : 'bg-[#F2EFE9] text-[#7A857D]'
                }`}>
                  {quranTask.completed
                    ? 'Completed'
                    : (quranTask.notes || '').toLowerCase().includes('busy')
                    ? 'Insha’Allah later'
                    : quranTask.pages_completed > 0
                    ? 'In progress'
                    : 'Pending'}
                </span>
              </div>

              {/* Partner's Status */}
              <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-[#EAE6DD] space-y-1">
                <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider block">
                  {partnerDisplayName}
                </span>
                <p className="text-xs font-medium text-[#1F2421]">
                  {partnerQuranStatusLabel}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${partnerQuranBadgeClass}`}>
                  {partnerQuranBadgeLabel}
                </span>
              </div>
            </div>

            {/* Compassionate message if user was busy */}
            {quranNotice && (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DDD0] text-xs text-[#6B5A3E] leading-relaxed">
                {quranNotice}
              </div>
            )}

            {/* Action button to Log Reading */}
            <button
              onClick={() => setShowQuranModal(true)}
              className="w-full py-2.5 rounded-xl bg-[#2E473B] text-white text-xs font-semibold hover:bg-[#23382D] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Update Today’s Quran Status</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. OUR GOALS */}
      {activeTab === 'our_goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              Our Shared Premarital Goals
            </span>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shared Goal</span>
            </button>
          </div>

          <div className="space-y-3">
            {sharedGoals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#7A6B53] font-semibold uppercase tracking-wider">
                    {g.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#1F2421]">
                      {g.progress}%
                    </span>
                    <button
                      onClick={() => handleDeleteSharedGoal(g.id)}
                      className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#1F2421]">{g.title}</h3>
                  {g.description && (
                    <p className="text-xs text-[#6B756E] mt-0.5 leading-relaxed">
                      {g.description}
                    </p>
                  )}
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#EFECE6] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2E473B] transition-all duration-300"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => handleUpdateSharedProgress(g.id, g.progress, -10)}
                    disabled={g.progress <= 0}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#EFECE6] text-[#505D54] disabled:opacity-30"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => handleUpdateSharedProgress(g.id, g.progress, 10)}
                    disabled={g.progress >= 100}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#2E473B] text-white disabled:opacity-30"
                  >
                    +10%
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HER / PARTNER GOALS */}
      {activeTab === 'her_goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              {partnerDisplayName}'s Goals {isLinked ? `(${relationship.partner_name || 'Connected'})` : ''}
            </span>
          </div>

          {isLinked ? (
            partnerGoals.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-[#DDD7CB] text-center text-xs text-[#7E8B82] space-y-1">
                <p className="font-medium text-[#1F2421]">No goals published yet.</p>
                <p>When your partner adds goals in their app, they appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partnerGoals.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-2"
                  >
                    <span className="text-[10px] text-[#7A6B53] font-semibold uppercase tracking-wider block">
                      {g.category}
                    </span>
                    <h3 className="text-sm font-semibold text-[#1F2421]">{g.title}</h3>
                    {g.description && (
                      <p className="text-xs text-[#6B756E] leading-relaxed">
                        {g.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-8 rounded-2xl bg-[#FAF8F3] border border-[#EAE4D6] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DD] flex items-center justify-center mx-auto text-[#6B756E]">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#1F2421]">
                Private Partner Goals
              </h3>
              <p className="text-xs text-[#6B756E] max-w-xs mx-auto leading-relaxed">
                Connect with your prospective spouse via invite code to view their personal growth goals.
              </p>
              <button
                onClick={() => setActiveTab('link')}
                className="px-4 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23382D]"
              >
                Go to Connection Tab
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. MY GOALS */}
      {activeTab === 'my_goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              My Personal Goals
            </span>
            <button
              onClick={() => setShowPersonalGoalModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="space-y-3">
            {personalGoals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#7A6B53] font-semibold uppercase tracking-wider">
                    {g.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#1F2421]">
                      {g.progress}%
                    </span>
                    <button
                      onClick={() => handleDeletePersonalGoal(g.id)}
                      className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#1F2421]">{g.title}</h3>
                {g.description && (
                  <p className="text-xs text-[#6B756E] leading-relaxed">
                    {g.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OUR JOURNEY */}
      {activeTab === 'journey' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              Journey Timeline & Milestones
            </span>
            <button
              onClick={() => setShowJourneyModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Moment</span>
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3DDD1]">
            {memories.map((m) => (
              <div key={m.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#988158] border-2 border-white shadow-xs" />
                <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider">
                        {m.event_type} · {new Date(m.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <h3 className="text-sm font-semibold text-[#1F2421] mt-0.5">
                        {m.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeleteJourneyMoment(m.id)}
                      className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                      aria-label="Delete moment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {m.description && (
                    <p className="text-xs text-[#505D54] leading-relaxed">
                      {m.description}
                    </p>
                  )}
                  {m.image_url && (
                    <div className="rounded-xl overflow-hidden mt-2 max-h-48 border border-[#EAE6DD]">
                      <img
                        src={m.image_url}
                        alt={m.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COUPLES GALLERY */}
      {activeTab === 'gallery' && (
        <CouplesGallery
          memories={memories}
          onUpdateMemories={setMemories}
          isLinked={isLinked}
          partnerName={relationship.partner_name}
        />
      )}

      {/* 6. CONNECTION LINKING */}
      {activeTab === 'link' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#2E473B]" />
              <h3 className="text-sm font-semibold text-[#1F2421]">
                Private Connection Status
              </h3>
            </div>

            {isLinked ? (
              <div className="p-4 rounded-xl bg-[#EBF3ED] border border-[#C1DEC9] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C512C]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connected with {relationship.partner_name}</span>
                </div>
                <p className="text-xs text-[#405646] leading-relaxed">
                  Both individuals can view shared goals, partner goals, Deen Together consistency, and private timeline.
                </p>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5CEC2] bg-white text-xs text-[#B93815] hover:bg-[#FAECE7] disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B93815]" />
                  ) : (
                    <Unlink className="w-3.5 h-3.5" />
                  )}
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#ECE6D9]">
                  <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider block mb-1">
                    Your Private Invitation Code
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-[#1F2421] tracking-wider">
                      {relationship.invite_code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E]"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#7A857D] mt-2 leading-relaxed">
                    Share this code with your prospective partner to link your goals and alerts.
                  </p>
                </div>

                {connectError && (
                  <div className="p-3 rounded-xl bg-[#FDF2EC] border border-[#F3C7BC] text-[#8C2C16] text-xs font-medium">
                    {connectError}
                  </div>
                )}

                <form onSubmit={handleConnectPartner} className="space-y-2">
                  <label className="block text-xs font-medium text-[#445047]">
                    Or enter partner’s invitation code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputInviteCode}
                      onChange={(e) => {
                        setInputInviteCode(e.target.value.toUpperCase());
                        if (connectError) setConnectError(null);
                      }}
                      placeholder="e.g. AMANAH-XXXX"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                    />
                    <button
                      type="submit"
                      disabled={isConnecting || !inputInviteCode.trim()}
                      className="px-4 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-all min-w-[70px] justify-center"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E2C785]" />
                          <span>Linking...</span>
                        </>
                      ) : (
                        <span>Link</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Interactive Quran Reading Status Choice */}
      {showQuranModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF8F3] border border-[#E8E2D5] shadow-2xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2E473B]" />
                <h4 className="text-base font-serif font-bold text-[#1F2421]">
                  Log Quran Reading
                </h4>
              </div>
              <button
                onClick={() => setShowQuranModal(false)}
                className="p-1 rounded-full text-[#6B756E] hover:text-[#1F2421]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E5DFD3] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#8B6E38] uppercase tracking-wider block">
                  Dedicated Quran Streak
                </span>
                <span className="text-sm font-serif font-bold text-[#1F2421]">
                  {quranStreak} Days Consecutive
                </span>
              </div>
              <Flame className="w-6 h-6 fill-[#D99A26] text-[#D99A26]" />
            </div>

            <p className="text-xs text-[#556358] leading-relaxed">
              Did you complete your Quran reading portion today? Select your honest status below:
            </p>

            {/* Option 1: "I did it" */}
            <button
              type="button"
              disabled={isLoggingQuran}
              onClick={() => handleLogQuran('completed')}
              className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#2E473B] hover:bg-[#F2F6F3] text-left transition-all flex items-center justify-between group active:scale-98 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2E473B] text-white flex items-center justify-center shrink-0">
                  {isLoggingQuran ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#E2D4B7]" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#1F2421]">
                    Alhamdulillah, I did it
                  </h5>
                  <p className="text-[11px] text-[#6B756E]">
                    Finished today’s Quran reading
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#2E473B] shrink-0">
                Done ✓
              </span>
            </button>

            {/* Option 2: "No, I didn't yet. I was busy" */}
            <button
              type="button"
              disabled={isLoggingQuran}
              onClick={() => handleLogQuran('busy')}
              className="w-full p-3.5 rounded-2xl bg-white border border-[#DDD5C5] hover:bg-[#FAF6F0] text-left transition-all flex items-center justify-between active:scale-98 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#8B6E38] flex items-center justify-center shrink-0 border border-[#EADBBD]">
                  {isLoggingQuran ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B6E38]" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#1F2421]">
                    No, I didn’t yet. I was busy
                  </h5>
                  <p className="text-[11px] text-[#6B756E]">
                    Will try to read what is easy before sleep
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#8B6E38] shrink-0">
                Later
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Our Journey Add Moment Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleAddJourneyMoment} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#E3DDD1] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-serif font-bold text-[#1F2421]">Add Journey Moment</h4>
              <button type="button" onClick={() => setShowJourneyModal(false)} className="text-xs text-[#6B756E]">Cancel</button>
            </div>
            <input
              value={journeyTitle}
              onChange={(e) => setJourneyTitle(e.target.value)}
              placeholder="Moment title"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
              required
            />
            <textarea
              value={journeyDescription}
              onChange={(e) => setJourneyDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
                required
              />
              <select
                value={journeyEventType}
                onChange={(e) => setJourneyEventType(e.target.value as Memory['event_type'])}
                className="px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
              >
                <option>Important date</option>
                <option>Day met</option>
                <option>Day talked</option>
                <option>Day chose not to talk</option>
                <option>Birthday</option>
                <option>Celebration</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSavingMoment}
              className="w-full px-4 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] disabled:opacity-50 flex items-center justify-center min-h-[36px]"
            >
              {isSavingMoment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                'Save Moment'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Create Shared Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleCreateSharedGoal} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#E3DDD1] space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#1F2421]">New Shared Goal</h4>
            
            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Goal Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Complete premarital guidance study"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SharedGoalCategory)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Description (Optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2 rounded-xl border border-[#DCD6C8] text-xs text-[#505D54]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingSharedGoal}
                className="flex-1 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium disabled:opacity-50 flex items-center justify-center min-h-[36px]"
              >
                {isCreatingSharedGoal ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Personal Goal Modal */}
      {showPersonalGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleCreatePersonalGoal} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#E3DDD1] space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#1F2421]">New Personal Goal</h4>
            
            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Goal Title</label>
              <input
                type="text"
                value={personalTitle}
                onChange={(e) => setPersonalTitle(e.target.value)}
                placeholder="e.g. Daily Arabic reading"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Category</label>
              <input
                type="text"
                value={personalCategory}
                onChange={(e) => setPersonalCategory(e.target.value)}
                placeholder="e.g. Deen, Health, Career"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">Description</label>
              <textarea
                value={personalDesc}
                onChange={(e) => setPersonalDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPersonalGoalModal(false)}
                className="flex-1 py-2 rounded-xl border border-[#DCD6C8] text-xs text-[#505D54]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingPersonalGoal}
                className="flex-1 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium disabled:opacity-50 flex items-center justify-center min-h-[36px]"
              >
                {isCreatingPersonalGoal ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  'Save Goal'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
