// User related types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

export interface UserProgress {
  userId: string
  totalXp: number
  streak: number
  completedCourses: number
  completedDebates: number
  level: 'A1' | 'A2' | 'B1' | 'B2'
}

// Course types
export interface Course {
  id: string
  title: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  category: string
  thumbnail?: string
  duration: number // in minutes
  lessons: number
  instructor: string
  xpReward: number
  enrollmentCount: number
  rating: number
  ratingCount: number
  isTrending?: boolean
  createdAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  duration: number
  videoUrl?: string
  order: number
  /** Conversation ID for practice (e.g. 'l1', 'l2'). Used for Start link to /lessons/[conversationId]. */
  conversationId?: string
}

// Conversation lesson types
export interface ConversationTurn {
  id: string
  role: string // e.g., "Passenger", "Officer", "Customer", "Waiter"
  text: string // default language (e.g. en-US)
  /** Optional translations: locale code -> text (e.g. 'es-ES' -> '¡Hola! Bienvenido...') */
  textByLang?: Record<string, string>
  /** Optional romanization/transliteration: locale code -> Latin script (e.g. 'ar-SA' -> 'Marhaban...') */
  romanizationByLang?: Record<string, string>
  order: number
}

export interface LessonConversation {
  id: string
  lessonId: string
  title: string
  description: string
  scenario: string // e.g., "Airport Check-in", "Restaurant Order"
  turns: ConversationTurn[]
}

export interface ConversationMessage {
  id: string
  role: string
  content: string
  speaker: 'user' | 'ai'
  timestamp: string
  audioUrl?: string
  turnOrder: number
}

// Debate types
export interface DebateTopic {
  id: string
  title: string
  description: string
  category: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  proArguments: string[]
  conArguments: string[]
  vocabularyTips: string[]
  phrasesSuggested: string[]
  duration: number // in minutes
  difficulty: 'easy' | 'medium' | 'hard'
  participants: number
  rating: number
  isFeatured?: boolean
  createdAt: string
}

export interface DebateSession {
  id: string
  topicId: string
  userId: string
  position: 'pro' | 'con'
  startedAt: string
  endedAt?: string
  duration: number
  transcript: DebateMessage[]
  score: number
  xpEarned: number
  feedback: DebateFeedback[]
}

export interface DebateMessage {
  id: string
  speaker: 'user' | 'ai'
  content: string
  timestamp: string
  duration?: number
}

export interface DebateFeedback {
  id: string
  category: 'pronunciation' | 'grammar' | 'vocabulary' | 'fluency'
  feedback: string
  severity: 'info' | 'warning' | 'error'
}

// Engagement types
export interface UserCourse {
  id: string
  userId: string
  courseId: string
  progress: number // 0-100
  completedAt?: string
  enrolledAt: string
}

export interface UserDebateVote {
  userId: string
  topicId: string
  liked: boolean
}
