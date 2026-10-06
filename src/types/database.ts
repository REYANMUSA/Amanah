export type Gender = 'male' | 'female' | 'unspecified';
export type ThemePreference = 'personal' | 'feminine' | 'minimal_dark';
export type HabitCategory = 'Deen' | 'Character' | 'Health' | 'Education' | 'Career' | 'Discipline' | 'Personal';
export type TaskPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'in_progress' | 'completed' | 'paused';
export type SharedGoalCategory = 'Deen' | 'Education' | 'Career' | 'Money' | 'Family' | 'Character' | 'Health' | 'Marriage preparation';
export type RelationshipStatus = 'pending' | 'accepted' | 'rejected' | 'disconnected';
export type MemoryEventType = 'Past' | 'Present' | 'Future' | 'Day met' | 'Day talked' | 'Day chose not to talk' | 'Birthday' | 'Celebration' | 'Important date';
export type EmergencyStatus = 'active' | 'acknowledged' | 'resolved';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  gender: Gender;
  avatar_url?: string;
  date_of_birth?: string;
  timezone: string;
  onboarding_completed: boolean;
  theme_preference: ThemePreference;
  notification_permission_status: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  prayer_notifications_enabled: boolean;
  habit_notifications_enabled: boolean;
  relationship_notifications_enabled: boolean;
  reminder_time: string;
  daily_reminder_enabled: boolean;
  dark_mode: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: HabitCategory;
  frequency: string;
  target_count: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string; // YYYY-MM-DD
  completed: boolean;
  completed_at: string;
  notes?: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  category: string;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  target_date?: string;
  progress: number; // 0 - 100
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  user_a: string;
  user_b?: string;
  invite_code: string;
  status: RelationshipStatus;
  partner_name?: string;
  created_at: string;
  accepted_at?: string;
  weekly_checkin_day?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  weekly_checkin_time?: string;
  last_checkin_date?: string;
}

export interface SharedGoal {
  id: string;
  owner_user_id: string;
  partner_user_id?: string;
  relationship_id?: string;
  title: string;
  description: string;
  category: SharedGoalCategory;
  progress: number;
  target_date?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  owner: string; // "Me" or partner name
  description: string;
  progress: number; // 0 - 100
  days_per_week: number;
  expected_days: number;
  notes: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  relationship_id?: string;
  title: string;
  description: string;
  event_date: string;
  event_type: MemoryEventType;
  image_url?: string;
  created_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  storage_path: string;
  caption?: string;
  event_date: string;
  created_at: string;
}

export interface PrayerSettings {
  id: string;
  user_id: string;
  fajr_enabled: boolean;
  dhuhr_enabled: boolean;
  asr_enabled: boolean;
  maghrib_enabled: boolean;
  isha_enabled: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DhikrProgress {
  id: string;
  user_id: string;
  date: string;
  target: number;
  count: number;
  updated_at: string;
}

export interface HadithItem {
  day_number: number;
  arabic: string;
  transliteration?: string;
  english: string;
  source: 'Sahih al-Bukhari' | 'Sahih Muslim';
  reference: string;
  topic: string;
}

export interface DeenChallenge {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source: string;
  category: string;
}

export interface QuranTask {
  id: string;
  user_id: string;
  date: string;
  pages_target: number;
  pages_completed: number;
  completed: boolean;
  notes: string;
  created_at: string;
}

export interface EmergencyRequest {
  id: string;
  sender_user_id: string;
  sender_name?: string;
  recipient_user_id?: string;
  relationship_id?: string;
  message: string;
  created_at: string;
  acknowledged_at?: string;
  status: EmergencyStatus;
}

export interface PushSubscriptionItem {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  status: string;
  streak_count?: number;
  target_nikah_date?: string;
  connected_since: string;
  today_quiz_score?: { score: number; total: number; date: string } | null;
}

export interface DailyQuizRecord {
  date: string;
  score: number;
  total: number;
  completed: boolean;
  answers: Record<string, string>;
  updatedAt: string;
}
