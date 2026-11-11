import { useMemo, useState, useRef, useEffect } from 'react'
import {
  Music2,
  Search,
  Play,
  Pause,
  Link2,
  Headphones,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  MOODS,
  CATALOG,
  searchItunes,
  toEmbedUrl,
  type CatalogTrack,
  type MoodId,
  type ItunesResult,
} from '../../lib/musicCatalog'
import { useToast } from '../Toast'

type View = 'browse' | 'search' | 'link'

export default function MusicTab() {
  const { showToast } = useToast()
  const [mood, setMood] = useState<MoodId | 'all'>('lofi')
  const [current, setCurrent] = useState<CatalogTrack>(() => CATALOG[0])
  const [view, setView] = useState<View>('browse')
  const [query, setQuery] = useState('')
  const [itunes, setItunes] = useState<ItunesResult[]>([])
  const [searching, setSearching] = useState(false)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [playingPreview, setPlayingPreview] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tracks = useMemo(() => {
    if (mood === 'all') return CATALOG
    return CATALOG.filter((t) => t.mood === mood)
  }, [mood])

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  function playTrack(t: CatalogTrack) {
    stopPreview()
    setCurrent(t)
  }

  function stopPreview() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingPreview(false)
    setPreviewId(null)
  }

  function togglePreview(item: ItunesResult) {
    if (previewId === item.trackId && playingPreview) {
      stopPreview()
      return
    }
    stopPreview()
    if (!item.previewUrl) {
      showToast('Preview tidak tersedia')
      return
    }
    try {
      const audio = new Audio(item.previewUrl)
      audioRef.current = audio
      audio.onended = () => {
        setPlayingPreview(false)
        setPreviewId(null)
      }
      void audio.play()
      setPreviewId(item.trackId)
      setPlayingPreview(true)
    } catch {
      showToast('Gagal memutar preview')
    }
  }

  function onSearchChange(value: string) {
    setQuery(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!value.trim()) {
      setItunes([])
      return
    }
    searchTimer.current = setTimeout(() => {
      setSearching(true)
      searchItunes(value)
        .then((results) => setItunes(results))
        .catch(() => setItunes([]))
        .finally(() => setSearching(false))
    }, 450)
  }

  function addFromLink() {
    if (!linkUrl.trim()) {
      showToast('Tempel link YouTube atau Spotify dulu')
      return
    }
    try {
      const { embedUrl, platform } = toEmbedUrl(linkUrl.trim())
      const title =
        linkTitle.trim() || (platform === 'SPOTIFY' ? 'Spotify Track' : 'YouTube Video')
      playTrack({
        id: `custom-${Date.now()}`,
        title,
        artist: platform,
        mood: 'focus',
        url: embedUrl,
        platform,
      })
      setLinkTitle('')
      setLinkUrl('')
      setView('browse')
      showToast('Diputar di pemutar utama')
    } catch {
      showToast('Link tidak valid')
    }
  }

  const moodLabel =
    mood === 'all' ? 'Semua katalog belajar' : MOODS.find((m) => m.id === mood)?.desc || ''

  return (
    <div className="rounded-xl bg-gradient-to-br from-zinc-950 via-violet-950 to-zinc-900 text-zinc-100 -mx-2 sm:mx-0 overflow-hidden border border-violet-900/40">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-300/80">
              <Headphones className="h-3.5 w-3.5" /> Studio Musik
            </p>
            <h2 className="text-2xl font-black tracking-wide text-white">Fokus dengan ritme</h2>
            <p className="mt-1 max-w-md text-sm text-zinc-400">
              Pilih mood, cari lagu, atau tempel link Spotify/YouTube.
            </p>
          </div>

          <div className="flex flex-wrap rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            {(
              [
                { id: 'browse' as View, label: 'Jelajah', icon: Sparkles },
                { id: 'search' as View, label: 'Cari Lagu', icon: Search },
                { id: 'link' as View, label: 'Tempel Link', icon: Link2 },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ' +
                  (view === id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'text-zinc-400 hover:text-white')
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Now Playing */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-xl">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Sedang diputar
                </span>
                <h3 className="mt-3 text-lg font-bold text-white sm:text-xl">{current.title}</h3>
                <p className="mt-1 text-sm text-violet-200/70">{current.artist}</p>
                <p className="mt-2 text-[11px] text-zinc-500">Sumber: {current.platform}</p>
              </div>
            </div>
            <div className="relative h-52 bg-black sm:h-64 lg:h-auto lg:min-h-[240px]">
              <iframe
                key={current.id}
                className="absolute inset-0 h-full w-full border-0"
                src={current.url}
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Browse */}
        {view === 'browse' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMood('all')}
                className={
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition ' +
                  (mood === 'all'
                    ? 'bg-white text-zinc-900'
                    : 'bg-white/5 text-zinc-300 ring-1 ring-white/10')
                }
              >
                ✨ Semua
              </button>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition ' +
                    (mood === m.id
                      ? 'bg-white text-zinc-900'
                      : 'bg-white/5 text-zinc-300 ring-1 ring-white/10')
                  }
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500">{moodLabel}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.map((t) => {
                const emoji = MOODS.find((m) => m.id === t.mood)?.emoji || '🎵'
                const active = current.id === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => playTrack(t)}
                    className={
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition ' +
                      (active
                        ? 'border-violet-400/50 bg-violet-500/20'
                        : 'border-white/5 bg-white/5 hover:bg-white/10')
                    }
                  >
                    <div
                      className={
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base ' +
                        (active ? 'bg-violet-500 text-white' : 'bg-zinc-800')
                      }
                    >
                      {active ? <Music2 className="h-5 w-5" /> : emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{t.title}</p>
                      <p className="truncate text-[11px] text-zinc-400">{t.artist}</p>
                    </div>
                    <Play className="h-4 w-4 shrink-0 text-zinc-500" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Search */}
        {view === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari judul atau artis… (lofi, mozart, rain)"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/40"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Preview 30 detik via iTunes. Untuk putar penuh, gunakan Tempel Link (Spotify/YouTube).
            </p>
            {searching && <p className="text-center text-xs text-zinc-400">Mencari…</p>}
            {!searching && query && itunes.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-zinc-500">
                Tidak ada hasil. Coba kata lain atau Tempel Link.
              </p>
            )}
            <div className="grid gap-2">
              {itunes.map((item) => (
                <div
                  key={item.trackId}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3"
                >
                  {item.artworkUrl100 ? (
                    <img
                      src={item.artworkUrl100}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{item.trackName}</p>
                    <p className="truncate text-[11px] text-zinc-400">{item.artistName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreview(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-white"
                  >
                    {previewId === item.trackId && playingPreview ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link */}
        {view === 'link' && (
          <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-500/20 p-2.5 text-violet-300">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Tempel link resmi</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Salin link dari Spotify (lagu/playlist) atau YouTube, lalu tempel di bawah.
                </p>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-zinc-400">
                Judul (opsional)
              </label>
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Misal: Playlist Ujian"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-zinc-400">
                URL Spotify / YouTube
              </label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://open.spotify.com/... atau youtube.com/..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addFromLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 text-sm font-bold text-white hover:bg-violet-400"
            >
              <Play className="h-4 w-4" /> Putar sekarang
            </button>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-violet-300"
            >
              Buka Spotify <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <p className="pb-2 text-center text-[11px] text-zinc-500">
          Tips: mulai dari <strong className="text-zinc-400">Jelajah</strong> → lalu Cari Lagu atau
          Tempel Link.
        </p>
      </div>
    </div>
  )
}
