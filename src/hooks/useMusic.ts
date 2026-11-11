import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { MusicItem } from '../types'
import { CATALOG, toEmbedUrl } from '../lib/musicCatalog'

function catalogAsPlaylist(userId: string): MusicItem[] {
  return CATALOG.slice(0, 4).map((t) => ({
    id: t.id,
    user_id: userId,
    title: t.title,
    url: t.url,
    platform: t.platform,
    created_at: new Date().toISOString(),
  }))
}

export function useMusic() {
  const { user } = useAuth()
  const [playlist, setPlaylist] = useState<MusicItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlaylist = useCallback(async () => {
    if (!user) {
      setPlaylist([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('music_playlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) {
        const fallback = catalogAsPlaylist(user.id)
        setPlaylist(fallback)
        setActiveId((prev) => prev || fallback[0]?.id || null)
      } else {
        setPlaylist(data)
        setActiveId((prev) => prev || data[0]?.id || null)
      }
    } catch {
      const fallback = catalogAsPlaylist(user.id)
      setPlaylist(fallback)
      setActiveId((prev) => prev || fallback[0]?.id || null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchPlaylist()
  }, [fetchPlaylist])

  async function addMusic(title: string, url: string) {
    if (!user) return
    const { embedUrl, platform } = toEmbedUrl(url)
    try {
      const { data, error } = await supabase
        .from('music_playlist')
        .insert({ user_id: user.id, title, url: embedUrl, platform })
        .select()
        .single()
      if (error) throw error
      if (data) {
        setPlaylist((prev) => {
          const withoutDefault = prev.filter((p) => !String(p.id).startsWith('yt-'))
          return [...withoutDefault, data]
        })
        setActiveId(data.id)
      }
    } catch {
      const local: MusicItem = {
        id: `local-${Date.now()}`,
        user_id: user.id,
        title,
        url: embedUrl,
        platform,
        created_at: new Date().toISOString(),
      }
      setPlaylist((prev) => [...prev, local])
      setActiveId(local.id)
    }
  }

  async function deleteMusic(id: string) {
    if (String(id).startsWith('yt-') || String(id).startsWith('local-')) {
      setPlaylist((prev) => {
        const next = prev.filter((m) => m.id !== id)
        if (activeId === id) setActiveId(next[0]?.id || null)
        return next
      })
      return
    }
    try {
      await supabase.from('music_playlist').delete().eq('id', id)
    } catch {
      /* ignore */
    }
    setPlaylist((prev) => {
      const next = prev.filter((m) => m.id !== id)
      if (activeId === id) setActiveId(next[0]?.id || null)
      return next
    })
  }

  const activeItem = playlist.find((m) => m.id === activeId) || playlist[0] || null

  return {
    playlist,
    activeId,
    activeItem,
    loading,
    setActiveId,
    addMusic,
    deleteMusic,
    refresh: fetchPlaylist,
  }
}
