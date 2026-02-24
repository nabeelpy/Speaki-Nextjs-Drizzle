'use client'

import { useState, useRef, useEffect } from 'react'
import { TextToSpeech } from '@/lib/voice-recorder'
import type { DebateMessage } from '@/lib/types'

interface SessionAudioReplayProps {
  transcript: (DebateMessage & { audioUrl?: string; feedback?: any })[]
}

export default function SessionAudioReplay({ transcript }: SessionAudioReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const ttsRef = useRef(new TextToSpeech())
  const audioRef = useRef<HTMLAudioElement>(null)

  const totalDuration = Math.ceil(transcript.length * 3) // Estimate 3 seconds per message

  const playFullSession = async () => {
    setIsPlaying(true)
    setCurrentIndex(0)

    for (let i = 0; i < transcript.length; i++) {
      if (!isPlaying) break

      const msg = transcript[i]
      setCurrentIndex(i)

      // Announce speaker
      const speakerAnnouncement = msg.speaker === 'user' ? 'Your turn:' : 'AI response:'
      ttsRef.current.speak(speakerAnnouncement)

      // Wait for speaker announcement
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Play the actual message
      if (msg.audioUrl) {
        // Play recorded user audio
        await playAudio(msg.audioUrl)
      } else {
        // Play AI text as speech
        await new Promise((resolve) => {
          ttsRef.current.speak(msg.content, () => resolve(null))
        })
      }

      // Add pause between messages
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsPlaying(false)
  }

  const playAudio = (audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl)
      audio.onended = () => resolve()
      audio.play()
    })
  }

  const stopPlayback = () => {
    setIsPlaying(false)
    ttsRef.current.stop()
  }

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setPlaybackTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">
        Session Replay
      </h3>

      <div className="bg-gradient-to-r from-[#137fec]/10 to-blue-500/10 dark:from-[#137fec]/20 dark:to-blue-500/20 border border-[#137fec]/30 rounded-lg p-6 mb-6">
        {/* Playback Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {!isPlaying ? (
              <button
                onClick={playFullSession}
                className="bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Full Session
              </button>
            ) : (
              <button
                onClick={stopPlayback}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
                Stop
              </button>
            )}
            <span className="text-[#4c739a] dark:text-slate-400 font-medium">
              {formatTime(playbackTime)} / {formatTime(totalDuration)}
            </span>
          </div>
          <span className="text-sm text-[#4c739a] dark:text-slate-400">
            Message {currentIndex + 1} of {transcript.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#137fec] h-full transition-all"
            style={{ width: `${(currentIndex / transcript.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Transcript with Audio Indicators */}
      <div className="space-y-4">
        {transcript.map((msg, idx) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              isPlaying && currentIndex === idx
                ? 'border-[#137fec] bg-[#137fec]/5'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0d141b] dark:text-white mb-1">
                  {msg.speaker === 'user' ? '🎤 Your Response' : '🤖 AI Response'}
                </p>
                <p className="text-sm text-[#4c739a] dark:text-slate-400">{msg.content}</p>
              </div>
              {msg.audioUrl && msg.speaker === 'user' && (
                <audio controls className="h-8 text-xs" src={msg.audioUrl} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Download Option */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Export Session
        </button>
      </div>
    </div>
  )
}
