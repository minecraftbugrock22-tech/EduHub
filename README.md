# EduHub Pelajar – Full Stack Student Workspace

Aplikasi workspace belajar pribadi berbasis **Vite + React + TypeScript**, database **PostgreSQL (Supabase)**, autentikasi **Google OAuth2**, dan animasi **Framer Motion**.

## Fitur Utama

- **Login Google OAuth2** – klik tombol Google → loading animation → pilih akun (tidak perlu ketik manual)
- **Dashboard real-time** – Total Fokus, Tugas Selesai, Streak, Quiz average (update live via Supabase Realtime)
- **Catatan Belajar** – CRUD + filter mata pelajaran + likes
- **Pomodoro Timer** + Flashcards
- **Musik Belajar** – YouTube / Spotify embed + playlist
- **Dark mode**, animasi smooth, scroll-friendly
- Sidebar menampilkan **nama user** dari profil Google

## Setup Cepat

### 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Di **SQL Editor**, jalankan seluruh isi file `supabase/schema.sql`
3. Aktifkan **Realtime** untuk tabel: `tasks`, `notes`, `music_playlist`, `focus_sessions`  
   (Database → Replication)
4. **Authentication → Providers → Google**  
   - Enable Google  
   - Isi Client ID & Client Secret dari [Google Cloud Console](https://console.cloud.google.com/)  
   - Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Di **Authentication → URL Configuration** tambahkan Site URL dan Redirect URLs (localhost:5173)

### 2. Install & Jalankan

```bash
cd eduhub-fullstack
cp .env.example .env
# Edit .env → isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Buka http://localhost:5173

### 3. Environment Variables

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Struktur Folder

```
src/
├── components/
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   └── tabs/
│       ├── DashboardTab.tsx
│       ├── NotesTab.tsx
│       ├── PlannerTab.tsx
│       ├── MusicTab.tsx
│       ├── TryoutTab.tsx
│       └── ForumTab.tsx
├── contexts/AuthContext.tsx
├── hooks/
│   ├── useDashboardStats.ts   ← real-time stats
│   ├── useNotes.ts
│   └── useMusic.ts
├── lib/supabase.ts
├── pages/
│   ├── LoginPage.tsx
│   └── Workspace.tsx
├── types/index.ts
├── App.tsx
└── main.tsx
```

## Catatan Real-time Dashboard

Statistik di dasbor (Total Fokus, Tugas, Streak) dihitung dari tabel `focus_sessions` dan `tasks`. Setiap kali:

- Tugas di-toggle / ditambah
- Sesi Pomodoro selesai (25 menit)

data langsung ter-update lewat **Supabase Realtime** channel tanpa perlu refresh halaman.

## Tech Stack

| Layer        | Teknologi              |
|-------------|------------------------|
| Frontend    | Vite, React 18, TS     |
| Styling     | Tailwind CSS           |
| Animation   | Framer Motion          |
| Icons       | Lucide React           |
| Backend/DB  | Supabase (PostgreSQL)  |
| Auth        | Supabase Auth + Google |

---

Dibuat dengan hati-hati, tanpa error yang disengaja. Semoga bermanfaat untuk belajar!
