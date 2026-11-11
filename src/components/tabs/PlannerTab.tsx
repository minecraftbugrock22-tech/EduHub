import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../Toast'

type Mode = 'work' | 'short'

export default function PlannerTab() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState<Mode>('work')
  const [secs, setSecs] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    ref.current = window.setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          window.clearInterval(ref.current!)
          setRunning(false)
          finish()
          return mode === 'work' ? 25 * 60 : 5 * 60
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (ref.current) window.clearInterval(ref.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode])

  async function finish() {
    if (mode === 'work' && user) {
      await supabase.from('focus_sessions').insert({
        user_id: user.id,
        duration_minutes: 25,
        mode: 'work',
        completed_at: new Date().toISOString(),
      })
      showToast('Sesi fokus selesai! +25 menit')
    } else {
      showToast('Istirahat selesai')
    }
  }

  function switchMode(m: Mode) {
    setRunning(false)
    setMode(m)
    setSecs(m === 'work' ? 25 * 60 : 5 * 60)
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f2744] tracking-tight">Pomodoro</h2>
        <p className="text-sm text-slate-500">Timer fokus 25 menit</p>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8 gap-1">
          <button
            type="button"
            onClick={() => switchMode('work')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${mode === 'work' ? 'bg-white text-[#0f2744] shadow' : 'text-slate-500'}`}
          >
            Fokus 25m
          </button>
          <button
            type="button"
            onClick={() => switchMode('short')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${mode === 'short' ? 'bg-white text-[#0f2744] shadow' : 'text-slate-500'}`}
          >
            Istirahat 5m
          </button>
        </div>

        <div className={`text-6xl font-bold tracking-tight tabular-nums ${running ? 'text-[#1e4d8c]' : 'text-[#0f2744]'}`}>
          {mm}:{ss}
        </div>
        <p className="text-sm text-slate-400 mt-3 mb-8">
          {running ? (mode === 'work' ? 'Sedang fokus…' : 'Istirahat…') : 'Siap memulai?'}
        </p>

        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="min-w-[120px] h-12 rounded-xl bg-[#0f2744] text-white text-sm font-bold hover:bg-[#1e4d8c]"
          >
            {running ? 'Jeda' : secs < (mode === 'work' ? 25 * 60 : 5 * 60) ? 'Lanjut' : 'Mulai'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(mode)}
            className="h-12 px-5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-500"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
