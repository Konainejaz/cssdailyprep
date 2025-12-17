**Project Overview (Current State)**  
- App is `Vite + React (tS)` with a single “view-state” navigation (no React Router). Main flow is in `App.tsx:39-67` where `view` controls what screen renders.  
- Notes + quiz history + streak are all **localStorage-based** via `services/storageService.ts` (e.g. notes key `css_prep_notes_v1` in `storageService.ts:3-30`, streak in `storageService.ts:98-136`).  
- AI content is fetched directly from browser using `groq-sdk` with `dangerouslyAllowBrowser: true` in `services/groqService.ts:9-14` (this exposes your API key risk).  
- No authentication, no backend, no DB yet. Everything “personalized” is currently localStorage (notes, streak, app state).

---

**Perfect Plan (Auth + Backend + Admin + Personalization + History + Logs + Profile)**  
Goal: keep your current Vite UI, add a backend that is deployable on Vercel free, and move all personalized + sensitive operations to DB/backend.

### 1) Final Stack Choice (Free + Easy on Vercel)
- **Frontend:** existing Vite React app (same repo).
- **Backend on Vercel:** Vercel Serverless Functions using an `api/` folder (works alongside Vite static hosting).
- **Database + Auth + Storage:** **Supabase (Free tier)**  
  - Email/password auth (login/register)  
  - Forgot password (reset email)  
  - Google OAuth login  
  - Postgres DB for notes, settings, history, logs  
  - Storage bucket for profile pictures  
- **Why this is the best fit:** you get full auth + DB + storage without paying, and Vercel only hosts UI + API functions. Also you can remove the Groq key from the browser completely.

### 2) Authentication & Session (Login/Register/Forgot/Google)
**Frontend additions (new views in your existing `ViewState` pattern):**
- Add new view states: `AUTH_LOGIN`, `AUTH_REGISTER`, `AUTH_FORGOT`, `PROFILE`, `ADMIN_PANEL`.
- Add an `AuthContext` that holds:
  - `session`, `user`, `profile`, `isLoading`
  - `signIn`, `signUp`, `signOut`, `resetPassword`, `signInWithGoogle`

**Backend responsibilities:**
- Most auth happens via Supabase client, but for admin/user-management you’ll use backend endpoints secured by JWT + role checks.

**Forgot password flow:**
- Use Supabase reset password email + a UI route/view to set new password.

### 3) Roles & Admin User (Full Rights)
**Role model (RBAC):**
- `profiles.role`: `'user' | 'admin'`

**How admin is assigned (safe + controlled):**
- Option A (recommended): env allowlist `ADMIN_EMAILS` (comma-separated). On login, backend ensures those emails get `admin` role.
- Option B: first registered user becomes admin (simple but risky if random user signs up first).

**Admin capabilities (via backend-only endpoints):**
- List users, promote/demote roles, view user logs, optionally disable users.

### 4) Personalization: Notes, Settings, History, Profile
Move all personalization from localStorage to DB (still can cache locally for speed, but DB is source of truth).

**DB tables (minimum needed):**
- `profiles`
  - `id (uuid, same as auth.user id)`, `email`, `full_name`, `bio`, `avatar_url`, `role`, timestamps
- `notes`
  - `id`, `user_id`, `title`, `content`, `subject`, `linked_article_id`, timestamps
- `user_settings`
  - `user_id`, `language`, `theme`, plus a `jsonb` field for future preferences
- `search_history`
  - `id`, `user_id`, `query`, `type` (e.g. `research|resource|articles`), `result_snapshot` (optional), timestamps
- `user_logs`
  - `id`, `user_id`, `action`, `entity_type`, `entity_id`, `metadata jsonb`, `created_at`

**Security (RLS policies in Supabase):**
- Users can only read/write rows where `user_id = auth.uid()`
- Admin can read everything (policy checks `profiles.role = 'admin'`)

### 5) Backend APIs (What UI Will Call)
Implement Vercel functions under `api/`:

**Auth/Profile**
- `GET /api/me` → returns profile + role
- `PUT /api/me` → update profile (name, bio, etc.)

**Notes**
- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

**History**
- `GET /api/history`
- `POST /api/history` (add searched query, opened item, etc.)

**Logs**
- `POST /api/logs` (log actions like “searched”, “opened article”, “created note”)
- `GET /api/admin/logs` (admin only)

**Admin**
- `GET /api/admin/users` (admin only)
- `PATCH /api/admin/users/:id/role` (admin only)

### 6) Move AI Calls Behind Backend (Critical Fix)
Right now Groq key is exposed in browser (`groqService.ts:9-14`). The correct plan:
- Create endpoints:
  - `POST /api/ai/daily-articles`
  - `POST /api/ai/research`
  - `POST /api/ai/study-material`
  - `POST /api/ai/quiz`
- Backend holds `GROQ_API_KEY` in Vercel env vars.
- Frontend `services/groqService.ts` becomes a thin wrapper calling these endpoints.
- Also: every AI request can auto-write to `search_history` + `user_logs` (so history/logs become accurate).

### 7) UI Changes Needed (To “Integrate APIs” Properly)
- Add auth screens (login/register/forgot) and guard the app:
  - If not logged in: show auth flow
  - If logged in: show app
- Add user menu in sidebar/header:
  - profile, settings, logout
- Notes:
  - replace localStorage `getNotes/saveNote` with API calls (or Supabase client calls) and keep same UI.
- History:
  - show “your previous searches” with clickable items that re-open results.
- Profile page:
  - update bio, name, upload profile picture (Supabase storage).
- Admin panel view:
  - user list + role management + logs viewer

### 8) Deployment Plan (Vercel Free)
- Create Supabase project (free), enable:
  - Email/password auth
  - Google provider (set redirect URLs for Vercel domain)
  - Storage bucket for avatars
  - RLS policies + tables
- Deploy to Vercel:
  - Frontend build = Vite build output
  - Serverless functions = `api/*`
  - Set env vars in Vercel:
    - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
    - `GROQ_API_KEY`
    - `ADMIN_EMAILS`

---

**Execution Order (So Nothing Breaks Midway)**
- Phase 1: Add Supabase auth + `profiles` + role handling + login/register/forgot/google UI.
- Phase 2: Add notes API + migrate notes from localStorage → DB (one-time migration per user).
- Phase 3: Add profile/settings (DB + storage upload).
- Phase 4: Add history + logs (DB + UI).
- Phase 5: Add admin panel + user management endpoints.
- Phase 6: Move all Groq calls to backend + remove browser key usage.
