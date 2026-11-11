import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../Toast'
import { isDueWithinOneDay } from '../../lib/notifications'
import clsx from 'clsx'

interface Props {
  onStartFocus: () => void
}

function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function DashboardTab({ onStartFocus }: Props) {
  const { stats, tasks, setTasks, loading } = useDashboardStats()
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [deadlineChoice, setDeadlineChoice] = useState('1')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const name = profile?.full_name?.split(' ')[0] || 'Pelajar'
  const dateLabel = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeLabel = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const list = Array.isArray(tasks) ? tasks.filter((t) => t != null) : []
  const urgent = list.filter((t) => !t.done && isDueWithinOneDay(t))

  async function toggleTask(id: string, done: boolean) {
    const { error } = await supabase.from('tasks').update({ done: !done }).eq('id', id)
    if (error) return showToast('Gagal update')
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !done } : t)))
  }

  async function removeTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return showToast('Gagal hapus')
    setTasks((p) => p.filter((t) => t.id !== id))
  }

  async function saveTask() {
    if (!user || !title.trim()) return
    const days = parseInt(deadlineChoice, 10)
    const due = new Date()
    due.setHours(0, 0, 0, 0)
    due.setDate(due.getDate() + days)
    const dueDate = toISODate(due)
    let deadline = 'Hari ini'
    if (days === 1) deadline = 'H-1'
    else if (days > 1) deadline = `H-${days}`

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: title.trim(),
        deadline,
        due_date: dueDate,
        done: false,
      })
      .select()
      .single()
    if (error) return showToast('Gagal simpan')
    if (data) setTasks((p) => [data, ...p])
    setTitle('')
    setDeadlineChoice('1')
    setShowAdd(false)
    showToast('Tugas ditambah')
  }

  const [cy, setCy] = useState(now.getFullYear())
  const [cm, setCm] = useState(now.getMonth())
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const firstDow = new Date(cy, cm, 1).getDay()
  const start = (firstDow + 6) % 7
  const dim = new Date(cy, cm + 1, 0).getDate()
  const prevDim = new Date(cy, cm, 0).getDate()
  const taskDays = new Set(
    list
      .filter((t) => t.due_date)
      .map((t) => {
        const d = new Date(t.due_date + 'T12:00:00')
        return d.getFullYear() === cy && d.getMonth() === cm ? d.getDate() : -1
      })
      .filter((d) => d > 0)
  )

  const focusPct = Math.min(
    100,
    (stats.totalFocusHours / Math.max(stats.weeklyTargetHours || 10, 1)) * 100
  )
  const taskPct = stats.tasksTotal ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0
  const streakPct = Math.min(100, (stats.streakDays / 7) * 100)

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#0b1c33] text-white px-6 py-7 min-h-[140px]">
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute w-20 h-20 border-[10px] border-sky-300/70 rounded-[40%] -left-2 bottom-[-20px] rotate-[-20deg]" />
          <div className="absolute w-14 h-14 border-[8px] border-orange-300/60 rounded-full left-[22%] top-4" />
        </div>
        <p className="relative text-xs text-slate-300 mb-0.5">{dateLabel}</p>
        <p className="relative text-sm font-semibold text-sky-300 tabular-nums mb-2">{timeLabel}</p>
        <h2 className="relative text-2xl font-bold tracking-tight text-white">Hai, {name}!</h2>
        <p className="relative text-sm text-slate-300 mt-1 max-w-md">
          Pantau tugas, fokus, dan progress belajarmu.
        </p>
        {/* LIGHT = putih navy | DARK = pink */}
        <button
          type="button"
          onClick={onStartFocus}
          className="relative mt-4 text-xs font-bold px-4 py-2.5 rounded-xl
            bg-white text-[#0f2744] hover:bg-sky-50
            dark:bg-pink-600 dark:text-white dark:hover:bg-pink-500"
        >
          Mulai Pomodoro →
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.9fr] gap-4">
        <div className="space-y-4">
          {/* Tugas */}
          <div className="rounded-2xl border border-slate-100 dark:border-[#3d2a38] shadow-sm p-5 bg-white dark:bg-[#1a1524]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0f2744] dark:text-pink-200">Tugas</h3>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="text-xs font-bold flex items-center gap-1 text-[#1e4d8c] dark:text-pink-300"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 py-8 text-center">Memuat…</p>
            ) : list.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-[#3d2a38] rounded-2xl">
                Belum ada tugas
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.slice(0, 6).map((t) => {
                  const soon = !t.done && isDueWithinOneDay(t)
                  const d = t.due_date ? new Date(t.due_date + 'T12:00:00') : null
                  const ds = d
                    ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
                    : '—'
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      className={clsx(
                        'relative rounded-2xl border p-4 shadow-sm',
                        t.done &&
                          'bg-slate-50 dark:bg-[#1c1520] border-slate-200 dark:border-[#3d2a38] opacity-75',
                        !t.done &&
                          soon &&
                          'bg-orange-50 dark:bg-[#2a1520] border-orange-200 dark:border-pink-700',
                        !t.done &&
                          !soon &&
                          'bg-slate-50 dark:bg-[#22182c] border-slate-100 dark:border-[#4a3040]'
                      )}
                    >
                      <div
                        className={clsx(
                          'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl',
                          t.done
                            ? 'bg-emerald-500'
                            : soon
                            ? 'bg-orange-400 dark:bg-pink-500'
                            : 'bg-[#1e4d8c] dark:bg-pink-500'
                        )}
                      />
                      <div className="pl-2">
                        <div className="flex items-center gap-2 text-lg font-bold text-[#0f2744] dark:text-pink-200">
                          {ds}
                          {soon && (
                            <span className="text-[10px] uppercase font-bold bg-orange-100 dark:bg-pink-900/50 text-orange-700 dark:text-pink-200 px-2 py-0.5 rounded-full">
                              soon
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-1 text-slate-500 dark:text-pink-200/80">
                          {t.deadline || '—'}
                        </p>
                        <p
                          className={clsx(
                            'text-sm font-semibold mt-1 dark:text-white',
                            t.done ? 'line-through text-slate-400' : 'text-slate-800'
                          )}
                        >
                          {t.title}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleTask(t.id, t.done)}
                            className={clsx(
                              'w-5 h-5 rounded-md border-2 grid place-items-center',
                              t.done
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 dark:border-pink-400/60'
                            )}
                          >
                            {t.done && <Check className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTask(t.id)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-500 dark:text-pink-300/80"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ringkasan */}
          <div className="rounded-2xl border border-slate-100 dark:border-[#3d2a38] shadow-sm p-5 bg-white dark:bg-[#1a1524]">
            <h3 className="text-sm font-semibold text-[#0f2744] dark:text-pink-200 mb-4">Ringkasan</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Jam fokus',
                  val: `${stats.totalFocusHours}j`,
                  pct: focusPct,
                  bar: 'from-sky-400 to-blue-600 dark:from-pink-700 dark:to-rose-500',
                },
                {
                  label: 'Selesai',
                  val: `${stats.tasksCompleted}/${stats.tasksTotal}`,
                  pct: taskPct,
                  bar: 'from-indigo-300 to-indigo-500 dark:from-pink-700 dark:to-pink-500',
                },
                {
                  label: 'Streak',
                  val: `${stats.streakDays}h`,
                  pct: streakPct,
                  bar: 'from-orange-300 to-orange-500 dark:from-rose-800 dark:to-pink-400',
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-pink-100">{r.label}</span>
                    <span className="text-slate-400 dark:text-pink-300/70">{r.val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-[#2a2030] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${r.bar}`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kalender */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 dark:border-[#3d2a38] shadow-sm p-5 bg-white dark:bg-[#1a1524]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0f2744] dark:text-pink-200">
                {months[cm]} {cy}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#2a2030] text-slate-600 dark:text-pink-200"
                  onClick={() => {
                    if (cm === 0) {
                      setCm(11)
                      setCy(cy - 1)
                    } else setCm(cm - 1)
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#2a2030] text-slate-600 dark:text-pink-200"
                  onClick={() => {
                    if (cm === 11) {
                      setCm(0)
                      setCy(cy + 1)
                    } else setCm(cm + 1)
                  }}
                >
                  ›
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                <div
                  key={d}
                  className="text-[9px] font-bold text-slate-400 dark:text-pink-300/50 py-1 uppercase"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: start }).map((_, i) => (
                <div
                  key={'p' + i}
                  className="aspect-square text-[11px] text-slate-300 dark:text-slate-600 grid place-items-center"
                >
                  {prevDim - start + i + 1}
                </div>
              ))}
              {Array.from({ length: dim }).map((_, i) => {
                const d = i + 1
                const isToday =
                  now.getFullYear() === cy && now.getMonth() === cm && now.getDate() === d
                const has = taskDays.has(d)
                return (
                  <div
                    key={d}
                    className={clsx(
                      'aspect-square text-[11px] font-semibold grid place-items-center rounded-lg relative',
                      isToday &&
                        'text-white shadow bg-gradient-to-br from-[#1e4d8c] to-blue-500 dark:from-pink-700 dark:to-rose-500',
                      !isToday && 'text-[#0f2744] dark:text-pink-100'
                    )}
                  >
                    {d}
                    {has && (
                      <span
                        className={clsx(
                          'absolute bottom-1 w-1 h-1 rounded-full',
                          isToday ? 'bg-white' : 'bg-blue-500 dark:bg-pink-400'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-[#3d2a38] shadow-sm p-5 bg-white dark:bg-[#1a1524]">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-pink-200 mb-2">
              Deadline dekat
            </h3>
            {urgent.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-pink-300/50">Tidak ada</p>
            ) : (
              urgent.map((t) => (
                <p key={t.id} className="text-sm py-1 text-slate-700 dark:text-pink-100">
                  ⚠ {t.title}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

            {/* Modal + animasi */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 grid place-items-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-sm rounded-2xl p-6 shadow-xl
                bg-white border border-slate-200
                dark:bg-[#1a1524] dark:border-[#3d2a38]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-[#0f2744] dark:text-pink-100 mb-4">Tugas baru</h3>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-pink-300/70 mb-1">
                Judul
              </label>
              <input
                className="w-full h-11 rounded-xl px-3 text-sm mb-3 outline-none
                  bg-slate-50 text-slate-800 border border-slate-200
                  dark:bg-[#22182c] dark:text-white dark:border-[#3d2a38]
                  focus:ring-2 focus:ring-blue-200 dark:focus:ring-pink-500/40"
                placeholder="Judul tugas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-pink-300/70 mb-1">
                Deadline
              </label>
              <select
                className="w-full h-11 rounded-xl px-3 text-sm mb-4 outline-none
                  bg-slate-50 text-slate-800 border border-slate-200
                  dark:bg-[#22182c] dark:text-white dark:border-[#3d2a38]"
                value={deadlineChoice}
                onChange={(e) => setDeadlineChoice(e.target.value)}
              >
                <option value="0">Hari ini</option>
                <option value="1">H-1 (besok)</option>
                <option value="2">H-2</option>
                <option value="3">H-3</option>
                <option value="7">1 minggu</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveTask}
                  className="flex-1 h-11 rounded-xl text-sm font-bold text-white
                    bg-[#0f2744] hover:bg-[#1e4d8c]
                    dark:bg-pink-600 dark:hover:bg-pink-500"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="h-11 px-4 rounded-xl text-sm font-semibold
                    bg-slate-100 text-slate-600
                    dark:bg-[#2a2030] dark:text-pink-200"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
