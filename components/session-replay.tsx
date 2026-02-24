'use client'

import { useState } from 'react'
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '@/lib/audio-utils'
import type { DebateMessage } from '@/lib/types'

interface SessionReplayProps {
  transcript: DebateMessage[]
  topicTitle: string
  score: number
  onClose: () => void
}

export default function SessionReplay({
  transcript,
  topicTitle,
  score,
  onClose,
}: SessionReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isSupported] = useState(isSpeechSynthesisSupported())

  const playFullSession = async () => {
    if (!isSupported) return

    setIsPlaying(true)

    try {
      for (let i = 0; i < transcript.length; i++) {
        if (!isPlaying) break

        const message = transcript[i]
        setCurrentMessageIndex(i)

        // Add speaker label for clarity
        const speakerLabel =
          message.speaker === 'user' ? 'You said: ' : 'AI said: '
        await speakText(speakerLabel + message.content)

        // Add a small pause between messages
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setIsPlaying(false)
      setCurrentMessageIndex(0)
    } catch (error) {
      console.error('[v0] Error playing session:', error)
      setIsPlaying(false)
    }
  }

  const stopPlayback = () => {
    stopSpeech()
    setIsPlaying(false)
    setCurrentMessageIndex(0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-[#e7edf3] dark:border-slate-800 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">
                Session Replay
              </h2>
              <p className="text-[#4c739a] dark:text-slate-400">
                {topicTitle} | Final Score: {score}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#4c739a] hover:text-[#0d141b] dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Play Controls */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={isPlaying ? stopPlayback : playFullSession}
              disabled={!isSupported}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                isSupported
                  ? isPlaying
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#137fec] text-white hover:bg-[#137fec]/90'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Stop Playback
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play Full Session
                </>
              )}
            </button>
            {!isSupported && (
              <p className="text-sm text-[#4c739a] dark:text-slate-400 self-center">
                Speech synthesis not supported in your browser
              </p>
            )}
          </div>

          {/* Transcript with Progress */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#0d141b] dark:text-white mb-4">
              Full Transcript
            </h3>
            {transcript.map((msg, idx) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg transition-all ${
                  idx === currentMessageIndex && isPlaying
                    ? 'ring-2 ring-[#137fec] bg-[#137fec]/10'
                    : ''
                } ${
                  msg.speaker === 'user'
                    ? 'bg-[#137fec]/10 border-l-4 border-[#137fec]'
                    : 'bg-slate-100 dark:bg-slate-800 border-l-4 border-slate-400'
                }`}
              >
                <p className="font-bold text-[#0d141b] dark:text-white mb-2">
                  {msg.speaker === 'user' ? 'You' : 'AI Opponent'}
                </p>
                <p className="text-[#4c739a] dark:text-slate-400 text-sm">
                  {msg.content}
                </p>
                {idx === currentMessageIndex && isPlaying && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#137fec] font-bold">
                    <div className="w-2 h-2 bg-[#137fec] rounded-full animate-pulse" />
                    Now Playing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-[#e7edf3] dark:border-slate-800 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
