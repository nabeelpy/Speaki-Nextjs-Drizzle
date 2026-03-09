'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

// Language configuration
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', voiceKeywords: ['english', 'en-US', 'en-GB', 'en-AU', 'daniel', 'samantha', 'karen'] },
  { code: 'fr', name: 'French', flag: '🇫🇷', voiceKeywords: ['french', 'fr-FR', 'fr-CA', 'thomas', 'amélie', 'amelie'] },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', voiceKeywords: ['spanish', 'es-ES', 'es-US', 'es-MX', 'mónica', 'monica', 'jorge'] },
  { code: "zh", name: "Chinese", flag: "🇨🇳", voiceKeywords: ["chinese", "mandarin", "zh-CN", "zh-TW", "zh-HK", "ting-ting", "mei-jia", "sin-ji"] },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', voiceKeywords: ['arabic', 'ar-SA', 'ar-EG', 'maged', 'tarik', 'lana'] },
] as const

const STORAGE_KEY = 'selected-language-code'

// Hook to get installed voices
function useInstalledVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [loading, setLoading] = useState(true)

  const loadVoices = () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    const v = window.speechSynthesis?.getVoices() || []
    setVoices(v)
    setLoading(false)
  }

  useEffect(() => {
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)

    const timer = setTimeout(loadVoices, 1000)

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
      clearTimeout(timer)
    }
  }, [])

  return { voices, loading }
}

// Get language status
function getLanguageStatus(lang: typeof LANGUAGES[number], voices: SpeechSynthesisVoice[]) {
  if (!voices.length) return 'unknown'

  const found = voices.some((v) =>
      lang.voiceKeywords.some((kw) =>
          v.lang?.toLowerCase().includes(kw.toLowerCase()) ||
          v.name?.toLowerCase().includes(kw.toLowerCase())
      )
  )

  return found ? 'installed' : 'missing'
}

// Status Badge
function StatusBadge({ status }: { status: 'installed' | 'missing' | 'unknown' }) {
  if (status === 'installed') {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
        <CheckCircle2 size={10} />
        Ready
      </span>
    )
  }

  if (status === 'missing') {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-600 border border-rose-500/30">
        <XCircle size={10} />
        Setup
      </span>
    )
  }

  return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-600 border border-amber-500/30">
      <AlertCircle size={10} />
      Checking
    </span>
  )
}

interface LanguageSelectorProps {
  onLanguageChange?: (langCode: string) => void
  className?: string
}

export default function LanguageSelector({ onLanguageChange, className = '' }: LanguageSelectorProps) {
  const [selectedCode, setSelectedCode] = useState<string>('en')
  const [mounted, setMounted] = useState(false)

  const { voices, loading } = useInstalledVoices()

  useEffect(() => {
    setMounted(true)

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setSelectedCode(saved)
      onLanguageChange?.(saved)
    }
  }, [])

  const handleSelect = (code: string) => {
    setSelectedCode(code)
    localStorage.setItem(STORAGE_KEY, code)
    onLanguageChange?.(code)
  }

  if (!mounted) {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
          {LANGUAGES.map((lang) => (
              <div
                  key={lang.code}
                  className="relative flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 bg-slate-50 animate-pulse"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 mb-2" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
          ))}
        </div>
    )
  }

  return (
      <div className={className}>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 md:text-sm">
            Select Language
          </h3>
        </div>

        {/* MOBILE = horizontal scroll (approx 3.5 items) | DESKTOP = grid */}
        <div className="
        flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory
        md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:snap-none
      ">

          {LANGUAGES.map((lang) => {

            const isSelected = selectedCode === lang.code
            const status = loading ? 'unknown' : getLanguageStatus(lang, voices)

            return (
                <button
                    key={lang.code}
                    disabled={status === 'missing'}
                    onClick={() => status !== 'missing' && handleSelect(lang.code)}
                    className={`
                relative flex flex-col items-center justify-between
                p-3 pb-5
                rounded-xl border-2 transition-all duration-200
${status !== 'installed' ? 'min-w-[33%] sm:min-w-[50%] md:min-w-[200px]' : 'min-w-[26%] md:min-w-0'}
                flex-shrink-0 snap-start h-full
                md:min-w-0
                ${status === 'missing' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}
                ${isSelected
                        ? 'border-[#137fec] bg-[#137fec]/5 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#137fec]/50'
                    }
              `}
                >

                  {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#137fec] flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                  )}

                  {/* mb-auto pushes this text to the top, ensuring space for the button below */}
                  <span className={`mb-auto text-xs font-semibold md:text-sm ${
                      isSelected ? 'text-[#137fec]' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {lang.name}
                  </span>

                  {/* Status indicator */}
                  {status === "missing" ? (
                      <a
                          href="/languages"
                          onClick={(e) => e.stopPropagation()}
                          className="
                            absolute bottom-3 right-3
                            text-[10px] px-2.5 py-1 rounded-full
                            bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm
                            font-medium
                          "
                      >
                        Install
                      </a>
                  ) : (
                      status !== "installed" && (
                          <div className="absolute bottom-3 right-3">
                            <StatusBadge status={status} />
                          </div>
                      )
                  )}

                </button>
            )
          })}

        </div>

      </div>
  )
}

// Hook
export function useSelectedLanguage() {
  const [selectedCode, setSelectedCode] = useState<string>('en')

  useEffect(() => {

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setSelectedCode(saved)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSelectedCode(e.newValue || 'en')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => window.removeEventListener('storage', handleStorageChange)

  }, [])

  const setLanguage = (code: string) => {
    setSelectedCode(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  return { selectedCode, setLanguage, languages: LANGUAGES }
}