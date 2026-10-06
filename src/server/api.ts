import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data_store.json');

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  display_name: string;
  created_at: string;
}

export interface StoredRelationship {
  id: string;
  user_a: string;
  user_a_name?: string;
  user_b?: string;
  user_b_name?: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'disconnected';
  accepted_at?: string;
  created_at: string;
}

export interface StoredEmergencyRequest {
  id: string;
  sender_user_id: string;
  sender_name: string;
  recipient_user_id: string;
  relationship_id?: string;
  message: string;
  created_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_at?: string;
}

export interface StoredMemory {
  id: string;
  relationship_id?: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  image_url: string;
  created_at: string;
}

export interface StoredSharedGoal {
  id: string;
  relationship_id: string;
  category: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  completed_by?: string;
  updated_at: string;
}

export interface StoredQuizScore {
  userId: string;
  date: string;
  score: number;
  total: number;
  updatedAt: string;
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

interface ServerData {
  users: StoredUser[];
  relationships: StoredRelationship[];
  emergency_requests: StoredEmergencyRequest[];
  memories: StoredMemory[];
  shared_goals: StoredSharedGoal[];
  quiz_scores: Record<string, StoredQuizScore>;
}

function loadStore(): ServerData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        relationships: parsed.relationships || [],
        emergency_requests: parsed.emergency_requests || [],
        memories: parsed.memories || [],
        shared_goals: parsed.shared_goals || [],
        quiz_scores: parsed.quiz_scores || {},
      };
    }
  } catch (err) {
    console.warn('Could not read server store, resetting:', err);
  }
  return {
    users: [],
    relationships: [],
    emergency_requests: [],
    memories: [],
    shared_goals: [],
    quiz_scores: {},
  };
}

function saveStore(data: ServerData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save server store:', err);
  }
}

// Password hashing
function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// SSE Clients for Realtime updates
type SSEClient = {
  id: string;
  userId?: string;
  res: any;
};
const sseClients: SSEClient[] = [];

export function broadcastRealtimeEvent(event: any) {
  const data = JSON.stringify(event);
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  }
}

function broadcastEmergencyUpdate(request: StoredEmergencyRequest) {
  broadcastRealtimeEvent({ type: 'emergency_update', request });
}

export const apiRouter = express.Router();
apiRouter.use(express.json());

// Polyfill express helpers for Vite connect middlewares
apiRouter.use((req: any, res: any, next: any) => {
  if (!req.query && req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      const queryObj: Record<string, string> = {};
      parsed.searchParams.forEach((val, key) => {
        queryObj[key] = val;
      });
      req.query = queryObj;
    } catch {
      req.query = {};
    }
  } else if (!req.query) {
    req.query = {};
  }
  if (!res.status) {
    res.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function (data: any) {
      if (!this.headersSent) {
        this.setHeader('Content-Type', 'application/json');
      }
      this.end(JSON.stringify(data));
      return this;
    };
  }
  next();
});

// ----------------- AUTH ENDPOINTS -----------------

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (displayName || '').trim() || cleanEmail.split('@')[0] || 'Seeker';

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const store = loadStore();
  const existing = store.users.find((u) => u.email === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newUser: StoredUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: cleanEmail,
    passwordHash,
    salt,
    display_name: cleanName,
    created_at: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore(store);

  return res.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      display_name: newUser.display_name,
      created_at: newUser.created_at,
    },
    token: 'token_' + Math.random().toString(36),
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const store = loadStore();
  const user = store.users.find((u) => u.email === cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email. Please check your email or create an account.' });
  }

  const testHash = hashPassword(password, user.salt);
  if (testHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at,
    },
    token: 'token_' + Math.random().toString(36),
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const store = loadStore();
  const user = store.users.find((u) => u.email === cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'Account not found with this email.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);
  saveStore(store);

  return res.json({ success: true });
});

// ----------------- RELATIONSHIPS ENDPOINTS -----------------

apiRouter.get('/relationships/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const store = loadStore();

  const rel = store.relationships.find(
    (r) => r.user_a === userId || r.user_b === userId
  );

  if (!rel) {
    // Generate default pending relationship with invite code
    const newRel: StoredRelationship = {
      id: 'rel_' + Math.random().toString(36).substring(2, 9),
      user_a: userId,
      invite_code: 'AMANAH-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    store.relationships.push(newRel);
    saveStore(store);
    return res.json({ relationship: newRel, partnerId: null, partnerName: 'Connected Person', partnerProfile: null });
  }

  const partnerId = rel.user_a === userId ? rel.user_b : rel.user_a;
  const partnerUser = partnerId ? store.users.find((u) => u.id === partnerId) : null;
  const partnerName = partnerUser?.display_name || (rel.user_a === userId ? rel.user_b_name : rel.user_a_name) || 'Connected Person';

  let partnerProfile: PartnerProfile | null = null;
  if (partnerId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const scoreRecord = store.quiz_scores?.[partnerId];
    const todayQuizScore = scoreRecord ? {
      score: scoreRecord.score,
      total: scoreRecord.total,
      date: scoreRecord.date,
    } : null;

    partnerProfile = {
      id: partnerId,
      name: partnerName,
      email: partnerUser?.email || '',
      bio: 'Preparing for halal union with sabr, taqwa and steadfast deen',
      status: rel.status === 'accepted' ? 'Connected' : 'Pending',
      connected_since: rel.accepted_at || rel.created_at,
      today_quiz_score: todayQuizScore,
    };
  }

  return res.json({
    relationship: rel,
    partnerId: partnerId || null,
    partnerName,
    partnerProfile,
  });
});

apiRouter.post('/relationships/connect', (req: Request, res: Response) => {
  const { userId, inviteCode, userName } = req.body;
  const code = (inviteCode || '').trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ error: 'Invitation code is required.' });
  }

  const store = loadStore();
  const relIndex = store.relationships.findIndex(
    (r) => r.invite_code.toUpperCase() === code
  );

  if (relIndex === -1) {
    return res.status(404).json({ error: 'Invitation code not found. Please verify the code.' });
  }

  const rel = store.relationships[relIndex];
  if (rel.user_a === userId) {
    return res.status(400).json({ error: 'You cannot connect with your own invitation code.' });
  }

  rel.user_b = userId;
  rel.user_b_name = userName || 'Partner';
  rel.status = 'accepted';
  rel.accepted_at = new Date().toISOString();

  store.relationships[relIndex] = rel;
  saveStore(store);

  const partnerUser = store.users.find((u) => u.id === rel.user_a);
  const partnerName = partnerUser?.display_name || rel.user_a_name || 'Connected Person';

  const partnerProfile: PartnerProfile = {
    id: rel.user_a,
    name: partnerName,
    email: partnerUser?.email || '',
    bio: 'Preparing for halal union with sabr, taqwa and steadfast deen',
    status: 'Connected',
    connected_since: rel.accepted_at,
    today_quiz_score: store.quiz_scores?.[rel.user_a] || null,
  };

  // Broadcast relationship update so User A gets live notification
  broadcastRealtimeEvent({
    type: 'relationship_update',
    relationship: rel,
    partnerId: userId,
    partnerName: userName || 'Partner',
  });

  return res.json({
    relationship: rel,
    partnerId: rel.user_a,
    partnerName,
    partnerProfile,
  });
});

// ----------------- SHARED JOURNEY GALLERY ENDPOINTS -----------------

apiRouter.get('/memories', (req: Request, res: Response) => {
  const relationshipId = (req.query?.relationshipId as string) || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('relationshipId') || '' : '');
  const userId = (req.query?.userId as string) || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('userId') || '' : '');
  const store = loadStore();

  if (!store.memories) store.memories = [];

  const list = store.memories.filter((m) => {
    if (relationshipId && m.relationship_id === relationshipId) return true;
    if (userId && m.user_id === userId) return true;
    return false;
  });

  return res.json({ memories: list });
});

apiRouter.post('/memories/sync', (req: Request, res: Response) => {
  const { relationshipId, memory } = req.body;
  if (!memory || !memory.id) {
    return res.status(400).json({ error: 'Memory object is required' });
  }

  const store = loadStore();
  if (!store.memories) store.memories = [];

  const item: StoredMemory = {
    ...memory,
    relationship_id: relationshipId || memory.relationship_id,
  };

  const existingIdx = store.memories.findIndex((m) => m.id === memory.id);
  if (existingIdx !== -1) {
    store.memories[existingIdx] = item;
  } else {
    store.memories.unshift(item);
  }
  saveStore(store);

  broadcastRealtimeEvent({
    type: 'memory_update',
    memory: item,
    relationship_id: relationshipId,
  });

  return res.json({ memory: item });
});

apiRouter.delete('/memories/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const store = loadStore();
  if (!store.memories) store.memories = [];

  const idx = store.memories.findIndex((m) => m.id === id);
  if (idx !== -1) {
    const deleted = store.memories.splice(idx, 1)[0];
    saveStore(store);
    broadcastRealtimeEvent({
      type: 'memory_deleted',
      id,
      relationship_id: deleted.relationship_id,
    });
  }

  return res.json({ success: true, id });
});

// ----------------- SHARED PREPARATION GOALS ENDPOINTS -----------------

apiRouter.get('/shared-goals', (req: Request, res: Response) => {
  const relationshipId = (req.query?.relationshipId as string) || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('relationshipId') || '' : '');
  const store = loadStore();
  if (!store.shared_goals) store.shared_goals = [];

  if (relationshipId) {
    const list = store.shared_goals.filter((g) => g.relationship_id === relationshipId);
    return res.json({ goals: list });
  }

  return res.json({ goals: store.shared_goals });
});

apiRouter.post('/shared-goals/sync', (req: Request, res: Response) => {
  const { relationshipId, goal, goals } = req.body;
  const store = loadStore();
  if (!store.shared_goals) store.shared_goals = [];

  if (goals && Array.isArray(goals)) {
    for (const g of goals) {
      const idx = store.shared_goals.findIndex((item) => item.id === g.id);
      const updated = { ...g, relationship_id: relationshipId || g.relationship_id };
      if (idx !== -1) {
        store.shared_goals[idx] = updated;
      } else {
        store.shared_goals.push(updated);
      }
    }
  } else if (goal && goal.id) {
    const idx = store.shared_goals.findIndex((item) => item.id === goal.id);
    const updated = { ...goal, relationship_id: relationshipId || goal.relationship_id };
    if (idx !== -1) {
      store.shared_goals[idx] = updated;
    } else {
      store.shared_goals.push(updated);
    }
  }

  saveStore(store);

  broadcastRealtimeEvent({
    type: 'goals_update',
    relationship_id: relationshipId,
    goals: store.shared_goals.filter((g) => !relationshipId || g.relationship_id === relationshipId),
  });

  return res.json({ success: true });
});

// ----------------- DAILY HADITH QUIZ SCORES ENDPOINTS -----------------

apiRouter.post('/quiz/score', (req: Request, res: Response) => {
  const { userId, dateKey, score, total } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const store = loadStore();
  if (!store.quiz_scores) store.quiz_scores = {};

  const record: StoredQuizScore = {
    userId,
    date: dateKey || new Date().toISOString().split('T')[0],
    score: Number(score) || 0,
    total: Number(total) || 5,
    updatedAt: new Date().toISOString(),
  };

  store.quiz_scores[userId] = record;
  saveStore(store);

  broadcastRealtimeEvent({
    type: 'quiz_update',
    userId,
    quizScore: record,
  });

  return res.json({ quizScore: record });
});

apiRouter.get('/quiz/score/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const store = loadStore();
  const record = store.quiz_scores?.[userId] || null;
  return res.json({ quizScore: record });
});

// ----------------- EMERGENCY ("I NEED YOU") ENDPOINTS -----------------

apiRouter.post('/emergency/send', (req: Request, res: Response) => {
  const { senderId, senderName, message } = req.body;
  if (!senderId) {
    return res.status(400).json({ error: 'senderId is required.' });
  }

  const store = loadStore();
  // Find recipient via relationship
  const rel = store.relationships.find(
    (r) => (r.user_a === senderId || r.user_b === senderId) && r.status === 'accepted'
  );

  let recipientId = 'partner';
  let relationshipId: string | undefined = undefined;

  if (rel) {
    recipientId = rel.user_a === senderId ? (rel.user_b || 'partner') : rel.user_a;
    relationshipId = rel.id;
  }

  const newRequest: StoredEmergencyRequest = {
    id: 'emg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    sender_user_id: senderId,
    sender_name: senderName || 'Your Person',
    recipient_user_id: recipientId,
    relationship_id: relationshipId,
    message: (message || 'I NEED YOU').trim(),
    created_at: new Date().toISOString(),
    status: 'active',
  };

  store.emergency_requests.unshift(newRequest);
  saveStore(store);

  // Broadcast realtime update to any connected SSE listeners
  broadcastEmergencyUpdate(newRequest);

  return res.json({ request: newRequest });
});

apiRouter.get('/emergency/active', (req: Request, res: Response) => {
  const userId = (req.query?.userId as string) || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('userId') || '' : '');
  const store = loadStore();

  if (!userId) {
    return res.json({ requests: store.emergency_requests.filter((r) => r.status === 'active') });
  }

  // Active requests where this user is the recipient OR requests sent to partner in their relationship
  const userRel = store.relationships.find(
    (r) => r.user_a === userId || r.user_b === userId
  );

  const activeForUser = store.emergency_requests.filter((r) => {
    if (r.status !== 'active') return false;
    // Don't show to sender as an incoming alert
    if (r.sender_user_id === userId) return false;

    // Matches if specifically addressed to userId
    if (r.recipient_user_id === userId) return true;

    // Matches if part of the same relationship
    if (userRel && r.relationship_id === userRel.id) return true;

    // Matches if relationship is accepted and sender is the partner
    if (userRel && (r.sender_user_id === userRel.user_a || r.sender_user_id === userRel.user_b)) return true;

    // Fallback if connected in guest mode or recipient is 'partner'
    if (r.recipient_user_id === 'partner') return true;

    return false;
  });

  return res.json({ requests: activeForUser });
});

apiRouter.post('/emergency/acknowledge', (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id is required' });

  const store = loadStore();
  const reqItem = store.emergency_requests.find((r) => r.id === id);
  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found' });
  }

  reqItem.status = 'acknowledged';
  reqItem.acknowledged_at = new Date().toISOString();
  saveStore(store);

  broadcastEmergencyUpdate(reqItem);
  return res.json({ request: reqItem });
});

// SSE Realtime stream
apiRouter.get('/emergency/stream', (req: Request, res: Response) => {
  const userId = (req.query?.userId as string) || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('userId') || undefined : undefined);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Math.random().toString(36);
  const client: SSEClient = { id: clientId, userId, res };
  sseClients.push(client);

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) sseClients.splice(index, 1);
  });
});
