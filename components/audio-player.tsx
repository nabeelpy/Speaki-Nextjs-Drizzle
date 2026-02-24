'use client'

import { useState, useEffect, useRef } from 'react'
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '@/lib/audio-utils'

interface AudioPlayerProps {
  text: string
  speaker: 'user' | 'ai'
  autoPlay?: boolean
}

export default function AudioPlayer({
  text,
  speaker,
  autoPlay = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setIsSupported(isSpeechSynthesisSupported())
  }, [])

  const togglePlayback = async () => {
    if (!isSupported) return

    if (isPlaying) {
      stopSpeech()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      try {
        await speakText(text)
        setIsPlaying(false)
      } catch (error) {
        console.error('[v0] Error playing audio:', error)
        setIsPlaying(false)
      }
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={togglePlayback}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isPlaying
          ? 'bg-[#137fec] text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-[#137fec] hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
      title={isPlaying ? 'Stop' : 'Play audio'}
    >
      {isPlaying ? (
        <>
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <span className="text-xs font-bold">Playing...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-xs font-bold">Listen</span>
        </>
      )}
    </button>
  )
}
