import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  Compass, 
  GraduationCap, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { Habit, Goal, Course, HabitCompletion } from '../../types/database';
import { dataService, getTodayKey } from '../../lib/storage/dataService';

export const ProgressView: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setHabits(dataService.getHabits());
    setCompletions(dataService.getCompletions());
    setGoals(dataService.getGoals());
    setCourses(dataService.getCourses());
    setStreak(dataService.calculateStreak());
  }, []);

  // Compute 7-day completion activity
  const last7Days: { dateStr: string; label: string; count: number; total: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const count = completions.filter((c) => c.completion_date === dateStr && c.completed).length;
    last7Days.push({
      dateStr,
      label: dayName,
      count,
      total: habits.length || 1,
    });
  }

  // Deen specific completion
  const deenHabits = habits.filter((h) => h.category === 'Deen');
  const deenCompletions = completions.filter(
    (c) => c.completed && deenHabits.some((dh) => dh.id === c.habit_id)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
          Progress & Consistency
        </h1>
        <p className="text-xs text-[#7A6B53]">
          Grounded in actual records. Becoming better, one day at a time.
        </p>
      </div>

      {/* 1. Real Streak & Consistency Hero */}
      <div className="p-5 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider block">
            Current Unbroken Streak
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-[#1F2421] tabular-nums">
              {streak}
            </span>
            <span className="text-xs font-medium text-[#505D54]">
              {streak === 1 ? 'consecutive day' : 'consecutive days'}
            </span>
          </div>
          <p className="text-[11px] text-[#7E8B82]">
            {streak > 0
              ? 'Consistency built on daily intentionality.'
              : 'Restart today calmly. Every day is a fresh opportunity.'}
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#D99A26]">
          <Flame className="w-7 h-7 fill-[#D99A26]" />
        </div>
      </div>

      {/* 2. Last 7 Days Activity Rhythm */}
      <div className="p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1F2421] uppercase tracking-wider text-[11px]">
            7-Day Habit Activity
          </span>
          <span className="text-[#7A6B53] font-mono text-[11px]">Recent rhythm</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {last7Days.map((d, i) => {
            const pct = d.total > 0 ? (d.count / d.total) * 100 : 0;
            const isToday = i === 6;
            return (
              <div key={d.dateStr} className="space-y-2 flex flex-col items-center">
                <div className="w-full h-20 rounded-xl bg-[#F4F1EA] p-1 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      pct > 0 ? 'bg-[#2E473B]' : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(pct, pct > 0 ? 15 : 0)}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isToday ? 'text-[#2E473B]' : 'text-[#6B756E]'
                  }`}
                >
                  {d.label}
                </span>
                <span className="text-[9px] font-mono text-[#7E8B82]">
                  {d.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Goal Milestones Summary */}
      <div className="p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1F2421] uppercase tracking-wider text-[11px]">
            Personal Goals Overview
          </span>
          <span className="text-[#6B756E] font-mono text-[11px]">
            {goals.filter((g) => g.progress === 100).length}/{goals.length} completed
          </span>
        </div>

        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#1F2421] truncate max-w-[200px]">
                  {goal.title}
                </span>
                <span className="font-mono tabular-nums text-[#7A6B53] font-semibold">
                  {goal.progress}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EFECE6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2E473B]"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Course Studies Progression */}
      {courses.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#2E473B]" />
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              Course Learning Progress
            </span>
          </div>

          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3 rounded-xl bg-[#FAF8F3] border border-[#ECE6D9] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1F2421]">{course.name}</span>
                  <span className="font-mono font-bold text-[#2E473B]">{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E8E2D5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2E473B]"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
