import {
  LayoutDashboard,
  FolderKanban,
  Timer,
  BrainCircuit,
  FileQuestion,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export type TabId = 'dashboard' | 'notes' | 'planner' | 'tryout' | 'forum'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  darkMode?: boolean
  setDarkMode?: (v: boolean) => void
}

const navItems: { id: TabId; label: string; tip: string; icon: React.ElementType }[] = [
  { id: 'notes', label: 'Catatan', tip: 'Catatan', icon: FolderKanban },
  { id: 'planner', label: 'Pomodoro', tip: 'Pomodoro', icon: Timer },
  { id: 'dashboard', label: 'Dashboard', tip: 'Dashboard', icon: LayoutDashboard },
  { id: 'tryout', label: 'Kuis', tip: 'Kuis', icon: BrainCircuit },
  { id: 'forum', label: 'Jurnal', tip: 'Jurnal', icon: FileQuestion },
]

function EduLogoMark() {
  return (
    <svg viewBox="0 0 80 56" className="w-10 h-8" fill="none" aria-hidden>
      <path d="M10 40c1-8 10-14 22-16" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 24v18" stroke="#1e4d8c" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M54 40c-1-8-10-14-22-16" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M10 40c3 4 12 7 30 7s27-3 30-7" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="40" cy="12" r="5" fill="#f5a623" />
      <path d="M40 18c-7 4-9.5 11-8 16 1.2-4 4.5-7 8-8 3.5 1 6.8 4 8 8 1.5-5-.8-12-8-16z" fill="#f5a623" />
    </svg>
  )
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const displayName = profile?.full_name || 'Pelajar'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-100">
        <span className="font-bold text-[#0f2744]">EduHub</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs font-semibold text-white bg-[#0f2744] px-3 py-2 rounded-lg"
        >
          Keluar
        </button>
      </div>

      {/* Desktop left rail + Mobile bottom nav */}
      <aside
        className="
          fixed md:static bottom-0 left-0 right-0 z-50
          md:w-[88px] md:min-h-full
          flex md:flex-col items-end md:items-center
          justify-around md:justify-start
          gap-1 md:gap-2
          px-2 py-2 md:py-6
          bg-white/95 md:bg-gradient-to-b md:from-sky-50 md:to-violet-50
          border-t md:border-t-0 md:border-r border-slate-200
          backdrop-blur md:backdrop-blur-0
          pb-[max(0.5rem,env(safe-area-inset-bottom))]
        "
      >
        <div className="hidden md:flex flex-col items-center mb-4">
          <EduLogoMark />
          <span className="text-[9px] font-bold text-[#0f2744] mt-1">EduHub</span>
        </div>

        <nav className="flex md:flex-col items-end md:items-center gap-1 w-full md:w-auto justify-around md:justify-start flex-1 md:flex-initial">
          {navItems.map((item) => {
            const Icon = item.icon
            const on = activeTab === item.id
            const isDash = item.id === 'dashboard'
            return (
              <button
                key={item.id}
                type="button"
                title={item.tip}
                onClick={() => onTabChange(item.id)}
                className={
                  isDash
                    ? `relative -mt-5 md:mt-0 w-14 h-14 md:w-12 md:h-12 rounded-full md:rounded-2xl
                       flex items-center justify-center transition shadow-lg md:shadow-none border-[3px] md:border-0 border-white
                       ${on ? 'bg-gradient-to-br from-[#0f2744] to-[#1e4d8c] text-white' : 'bg-gradient-to-br from-[#1e4d8c] to-[#3b82f6] text-white'}`
                    : `w-12 h-12 rounded-2xl flex items-center justify-center transition
                       ${on ? 'bg-white text-[#1e4d8c] shadow-md' : 'text-slate-400 hover:bg-white/80 hover:text-slate-700'}`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="sr-only">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          title="Keluar"
          onClick={() => signOut()}
          className="hidden md:flex w-12 h-12 rounded-2xl items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700 mt-auto"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* user chip desktop only — shown in header usually */}
        <div className="hidden">
          <span>{initial}</span>
        </div>
      </aside>
    </>
  )
}
