import { useState } from 'react'
import { useToast } from '../Toast'

const Q = [
  { q: 'Ibukota Indonesia adalah…', a: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'], c: 0 },
  { q: 'Hasil dari 2 + 2 × 2?', a: ['6', '8', '4', '2'], c: 0 },
  { q: 'Planet terdekat Matahari?', a: ['Venus', 'Merkurius', 'Mars', 'Bumi'], c: 1 },
  { q: 'H₂O adalah rumus kimia…', a: ['Oksigen', 'Hidrogen', 'Air', 'Karbon'], c: 2 },
  { q: 'Penulis novel Laskar Pelangi?', a: ['Tere Liye', 'Andrea Hirata', 'Pramoedya', 'Dee Lestari'], c: 1 },
]

export default function TryoutTab() {
  const { showToast } = useToast()
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  function pick(idx: number) {
    if (idx === Q[i].c) {
      setScore((s) => s + 1)
      showToast('Benar!')
    } else showToast('Kurang tepat')
    if (i + 1 >= Q.length) setDone(true)
    else setI((x) => x + 1)
  }

  function restart() {
    setI(0)
    setScore(0)
    setDone(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f2744] tracking-tight">Kuis</h2>
        <p className="text-sm text-slate-500">Latihan cepat</p>
      </div>

      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {done ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-2">Selesai!</p>
            <p className="text-3xl font-bold text-[#1e4d8c]">
              Skor {score}/{Q.length}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 w-full h-11 rounded-xl bg-[#0f2744] text-white text-sm font-bold"
            >
              Ulangi
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-3">
              <span>Soal</span>
              <span>
                {i + 1}/{Q.length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#0f2744] mb-4">{Q[i].q}</h3>
            <div className="space-y-2">
              {Q[i].a.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pick(idx)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 text-sm font-medium transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
