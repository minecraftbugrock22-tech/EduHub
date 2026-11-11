export type MoodId = 'focus' | 'lofi' | 'classic' | 'nature' | 'jazz' | 'piano'

export interface CatalogTrack {
  id: string
  title: string
  artist: string
  mood: MoodId
  url: string
  platform: 'YOUTUBE' | 'SPOTIFY'
  cover?: string
}

export const MOODS: { id: MoodId; label: string; emoji: string; desc: string }[] = [
  { id: 'focus', label: 'Fokus', emoji: '🎯', desc: 'Beat tenang untuk konsentrasi' },
  { id: 'lofi', label: 'Lo-fi', emoji: '🎧', desc: 'Chill beats & study vibes' },
  { id: 'classic', label: 'Klasik', emoji: '🎻', desc: 'Musik klasik lembut' },
  { id: 'nature', label: 'Alam', emoji: '🌿', desc: 'Suara hujan & hutan' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷', desc: 'Jazz kafe & soft swing' },
  { id: 'piano', label: 'Piano', emoji: '🎹', desc: 'Piano solo untuk baca' },
]

export const CATALOG: CatalogTrack[] = [
  {
    id: 'yt-lofi-1',
    title: 'Lofi Girl — Chill Beats',
    artist: 'Lofi Girl',
    mood: 'lofi',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-lofi-2',
    title: 'Coffee Shop Ambience',
    artist: 'Jazz & Rain',
    mood: 'jazz',
    url: 'https://www.youtube.com/embed/TURbeWK2wwg',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-focus-1',
    title: 'Deep Focus — Work Music',
    artist: 'Focus Channel',
    mood: 'focus',
    url: 'https://www.youtube.com/embed/4xDzrJKXOOY',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-nature-1',
    title: 'Rain Sounds for Study',
    artist: 'Nature',
    mood: 'nature',
    url: 'https://www.youtube.com/embed/q76bMs-NwRk',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-classic-1',
    title: 'Classical Music for Studying',
    artist: 'Classic',
    mood: 'classic',
    url: 'https://www.youtube.com/embed/5H-dG7M_y6U',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-piano-1',
    title: 'Peaceful Piano',
    artist: 'Piano Relax',
    mood: 'piano',
    url: 'https://www.youtube.com/embed/4Tr0otuiQuU',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-focus-2',
    title: 'Alpha Waves — Concentration',
    artist: 'Brain Waves',
    mood: 'focus',
    url: 'https://www.youtube.com/embed/WPni755-Krg',
    platform: 'YOUTUBE',
  },
  {
    id: 'yt-lofi-3',
    title: '1 Hour Lo-fi Hip Hop',
    artist: 'Study Beats',
    mood: 'lofi',
    url: 'https://www.youtube.com/embed/lTRiuFIWV54',
    platform: 'YOUTUBE',
  },
]

export interface ItunesResult {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
  previewUrl?: string
  collectionName?: string
}

export async function searchItunes(term: string): Promise<ItunesResult[]> {
  if (!term.trim()) return []
  try {
    const q = encodeURIComponent(term.trim())
    const res = await fetch(`/api/itunes/search?term=${q}&media=music&entity=song&limit=12`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).filter((r: ItunesResult) => r.previewUrl)
  } catch {
    return []
  }
}

export function toEmbedUrl(url: string): { embedUrl: string; platform: 'YOUTUBE' | 'SPOTIFY' } {
  let platform: 'YOUTUBE' | 'SPOTIFY' = 'YOUTUBE'
  let embedUrl = url

  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0]
    if (id) embedUrl = `https://www.youtube.com/embed/${id}`
  } else if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]
    if (id) embedUrl = `https://www.youtube.com/embed/${id}`
  } else if (url.includes('youtube.com/embed/')) {
    embedUrl = url.split('?')[0]
  } else if (url.includes('spotify.com')) {
    platform = 'SPOTIFY'
    if (url.includes('/track/')) {
      const id = url.split('/track/')[1]?.split('?')[0]
      embedUrl = `https://open.spotify.com/embed/track/${id}`
    } else if (url.includes('/playlist/')) {
      const id = url.split('/playlist/')[1]?.split('?')[0]
      embedUrl = `https://open.spotify.com/embed/playlist/${id}`
    } else if (url.includes('/album/')) {
      const id = url.split('/album/')[1]?.split('?')[0]
      embedUrl = `https://open.spotify.com/embed/album/${id}`
    }
  }

  return { embedUrl, platform }
}
