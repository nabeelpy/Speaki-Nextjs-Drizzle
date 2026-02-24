'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceRecorder, TextToSpeech, generateSpeakingFeedback } from '@/lib/voice-recorder'
import type { DebateTopic, DebateMessage } from '@/lib/types'

interface AudioDebateInterfaceProps {
  topic: DebateTopic
  onComplete: (transcript: DebateMessage[]) => void
}

interface TranscriptItem extends DebateMessage {
  audioUrl?: string
  feedback?: {
    score: number
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  }
}

const AI_RESPONSES = [
  "Social media has revolutionized how we communicate. It connects billions of people instantaneously.",
  "That's an interesting point. However, we must consider the mental health impacts of constant connectivity.",
  "You are doing good Zahid,I agree that connection is valuable, but excessive use leads to addiction and decreased attention spans.",
  "The algorithm-driven content creates echo chambers that polarize society further.",
  "Despite your argument, the benefits of awareness and social movements cannot be ignored.",
]

export default function AudioDebateInterface({ topic, onComplete }: AudioDebateInterfaceProps) {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<TranscriptItem['feedback'] | null>(null)
  const [debateEnded, setDebateEnded] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionAudio, setSessionAudio] = useState<Blob | null>(null)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [combinedAudioUrl, setCombinedAudioUrl] = useState<string | null>(null)
  const [isPlayingCombined, setIsPlayingCombined] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder())
  const textToSpeechRef = useRef<TextToSpeech>(new TextToSpeech())
  const sessionAudioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartRef = useRef<Date | null>(null)
  const combinedAudioRef = useRef<HTMLAudioElement | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const roundCount = Math.floor(transcript.length / 2) + 1

  // Start timer when component mounts
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Play initial topic prompt
  useEffect(() => {
    const initializeDebate = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      playAIMessage(topic.title)
    }

    initializeDebate()
  }, [topic])

  const playAIMessage = (message: string) => {
    setIsListening(true)
    textToSpeechRef.current.speak(message, () => {
      setIsListening(false)
    })
  }

  const startRecording = async () => {
    try {
      setIsRecording(true)
      setIsProcessing(false)
      setLiveTranscript('')
      recordingStartRef.current = new Date()

      // Set up live transcription callback
      voiceRecorderRef.current.onTranscriptUpdate = (transcript) => {
        setLiveTranscript(transcript)
      }

      await voiceRecorderRef.current.startRecording()
    } catch (error) {
      setIsRecording(false)
      alert('Microphone access denied. Please allow microphone permissions and try again.')
    }
  }

  const stopRecording = async () => {
    try {
      setIsProcessing(true)
      const audioBlob = await voiceRecorderRef.current.stopRecording()
      setIsRecording(false)

      // Use live transcription or fallback to default
      const userText = liveTranscript.trim() || `I think that's an important point to consider. Let me add that this affects many aspects of our daily lives.`

      // Create audio URL for playback
      const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)

      // Add user message to transcript
      const userMessage: TranscriptItem = {
        id: `msg-${Date.now()}`,
        speaker: 'user',
        content: userText,
        audioUrl: audioUrl,
        timestamp: new Date().toISOString(),
      }

      // Generate feedback
      const feedback = generateSpeakingFeedback(userText, [
        'social',
        'media',
        'important',
        'impact',
        'communication',
      ])
      userMessage.feedback = feedback

      setTranscript((prev) => [...prev, userMessage])
      setCurrentFeedback(feedback)

      // Delay before AI response
      setTimeout(() => {
        const aiResponse = AI_RESPONSES[roundCount % AI_RESPONSES.length]
        addAIResponse(aiResponse)
        setIsProcessing(false) // Reset processing state after AI responds
      }, 1500)
    } catch (error) {
      setIsProcessing(false)
      console.error('[v0] Error processing audio:', error)
    }
  }

  const addAIResponse = (message: string) => {
    const aiMessage: TranscriptItem = {
      id: `msg-${Date.now()}`,
      speaker: 'ai',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setTranscript((prev) => [...prev, aiMessage])
    setCurrentFeedback(null)

    // Play AI response
    playAIMessage(message)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playSequentialAudio = async () => {
    setIsPlayingCombined(true)
    setPlaybackProgress(0)

    for (let i = 0; i < transcript.length; i++) {
      const msg = transcript[i]
      const progress = ((i + 1) / transcript.length) * 100
      setPlaybackProgress(progress)

      if (msg.speaker === 'user' && msg.audioUrl) {
        // Play user audio
        await new Promise<void>((resolve) => {
          const audio = new Audio(msg.audioUrl)
          audio.onended = () => resolve()
          audio.onerror = () => resolve() // Skip if error
          audio.play()
        })
      } else if (msg.speaker === 'ai') {
        // Play AI text-to-speech
        await new Promise<void>((resolve) => {
          textToSpeechRef.current.speak(msg.content, () => resolve())
        })
      }

      // Small pause between messages
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsPlayingCombined(false)
    setPlaybackProgress(100)
  }

  const stopCombinedAudio = () => {
    textToSpeechRef.current.stop()
    setIsPlayingCombined(false)
    setPlaybackProgress(0)
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
    }
  }

  const endDebate = async () => {
    textToSpeechRef.current.stop()
    setDebateEnded(true)
    // Don't call onComplete here - let user view results first
  }

  if (debateEnded) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 text-center mb-6">
          <h2 className="text-3xl font-bold mb-4">Debate Complete!</h2>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-4xl font-bold">
                {Math.round(
                  transcript
                    .filter((m) => m.feedback)
                    .reduce((sum, m) => sum + (m.feedback?.score || 0), 0) /
                  Math.max(transcript.filter((m) => m.feedback).length, 1),
                )}
              </p>
              <p className="text-green-100">Average Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{formatTime(elapsedTime)}</p>
              <p className="text-green-100">Total Time</p>
            </div>
          </div>
        </div>

        {/* Session Audio Replay Component */}
        <div className="bg-white dark:bg-slate-900 border-2 border-[#137fec]/30 dark:border-[#137fec]/50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#137fec]/10 dark:bg-[#137fec]/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-[#137fec]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">
                Combined Debate Audio
              </h3>
              <p className="text-sm text-[#4c739a] dark:text-slate-400">
                {transcript.length} total messages ({transcript.filter(m => m.speaker === 'user').length} user + {transcript.filter(m => m.speaker === 'ai').length} AI)
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-6 mb-4 border border-blue-200 dark:border-slate-700">
            <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-4">
              🎧 Listen to your complete debate session with all AI and user responses played sequentially in order.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={isPlayingCombined ? stopCombinedAudio : playSequentialAudio}
                  disabled={transcript.length === 0}
                  className="bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-[#137fec]/20"
                >
                  {isPlayingCombined ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      Stop Playback
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play Complete Debate
                    </>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-[#0d141b] dark:text-white">
                      {isPlayingCombined ? 'Playing...' : 'Ready to play'}
                    </p>
                    <p className="text-xs font-bold text-[#137fec]">
                      {Math.round(playbackProgress)}%
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#137fec] to-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {isPlayingCombined && (
                <div className="flex items-center gap-2 text-sm text-[#137fec] animate-pulse">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  <span className="font-medium">Playing combined audio...</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[#0d141b] dark:text-white">Transcript:</h4>
            {transcript.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${msg.speaker === 'user'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 mb-1">
                  {msg.speaker === 'user' ? 'Your Response' : 'AI Response'}
                </p>
                <p className="text-sm text-[#0d141b] dark:text-white">{msg.content}</p>
                {msg.audioUrl && (
                  <audio
                    controls
                    className="w-full h-6 text-xs"
                    src={msg.audioUrl}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back to Topics Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => onComplete(transcript)}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">
            {topic.title}
          </h2>
          <p className="text-[#4c739a] dark:text-slate-400">Round {roundCount}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#137fec]">{formatTime(elapsedTime)}</p>
          <p className="text-xs text-[#4c739a] dark:text-slate-400">Elapsed time</p>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {transcript.map((msg, idx) => (
            <div key={msg.id} className="space-y-2">
              <div className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-2xl p-4 rounded-lg ${msg.speaker === 'user'
                    ? 'bg-[#137fec] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white'
                    }`}
                >
                  <p className="text-sm font-bold mb-2">
                    {msg.speaker === 'user' ? 'You' : 'AI Opponent'}
                  </p>
                  <p className="text-sm mb-3">{msg.content}</p>
                  {msg.audioUrl && (
                    <audio
                      controls
                      className="w-full h-6 text-xs"
                      src={msg.audioUrl}
                    />
                  )}
                </div>
              </div>

              {msg.feedback && (
                <div className="ml-auto max-w-2xl bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-[#137fec]">Speech Analysis</p>
                    <p className="text-2xl font-bold text-[#137fec]">{msg.feedback.score}%</p>
                  </div>

                  {msg.feedback.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">
                        Strengths:
                      </p>
                      <ul className="text-xs text-[#4c739a] dark:text-slate-400 space-y-1">
                        {msg.feedback.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.feedback.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                        Suggestions:
                      </p>
                      <ul className="text-xs text-[#4c739a] dark:text-slate-400 space-y-1">
                        {msg.feedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-0.5">→</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Voice Input Controls */}
      <div className="bg-gradient-to-r from-[#137fec]/10 to-blue-500/10 dark:from-[#137fec]/20 dark:to-blue-500/20 border border-[#137fec]/30 dark:border-[#137fec]/50 rounded-lg p-8 text-center">
        {isListening && (
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#137fec] rounded-full animate-pulse"
                    style={{
                      height: `${20 + i * 10}px`,
                      animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[#137fec] font-semibold">Listening...</p>
          </div>
        )}

        {isRecording && (
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#137fec] border-t-red-500 animate-spin" />
            </div>
            <p className="text-[#0d141b] dark:text-white font-semibold mb-3">Recording your response...</p>

            {liveTranscript && (
              <div className="bg-white dark:bg-slate-800 border border-[#137fec]/30 rounded-lg p-4 mb-4 text-left">
                <p className="text-xs font-bold text-[#137fec] mb-2">Live Transcription:</p>
                <p className="text-sm text-[#0d141b] dark:text-white italic">
                  {liveTranscript}
                </p>
              </div>
            )}

            <p className="text-[#4c739a] dark:text-slate-400 text-sm">
              Click stop when you're done speaking
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-6">
            <p className="text-[#137fec] font-semibold">Processing your speech...</p>
          </div>
        )}

        {!isRecording && !isListening && !isProcessing && (
          <div>
            <p className="text-[#0d141b] dark:text-white font-semibold mb-6">
              Ready to respond?
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isListening || isProcessing}
              className="bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C6.48 1 2 5.48 2 11v8c0 .55.45 1 1 1h2v-6h-2v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-2v6h2v-8c0-5.52-4.48-10-10-10z" />
              </svg>
              Start Speaking
            </button>
          ) : (
            <button
              onClick={stopRecording}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h12v12H6z" />
              </svg>
              Stop Recording
            </button>
          )}

          {transcript.length > 0 && !isRecording && !isProcessing && (
            <button
              onClick={endDebate}
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all"
            >
              End Debate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
