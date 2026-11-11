import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import Sidebar, { type TabId } from '../components/Sidebar'
import DashboardTab from '../components/tabs/DashboardTab'
import NotesTab from '../components/tabs/NotesTab'
import PlannerTab from '../components/tabs/PlannerTab'
import TryoutTab from '../components/tabs/TryoutTab'
import ForumTab from '../components/tabs/ForumTab'
import { ToastProvider } from '../components/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import {
  checkAndNotifyDueTasks,
  requestNotificationPermission,
} from '../lib/notifications'

function WorkspaceInner({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}) {
  const [tab, setTab] = useState<TabId>('dashboard')
  const { profile } = useAuth()
  const { tasks } = useDashboardStats()
  const name = profile?.full_name?.split(' ')[0] || 'Pelajar'

   useEffect(() => {
      if (tasks.length) {
        checkAndNotifyDueTasks(tasks).catch(() => {})
      }
    }, [tasks])

  return (
    <div className="min-h-screen p-0 md:p-5">
      <div className="eh-frame flex flex-col md:flex-row">
        <Sidebar activeTab={tab} onTabChange={setTab} />

        <main className="flex-1 min-w-0 flex flex-col bg-[#fafbfd] dark:bg-slate-950/50 pb-24 md:pb-0">
          <header className="hidden md:flex items-center gap-3 px-6 pt-5 pb-2">
            <div className="flex-1 max-w-md">
              <input
                readOnly
                placeholder="Search"
                className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 px-4 text-sm text-slate-400 shadow-sm border-0 outline-none dark:text-slate-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 grid place-items-center text-slate-500 dark:text-pink-300 shadow-sm"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 dark:from-pink-300 dark:to-pink-500 text-white text-sm font-bold grid place-items-center">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</span>
            </div>
          </header>

          {/* Mobile theme toggle */}
          <div className="md:hidden flex justify-end px-4 pt-2">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 grid place-items-center text-slate-500 dark:text-pink-300"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {tab === 'dashboard' && <DashboardTab onStartFocus={() => setTab('planner')} />}
                {tab === 'notes' && <NotesTab />}
                {tab === 'planner' && <PlannerTab />}
                {tab === 'tryout' && <TryoutTab />}
                {tab === 'forum' && <ForumTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Workspace({
  darkMode = false,
  setDarkMode = () => {},
}: {
  darkMode?: boolean
  setDarkMode?: (v: boolean) => void
}) {
  return (
    <ToastProvider>
      <WorkspaceInner darkMode={darkMode} setDarkMode={setDarkMode} />
    </ToastProvider>
  )
}
