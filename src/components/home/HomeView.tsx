import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Flame, 
  Compass, 
  BookOpen, 
  HeartHandshake, 
  Clock, 
  GraduationCap, 
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { Habit, HabitCategory, DailyTask, Profile, DhikrProgress, HadithItem } from '../../types/database';
import { dataService, getTodayKey } from '../../lib/storage/dataService';
import { getDailyReminder } from '../../data/dailyReminders';
import { getHadithForDay } from '../../data/hadiths';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';
import { DailyInspirationCard } from './DailyInspirationCard';
import { SalahHeroCard } from '../deen/SalahHeroCard';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';

interface HomeViewProps {
  profile: Profile;
  onNavigateTab: (tab: 'progress' | 'deen' | 'us') => void;
  onOpenCourses: () => void;
  onOpenJourney: () => void;
  onOpenINeedYou: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  onNavigateTab,
  onOpenCourses,
  onOpenJourney,
  onOpenINeedYou,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionsMap, setCompletionsMap] = useState<Record<string, boolean>>({});
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [dhikr, setDhikr] = useState<DhikrProgress>({
    id: '',
    user_id: profile.user_id,
    date: getTodayKey(),
    target: 100,
    count: 0,
    updated_at: '',
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('Deen');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [streak, setStreak] = useState(0);
  const [habitStreaks, setHabitStreaks] = useState<Record<string, number>>({});
  const [processingHabits, setProcessingHabits] = useState<Set<string>>(new Set());
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const todayKey = getTodayKey();
  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const reminder = getDailyReminder(dayOfYear);
  const hadith = getHadithForDay(dayOfYear);

  const loadData = () => {
    const loadedHabits = dataService.getHabits().filter((h) => h.active);
    setHabits(loadedHabits);

    const cMap: Record<string, boolean> = {};
    const sMap: Record<string, number> = {};
    loadedHabits.forEach((h) => {
      cMap[h.id] = dataService.isHabitCompletedToday(h.id, todayKey);
      sMap[h.id] = dataService.calculateStreak(h.id);
    });
    setCompletionsMap(cMap);
    setHabitStreaks(sMap);

    setTasks(dataService.getDailyTasks(todayKey));
    setDhikr(dataService.getDhikrProgress(todayKey));
    setStreak(dataService.calculateStreak());
  };

  useEffect(() => {
    loadData();
  }, [todayKey]);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleHabit = async (habitId: string) => {
    if (processingHabits.has(habitId)) return;
    setProcessingHabits((prev) => new Set(prev).add(habitId));
    triggerHapticFeedback();
    try {
      const nextState = await dataService.toggleHabitCompletion(habitId, todayKey);
      setCompletionsMap((prev) => ({ ...prev, [habitId]: nextState }));
      const newOverallStreak = dataService.calculateStreak();
      setStreak(newOverallStreak);

      const updatedHabitStreak = dataService.calculateStreak(habitId);
      setHabitStreaks((prev) => ({ ...prev, [habitId]: updatedHabitStreak }));

      if (nextState) {
        playCalmChime();
      }
    } finally {
      setProcessingHabits((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const handleDeleteHabit = async (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    triggerHapticFeedback();
    await dataService.deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setCompletionsMap((prev) => {
      const copy = { ...prev };
      delete copy[habitId];
      return copy;
    });
    setStreak(dataService.calculateStreak());
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim() || isAddingHabit) return;
    setIsAddingHabit(true);
    triggerHapticFeedback();
    try {
      const created = await dataService.createHabit({
        title: newHabitTitle.trim(),
        description: '',
        category: newHabitCategory,
        frequency: 'daily',
        target_count: 1,
        sort_order: habits.length + 1,
        active: true,
      });
      setHabits((prev) => [...prev, created]);
      setCompletionsMap((prev) => ({ ...prev, [created.id]: false }));
      setNewHabitTitle('');
      setShowAddHabit(false);
    } finally {
      setIsAddingHabit(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (processingTasks.has(taskId)) return;
    setProcessingTasks((prev) => new Set(prev).add(taskId));
    triggerHapticFeedback();
    try {
      const nextState = await dataService.toggleDailyTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: nextState } : t))
      );
      if (nextState) {
        playCalmChime();
      }
    } finally {
      setProcessingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isAddingTask) return;
    setIsAddingTask(true);
    try {
      const created = await dataService.createDailyTask({
        title: newTaskTitle.trim(),
        description: '',
        date: todayKey,
        completed: false,
        category: 'General',
        priority: 'medium',
      });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
      setShowAddTask(false);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await dataService.deleteDailyTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleQuickDhikr = async () => {
    triggerHapticFeedback();
    const updated = await dataService.incrementDhikr(1, todayKey);
    setDhikr(updated);
    if (updated.count === updated.target) {
      playCalmChime();
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#2E473B', '#E2D4B7', '#8F9E8B']
        });
      } catch {}
    }
  };

  // Calculate daily completion progress
  const totalItems = habits.length + tasks.length;
  const completedHabitsCount = habits.filter((h) => completionsMap[h.id]).length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const completedItems = completedHabitsCount + completedTasksCount;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header Greeting & Tone */}
      <div className="pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1F2421] tracking-tight">
              {getGreeting()}, {profile.display_name}
            </h1>
            <p className="text-xs text-[#7A6B53] font-medium mt-0.5">
              Let’s make today count.
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-xs font-semibold text-[#8B6E38]">
              <Flame className="w-3.5 h-3.5 fill-[#D99A26] text-[#D99A26]" />
              <span>{streak}d streak</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Next Obligation Hero Card (Screenshot 1) */}
      <SalahHeroCard onSelectPrayer={() => onNavigateTab('deen')} />

      {/* 3. Daily Progress Summary */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-[#505D54]">Today’s Completion</span>
          <span className="font-mono tabular-nums text-xs font-semibold text-[#1F2421]">
            {completedItems} of {totalItems} completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2E473B] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Daily Inspiration · Husband & Wife (Sunnah & Mutual Mercy) */}
      <DailyInspirationCard />

      {/* 5. Today's Habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#1F2421] uppercase tracking-wider text-[11px]">
              Daily Habits
            </h2>
            <span className="text-[11px] text-[#7A857D] font-mono tabular-nums">
              {completedHabitsCount}/{habits.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>

        {showAddHabit && (
          <form onSubmit={handleAddHabit} className="p-3 mb-3 rounded-xl bg-white border border-[#D5CEC2] space-y-2.5 shadow-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="New habit name (e.g. Morning Adhkar, 10m Reading)"
                autoFocus
                className="flex-1 px-2.5 py-1.5 text-xs bg-[#FBFBF9] border border-[#E0DACE] rounded-lg focus:outline-none focus:border-[#2E473B]"
              />
              <button
                type="submit"
                disabled={isAddingHabit}
                className="px-3.5 py-1.5 rounded-lg bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] shrink-0 disabled:opacity-50 min-w-[50px] flex items-center justify-center"
              >
                {isAddingHabit ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Deen', 'Character', 'Health', 'Discipline', 'Personal'] as HabitCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewHabitCategory(cat)}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-colors ${
                    newHabitCategory === cat
                      ? 'bg-[#2E473B] text-white'
                      : 'bg-[#F4F1EA] text-[#556358] hover:bg-[#EAE6DD]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>
        )}

        <div className="space-y-2">
          {habits.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-[#DDD7CB] text-center text-xs text-[#7E8B82]">
              No habits listed. Tap "Add Habit" to create your first routine.
            </div>
          ) : (
            habits.map((habit) => {
              const isDone = !!completionsMap[habit.id];
              const habitStreak = habitStreaks[habit.id] ?? 0;
              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group shadow-2xs ${
                    isDone
                      ? 'bg-[#F2F6F3] border-[#C8DFCD] text-[#2E473B]'
                      : 'bg-white border-[#EAE6DD] text-[#1F2421] hover:border-[#D5CEC2]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      aria-label={`Toggle habit ${habit.title}`}
                      className="shrink-0 text-[#2E473B]"
                    >
                      {processingHabits.has(habit.id) ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#2E473B]" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2E473B] fill-[#CDE6D3]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#B7C0B9]" />
                      )}
                    </button>
                    <div className="truncate flex-1">
                      <p
                        className={`text-xs font-semibold leading-tight truncate ${
                          isDone ? 'line-through text-[#637367]' : 'text-[#1F2421]'
                        }`}
                      >
                        {habit.title}
                      </p>
                      <span className="text-[11px] text-[#A58957] font-medium">
                        {habit.category} · 09:00
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-xs font-medium text-[#8B6E38]">
                      <Flame className="w-3.5 h-3.5 fill-[#D99A26] text-[#D99A26]" />
                      <span>{habitStreak}d streak</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHabit(e, habit.id)}
                      className="p-1.5 text-[#B7C0B9] hover:text-[#B93815] hover:bg-[#FBEAE5] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete habit"
                      aria-label={`Delete habit ${habit.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1F2421] uppercase tracking-wider text-[11px]">
            Today’s Tasks
          </h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {showAddTask && (
          <form onSubmit={handleAddTask} className="p-3 mb-2 rounded-xl bg-white border border-[#D5CEC2] flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs deliberate attention today?"
              autoFocus
              className="flex-1 px-2 text-xs bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddingTask}
              className="px-3.5 py-1.5 rounded-lg bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] disabled:opacity-50 min-w-[50px] flex items-center justify-center"
            >
              {isAddingTask ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                'Add'
              )}
            </button>
          </form>
        )}

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-[#DDD7CB] text-center text-xs text-[#7E8B82]">
              No tasks for today. Add one above to keep clarity.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  task.completed
                    ? 'bg-[#F2F6F3] border-[#C8DFCD]'
                    : 'bg-white border-[#EAE6DD]'
                }`}
              >
                <div
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <button
                    type="button"
                    aria-label={`Toggle task ${task.title}`}
                    className="shrink-0 text-[#2E473B]"
                  >
                    {processingTasks.has(task.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#2E473B]" />
                    ) : task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2E473B] fill-[#CDE6D3]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#B7C0B9]" />
                    )}
                  </button>
                  <span
                    className={`text-xs truncate ${
                      task.completed ? 'line-through text-[#637367]' : 'text-[#1F2421]'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Us Card ("Growing separately. Growing together.") */}
      <div 
        onClick={() => onNavigateTab('us')}
        className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DFD0] shadow-xs cursor-pointer hover:border-[#D5C7B0] transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#7F5353]">
            <HeartHandshake className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F2421]">
              Us · Halal Future
            </h2>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#7F5353]" />
        </div>
        <p className="text-sm font-serif font-semibold text-[#1F2421] mb-1">
          «Growing separately. Growing together.»
        </p>
        <p className="text-xs text-[#6B756E] leading-relaxed">
          Private, disciplined alignment on shared character, values, and premarital preparation.
        </p>
      </div>

      {/* 8. Secondary Quick Nav (Courses & Our Journey) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenCourses}
          className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] text-left hover:border-[#D5CEC2] transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#EFECE6] flex items-center justify-center text-[#2E473B] mb-2 group-hover:bg-[#2E473B] group-hover:text-white transition-colors">
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-[#1F2421]">My Courses</p>
          <p className="text-[10px] text-[#7E8B82] mt-0.5">Studies & skills</p>
        </button>

        <button
          onClick={onOpenJourney}
          className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] text-left hover:border-[#D5CEC2] transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#EFECE6] flex items-center justify-center text-[#988158] mb-2 group-hover:bg-[#988158] group-hover:text-white transition-colors">
            <CalendarDays className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-[#1F2421]">Our Journey</p>
          <p className="text-[10px] text-[#7E8B82] mt-0.5">Timeline & milestones</p>
        </button>
      </div>
    </div>
  );
};
