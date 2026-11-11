import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Note } from '../types'

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const fetchRef = useRef<() => void>(() => {})

  const fetchNotes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('subject', filter)
      }

      const { data } = await query
      setNotes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user, filter])

  fetchRef.current = fetchNotes

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchNotes()

    const uid = `${user.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 9)}`
    const channel = supabase.channel(`notes-rt-${uid}`)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchRef.current()
      }
    )
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotes])

  async function addNote(subject: string, title: string, desc: string) {
    if (!user) return
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      subject,
      title,
      desc,
      likes: 0,
    })
    if (error) throw error
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
  }

  async function likeNote(id: string) {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    const { error } = await supabase
      .from('notes')
      .update({ likes: note.likes + 1 })
      .eq('id', id)
    if (error) throw error
  }

  return {
    notes,
    loading,
    filter,
    setFilter,
    addNote,
    deleteNote,
    likeNote,
    refresh: fetchNotes,
  }
}
