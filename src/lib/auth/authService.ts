import { getSupabase } from '../supabase/client';

export interface UserAccount {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthSession {
  user: UserAccount | null;
  token: string | null;
}

const STORAGE_KEYS = {
  USERS: 'amanah_registered_users_v1',
  SESSION: 'amanah_auth_session_v1',
};

// Web Crypto SHA-256 password hashing with salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredCredential {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  display_name: string;
  created_at: string;
}

class AuthService {
  private listeners: Array<(session: AuthSession) => void> = [];

  constructor() {
    // Check if Supabase auth listener is available
    const sb = getSupabase();
    if (sb) {
      sb.auth.onAuthStateChange((event, session) => {
        // CRITICAL BUG FIX: Only adopt Supabase session if it exists.
        // DO NOT wipe out existing local session on INITIAL_SESSION when session is null.
        if (session?.user) {
          const user: UserAccount = {
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Seeker',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          this.setLocalSession({ user, token: session.access_token });
        } else if (event === 'SIGNED_OUT') {
          this.setLocalSession({ user: null, token: null });
        }
      });
    }
  }

  private getStoredUsers(): StoredCredential[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveStoredUsers(users: StoredCredential[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getSession(): AuthSession {
    if (typeof window === 'undefined') return { user: null, token: null };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return { user: null, token: null };
      return JSON.parse(raw);
    } catch {
      return { user: null, token: null };
    }
  }

  private setLocalSession(session: AuthSession): void {
    if (typeof window === 'undefined') return;
    if (session.user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    this.notify(session);
  }

  subscribe(listener: (session: AuthSession) => void): () => void {
    this.listeners.push(listener);
    listener(this.getSession());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(session: AuthSession): void {
    this.listeners.forEach((l) => l(session));
  }

  async signUp(
    email: string,
    pass: string,
    displayName: string
  ): Promise<{ user: UserAccount; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0] || 'Seeker';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { user: null as unknown as UserAccount, error: 'Please provide a valid email address.' };
    }
    if (pass.length < 6) {
      return { user: null as unknown as UserAccount, error: 'Password must be at least 6 characters long.' };
    }

    // 1. Always store locally with salted SHA-256 hash first
    const users = this.getStoredUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return { user: null as unknown as UserAccount, error: 'An account with this email already exists. Please log in.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(pass, salt);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newCred: StoredCredential = {
      id: userId,
      email: cleanEmail,
      passwordHash,
      salt,
      display_name: cleanName,
      created_at: new Date().toISOString(),
    };

    users.push(newCred);
    this.saveStoredUsers(users);

    const user: UserAccount = {
      id: newCred.id,
      email: newCred.email,
      display_name: newCred.display_name,
      created_at: newCred.created_at,
    };

    // 2. Also register on backend server API for cross-device synchronization
    try {
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass, displayName: cleanName }),
      }).catch(() => {});
    } catch {
      // Offline fallback is already active
    }

    // 3. Attempt Supabase sync in background (non-blocking)
    const sb = getSupabase();
    if (sb) {
      try {
        sb.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: { data: { display_name: cleanName } },
        }).catch((err) => console.warn('Supabase background signup note:', err));
      } catch {
        // Non-blocking
      }
    }

    // 4. Set persistent session
    this.setLocalSession({ user, token: 'session_' + Math.random().toString(36) });
    return { user, error: null };
  }

  async signIn(email: string, pass: string): Promise<{ user: UserAccount; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      return { user: null as unknown as UserAccount, error: 'Email and password are required.' };
    }

    // 1. Try local verified credentials first
    const users = this.getStoredUsers();
    const localFound = users.find((u) => u.email === cleanEmail);
    if (localFound) {
      const testHash = await hashPassword(pass, localFound.salt);
      if (testHash === localFound.passwordHash) {
        const user: UserAccount = {
          id: localFound.id,
          email: localFound.email,
          display_name: localFound.display_name,
          created_at: localFound.created_at,
        };
        this.setLocalSession({ user, token: 'session_' + Math.random().toString(36) });

        // Sync with backend server in background
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: pass }),
        }).catch(() => {});

        return { user, error: null };
      } else {
        return { user: null as unknown as UserAccount, error: 'Incorrect password. Please try again.' };
      }
    }

    // 2. If not found locally, try backend server API (e.g. user registered on another device)
    try {
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      const serverData = await serverRes.json();
      if (serverRes.ok && serverData.user) {
        const user = serverData.user as UserAccount;
        // Save to local credentials so future logins work instantly offline
        const salt = generateSalt();
        const passwordHash = await hashPassword(pass, salt);
        users.push({
          id: user.id,
          email: user.email,
          passwordHash,
          salt,
          display_name: user.display_name,
          created_at: user.created_at,
        });
        this.saveStoredUsers(users);
        this.setLocalSession({ user, token: serverData.token || 'session_' + Math.random().toString(36) });
        return { user, error: null };
      }
    } catch {
      // Continue to Supabase check
    }

    // 3. Try Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!error && data.user) {
          const user: UserAccount = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            display_name: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
            created_at: data.user.created_at || new Date().toISOString(),
          };
          this.setLocalSession({ user, token: data.session?.access_token || 'supabase-token' });
          return { user, error: null };
        }
      } catch (err: unknown) {
        console.warn('Supabase sign-in note:', err);
      }
    }

    return {
      user: null as unknown as UserAccount,
      error: 'No account found with this email. Please check your spelling or create an account.',
    };
  }

  async signOut(): Promise<void> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    this.setLocalSession({ user: null, token: null });
  }

  async resetPassword(email: string, newPass: string): Promise<{ success: boolean; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const users = this.getStoredUsers();
    const idx = users.findIndex((u) => u.email === cleanEmail);
    if (idx !== -1) {
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPass, newSalt);
      users[idx].salt = newSalt;
      users[idx].passwordHash = newHash;
      this.saveStoredUsers(users);
    }

    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword: newPass }),
      });
    } catch {
      // offline
    }

    return { success: true, error: null };
  }
}

export const authService = new AuthService();
