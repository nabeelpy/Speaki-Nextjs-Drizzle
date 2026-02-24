// Voice Recording and Speech Recognition Utility

import { findVoiceForAgent, findAnyVoiceForLang, type VoiceAgent } from './voice-config'

export interface VoiceChunk {
  audio: Blob
  transcript: string
  duration: number
  timestamp: number
}

export interface SpeechOptions {
  lang?: string
  voice?: SpeechSynthesisVoice | null
  /** Voice agent: resolved to browser voice via findVoiceForAgent when voices are provided */
  voiceAgent?: VoiceAgent | null
  onEnd?: () => void
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private chunks: BlobPart[] = []
  private startTime: number = 0
  private speechRecognition: any = null
  private speechLang: string = 'en-US'
  public onTranscriptUpdate?: (transcript: string) => void

  setLanguage(lang: string): void {
    this.speechLang = lang || 'en-US'
  }

  getLanguage(): string {
    return this.speechLang
  }

  async startRecording(): Promise<void> {
    try {
      // Request audio with noise suppression and echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      })
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.mediaRecorder = new MediaRecorder(stream)
      this.chunks = []
      this.startTime = Date.now()

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.chunks.push(event.data)
      }

      this.mediaRecorder.start()

      // Start live speech recognition
      this.initLiveSpeechRecognition()
    } catch (error) {
      console.error('[v0] Error accessing microphone:', error)
      throw new Error('Microphone access denied. Please allow microphone permissions.')
    }
  }

  private initLiveSpeechRecognition(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) {
      console.warn('[v0] Speech Recognition API not available')
      return
    }

    this.speechRecognition = new SpeechRecognition()
    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = true
    this.speechRecognition.lang = this.speechLang

    let fullTranscript = ''

    this.speechRecognition.onresult = (event: any) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          fullTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(fullTranscript + interimTranscript)
      }
    }

    this.speechRecognition.onerror = (event: any) => {
      console.error('[v0] Speech recognition error:', event.error)
    }

    this.speechRecognition.start()
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/wav' })
        resolve(audioBlob)
        this.cleanup()
      }

      this.mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording error: ${event.error}`))
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      this.mediaRecorder = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    if (this.speechRecognition) {
      this.speechRecognition.stop()
      this.speechRecognition = null
    }
    this.chunks = []
  }

  static async transcribeAudio(audioBlob: Blob, lang: string = 'en-US'): Promise<string> {
    // Simulated transcription - in production, use Web Speech API or server-side transcription
    return new Promise((resolve) => {
      const recognition = new ((window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition)() as any

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = lang

      let transcript = ''

      recognition.onstart = () => {
        console.log('[v0] Speech recognition started')
      }

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' '
        }
      }

      recognition.onerror = (event) => {
        console.error('[v0] Speech recognition error:', event.error)
        resolve(transcript || 'Unable to transcribe audio')
      }

      recognition.onend = () => {
        resolve(transcript.trim() || 'Could not understand speech')
      }

      // Create audio URL from blob and use Web Audio API for speech recognition
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      // Note: Web Speech API works with live microphone input, not pre-recorded audio
      // For pre-recorded audio, we'd need a backend service
      // For now, we'll use a simulated response
      setTimeout(() => {
        resolve('Sample transcription of your spoken response')
      }, 500)
    })
  }

  static createAudioUrl(blob: Blob): string {
    return URL.createObjectURL(blob)
  }
}

export class TextToSpeech {
  private synth = typeof window !== 'undefined' ? window.speechSynthesis : (null as unknown as SpeechSynthesis)
  private utterance: SpeechSynthesisUtterance | null = null
  private browserVoices: SpeechSynthesisVoice[] = []

  /** Call once (e.g. on mount) to cache browser voices for resolving voice agents. */
  setBrowserVoices(voices: SpeechSynthesisVoice[]): void {
    this.browserVoices = voices
  }

  speak(text: string, options?: SpeechOptions | (() => void)): void {
    const opts: SpeechOptions =
      typeof options === 'function' ? { onEnd: options } : options || {}

    if (!this.synth) return

    this.synth.cancel()

    this.utterance = new SpeechSynthesisUtterance(text)
    this.utterance.rate = 0.9
    this.utterance.pitch = 1
    this.utterance.volume = 1

    if (opts.lang) this.utterance.lang = opts.lang

    if (opts.voice) {
      this.utterance.voice = opts.voice
    } else if (opts.voiceAgent && this.browserVoices.length > 0) {
      const resolved = findVoiceForAgent(opts.voiceAgent, this.browserVoices)
      if (resolved) this.utterance.voice = resolved
    }

    // Fallback: if no voice set but we have a lang, use any available voice for that language
    // (e.g. Arabic) so TTS actually speaks in the requested language
    if (!this.utterance.voice && opts.lang && this.browserVoices.length > 0) {
      const fallback = findAnyVoiceForLang(this.browserVoices, opts.lang)
      if (fallback) this.utterance.voice = fallback
    }

    if (opts.onEnd) this.utterance.onend = opts.onEnd

    this.synth.speak(this.utterance)
  }

  stop(): void {
    if (this.synth) this.synth.cancel()
    this.utterance = null
  }

  isPlaying(): boolean {
    return this.synth ? this.synth.speaking : false
  }
}

// Simulated feedback generator based on user response
export function generateSpeakingFeedback(
  userResponse: string,
  expectedVocabulary: string[],
): {
  score: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
} {
  const userWords = userResponse.toLowerCase().split(/\s+/)
  const expectedWords = expectedVocabulary.map((w) => w.toLowerCase())

  const matchedWords = userWords.filter((word) =>
    expectedWords.some((expected) => expected.includes(word) || word.includes(expected)),
  )

  const score = Math.round((matchedWords.length / expectedWords.length) * 100)

  const strengths: string[] = []
  const improvements: string[] = []
  const suggestions: string[] = []

  if (userResponse.length > 20) {
    strengths.push('Good response length - you provided detailed information')
  } else {
    improvements.push('Try to provide longer, more detailed responses')
    suggestions.push('Add more phrases to express your opinion more fully')
  }

  if (/[!?.]/.test(userResponse)) {
    strengths.push('Good use of punctuation in transcription')
  }

  const formalWords = ['furthermore', 'therefore', 'moreover', 'in my opinion']
  const hasFormalLanguage = formalWords.some((word) => userResponse.toLowerCase().includes(word))

  if (hasFormalLanguage) {
    strengths.push('Excellent use of formal debate language')
  } else {
    improvements.push('Use more formal debate phrases')
    suggestions.push('Try using: "Furthermore...", "In my opinion...", "Therefore..."')
  }

  const fillerWords = ['uh', 'um', 'like', 'you know']
  const hasFillerWords = fillerWords.some((word) => userResponse.toLowerCase().includes(word))

  if (hasFillerWords) {
    improvements.push('Minimize filler words for more professional speech')
    suggestions.push('Replace fillers with brief pauses or thoughtful silence')
  } else {
    strengths.push('No filler words detected - clear and confident speech')
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    strengths,
    improvements,
    suggestions,
  }
}
