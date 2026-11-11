import type { Task } from '../types'

export function resolveDueDate(task: Task | null | undefined): Date | null {
  if (!task) return null
  if (task.due_date) {
    const d = new Date(task.due_date)
    if (!isNaN(d.getTime())) return d
  }
  const raw = (task.deadline || '').toLowerCase().trim()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (raw.includes('hari ini') || raw === 'h-0' || raw.includes('today')) return startOfToday
  if (raw.includes('besok') || raw.includes('h-1') || raw.includes('tomorrow')) {
    const t = new Date(startOfToday)
    t.setDate(t.getDate() + 1)
    return t
  }
  const hMatch = raw.match(/h-(\d+)/)
  if (hMatch) {
    const t = new Date(startOfToday)
    t.setDate(t.getDate() + parseInt(hMatch[1], 10))
    return t
  }
  return null
}

export function isDueWithinOneDay(task: Task | null | undefined): boolean {
  if (!task || task.done) return false
  const due = resolveDueDate(task)
  if (!due) return false
  const hoursLeft = (due.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursLeft < 24
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export async function showTaskNotification(task: Task): Promise<void> {
  if (!task || Notification.permission !== 'granted') return
  const title = 'Deadline tugas mendekat!'
  const body = `${task.title} — ${task.deadline || task.due_date || 'segera'}`
  const tag = `task-${task.id}`
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, { body, icon: '/icon-192.png', tag })
      return
    }
    new Notification(title, { body, icon: '/icon-192.png', tag })
  } catch {}
}

const NOTIFIED_KEY = 'eduhub_notified_tasks'
function getNotifiedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function markNotified(id: string) {
  const s = getNotifiedSet()
  s.add(id)
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...s]))
}

/** Jangan request permission di sini — hanya kirim jika sudah granted */
export async function checkAndNotifyDueTasks(tasks: Task[]): Promise<number> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return 0
  if (!Array.isArray(tasks)) return 0
  const notified = getNotifiedSet()
  let count = 0
  for (const task of tasks) {
    if (!task || !isDueWithinOneDay(task) || notified.has(task.id)) continue
    await showTaskNotification(task)
    markNotified(task.id)
    count++
  }
  return count
}
