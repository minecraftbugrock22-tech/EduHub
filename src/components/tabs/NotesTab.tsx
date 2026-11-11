import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotes } from '../../hooks/useNotes'
import { useToast } from '../Toast'

export default function NotesTab() {
  const { notes, loading, addNote, deleteNote, filter, setFilter } = useNotes()
  const { showToast } = useToast()
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const subjects = ['all', ...Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)))]

  async function onSave() {
    if (!title.trim()) return showToast('Isi judul catatan')
    setSaving(true)
    try {
      await addNote(subject.trim() || 'Umum', title.trim(), body.trim())
      setTitle('')
      setBody('')
      showToast('Catatan disimpan')
    } catch {
      showToast('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f2744] tracking-tight">Catatan</h2>
        <p className="text-sm text-slate-500">Rangkuman pelajaranmu</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
        <div className="grid md:grid-cols-[1fr_1.4fr_auto] gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Mapel</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Matematika"
              className="mt-1 w-full h-11 rounded-xl bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bab turunan"
              className="mt-1 w-full h-11 rounded-xl bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-11 px-5 rounded-xl bg-[#0f2744] text-white text-sm font-bold hover:bg-[#1e4d8c] disabled:opacity-60"
          >
            {saving ? '…' : 'Simpan'}
          </button>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Isi catatan..."
            rows={3}
            className="md:col-span-3 w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === s ? 'bg-[#1e4d8c] text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {s === 'all' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-10">Memuat catatan…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white">
          Belum ada catatan
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((n, i) => (
            <motion.article
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e4d8c]">{n.subject}</p>
              <h3 className="text-sm font-bold text-[#0f2744] mt-1">{n.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3">{n.desc}</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteNote(n.id)
                    showToast('Catatan dihapus')
                  } catch {
                    showToast('Gagal menghapus')
                  }
                }}
                className="mt-3 text-[11px] font-semibold text-red-500"
              >
                Hapus
              </button>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
