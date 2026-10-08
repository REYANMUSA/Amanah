import { 
  Profile, 
  UserSettings, 
  Habit, 
  HabitCompletion, 
  DailyTask, 
  Goal, 
  SharedGoal, 
  Relationship, 
  Course, 
  Memory, 
  PrayerSettings, 
  DhikrProgress, 
  QuranTask, 
  EmergencyRequest,
  DailyQuizRecord
} from '../../types/database';
import { getSupabase, isSupabaseConfigured } from '../supabase/client';
import { sendLocalNotification } from '../notifications/notificationService';

const STORAGE_KEYS = {
  PROFILE: 'amanah_profile_v1',
  SETTINGS: 'amanah_settings_v1',
  HABITS: 'amanah_habits_v1',
  COMPLETIONS: 'amanah_completions_v1',
  TASKS: 'amanah_tasks_v1',
  GOALS: 'amanah_goals_v1',
  SHARED_GOALS: 'amanah_shared_goals_v1',
  RELATIONSHIPS: 'amanah_relationship_v1',
  QUIZ_SCORES: 'amanah_quiz_scores_v1',
  COURSES: 'amanah_courses_v1',
  MEMORIES: 'amanah_memories_v1',
  PRAYER_SETTINGS: 'amanah_prayer_settings_v1',
  DHIKR_PROGRESS: 'amanah_dhikr_progress_v1',
  HADITH_PROGRESS: 'amanah_hadith_progress_v1',
  QURAN_TASKS: 'amanah_quran_tasks_v1',
  EMERGENCY_REQUESTS: 'amanah_emergency_requests_v1',
  OFFLINE_QUEUE: 'amanah_offline_sync_queue_v1',
};

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface PartnerProfileRow {
  id: string;
  display_name: string;
  avatar_url?: string;
  gender?: string;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------- DEFAULT SEED DATA ----------------

const DEFAULT_PROFILE: Profile = {
  id: generateUUID(),
  user_id: 'local-user',
  display_name: 'Seeker',
  gender: 'male',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  onboarding_completed: false,
  theme_preference: 'personal',
  notification_permission_status: 'default',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_SETTINGS: UserSettings = {
  id: generateUUID(),
  user_id: 'local-user',
  notifications_enabled: false,
  prayer_notifications_enabled: true,
  habit_notifications_enabled: true,
  relationship_notifications_enabled: true,
  reminder_time: '07:30',
  daily_reminder_enabled: true,
  dark_mode: false,
  sound_enabled: true,
  vibration_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h-1',
    user_id: 'local-user',
    title: 'Fajr & Morning Adhkar',
    description: 'Pray on time and complete morning remembrance in peace',
    category: 'Deen',
    frequency: 'daily',
    target_count: 1,
    active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h-2',
    user_id: 'local-user',
    title: 'Muraaja — 3 Pages of Qur’an',
    description: 'Read and reflect on three pages daily with presence of heart',
    category: 'Deen',
    frequency: 'daily',
    target_count: 3,
    active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h-3',
    user_id: 'local-user',
    title: 'Mindful Tongue & Patience',
    description: 'Speak good or remain silent; guard against unnecessary reaction',
    category: 'Character',
    frequency: 'daily',
    target_count: 1,
    active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h-4',
    user_id: 'local-user',
    title: 'Physical Vitality & Walk',
    description: 'Active body, disciplined mind, brisk outdoor movement',
    category: 'Health',
    frequency: 'daily',
    target_count: 1,
    active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h-5',
    user_id: 'local-user',
    title: 'Focused Education / Deep Work',
    description: '45 minutes of uninterrupted skill development and reading',
    category: 'Education',
    frequency: 'daily',
    target_count: 1,
    active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_TASKS: DailyTask[] = [
  {
    id: 't-1',
    user_id: 'local-user',
    title: 'Review today’s Hadith and apply one lesson',
    description: 'Contemplate how to bring the teaching into daily character',
    date: getTodayKey(),
    completed: false,
    category: 'Deen',
    priority: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    user_id: 'local-user',
    title: 'Prepare career / learning notes for the week',
    description: 'Clarify current deliverables with calm discipline',
    date: getTodayKey(),
    completed: false,
    category: 'Career',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    user_id: 'local-user',
    title: 'Check in on family with warmth and sincerity',
    description: 'Call or visit with undivided attention',
    date: getTodayKey(),
    completed: false,
    category: 'Character',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  id: generateUUID(),
  user_id: 'local-user',
  fajr_enabled: true,
  dhuhr_enabled: true,
  asr_enabled: true,
  maghrib_enabled: true,
  isha_enabled: true,
  notification_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'm-1',
    user_id: 'local-user',
    title: 'Beginning the Amanah Journey',
    description: 'Choosing to build oneself with quiet integrity, preparing for a noble halal future.',
    event_date: getTodayKey(),
    event_type: 'Important date',
    image_url: '/src/assets/images/journey_peaceful_path_1791120045293.jpg',
    created_at: new Date().toISOString(),
  },
];

// Helper for local storage access
function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key}:`, err);
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key}:`, err);
  }
}

// ---------------- DATA SERVICE CLASS ----------------

class AmanahDataService {
  private emergencyListeners: Array<(requests: EmergencyRequest[]) => void> = [];
  private quizListeners: Array<(score: DailyQuizRecord) => void> = [];
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;
  private supabaseEmergencyChannel: any = null;
  private knownEmergencyIds = new Set<string>();
  private currentSyncUserId: string = 'local-user';

  constructor() {
    if (typeof window !== 'undefined') {
      const profile = this.getProfile();
      this.initEmergencySync(profile.user_id);
    }
  }

  // Realtime subscription for emergency requests
  subscribeEmergency(listener: (requests: EmergencyRequest[]) => void): () => void {
    this.emergencyListeners.push(listener);
    listener(this.getEmergencyRequests());
    return () => {
      this.emergencyListeners = this.emergencyListeners.filter((l) => l !== listener);
    };
  }

  private notifyEmergencyListeners(requests?: EmergencyRequest[]): void {
    const list = requests || this.getEmergencyRequests();
    this.emergencyListeners.forEach((l) => l(list));
  }

  // Start cross-device sync for emergency alerts.
  // Supabase Realtime is the source of truth when authenticated; the legacy
  // server SSE path remains only as an offline/local-auth fallback.
  initEmergencySync(userId: string): void {
    if (typeof window === 'undefined') return;
    this.currentSyncUserId = userId;

    if (this.eventSource) {
      try { this.eventSource.close(); } catch {}
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.supabaseEmergencyChannel) {
      const sb = getSupabase();
      if (sb) sb.removeChannel(this.supabaseEmergencyChannel);
      this.supabaseEmergencyChannel = null;
    }

    this.knownEmergencyIds = new Set(this.getEmergencyRequests().map((r) => r.id));

    const sb = getSupabase();
    if (sb && userId !== 'local-user') {
      const channel = sb
        .channel('amanah-emergency-' + userId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergency_requests',
            filter: 'recipient_user_id=eq.' + userId,
          },
          (payload) => {
            const incoming = payload.new as EmergencyRequest;
            if (!incoming?.id || incoming.sender_user_id === userId) return;

            const isNew = !this.knownEmergencyIds.has(incoming.id);
            this.knownEmergencyIds.add(incoming.id);

            if (isNew) {
              sendLocalNotification('Amanah — I Need You', {
                body: incoming.message || 'Your connected partner reached out.',
                icon: '/icon.svg',
                badge: '/icon.svg',
                tag: 'amanah-urgent-' + incoming.id,
                data: { type: 'emergency_request', requestId: incoming.id, url: '/' },
              });
            }

            void this.fetchActiveEmergencyRequests(userId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'emergency_requests',
            filter: 'recipient_user_id=eq.' + userId,
          },
          () => {
            void this.fetchActiveEmergencyRequests(userId);
          }
        )
        .subscribe();

      this.supabaseEmergencyChannel = channel;
      void this.fetchActiveEmergencyRequests(userId);
      this.pollInterval = setInterval(() => {
        void this.fetchActiveEmergencyRequests(this.currentSyncUserId);
      }, 10000);
      return;
    }

    // Legacy/local-auth fallback only.
    try {
      const es = new EventSource('/api/emergency/stream?userId=' + encodeURIComponent(userId));
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'emergency_update') {
            void this.fetchActiveEmergencyRequests(userId);
          }
        } catch {}
      };
      this.eventSource = es;
    } catch (err) {
      console.warn('SSE connection note:', err);
    }

    void this.fetchActiveEmergencyRequests(userId);
    this.pollInterval = setInterval(() => {
      void this.fetchActiveEmergencyRequests(this.currentSyncUserId);
    }, 4000);
  }
  async fetchActiveEmergencyRequests(userId: string): Promise<EmergencyRequest[]> {
    const sb = getSupabase();

    if (sb && userId !== 'local-user') {
      try {
        const { data, error } = await sb
          .from('emergency_requests')
          .select('*')
          .or('sender_user_id.eq.' + userId + ',recipient_user_id.eq.' + userId)
          .order('created_at', { ascending: false });

        if (!error) {
          const requests = (data || []) as EmergencyRequest[];
          writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, requests);
          requests.forEach((r) => this.knownEmergencyIds.add(r.id));
          this.notifyEmergencyListeners(requests);
          return requests;
        }
        console.warn('Supabase emergency realtime refresh error:', error);
      } catch (err) {
        console.warn('Supabase emergency refresh note:', err);
      }
    }

    // Legacy/local-auth fallback.
    try {
      const res = await fetch('/api/emergency/active?userId=' + encodeURIComponent(userId));
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          const current = this.getEmergencyRequests();
          const activeIds = new Set(data.requests.map((r: EmergencyRequest) => r.id));
          const updated = [
            ...data.requests,
            ...current.filter((r) => !activeIds.has(r.id)),
          ];
          writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, updated);
          updated.forEach((r) => this.knownEmergencyIds.add(r.id));
          this.notifyEmergencyListeners(updated);
          return updated;
        }
      }
    } catch {}
    return this.getEmergencyRequests();
  }
  async syncRelationshipFromServer(userId: string): Promise<Relationship> {
    try {
      const res = await fetch(`/api/relationships/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.relationship) {
          const current = this.getRelationship();
          const merged: Relationship = {
            ...current,
            id: data.relationship.id,
            user_a: data.relationship.user_a,
            user_b: data.relationship.user_b || current.user_b,
            invite_code: data.relationship.invite_code,
            status: data.relationship.status,
            partner_name: data.partnerName || current.partner_name,
            accepted_at: data.relationship.accepted_at || current.accepted_at,
          };
          writeLocal(STORAGE_KEYS.RELATIONSHIPS, merged);
          return merged;
        }
      }
    } catch {}
    return this.getRelationship();
  }

  // Realtime subscription for quiz scores
  subscribeQuizScore(listener: (score: DailyQuizRecord) => void): () => void {
    this.quizListeners.push(listener);
    listener(this.getDailyQuizRecord());
    return () => {
      this.quizListeners = this.quizListeners.filter((l) => l !== listener);
    };
  }

  private notifyQuizListeners(score?: DailyQuizRecord): void {
    const record = score || this.getDailyQuizRecord();
    this.quizListeners.forEach((l) => l(record));
  }

  getDailyQuizRecord(dateKey: string = getTodayKey()): DailyQuizRecord {
    const all = readLocal<Record<string, DailyQuizRecord>>(STORAGE_KEYS.QUIZ_SCORES, {});
    return all[dateKey] || {
      date: dateKey,
      score: 0,
      total: 5,
      completed: false,
      answers: {},
      updatedAt: new Date().toISOString(),
    };
  }

  async saveDailyQuizAnswer(
    dateKey: string,
    questionId: string,
    answer: string,
    isCorrect: boolean
  ): Promise<DailyQuizRecord> {
    const all = readLocal<Record<string, DailyQuizRecord>>(STORAGE_KEYS.QUIZ_SCORES, {});
    const current = all[dateKey] || {
      date: dateKey,
      score: 0,
      total: 5,
      completed: false,
      answers: {},
      updatedAt: new Date().toISOString(),
    };

    if (current.answers[questionId] === undefined) {
      current.answers[questionId] = answer;
      if (isCorrect) {
        current.score += 1;
      }
      current.updatedAt = new Date().toISOString();
      if (Object.keys(current.answers).length >= 5) {
        current.completed = true;
      }
      all[dateKey] = current;
      writeLocal(STORAGE_KEYS.QUIZ_SCORES, all);
      this.notifyQuizListeners(current);

      const profile = this.getProfile();
      try {
        await fetch('/api/quiz/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.user_id,
            dateKey,
            score: current.score,
            total: current.total,
          }),
        });
      } catch {}
    }
    return current;
  }

  async syncQuizScoreToServer(score: number, total: number = 5, dateKey: string = getTodayKey()): Promise<void> {
    const profile = this.getProfile();
    try {
      await fetch('/api/quiz/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.user_id,
          dateKey,
          score,
          total,
        }),
      });
    } catch {}
  }

  // ---------------- CONNECTED US DATA ----------------

  private async getAuthUserId(): Promise<string | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data } = await sb.auth.getUser();
      return data.user?.id || null;
    } catch {
      return null;
    }
  }

  async loadRelationship(): Promise<Relationship> {
    const sb = getSupabase();
    const userId = await this.getAuthUserId();
    if (!sb || !userId) return this.getRelationship();

    const localProfile = this.getProfile();
    if (localProfile.user_id !== userId) {
      writeLocal(STORAGE_KEYS.PROFILE, { ...localProfile, user_id: userId, updated_at: new Date().toISOString() });
    }

    try {
      const { data, error } = await sb
        .from('relationships')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const current = this.getRelationship();
        const relationship: Relationship = {
          ...(data as Relationship),
          partner_name: current.partner_name || 'Connected Person',
        };

        if (relationship.status === 'accepted') {
          try {
            const { data: partnerRows } = await sb.rpc('get_partner_profile');
            const partner = Array.isArray(partnerRows) ? partnerRows[0] as PartnerProfileRow | undefined : undefined;
            if (partner?.display_name) {
              relationship.partner_name = partner.display_name;
            }
          } catch (err) {
            console.warn('Partner profile sync note:', err);
          }
        }

        writeLocal(STORAGE_KEYS.RELATIONSHIPS, relationship);
        return relationship;
      }

      const relationship: Relationship = {
        id: generateUUID(),
        user_a: userId,
        invite_code: 'AMANAH-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        status: 'pending',
        partner_name: 'Connected Person',
        created_at: new Date().toISOString(),
      };

      const { data: created, error: createError } = await sb
        .from('relationships')
        .insert({
          user_a: userId,
          invite_code: relationship.invite_code,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      const saved = { ...relationship, ...(created as Relationship) };
      writeLocal(STORAGE_KEYS.RELATIONSHIPS, saved);
      return saved;
    } catch (err) {
      console.warn('Supabase relationship load error:', err);
      return this.getRelationship();
    }
  }

  async connectRelationship(inviteCode: string): Promise<Relationship | null> {
    const sb = getSupabase();
    const userId = await this.getAuthUserId();
    if (!sb || !userId) return null;

    const { data, error } = await sb.rpc('connect_by_invite_code', {
      p_invite_code: inviteCode.trim().toUpperCase(),
    });

    if (error || !data) {
      console.warn('Supabase relationship connect error:', error);
      return null;
    }

    const relationship: Relationship = {
      ...(data as Relationship),
      partner_name: 'Connected Person',
    };

    const partner = await this.loadPartnerProfile();
    if (partner?.display_name) {
      relationship.partner_name = partner.display_name;
    }

    writeLocal(STORAGE_KEYS.RELATIONSHIPS, relationship);
    return relationship;
  }

  async loadPartnerProfile(): Promise<PartnerProfileRow | null> {
    const sb = getSupabase();
    if (!sb) return null;

    try {
      const { data, error } = await sb.rpc('get_partner_profile');
      if (error) throw error;
      const partner = Array.isArray(data) ? data[0] : null;
      return partner ? (partner as PartnerProfileRow) : null;
    } catch (err) {
      console.warn('Supabase partner profile load error:', err);
      return null;
    }
  }

  async loadPartnerGoals(relationship?: Relationship): Promise<Goal[]> {
    const sb = getSupabase();
    const rel = relationship || await this.loadRelationship();
    const userId = await this.getAuthUserId();
    if (!sb || !userId || rel.status !== 'accepted' || !rel.user_b) return [];

    const partnerId = rel.user_a === userId ? rel.user_b : rel.user_a;
    const { data, error } = await sb
      .from('goals')
      .select('*')
      .eq('user_id', partnerId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase partner goals load error:', error);
      return [];
    }
    return (data || []) as Goal[];
  }

  async loadSharedGoals(relationship?: Relationship): Promise<SharedGoal[]> {
    const sb = getSupabase();
    const rel = relationship || await this.loadRelationship();
    if (!sb || rel.status !== 'accepted') return this.getSharedGoals();

    const { data, error } = await sb
      .from('shared_goals')
      .select('*')
      .eq('relationship_id', rel.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase shared goals load error:', error);
      return this.getSharedGoals();
    }

    const goals = (data || []) as SharedGoal[];
    writeLocal(STORAGE_KEYS.SHARED_GOALS, goals);
    return goals;
  }

  async loadMemories(relationship?: Relationship): Promise<Memory[]> {
    const sb = getSupabase();
    const rel = relationship || await this.loadRelationship();
    const userId = await this.getAuthUserId();
    if (!sb || !userId || rel.status !== 'accepted') return this.getMemories();

    const localMemories = this.getMemories();
    if (localMemories.length > 0) {
      const unsynced = localMemories.map((memory) => ({
        ...memory,
        id: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(memory.id)
          ? memory.id
          : generateUUID(),
        user_id: userId,
        relationship_id: rel.id,
      }));
      const { error: syncError } = await sb.from('memories').upsert(unsynced, { onConflict: 'id' });
      if (syncError) console.warn('Supabase memory sync error:', syncError);
    }

    const { data, error } = await sb
      .from('memories')
      .select('*')
      .eq('relationship_id', rel.id)
      .order('event_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase memories load error:', error);
      return localMemories;
    }

    const memories = (data || []) as Memory[];
    writeLocal(STORAGE_KEYS.MEMORIES, memories);
    return memories;
  }

  async loadEmergencyRequests(): Promise<EmergencyRequest[]> {
    const sb = getSupabase();
    const userId = await this.getAuthUserId();
    if (!sb || !userId) return this.getEmergencyRequests();

    const { data, error } = await sb
      .from('emergency_requests')
      .select('*')
      .or(`sender_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase emergency load error:', error);
      return this.getEmergencyRequests();
    }

    const requests = (data || []) as EmergencyRequest[];
    writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, requests);
    return requests;
  }

  subscribeToUsChanges(onChange: () => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};

    const channel = sb
      .channel('amanah-us-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relationships' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_goals' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, onChange)
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }

  // PROFILE
  getProfile(): Profile {
    return readLocal<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const current = this.getProfile();
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.PROFILE, updated);

    // Sync to Supabase if configured
    const sb = getSupabase();
    if (sb && updated.user_id !== 'local-user') {
      try {
        await sb.from('profiles').upsert(updated);
      } catch (err) {
        console.warn('Supabase profile sync error:', err);
      }
    }
    return updated;
  }

  // USER SETTINGS
  getSettings(): UserSettings {
    return readLocal<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const current = this.getSettings();
    const updated: UserSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.SETTINGS, updated);

    const sb = getSupabase();
    if (sb && updated.user_id !== 'local-user') {
      try {
        await sb.from('user_settings').upsert(updated);
      } catch (err) {
        console.warn('Supabase settings sync error:', err);
      }
    }
    return updated;
  }

  // HABITS
  getHabits(): Habit[] {
    return readLocal<Habit[]>(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
  }

  async createHabit(habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    const habits = this.getHabits();
    const profile = this.getProfile();
    const newHabit: Habit = {
      id: generateUUID(),
      user_id: profile.user_id,
      ...habitData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const next = [...habits, newHabit];
    writeLocal(STORAGE_KEYS.HABITS, next);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('habits').insert(newHabit);
      } catch (err) {
        console.warn('Supabase habit create error:', err);
      }
    }
    return newHabit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | null> {
    const habits = this.getHabits();
    const index = habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const updated: Habit = {
      ...habits[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    habits[index] = updated;
    writeLocal(STORAGE_KEYS.HABITS, habits);

    const sb = getSupabase();
    if (sb && updated.user_id !== 'local-user') {
      try {
        await sb.from('habits').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase habit update error:', err);
      }
    }
    return updated;
  }

  async deleteHabit(id: string): Promise<boolean> {
    const habits = this.getHabits();
    const filtered = habits.filter((h) => h.id !== id);
    writeLocal(STORAGE_KEYS.HABITS, filtered);

    // Also remove its completions
    const completions = this.getCompletions();
    const updatedCompletions = completions.filter((c) => c.habit_id !== id);
    writeLocal(STORAGE_KEYS.COMPLETIONS, updatedCompletions);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('habits').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase habit delete error:', err);
      }
    }
    return true;
  }

  // HABIT COMPLETIONS
  getCompletions(): HabitCompletion[] {
    return readLocal<HabitCompletion[]>(STORAGE_KEYS.COMPLETIONS, []);
  }

  isHabitCompletedToday(habitId: string, dateStr: string = getTodayKey()): boolean {
    const completions = this.getCompletions();
    return completions.some((c) => c.habit_id === habitId && c.completion_date === dateStr && c.completed);
  }

  async toggleHabitCompletion(habitId: string, dateStr: string = getTodayKey()): Promise<boolean> {
    const completions = this.getCompletions();
    const profile = this.getProfile();
    const existingIndex = completions.findIndex(
      (c) => c.habit_id === habitId && c.completion_date === dateStr
    );

    let nextState = true;
    if (existingIndex >= 0) {
      const current = completions[existingIndex];
      nextState = !current.completed;
      completions[existingIndex] = {
        ...current,
        completed: nextState,
        completed_at: new Date().toISOString(),
      };
    } else {
      const newCompletion: HabitCompletion = {
        id: generateUUID(),
        habit_id: habitId,
        user_id: profile.user_id,
        completion_date: dateStr,
        completed: true,
        completed_at: new Date().toISOString(),
      };
      completions.push(newCompletion);
      nextState = true;
    }

    writeLocal(STORAGE_KEYS.COMPLETIONS, completions);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('habit_completions').upsert({
          habit_id: habitId,
          user_id: profile.user_id,
          completion_date: dateStr,
          completed: nextState,
          completed_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase completion upsert error:', err);
      }
    }

    return nextState;
  }

  // Calculate genuine habit streak (PRD 13: "Calculate from actual completion records. Never fake a streak.")
  calculateStreak(habitId?: string): number {
    const completions = this.getCompletions();
    if (completions.length === 0) return 0;

    const filtered = habitId 
      ? completions.filter((c) => c.habit_id === habitId && c.completed)
      : completions.filter((c) => c.completed);

    const completedDates = new Set(filtered.map((c) => c.completion_date));
    let streak = 0;
    const now = new Date();

    // Check today first
    const todayStr = getTodayKey();
    let checkDate = new Date(now);

    // If today is completed, streak starts at 1, else check yesterday
    if (completedDates.has(todayStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today not yet completed, see if yesterday was completed
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (!completedDates.has(yesterdayStr)) {
        return 0; // Missed yesterday and today
      }
    }

    // Now count backwards consecutively
    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (completedDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // DAILY TASKS
  getDailyTasks(dateStr: string = getTodayKey()): DailyTask[] {
    const all = readLocal<DailyTask[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    return all.filter((t) => t.date === dateStr);
  }

  getAllTasks(): DailyTask[] {
    return readLocal<DailyTask[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  }

  async createDailyTask(taskData: Omit<DailyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DailyTask> {
    const all = this.getAllTasks();
    const profile = this.getProfile();
    const newTask: DailyTask = {
      id: generateUUID(),
      user_id: profile.user_id,
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const next = [newTask, ...all];
    writeLocal(STORAGE_KEYS.TASKS, next);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('daily_tasks').insert(newTask);
      } catch (err) {
        console.warn('Supabase task insert error:', err);
      }
    }
    return newTask;
  }

  async toggleDailyTask(id: string): Promise<boolean> {
    const all = this.getAllTasks();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const nextCompleted = !all[index].completed;
    all[index] = {
      ...all[index],
      completed: nextCompleted,
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.TASKS, all);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('daily_tasks').update({ completed: nextCompleted }).eq('id', id);
      } catch (err) {
        console.warn('Supabase task update error:', err);
      }
    }
    return nextCompleted;
  }

  async deleteDailyTask(id: string): Promise<boolean> {
    const all = this.getAllTasks();
    const next = all.filter((t) => t.id !== id);
    writeLocal(STORAGE_KEYS.TASKS, next);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('daily_tasks').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase task delete error:', err);
      }
    }
    return true;
  }

  // GOALS (Personal)
  getGoals(): Goal[] {
    const fallback: Goal[] = [
      {
        id: 'g-1',
        user_id: 'local-user',
        title: 'Memorize Juz Amma with Tajweed',
        description: 'Consistent memorization and daily review of Surah recitation',
        category: 'Deen',
        target_date: '2026-12-31',
        progress: 45,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'g-2',
        user_id: 'local-user',
        title: 'Build Halal Financial Stability',
        description: 'Disciplined savings, emergency reserve, and debt-free posture',
        category: 'Career & Money',
        target_date: '2026-11-30',
        progress: 60,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'g-3',
        user_id: 'local-user',
        title: 'Cultivate Deliberate Restraint in Speech',
        description: 'No backbiting, no vain arguments, gentle tone under stress',
        category: 'Character',
        progress: 70,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    return readLocal<Goal[]>(STORAGE_KEYS.GOALS, fallback);
  }

  async createGoal(goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const goals = this.getGoals();
    const profile = this.getProfile();
    const newGoal: Goal = {
      id: generateUUID(),
      user_id: profile.user_id,
      ...goalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.GOALS, [...goals, newGoal]);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('goals').insert(newGoal);
      } catch (err) {
        console.warn('Supabase goal insert error:', err);
      }
    }
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goals = this.getGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const updated: Goal = {
      ...goals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    goals[index] = updated;
    writeLocal(STORAGE_KEYS.GOALS, goals);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('goals').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase goal update error:', err);
      }
    }
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const goals = this.getGoals();
    const next = goals.filter((g) => g.id !== id);
    writeLocal(STORAGE_KEYS.GOALS, next);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('goals').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase goal delete error:', err);
      }
    }
    return true;
  }

  // SHARED GOALS (Us)
  getSharedGoals(): SharedGoal[] {
    const fallback: SharedGoal[] = [
      {
        id: 'sg-1',
        owner_user_id: 'local-user',
        title: 'Marriage Preparation & Premarital Foundation',
        description: 'Aligning on deen, communication, roles, finances, and mutual expectations with maturity',
        category: 'Marriage preparation',
        progress: 55,
        target_date: '2026-12-15',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'sg-2',
        owner_user_id: 'local-user',
        title: 'Joint Qur’an Reflection Cycle',
        description: 'Both completing individual daily readings and sharing weekly reflections in restraint',
        category: 'Deen',
        progress: 75,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    return readLocal<SharedGoal[]>(STORAGE_KEYS.SHARED_GOALS, fallback);
  }

  async createSharedGoal(data: Omit<SharedGoal, 'id' | 'owner_user_id' | 'created_at' | 'updated_at'>): Promise<SharedGoal> {
    const goals = this.getSharedGoals();
    const profile = this.getProfile();
    const relationship = await this.loadRelationship();
    const newShared: SharedGoal = {
      id: generateUUID(),
      owner_user_id: profile.user_id,
      ...data,
      partner_user_id: relationship.status === 'accepted'
        ? (relationship.user_a === profile.user_id ? relationship.user_b : relationship.user_a)
        : undefined,
      relationship_id: relationship.status === 'accepted' ? relationship.id : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.SHARED_GOALS, [...goals, newShared]);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('shared_goals').insert(newShared);
      } catch (err) {
        console.warn('Supabase shared goal create error:', err);
      }
    }
    return newShared;
  }

  async updateSharedGoal(id: string, updates: Partial<SharedGoal>): Promise<SharedGoal | null> {
    const list = this.getSharedGoals();
    const idx = list.findIndex((g) => g.id === id);
    if (idx === -1) return null;

    const updated = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    writeLocal(STORAGE_KEYS.SHARED_GOALS, list);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('shared_goals').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase shared goal update error:', err);
      }
    }
    return updated;
  }

  async deleteSharedGoal(id: string): Promise<boolean> {
    const list = this.getSharedGoals();
    const next = list.filter((g) => g.id !== id);
    writeLocal(STORAGE_KEYS.SHARED_GOALS, next);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('shared_goals').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase shared goal delete error:', err);
      }
    }
    return true;
  }

  // RELATIONSHIP LINKING ('US')
  getRelationship(): Relationship {
    const fallback: Relationship = {
      id: 'rel-local',
      user_a: 'local-user',
      invite_code: 'AMANAH-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: 'pending',
      partner_name: 'Connected Person',
      created_at: new Date().toISOString(),
    };
    return readLocal<Relationship>(STORAGE_KEYS.RELATIONSHIPS, fallback);
  }

  async updateRelationship(updates: Partial<Relationship>): Promise<Relationship> {
    const current = await this.loadRelationship();
    const updated: Relationship = {
      ...current,
      ...updates,
    };
    writeLocal(STORAGE_KEYS.RELATIONSHIPS, updated);

    const sb = getSupabase();
    const userId = await this.getAuthUserId();
    if (sb && userId && current.id !== 'rel-local') {
      try {
        const dbUpdates = { ...updates };
        delete (dbUpdates as Partial<Relationship>).partner_name;
        const { data, error } = await sb
          .from('relationships')
          .update(dbUpdates)
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) {
          const saved = { ...updated, ...(data as Relationship) };
          writeLocal(STORAGE_KEYS.RELATIONSHIPS, saved);
          return saved;
        }
      } catch (err) {
        console.warn('Supabase relationship update error:', err);
      }
    }

    return updated;
  }

  // COURSES
  getCourses(): Course[] {
    const fallback: Course[] = [
      {
        id: 'c-1',
        user_id: 'local-user',
        name: 'Classical Arabic & Qur’anic Grammar',
        owner: 'Me',
        description: 'Foundations of Arabic syntax and vocabulary for direct Qur’anic understanding',
        progress: 35,
        days_per_week: 4,
        expected_days: 90,
        notes: 'Currently completing lesson 12 on nominal sentences.',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    return readLocal<Course[]>(STORAGE_KEYS.COURSES, fallback);
  }

  async createCourse(data: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const courses = this.getCourses();
    const profile = this.getProfile();
    const newCourse: Course = {
      id: generateUUID(),
      user_id: profile.user_id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.COURSES, [...courses, newCourse]);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('courses').insert(newCourse);
      } catch (err) {
        console.warn('Supabase course create error:', err);
      }
    }
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    const courses = this.getCourses();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated: Course = {
      ...courses[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    courses[index] = updated;
    writeLocal(STORAGE_KEYS.COURSES, courses);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('courses').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase course update error:', err);
      }
    }
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const courses = this.getCourses();
    const next = courses.filter((c) => c.id !== id);
    writeLocal(STORAGE_KEYS.COURSES, next);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('courses').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase course delete error:', err);
      }
    }
    return true;
  }

  // MEMORIES (Our Journey)
  getMemories(): Memory[] {
    return readLocal<Memory[]>(STORAGE_KEYS.MEMORIES, DEFAULT_MEMORIES);
  }

  async createMemory(data: Omit<Memory, 'id' | 'user_id' | 'created_at'>): Promise<Memory> {
    const memories = this.getMemories();
    const profile = this.getProfile();
    const relationship = await this.loadRelationship();
    const newMemory: Memory = {
      id: generateUUID(),
      user_id: profile.user_id,
      ...data,
      relationship_id: relationship.status === 'accepted' ? relationship.id : data.relationship_id,
      created_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.MEMORIES, [newMemory, ...memories]);

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      try {
        await sb.from('memories').insert(newMemory);
      } catch (err) {
        console.warn('Supabase memory insert error:', err);
      }
    }
    return newMemory;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const memories = this.getMemories();
    const next = memories.filter((m) => m.id !== id);
    writeLocal(STORAGE_KEYS.MEMORIES, next);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('memories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase memory delete error:', err);
      }
    }
    return true;
  }

  // PRAYER SETTINGS
  getPrayerSettings(): PrayerSettings {
    return readLocal<PrayerSettings>(STORAGE_KEYS.PRAYER_SETTINGS, DEFAULT_PRAYER_SETTINGS);
  }

  async updatePrayerSettings(updates: Partial<PrayerSettings>): Promise<PrayerSettings> {
    const current = this.getPrayerSettings();
    const updated: PrayerSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeLocal(STORAGE_KEYS.PRAYER_SETTINGS, updated);

    const sb = getSupabase();
    if (sb && updated.user_id !== 'local-user') {
      try {
        await sb.from('prayer_settings').upsert(updated);
      } catch (err) {
        console.warn('Supabase prayer settings error:', err);
      }
    }
    return updated;
  }

  // DHIKR PROGRESS (Interactive Counter, persists across refreshes)
  getDhikrProgress(dateStr: string = getTodayKey()): DhikrProgress {
    const all = readLocal<Record<string, DhikrProgress>>(STORAGE_KEYS.DHIKR_PROGRESS, {});
    if (all[dateStr]) {
      return all[dateStr];
    }
    const profile = this.getProfile();
    const initial: DhikrProgress = {
      id: generateUUID(),
      user_id: profile.user_id,
      date: dateStr,
      target: 100,
      count: 0,
      updated_at: new Date().toISOString(),
    };
    all[dateStr] = initial;
    writeLocal(STORAGE_KEYS.DHIKR_PROGRESS, all);
    return initial;
  }

  async incrementDhikr(amount: number = 1, dateStr: string = getTodayKey()): Promise<DhikrProgress> {
    const all = readLocal<Record<string, DhikrProgress>>(STORAGE_KEYS.DHIKR_PROGRESS, {});
    const current = this.getDhikrProgress(dateStr);
    const updated: DhikrProgress = {
      ...current,
      count: Math.min(current.count + amount, 9999),
      updated_at: new Date().toISOString(),
    };
    all[dateStr] = updated;
    writeLocal(STORAGE_KEYS.DHIKR_PROGRESS, all);

    const sb = getSupabase();
    if (sb && current.user_id !== 'local-user') {
      try {
        await sb.from('dhikr_progress').upsert(updated);
      } catch (err) {
        console.warn('Supabase dhikr sync error:', err);
      }
    }
    return updated;
  }

  async resetDhikr(dateStr: string = getTodayKey()): Promise<DhikrProgress> {
    const all = readLocal<Record<string, DhikrProgress>>(STORAGE_KEYS.DHIKR_PROGRESS, {});
    const current = this.getDhikrProgress(dateStr);
    const updated: DhikrProgress = {
      ...current,
      count: 0,
      updated_at: new Date().toISOString(),
    };
    all[dateStr] = updated;
    writeLocal(STORAGE_KEYS.DHIKR_PROGRESS, all);
    return updated;
  }

  async setDhikrTarget(target: number, dateStr: string = getTodayKey()): Promise<DhikrProgress> {
    const all = readLocal<Record<string, DhikrProgress>>(STORAGE_KEYS.DHIKR_PROGRESS, {});
    const current = this.getDhikrProgress(dateStr);
    const updated: DhikrProgress = {
      ...current,
      target: Math.max(1, target),
      updated_at: new Date().toISOString(),
    };
    all[dateStr] = updated;
    writeLocal(STORAGE_KEYS.DHIKR_PROGRESS, all);
    return updated;
  }

  // QUR'AN TASK
  getQuranTask(dateStr: string = getTodayKey()): QuranTask {
    const all = readLocal<Record<string, QuranTask>>(STORAGE_KEYS.QURAN_TASKS, {});
    if (all[dateStr]) return all[dateStr];

    const profile = this.getProfile();
    const initial: QuranTask = {
      id: generateUUID(),
      user_id: profile.user_id,
      date: dateStr,
      pages_target: 3,
      pages_completed: 0,
      completed: false,
      notes: 'Muraaja — 3 pages',
      created_at: new Date().toISOString(),
    };
    all[dateStr] = initial;
    writeLocal(STORAGE_KEYS.QURAN_TASKS, all);
    return initial;
  }

  async updateQuranPages(pages: number, dateStr: string = getTodayKey()): Promise<QuranTask> {
    const all = readLocal<Record<string, QuranTask>>(STORAGE_KEYS.QURAN_TASKS, {});
    const current = this.getQuranTask(dateStr);
    const count = Math.max(0, pages);
    const updated: QuranTask = {
      ...current,
      pages_completed: count,
      completed: count >= current.pages_target,
    };
    all[dateStr] = updated;
    writeLocal(STORAGE_KEYS.QURAN_TASKS, all);

    const sb = getSupabase();
    if (sb && current.user_id !== 'local-user') {
      try {
        await sb.from('qur_an_tasks').upsert(updated);
      } catch (err) {
        console.warn('Supabase quran task update error:', err);
      }
    }
    return updated;
  }

  async toggleQuranTask(dateStr: string = getTodayKey()): Promise<QuranTask> {
    const current = this.getQuranTask(dateStr);
    const nextCompleted = !current.completed;
    const pages = nextCompleted ? current.pages_target : 0;
    return this.updateQuranPages(pages, dateStr);
  }

  calculateQuranStreak(): number {
    const all = readLocal<Record<string, QuranTask>>(STORAGE_KEYS.QURAN_TASKS, {});
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i += 1) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      const task = all[key];
      if (!task || !task.completed) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  async logQuranStatus(status: 'completed' | 'busy'): Promise<{ task: QuranTask; streak: number }> {
    const task = status === 'completed'
      ? await this.updateQuranPages(this.getQuranTask().pages_target)
      : this.getQuranTask();
    return {
      task,
      streak: this.calculateQuranStreak(),
    };
  }

  // EMERGENCY REQUESTS ("I NEED YOU")
  getEmergencyRequests(): EmergencyRequest[] {
    return readLocal<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY_REQUESTS, []);
  }

  async sendEmergencyRequest(message: string = 'I NEED YOU'): Promise<EmergencyRequest> {
    const list = this.getEmergencyRequests();
    const profile = this.getProfile();
    const relationship = await this.loadRelationship();

    if (relationship.status !== 'accepted' || !relationship.user_b) {
      throw new Error('Connect with your partner before sending I NEED YOU.');
    }

    const recipientId = relationship.user_a === profile.user_id ? relationship.user_b : relationship.user_a;
    if (!recipientId) {
      throw new Error('No connected partner is available to receive this request.');
    }

    const request: EmergencyRequest = {
      id: generateUUID(),
      sender_user_id: profile.user_id,
      sender_name: profile.display_name,
      recipient_user_id: recipientId,
      relationship_id: relationship.id,
      message: message || 'I NEED YOU',
      created_at: new Date().toISOString(),
      status: 'active',
    };

    const sb = getSupabase();
    if (sb && profile.user_id !== 'local-user') {
      // The live table stores IDs/message/status only; sender_name is local display data.
      const { data, error } = await sb
        .from('emergency_requests')
        .insert({
          id: request.id,
          sender_user_id: request.sender_user_id,
          recipient_user_id: request.recipient_user_id,
          relationship_id: request.relationship_id,
          message: request.message,
          created_at: request.created_at,
          status: request.status,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw error || new Error('Emergency request could not be stored.');
      }

      const saved = {
        ...(data as EmergencyRequest),
        sender_name: request.sender_name,
      };
      writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, [saved, ...list.filter((r) => r.id !== saved.id)]);
      this.knownEmergencyIds.add(saved.id);
      this.notifyEmergencyListeners(this.getEmergencyRequests());
      return saved;
    }

    writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, [request, ...list]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      sendLocalNotification('Amanah — I Need You', {
        body: profile.display_name + ': ' + message,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'amanah-urgent',
        data: { type: 'emergency_request', requestId: request.id, url: '/' },
      });
    }

    this.knownEmergencyIds.add(request.id);
    this.notifyEmergencyListeners(this.getEmergencyRequests());
    return request;
  }
  async acknowledgeEmergencyRequest(id: string): Promise<EmergencyRequest | null> {
    const list = this.getEmergencyRequests();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const updated: EmergencyRequest = {
      ...list[idx],
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
    };
    list[idx] = updated;
    writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, list);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('emergency_requests')
          .update({
            status: updated.status,
            acknowledged_at: updated.acknowledged_at,
          })
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw error;
        if (data) {
          const saved = { ...(data as EmergencyRequest), sender_name: updated.sender_name };
          writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, list.map((r) => (r.id === id ? saved : r)));
          return saved;
        }
      } catch (err) {
        console.warn('Supabase emergency ack error:', err);
      }
    }
    return updated;
  }

  async resolveEmergencyRequest(id: string): Promise<EmergencyRequest | null> {
    const list = this.getEmergencyRequests();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const updated: EmergencyRequest = {
      ...list[idx],
      status: 'resolved',
    };
    list[idx] = updated;
    writeLocal(STORAGE_KEYS.EMERGENCY_REQUESTS, list);
    return updated;
  }

  // Clear all data (For Account Deletion / Reset)
  async clearAllUserData(): Promise<void> {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

export const dataService = new AmanahDataService();
