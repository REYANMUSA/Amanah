# Amanah (أمانة) — Production-Ready Mobile App

> **«Becoming better, one day at a time.»**

Amanah is a private, calm, mobile-first personal growth and halal-future companion application.

The app operates on two connected dimensions:
- **ME → ME**: Individual daily improvement across Deen, character, education, career, health, goals, discipline, and purpose.
- **ME + HER → FUTURE**: Two people prepare separately and responsibly for a possible halal marriage future without turning the application into a dating, messaging, or social-media platform.

---

## 1. Features Overview

- **Daily Calm Home**: Morning greeting, daily progress indicator, today's focus habits & tasks, quick Dhikr counter, authentic daily Hadith, and Us alignment.
- **Deen Sanctuary**:
  - **Dhikr**: Interactive Astaghfirullah counter (0 / 100 default) with haptic touch, audio chime, and persistent count across sessions.
  - **Prayer Times**: Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha with real-time countdown to next prayer.
  - **365 Hadith**: Authentic records strictly from *Sahih al-Bukhari* and *Sahih Muslim* with Arabic, transliteration, English translation, and book citations.
  - **Qur'an Muraaja**: 3 pages daily review tracker with completion progress.
  - **Deen Challenge**: A/B/C/D authentic Islamic questions with source verification and detailed explanations.
- **Us (Halal Future)**:
  - Personal goals & shared goals (Deen, Marriage preparation, Education, Career, Family, Character, Health, Money).
  - Secure invite code linking mechanism.
  - **I NEED YOU**: Immediate priority alert system with timestamp, status, and acknowledgement.
- **Courses & Studies**: Add, track, edit, and delete courses (e.g. Classical Arabic, Professional skills).
- **Our Journey Timeline**: Past, present, and future milestones with photo support and circle node timeline.
- **Progress & Consistency**: Genuine habit streaks (never fake streaks) and 7-day activity rhythm.
- **PWA & Offline First**: Complete manifest, service worker caching, in-app install prompt, and local persistence layer that operates offline or with Supabase.

---

## 2. Quick Local Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (runs on port 3000)
npm run dev

# 3. Build production bundle
npm run build
```

---

## 3. Connecting Supabase (Cloud Persistence & Auth)

Amanah runs out of the box with complete local persistence (IndexedDB / localStorage) with zero crashes. To enable cloud synchronization:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon / public key** from `Project Settings -> API`.

### Step 2: Run Database Migration
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open the file `supabase/migrations/20261004000000_amanah_schema.sql` from this repository.
3. Paste the entire script into the SQL Editor and click **Run**.
4. This creates all 17 tables (`profiles`, `user_settings`, `habits`, `habit_completions`, `daily_tasks`, `goals`, `shared_goals`, `relationships`, `courses`, `memories`, `photos`, `prayer_settings`, `dhikr_progress`, `hadith_progress`, `deen_challenges`, `qur_an_tasks`, `emergency_requests`, `push_subscriptions`), sets up Row Level Security (RLS) policies, indexes, and starter challenges.

### Step 3: Configure Storage
1. Navigate to **Storage** in the Supabase Dashboard.
2. Create a new bucket named `amanah_photos`.
3. Set public or authenticated read policies according to your privacy preference.

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
*(You can also configure or update these credentials at any time in the app under Settings -> Cloud / Supabase).*

---

## 4. PWA Installation

Amanah is a Progressive Web App:
- **Android / Chrome / Desktop**: Tap the **Install App** button in the header or browser address bar.
- **iOS Safari**: Tap the **Share** button in Safari, then select **Add to Home Screen**.

---

## 5. Packaging as an Android Native App

You can package Amanah into a native Android APK or Google Play bundle using **Capacitor**:

```bash
# 1. Install Capacitor
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init Amanah com.amanah.app --web-dir dist

# 3. Build web app & add Android platform
npm run build
npx cap add android

# 4. Open in Android Studio
npx cap open android
```
In Android Studio, you can test on an emulator or build a signed release APK / AAB.

---

## 6. Definition of Done & Production Test Checklist

- [x] Application launches cleanly without console errors.
- [x] Mobile-first ergonomic touch interface with 44px+ hitboxes.
- [x] All 17 database tables defined in SQL migration with RLS.
- [x] Local offline-first persistence ensures all habits, tasks, goals, and dhikr survive page refreshes.
- [x] Astaghfirullah Dhikr counter persists, increments, resets, and supports custom targets.
- [x] 365 Hadith strictly uses verified Sahih al-Bukhari & Sahih Muslim sources.
- [x] Qur'an Muraaja tracks daily 3-page progress.
- [x] Deen Challenge features A/B/C/D options with verified citations and explanations.
- [x] Us section provides secure invite codes, shared goals, and "I NEED YOU" emergency alerts.
- [x] Courses section supports adding, editing, progress tracking, and confirmed deletion.
- [x] Our Journey timeline supports milestone logs and photo preview.
- [x] PWA manifest and service worker precaching active.
- [x] Android back-button popstate handling closes modals gracefully.
