export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  deadline: string
  done: boolean
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  subject: string
  title: string
  desc: string
  likes: number
  created_at: string
}

export interface MusicItem {
  id: string
  user_id: string
  title: string
  url: string
  platform: 'YOUTUBE' | 'SPOTIFY'
  created_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  duration_minutes: number
  mode: 'work' | 'short'
  completed_at: string
}

export interface DashboardStats {
  totalFocusHours: number
  tasksCompleted: number
  tasksTotal: number
  streakDays: number
  avgQuizScore: number
  weeklyTargetHours: number
}

export type TabId = 'dashboard' | 'notes' | 'planner' | 'music' | 'tryout' | 'forum'
