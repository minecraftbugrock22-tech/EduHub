import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

function EduLogo({ className = 'w-16 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" fill="none" className={className} aria-hidden>
      <path d="M10 40c1-8 10-14 22-16" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 24v18" stroke="#1e4d8c" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M54 40c-1-8-10-14-22-16" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M10 40c3 4 12 7 30 7s27-3 30-7" stroke="#1e4d8c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="40" cy="12" r="5" fill="#f5a623" />
      <path d="M40 18c-7 4-9.5 11-8 16 1.2-4 4.5-7 8-8 3.5 1 6.8 4 8 8 1.5-5-.8-12-8-16z" fill="#f5a623" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk dengan Google. Coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] bg-white/95 backdrop-blur rounded-[28px] p-8 shadow-xl border border-white/60"
      >
        <div className="mb-20 items-center">
          <EduLogo className="w-14 h-10 mb-3" />
          <h1 className="text-[22px] font-bold text-[#0f2744] tracking-tight">EduHub</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Platform Pelajar</p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="button"
          className="eh-btn-google"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span>{isLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}</span>
        </button>

        <p className="mt-5 text-[11px] text-slate-400 text-center leading-relaxed pt-5">
          Dengan masuk, Anda menyetujui penggunaan data profil.
        </p>
      </motion.div>
    </div>
  )
}
