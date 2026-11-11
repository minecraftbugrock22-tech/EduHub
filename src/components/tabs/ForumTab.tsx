import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../Toast'

type Entry = { id: string; text: string; created_at: string }

export default function ForumTab() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [text, setText] = useState('')
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) return
    setLoading(true)
    // store journal in notes with subject Jurnal if no dedicated table
    const { data } = await supabase
      .from('notes')
      .select('id, desc, created_at, title')
      .eq('user_id', user.id)
      .eq('subject', 'Jurnal')
      .order('created_at', { ascending: false })
    setItems(
      (data || []).map((n: any) => ({
        id: n.id,
        text: n.desc || n.title,
        created_at: n.created_at,
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function save() {
    if (!user || !text.trim()) return showToast('Tulis dulu')
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      subject: 'Jurnal',
      title: 'Jurnal',
      desc: text.trim(),
      likes: 0,
    })
    if (error) return showToast('Gagal menyimpan')
    setText('')
    showToast('Jurnal disimpan')
    load()
  }

  async function remove(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setItems((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f2744] tracking-tight">Jurnal</h2>
        <p className="text-sm text-slate-500">PR & kendala belajar</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis PR atau kendala belajar..."
        rows={4}
        className="w-full rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-y"
      />
      <button
        type="button"
        onClick={save}
        className="h-11 px-5 rounded-xl bg-[#0f2744] text-white text-sm font-bold"
      >
        Simpan jurnal
      </button>

      {loading ? (
        <p className="text-sm text-slate-400">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-white">
          Belum ada jurnal
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((j) => (
            <li key={j.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-sm text-slate-700">{j.text}</p>
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{new Date(j.created_at).toLocaleString('id-ID')}</span>
                <button type="button" className="font-semibold text-red-500" onClick={() => remove(j.id)}>
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
