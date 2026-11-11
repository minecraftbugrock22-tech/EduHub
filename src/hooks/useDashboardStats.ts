import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DashboardStats, Task } from '../types'

export function useDashboardStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalFocusHours: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    streakDays: 0,
    avgQuizScore: 88,
    weeklyTargetHours: 20,
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const fetchRef = useRef<() => void>(() => {})

  const fetchStats = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const allTasks = tasksData || []
      setTasks(allTasks)
      const completed = allTasks.filter((t) => t.done).length

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString())

      const totalMinutes = (sessions || []).reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      )
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10

      const { data: allSessions } = await supabase
        .from('focus_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      let streak = 0
      if (allSessions && allSessions.length > 0) {
        const days = new Set(
          allSessions.map((s) =>
            new Date(s.completed_at).toISOString().slice(0, 10)
          )
        )
        const today = new Date()
        for (let i = 0; i < 60; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          if (days.has(key)) streak++
          else if (i > 0) break
        }
      }

      setStats({
        totalFocusHours: totalHours,
        tasksCompleted: completed,
        tasksTotal: allTasks.length,
        streakDays: streak,
        avgQuizScore: 88,
        weeklyTargetHours: 20,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  fetchRef.current = fetchStats

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchStats()

    const uid = `${user.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 9)}`

    const tasksChannel = supabase.channel(`tasks-rt-${uid}`)
    tasksChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchRef.current()
      }
    )
    tasksChannel.subscribe()

    const sessionsChannel = supabase.channel(`sessions-rt-${uid}`)
    sessionsChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'focus_sessions',
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchRef.current()
      }
    )
    sessionsChannel.subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(sessionsChannel)
    }
  }, [user, fetchStats])

  return { stats, tasks, setTasks, loading, refresh: fetchStats }
}
