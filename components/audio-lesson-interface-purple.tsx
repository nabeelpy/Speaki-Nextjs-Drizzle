'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceRecorder, TextToSpeech } from '@/lib/voice-recorder'
import type { LessonConversation, ConversationMessage, ConversationTurn } from '@/lib/types'
import { LANGUAGE_LABELS, loadBrowserVoices } from '@/lib/voice-config'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Settings, Mic, Square, Play, StopCircle, ChevronLeft } from 'lucide-react'

interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordDelaySeconds?: number
}

const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger', 'user', 'you', 'student', 'customer', 'learner', 'friend']
const AI_ROLE_ALIASES   = ['officer', 'ai', 'agent', 'system', 'teacher', 'assistant', 'me']

function getTurnText(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn) return ''
    const byLang = turn.textByLang
    if (!byLang) return turn.text
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find(k => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return turn.text
}

function getRomanization(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn?.romanizationByLang) return ''
    const byLang = turn.romanizationByLang
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find(k => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return ''
}

function normalizeRole(r?: string) { return (r ?? '').trim().toLowerCase() }
function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}
function cleanVoiceName(n: string) {
    return n
        .replace(/Microsoft\s*/gi, '').replace(/Google\s*/gi, '').replace(/Apple\s*/gi, '')
        .replace(/Online\s*\(Natural\)\s*/gi, '').replace(/\(.*?\)/g, '').trim()
}

/* ─── STYLES ─────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.lx {
  --v-50:  #F5F3FF;
  --v-100: #EDE9FE;
  --v-200: #DDD6FE;
  --v-300: #C4B5FD;
  --v-400: #A78BFA;
  --v-500: #8B5CF6;
  --v-600: #7C3AED;
  --v-700: #6D28D9;
  --v-800: #5B21B6;
  --v-900: #4C1D95;

  --red-50:  #FEF2F2;
  --red-400: #F87171;
  --red-500: #EF4444;
  --red-600: #DC2626;

  --green-50:  #F0FDF4;
  --green-600: #16A34A;

  --bg:      var(--v-50);
  --surface: #FFFFFF;
  --border:  var(--v-100);
  --text:    #1E1B4B;
  --text-2:  #3B0764;

  --shadow-xs:       0 1px 2px rgba(91,33,182,.05);
  --shadow-sm:       0 1px 4px rgba(91,33,182,.07), 0 3px 10px rgba(91,33,182,.04);
  --shadow-brand:    0 4px 20px rgba(109,40,217,.35), 0 1px 4px rgba(109,40,217,.20);
  --shadow-brand-lg: 0 8px 28px rgba(109,40,217,.42), 0 2px 8px rgba(109,40,217,.22);

  --r-xs:  8px;
  --r-sm:  10px;
  --r-md:  14px;
  --r-lg:  18px;
  --r-xl:  22px;
  --r-2xl: 28px;

  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  background: var(--bg);
}

@media (max-width: 767px) {
  .lx { position: fixed; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
  .lx-desktop { display: none !important; }
  .lx-mobile  { display: flex !important; flex: 1 1 0; min-height: 0; flex-direction: column; }
}
@media (min-width: 768px) {
  .lx { background: transparent; width: 100%; }
  .lx-mobile  { display: none !important; }
  .lx-desktop { display: grid !important; }
}

/* ── Header ── */
.lx-header {
  background: linear-gradient(155deg, var(--v-700) 0%, var(--v-800) 40%, var(--v-900) 100%);
  padding: 16px 18px 20px; flex-shrink: 0;
  position: relative; overflow: hidden;
}
.lx-header-orb1 {
  position: absolute; top: -50px; right: -40px; width: 150px; height: 150px;
  border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,.22) 0%, transparent 65%);
  pointer-events: none;
}
.lx-header-orb2 {
  position: absolute; bottom: -30px; left: 20px; width: 100px; height: 100px;
  border-radius: 50%; background: radial-gradient(circle, rgba(196,181,253,.12) 0%, transparent 65%);
  pointer-events: none;
}
.lx-header-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; position: relative; z-index: 1;
}
.lx-hbtn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.15); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white;
  transition: background .15s;
}
.lx-hbtn:hover { background: rgba(255,255,255,.22); }
.lx-hcenter { text-align: center; position: relative; z-index: 1; }
.lx-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase; color: rgba(221,214,254,.75); margin-bottom: 4px;
}
.lx-htitle {
  font-size: 19px; font-weight: 800; color: white;
  letter-spacing: -.025em; line-height: 1.2;
}
.lx-htimer {
  font-size: 11px; font-weight: 600; color: rgba(221,214,254,.65);
  font-family: 'DM Mono', monospace; margin-top: 2px;
}
.lx-prog-wrap { position: relative; z-index: 1; }
.lx-prog-track { height: 3px; background: rgba(255,255,255,.18); border-radius: 99px; overflow: hidden; margin-bottom: 5px; }
.lx-prog-fill  { height: 100%; background: rgba(255,255,255,.80); border-radius: 99px; transition: width .5s cubic-bezier(.4,0,.2,1); }
.lx-prog-meta  { display: flex; justify-content: space-between; }
.lx-prog-txt   { font-size: 10px; color: rgba(221,214,254,.65); font-weight: 500; }

/* ── Pinned zone ── */
.lx-pinned {
  flex-shrink: 0; background: var(--v-50);
  padding: 14px 16px 10px;
  display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid var(--border);
}
.lx-pin-role {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--v-600); margin-bottom: 6px;
}
.lx-pin-bubble {
  background: white; color: var(--text);
  border-radius: 18px 18px 18px 4px;
  padding: 13px 16px; font-size: 14px; line-height: 1.65; font-weight: 400;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border);
}
.lx-pin-bubble.speaking { border: 1.5px dashed var(--v-200); background: #FDFCFF; }

/* ── Your line card ── */
.lx-say-card {
  background: linear-gradient(145deg, var(--v-100), var(--v-50));
  border: 1.5px solid var(--v-300); border-radius: var(--r-xl);
  padding: 13px 15px; position: relative; overflow: hidden;
}
.lx-say-glow {
  position: absolute; top: -25px; right: -25px; width: 80px; height: 80px;
  border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,.10) 0%, transparent 65%);
  pointer-events: none;
}
.lx-say-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
.lx-say-badge {
  width: 20px; height: 20px; border-radius: 6px;
  background: linear-gradient(135deg, var(--v-600), var(--v-800));
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 9px; font-weight: 800; flex-shrink: 0;
}
.lx-say-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--v-700); }
.lx-say-text  { font-size: 14.5px; font-weight: 600; color: var(--text-2); line-height: 1.58; letter-spacing: -.01em; position: relative; z-index: 1; }
.lx-say-rom   { font-size: 11.5px; color: var(--v-600); margin-top: 6px; font-style: italic; position: relative; z-index: 1; line-height: 1.45; }
.lx-say-en    { font-size: 11.5px; color: var(--v-400); margin-top: 7px; padding-top: 7px; border-top: 1px solid var(--v-200); position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 5px; line-height: 1.4; }

/* ── Timer card ── */
.lx-timer-card { background: white; border: 1px solid var(--border); border-radius: var(--r-lg); padding: 13px 15px; box-shadow: var(--shadow-xs); }
.lx-timer-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
.lx-timer-rec-lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--v-400); display: flex; align-items: center; gap: 6px; }
.lx-timer-dot  { width: 5px; height: 5px; border-radius: 50%; background: var(--v-700); animation: lxBlink .9s ease-in-out infinite; }
.lx-timer-cd   { font-size: 12px; font-weight: 600; color: var(--v-700); font-family: 'DM Mono', monospace; }
.lx-timer-cd.urgent { color: var(--red-600); }
.lx-timer-bar  { height: 5px; background: var(--v-50); border-radius: 99px; overflow: hidden; margin-bottom: 9px; }
.lx-timer-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--v-700), var(--v-400)); transition: width .5s linear; }
.lx-timer-fill.urgent { background: linear-gradient(90deg, var(--red-500), var(--red-400)); }
.lx-live-tx {
  padding: 9px 12px; background: var(--v-50); border-radius: var(--r-xs);
  font-size: 12.5px; color: var(--v-700); font-style: italic;
  line-height: 1.5; border: 1px solid var(--border);
}

/* ── History scroll ── */
.lx-history {
  flex: 1 1 0; min-height: 0; overflow-y: auto;
  padding: 12px 16px 8px; display: flex; flex-direction: column; gap: 14px;
  scrollbar-width: none; background: var(--v-50);
}
.lx-history::-webkit-scrollbar { display: none; }
.lx-hist-divider { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.lx-hist-line    { flex: 1; height: 1px; background: var(--v-100); }
.lx-hist-txt     { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--v-300); white-space: nowrap; }

/* ── Chat bubbles ── */
.lx-bw { display: flex; flex-direction: column; max-width: 86%; }
.lx-bw.ai   { align-self: flex-start; }
.lx-bw.user { align-self: flex-end; }
.lx-brole   { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 5px; padding: 0 3px; }
.lx-bw.ai   .lx-brole { color: var(--v-500); }
.lx-bw.user .lx-brole { color: var(--v-700); text-align: right; }
.lx-bubble { padding: 12px 15px; font-size: 13.5px; line-height: 1.62; font-weight: 400; }
.lx-bubble.ai   { background: white; color: var(--text); border-radius: 18px 18px 18px 4px; border: 1px solid var(--border); box-shadow: 0 1px 6px rgba(91,33,182,.06); }
.lx-bubble.user { background: linear-gradient(135deg, var(--v-600), var(--v-800)); color: white; border-radius: 18px 18px 4px 18px; box-shadow: 0 3px 14px rgba(109,40,217,.30); }
.lx-brom { font-size: 11.5px; font-style: italic; opacity: .55; margin-top: 5px; line-height: 1.4; }
.lx-ben  { font-size: 11.5px; opacity: .50; margin-top: 4px; line-height: 1.4; }
.lx-ghost {
  align-self: flex-end; max-width: 86%;
  padding: 11px 16px; font-size: 13.5px; color: var(--v-400); font-style: italic;
  background: rgba(237,233,254,.55); border-radius: 18px 18px 4px 18px;
  border: 1.5px dashed var(--v-300);
}

/* ── Bottom controls ── */
.lx-bottom {
  flex-shrink: 0; background: white; border-top: 1px solid var(--border);
  padding: 14px 22px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.lx-tx-hint   { font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--v-600); text-align: center; min-height: 16px; }
.lx-ctrl-row  { display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; }
.lx-side-btn  { width: 44px; height: 44px; border-radius: 50%; background: var(--v-50); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--v-400); transition: background .15s, color .15s; }
.lx-side-btn:hover { background: var(--v-100); color: var(--v-600); }
.lx-mic-btn   { width: 68px; height: 68px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; -webkit-tap-highlight-color: transparent; transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .15s; }
.lx-mic-btn.start { background: linear-gradient(145deg, var(--v-600), var(--v-800)); box-shadow: var(--shadow-brand); color: white; }
.lx-mic-btn.start:hover  { transform: scale(1.06); box-shadow: var(--shadow-brand-lg); }
.lx-mic-btn.start:active { transform: scale(0.94); }
.lx-mic-btn.stop  { background: linear-gradient(145deg, var(--v-600), var(--v-900)); box-shadow: var(--shadow-brand); color: white; }
.lx-mic-btn.stop:hover   { transform: scale(1.06); box-shadow: var(--shadow-brand-lg); }
.lx-mic-btn.stop:active  { transform: scale(0.94); }
.lx-mic-btn.countdown { background: linear-gradient(145deg, var(--v-500), var(--v-700)); box-shadow: 0 5px 22px rgba(109,40,217,.40); color: white; }
.lx-ring1 { position: absolute; inset: -10px; border-radius: 50%; border: 1.5px solid rgba(124,58,237,.22); animation: lxRipple 1.8s ease-out infinite; pointer-events: none; }
.lx-ring2 { position: absolute; inset: -22px; border-radius: 50%; border: 1px solid rgba(124,58,237,.10); animation: lxRipple 1.8s ease-out .6s infinite; pointer-events: none; }
@keyframes lxRipple { 0%{transform:scale(.82);opacity:.8} 100%{transform:scale(1.45);opacity:0} }
.lx-cd-num  { font-size: 26px; font-weight: 800; color: white; font-family: 'DM Mono', monospace; line-height: 1; }
.lx-hint-txt { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--v-300); }

/* ── Wave bars ── */
.lx-wave { display: flex; align-items: center; gap: 3.5px; }
.lx-wave-bar { width: 4px; border-radius: 99px; background: linear-gradient(180deg, var(--v-400), var(--v-700)); animation: lxWave var(--dur) ease-in-out var(--delay) infinite alternate; transform-origin: center; }
@keyframes lxWave { from{transform:scaleY(.1);opacity:.35} to{transform:scaleY(1);opacity:1} }

/* ── Bounce dots ── */
.lx-dot-bounce { border-radius: 50%; background: linear-gradient(135deg, var(--v-400), var(--v-700)); animation: lxBounce .8s ease-in-out var(--delay) infinite; }
@keyframes lxBounce { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-8px);opacity:1} }
@keyframes lxBlink  { 0%,100%{opacity:1} 50%{opacity:.10} }

/* ── Status pill ── */
.lx-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; border: 1px solid transparent; }
.lx-pill.idle  { background: var(--v-50);   color: var(--v-400); border-color: var(--v-200); }
.lx-pill.speak { background: var(--v-100);  color: var(--v-700); border-color: var(--v-300); }
.lx-pill.rec   { background: var(--red-50); color: var(--red-600); border-color: #FCA5A5; }
.lx-pill.proc  { background: var(--green-50); color: var(--green-600); border-color: #86EFAC; }
.lx-pill.count { background: #FFFBEB; color: #D97706; border-color: #FCD34D; }
.lx-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.lx-pill.rec .lx-dot   { animation: lxBlink .9s ease-in-out infinite; }
.lx-pill.speak .lx-dot { animation: lxPulse 1.4s ease-in-out infinite; }
@keyframes lxPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.9);opacity:.2} }

/* ── Desktop ── */
.lx-desktop { grid-template-columns: 280px 1fr; gap: 20px; align-items: start; width: 100%; }
.lx-sidebar { display: flex; flex-direction: column; gap: 12px; }
.lx-panel { background: white; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 20px; box-shadow: var(--shadow-sm); }
.lx-panel-title { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--v-400); margin-bottom: 14px; }
.lx-session-name { font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.4; margin-bottom: 3px; letter-spacing: -.01em; }
.lx-session-meta { font-size: 12px; color: var(--v-400); margin-bottom: 14px; }
.lx-desk-prog-track { height: 4px; background: var(--v-100); border-radius: 99px; overflow: hidden; }
.lx-desk-prog-fill  { height: 100%; background: linear-gradient(90deg, var(--v-600), var(--v-400)); border-radius: 99px; transition: width .5s cubic-bezier(.4,0,.2,1); }
.lx-divider { height: 1px; background: var(--border); margin: 16px 0; }
.lx-desk-timer     { font-size: 34px; font-weight: 800; color: var(--v-700); font-family: 'DM Mono', monospace; letter-spacing: -.04em; line-height: 1; margin-bottom: 3px; }
.lx-desk-timer-lbl { font-size: 10px; color: var(--v-400); letter-spacing: .07em; text-transform: uppercase; font-weight: 500; }
.lx-chat { background: white; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 16px; max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm); scrollbar-width: thin; scrollbar-color: var(--v-200) transparent; }
.lx-chat::-webkit-scrollbar { width: 3px; }
.lx-chat::-webkit-scrollbar-thumb { background: var(--v-200); border-radius: 99px; }
.lx-chat-empty { text-align: center; color: var(--v-400); font-size: 13px; padding: 32px 0; }
.lx-ctrl { background: white; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: var(--shadow-sm); }
.lx-ctrl-status { font-size: 12px; font-weight: 500; color: var(--v-400); display: flex; align-items: center; gap: 8px; }
.lx-desk-rec { padding: 10px 22px; border-radius: var(--r-md); border: none; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .15s; align-self: flex-start; letter-spacing: -.01em; }
.lx-desk-rec:active { transform: scale(.96); }
.lx-desk-rec.start { background: linear-gradient(135deg, var(--v-600), var(--v-800)); color: white; box-shadow: var(--shadow-brand); }
.lx-desk-rec.start:hover { box-shadow: var(--shadow-brand-lg); transform: translateY(-1px); }
.lx-desk-rec.stop { background: var(--red-50); color: var(--red-600); border: 1.5px solid #FCA5A5; }
.lx-desk-rec.stop:hover { background: #FEE2E2; transform: translateY(-1px); }

/* ── Settings sheet ── */
.lx-overlay { position: fixed; inset: 0; background: rgba(74,29,149,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 60; animation: lxFadeIn .2s ease; }
@keyframes lxFadeIn { from{opacity:0} to{opacity:1} }
.lx-sheet { position: fixed; bottom: 0; left: 0; right: 0; z-index: 61; background: white; border-radius: 22px 22px 0 0; padding: 10px 20px 52px; max-height: 80vh; overflow-y: auto; box-shadow: 0 -8px 40px rgba(91,33,182,.16); animation: lxSlideUp .25s cubic-bezier(.4,0,.2,1); }
@keyframes lxSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.lx-sheet-handle { width: 36px; height: 4px; background: var(--v-200); border-radius: 99px; margin: 0 auto 20px; }
.lx-sheet-title  { font-size: 17px; font-weight: 700; margin-bottom: 20px; letter-spacing: -.02em; }
.lx-field        { margin-bottom: 16px; }
.lx-field-label  { display: block; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--v-400); margin-bottom: 8px; }
.lx-sheet-done   { width: 100%; padding: 14px; border: none; border-radius: var(--r-md); background: linear-gradient(135deg, var(--v-600), var(--v-800)); color: white; font-weight: 700; font-size: 15px; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-top: 8px; box-shadow: var(--shadow-brand); letter-spacing: -.01em; transition: box-shadow .15s, transform .12s; }
.lx-sheet-done:hover  { box-shadow: var(--shadow-brand-lg); }
.lx-sheet-done:active { transform: scale(.98); }

/* ── Completion ── */
.lx-done-hero  { background: linear-gradient(155deg, var(--v-700) 0%, var(--v-800) 40%, var(--v-900) 100%); border-radius: var(--r-2xl); padding: 30px 24px; text-align: center; color: white; box-shadow: var(--shadow-brand-lg); position: relative; overflow: hidden; }
.lx-done-orb1  { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,.18) 0%, transparent 65%); }
.lx-done-orb2  { position: absolute; bottom: -50px; left: -50px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(196,181,253,.10) 0%, transparent 65%); }
.lx-done-check { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.35); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 22px; font-weight: 800; position: relative; z-index: 1; }
.lx-done-title { font-size: 23px; font-weight: 800; margin-bottom: 4px; letter-spacing: -.025em; position: relative; z-index: 1; }
.lx-done-sub   { font-size: 12.5px; opacity: .68; margin-bottom: 22px; position: relative; z-index: 1; }
.lx-done-stats { display: flex; gap: 1px; border-radius: var(--r-md); overflow: hidden; background: rgba(255,255,255,.10); position: relative; z-index: 1; }
.lx-done-stat  { flex: 1; padding: 14px 0; text-align: center; background: rgba(255,255,255,.07); }
.lx-done-num   { font-size: 27px; font-weight: 800; line-height: 1; margin-bottom: 3px; font-family: 'DM Mono', monospace; letter-spacing: -.03em; }
.lx-done-nm    { font-size: 10px; opacity: .58; letter-spacing: .07em; text-transform: uppercase; font-weight: 500; }
.lx-replay-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border: none; border-radius: var(--r-md); background: linear-gradient(135deg, var(--v-600), var(--v-800)); color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; box-shadow: var(--shadow-brand); letter-spacing: -.01em; transition: box-shadow .15s, transform .12s; }
.lx-replay-btn:hover  { box-shadow: var(--shadow-brand-lg); transform: translateY(-1px); }
.lx-replay-btn:active { transform: scale(.97); }
.lx-replay-btn.stop-v { background: var(--red-50); color: var(--red-600); border: 1.5px solid #FCA5A5; box-shadow: none; }
.lx-replay-btn.stop-v:hover { background: #FEE2E2; box-shadow: none; }
.lx-prog-track { flex: 1; }
.lx-prog-bar   { height: 4px; background: var(--v-100); border-radius: 99px; overflow: hidden; }
.lx-prog-fill  { height: 100%; background: linear-gradient(90deg, var(--v-600), var(--v-400)); border-radius: 99px; transition: width .4s; }
.lx-prog-label { font-size: 10.5px; color: var(--v-400); margin-top: 5px; font-family: 'DM Mono', monospace; }
.lx-back-btn   { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--r-md); background: white; color: var(--v-400); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background .15s, color .15s, border-color .15s; letter-spacing: -.01em; }
.lx-back-btn:hover { background: var(--v-50); color: var(--v-700); border-color: var(--v-300); }
.lx-txlist       { background: white; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm); }
.lx-txlist-title { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--v-400); margin-bottom: 4px; }
`

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function AudioLessonInterface({
                                                 conversation,
                                                 onComplete,
                                                 defaultLanguage = DEFAULT_LANG,
                                                 defaultVoiceAgentId,
                                                 recordDelaySeconds = 4,
                                             }: AudioLessonInterfaceProps) {

    const [messages,         setMessages]        = useState<ConversationMessage[]>([])
    const [currentTurnIdx,   setCurrentTurnIdx]  = useState(0)
    const [isListening,      setIsListening]     = useState(false)
    const [isRecording,      setIsRecording]     = useState(false)
    const [isProcessing,     setIsProcessing]    = useState(false)
    const [conversationEnd,  setConversationEnd] = useState(false)
    const [elapsedTime,      setElapsedTime]     = useState(0)
    const [liveTranscript,   setLiveTranscript]  = useState('')
    const [isPlayingAll,     setIsPlayingAll]    = useState(false)
    const [playPct,          setPlayPct]         = useState(0)
    const [language,         setLanguage]        = useState(defaultLanguage)
    const [voiceAgentId,     setVoiceAgentId]    = useState(defaultVoiceAgentId ?? '')
    const [browserVoices,    setBrowserVoices]   = useState<SpeechSynthesisVoice[]>([])
    const [countdownActive,  setCountdownActive] = useState(false)
    const [countdownLeft,    setCountdownLeft]   = useState(0)
    const [recTimeLeft,      setRecTimeLeft]     = useState<number | null>(null)
    const [userRoleNorm,     setUserRoleNorm]    = useState<string | null>(null)
    const [aiRoleNorm,       setAiRoleNorm]      = useState<string | null>(null)
    const [settingsOpen,     setSettingsOpen]    = useState(false)
    const [savedLang] = useState<string | null>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('selected-language-code') : null)

    const historyRef    = useRef<HTMLDivElement>(null)
    const chatScrollRef = useRef<HTMLDivElement>(null)
    const vrRef         = useRef(new VoiceRecorder())
    const ttsRef        = useRef(new TextToSpeech())
    const timerRef      = useRef<NodeJS.Timeout | null>(null)
    const cdRef         = useRef<NodeJS.Timeout | null>(null)
    const cdTurnRef     = useRef<number | null>(null)
    const recTRef       = useRef<NodeJS.Timeout | null>(null)
    const initialized   = useRef(false)
    const idxRef        = useRef(0)
    const isRecRef      = useRef(false)
    const isListRef     = useRef(false)
    const isProcRef     = useRef(false)
    const transcriptRef = useRef('')
    const langRef       = useRef(defaultLanguage)
    const uRoleRef      = useRef<string | null>(null)
    const aRoleRef      = useRef<string | null>(null)
    const voiceRef      = useRef<SpeechSynthesisVoice | null>(null)
    const endedRef      = useRef(false)

    useEffect(() => { idxRef.current = currentTurnIdx }, [currentTurnIdx])
    useEffect(() => { langRef.current = language }, [language])
    useEffect(() => { uRoleRef.current = userRoleNorm }, [userRoleNorm])
    useEffect(() => { aRoleRef.current = aiRoleNorm }, [aiRoleNorm])

    useEffect(() => {
        const id = 'lx-styles'
        if (!document.getElementById(id)) {
            const el = document.createElement('style')
            el.id = id; el.textContent = STYLES
            document.head.appendChild(el)
        }
    }, [])

    useEffect(() => {
        if (chatScrollRef.current)
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        const t0 = conversation.turns[0], t1 = conversation.turns[1]
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) {
            const ai = normalizeRole(t0.role), user = normalizeRole(t1.role)
            setAiRoleNorm(ai); aRoleRef.current = ai
            setUserRoleNorm(user); uRoleRef.current = user
        } else if (t0) {
            const r = normalizeRole(t0.role)
            if (AI_ROLE_ALIASES.includes(r)) { setAiRoleNorm(r); aRoleRef.current = r }
            else { setUserRoleNorm(r); uRoleRef.current = r }
        }
    }, [conversation])

    const excludedLangs = ['fr-FR', 'es-ES', 'ar-SA', 'es-US', 'zh-CH', 'zh-CN']
    const getLanguages = () => {
        const codes = Array.from(new Set(browserVoices.map(v => v.lang)))
        if (!savedLang || savedLang === 'en') return codes.filter(c => !excludedLangs.includes(c))
        return codes.filter(c => c.startsWith(savedLang))
    }

    useEffect(() => {
        loadBrowserVoices().then(voices => {
            setBrowserVoices(voices); ttsRef.current.setBrowserVoices(voices)
            if (!voiceAgentId && voices.length > 0) {
                const v = voices.find(v => v.lang.toLowerCase().startsWith(language.toLowerCase())) || voices[0]
                setVoiceAgentId(`${v.name}|${v.lang}`)
            }
        })
    }, [])

    useEffect(() => { vrRef.current.setLanguage(language) }, [language])

    useEffect(() => {
        if (!browserVoices.length) return
        const cur = browserVoices.find(v => `${v.name}|${v.lang}` === voiceAgentId)
        if (!cur || cur.lang.split('-')[0] !== language.split('-')[0]) {
            const nv = browserVoices.find(v => v.lang.split('-')[0] === language.split('-')[0])
            if (nv) setVoiceAgentId(`${nv.name}|${nv.lang}`)
        }
    }, [language, browserVoices])

    useEffect(() => {
        voiceRef.current = browserVoices.find(v => `${v.name}|${v.lang}` === voiceAgentId) || null
    }, [voiceAgentId, browserVoices])

    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime(p => p + 1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    /* ── Derived ── */
    const isUserTurnByIdx = (idx: number) => {
        const turn = conversation.turns[idx]; if (!turn) return false
        const n = normalizeRole(turn.role), u = uRoleRef.current
        return (u ? n === u : USER_ROLE_ALIASES.includes(n)) || (!AI_ROLE_ALIASES.includes(n) && idx % 2 === 1)
    }

    const currentTurn  = conversation.turns[currentTurnIdx]
    const showEN       = language.split('-')[0].toLowerCase() !== 'en'
    const recDuration  = conversation?.recordingTime ?? 10
    const timerPct     = recTimeLeft != null ? (recTimeLeft / recDuration) * 100 : 0
    const timerUrgent  = recTimeLeft != null && recTimeLeft <= 3
    const isUserTurn   = isUserTurnByIdx(currentTurnIdx)
    const lastAiMsg    = [...messages].reverse().find(m => m.speaker === 'ai')
    const progressPct  = ((currentTurnIdx + 1) / conversation.turns.length) * 100

    const showStart    = isUserTurn && !isRecording && !isListening && !isProcessing && !countdownActive
    const showStop     = isRecording
    const showCd       = countdownActive && !isRecording && !isListening && !isProcessing
    const showProc     = isProcessing
    const showSpeaking = isListening

    const pillClass = isRecording ? 'rec' : isListening ? 'speak' : isProcessing ? 'proc' : countdownActive ? 'count' : 'idle'
    const pillLabel = isRecording ? 'Recording'
        : isListening ? 'Speaking'
            : isProcessing ? 'Processing'
                : countdownActive ? `Starting in ${countdownLeft}s`
                    : isUserTurn ? 'Your turn'
                        : 'Ready'

    /* ── Core logic ── */
    const cancelCd = () => {
        if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
        setCountdownActive(false); setCountdownLeft(0)
    }

    const startRecording = async () => {
        if (isRecRef.current) return
        try {
            cancelCd(); isRecRef.current = true
            setIsRecording(true); isProcRef.current = false; setIsProcessing(false)
            setLiveTranscript(''); transcriptRef.current = ''
            if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
            vrRef.current.onTranscriptUpdate = (tx) => { setLiveTranscript(tx); transcriptRef.current = tx }
            vrRef.current.setLanguage(langRef.current)
            await vrRef.current.startRecording()
            let left = recDuration; setRecTimeLeft(left)
            recTRef.current = setInterval(() => {
                left -= 1; setRecTimeLeft(left)
                if (left <= 0) {
                    if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
                    setRecTimeLeft(null)
                    if (isRecRef.current) stopRecording()
                }
            }, 1000)
        } catch {
            isRecRef.current = false; setIsRecording(false); setRecTimeLeft(null)
            alert('Microphone access denied.')
        }
    }

    const stopRecording = async () => {
        if (!isRecRef.current) return
        isRecRef.current = false
        if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
        setRecTimeLeft(null)
        const turnIdx    = idxRef.current
        const turn       = conversation.turns[turnIdx]
        const transcript = transcriptRef.current
        const lang       = langRef.current
        try {
            isProcRef.current = true; setIsProcessing(true)
            const audioBlob = await vrRef.current.stopRecording()
            setIsRecording(false)
            const userText = transcript.trim() || turn.text
            const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)
            const userMsg: ConversationMessage = {
                id: `msg-${Date.now()}`, role: turn.role, content: userText,
                speaker: 'user', audioUrl, timestamp: new Date().toISOString(), turnOrder: turnIdx,
            }
            setMessages(prev => [...prev, userMsg])
            if (turnIdx >= conversation.turns.length - 1) { setTimeout(() => endConv(), 800); return }
            const nextIdx  = turnIdx + 1
            const nextTurn = conversation.turns[nextIdx]
            setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
            setTimeout(() => {
                isProcRef.current = false; setIsProcessing(false)
                playAI(getTurnText(nextTurn, lang), nextTurn.role, nextIdx)
            }, 900)
        } catch (e) {
            isProcRef.current = false; setIsProcessing(false)
            isRecRef.current = false; setIsRecording(false); console.error(e)
        }
    }

    const startCd = (turnIdx: number) => {
        cdTurnRef.current = turnIdx; setCountdownLeft(recordDelaySeconds); setCountdownActive(true)
        if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
        cdRef.current = setInterval(() => {
            if (cdTurnRef.current !== idxRef.current || isListRef.current || endedRef.current) {
                cancelCd(); return
            }
            setCountdownLeft(prev => {
                const next = prev - 1
                if (next <= 0) {
                    if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
                    setCountdownActive(false)
                    if (!isRecRef.current && !isListRef.current && !isProcRef.current) startRecording()
                    return 0
                }
                return next
            })
        }, 1000)
    }

    const playAI = (message: string, role: string, turnOrder: number) => {
        cancelCd(); isListRef.current = true; setIsListening(true)
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`, role, content: message,
            speaker: 'ai', timestamp: new Date().toISOString(), turnOrder,
        }])
        ttsRef.current.speak(message, {
            lang: langRef.current, voice: voiceRef.current ?? undefined,
            onEnd: () => {
                isListRef.current = false; setIsListening(false)
                const nextIdx  = turnOrder + 1
                const nextTurn = conversation.turns[nextIdx]
                setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
                if (nextTurn && isUserTurnByIdx(nextIdx)) setTimeout(() => startCd(nextIdx), 0)
                else if (nextTurn) setTimeout(() => playAI(getTurnText(nextTurn, langRef.current), nextTurn.role, nextIdx), 450)
                else endConv()
            },
        })
    }

    useEffect(() => {
        if (initialized.current) return; initialized.current = true
        setTimeout(() => {
            const first = conversation.turns[0]; if (!first) return
            const t0 = conversation.turns[0], t1 = conversation.turns[1]
            let detAI: string | null = null
            if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) detAI = normalizeRole(t0.role)
            const n = normalizeRole(first.role)
            const isAI = detAI ? n === detAI : AI_ROLE_ALIASES.includes(n)
            if (isAI) playAI(getTurnText(first, langRef.current), first.role, 0)
        }, 500)
    }, [])

    const endConv = () => {
        ttsRef.current.stop(); endedRef.current = true; setConversationEnd(true)
        isListRef.current = false; setIsListening(false)
        isProcRef.current = false; setIsProcessing(false)
    }

    const playAll = async () => {
        setIsPlayingAll(true); setPlayPct(0)
        const n = conversation.turns.length
        const t0 = conversation.turns[0], t1 = conversation.turns[1]
        let uRole: string | null = null
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) uRole = normalizeRole(t1.role)
        for (let i = 0; i < n; i++) {
            const turn = conversation.turns[i]; setPlayPct(((i + 1) / n) * 100)
            const rn = normalizeRole(turn.role)
            const isUser = uRole ? rn === uRole : USER_ROLE_ALIASES.includes(rn) || (!AI_ROLE_ALIASES.includes(rn) && i % 2 === 1)
            if (isUser) {
                const m = messages.find(m => m.speaker === 'user' && m.turnOrder === i)
                if (m?.audioUrl) await new Promise<void>(res => {
                    const a = new Audio(m.audioUrl!); a.onended = () => res(); a.onerror = () => res(); a.play()
                })
            } else {
                await new Promise<void>(res =>
                    ttsRef.current.speak(getTurnText(turn, language), { lang: language, voice: voiceRef.current ?? undefined, onEnd: () => res() })
                )
            }
            await new Promise(res => setTimeout(res, 400))
        }
        setIsPlayingAll(false); setPlayPct(100)
    }

    /* ── Settings ── */
    const renderSettings = () => (
        <>
            <div className="lx-field">
                <span className="lx-field-label">Language / Accent</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                        {getLanguages().map(c => <SelectItem key={c} value={c}>{LANGUAGE_LABELS[c] || c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="lx-field">
                <span className="lx-field-label">Voice</span>
                <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select voice" /></SelectTrigger>
                    <SelectContent>
                        {browserVoices
                            .filter(v => v.lang.split('-')[0] === language.split('-')[0])
                            .map(v => (
                                <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>
                                    {cleanVoiceName(v.name)}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    )

    /* ── Wave bars ── */
    const barHeights = [0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.75, 0.35, 0.65, 0.5, 0.8]
    const renderWave = (h = 28) => (
        <div className="lx-wave" style={{ height: h }}>
            {barHeights.map((_, i) => (
                <div key={i} className="lx-wave-bar" style={{
                    height: `${h}px`,
                    '--dur':   `${0.38 + i * 0.055}s`,
                    '--delay': `${i * 0.04}s`,
                } as React.CSSProperties} />
            ))}
        </div>
    )

    /* ════════════════════════════════
       COMPLETION SCREEN
    ════════════════════════════════ */
    if (conversationEnd) {
        const userMsgCount = messages.filter(m => m.speaker === 'user').length

        const heroBanner = (
            <div className="lx-done-hero">
                <div className="lx-done-orb1" /><div className="lx-done-orb2" />
                <div className="lx-done-check">✓</div>
                <p className="lx-done-title">Lesson Complete</p>
                <p className="lx-done-sub">{conversation.scenario}</p>
                <div className="lx-done-stats">
                    <div className="lx-done-stat">
                        <p className="lx-done-num">{userMsgCount}</p>
                        <p className="lx-done-nm">Responses</p>
                    </div>
                    <div className="lx-done-stat">
                        <p className="lx-done-num">{formatTime(elapsedTime)}</p>
                        <p className="lx-done-nm">Duration</p>
                    </div>
                </div>
            </div>
        )

        const replayRow = (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                    className={`lx-replay-btn${isPlayingAll ? ' stop-v' : ''}`}
                    onClick={isPlayingAll ? () => { ttsRef.current.stop(); setIsPlayingAll(false) } : playAll}
                >
                    {isPlayingAll ? <><StopCircle size={14} /> Stop</> : <><Play size={14} /> Replay</>}
                </button>
                <div className="lx-prog-track">
                    <div className="lx-prog-bar"><div className="lx-prog-fill" style={{ width: `${playPct}%` }} /></div>
                    <div className="lx-prog-label">{Math.round(playPct)}% played</div>
                </div>
            </div>
        )

        const transcriptList = (
            <div className="lx-txlist">
                <div className="lx-txlist-title">Full Transcript</div>
                {messages.map(msg => (
                    <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                        <div className="lx-brole">{msg.role}</div>
                        <div className={`lx-bubble ${msg.speaker}`}>
                            {msg.speaker === 'ai'
                                ? getTurnText(conversation.turns[msg.turnOrder], language) || msg.content
                                : msg.content}
                            {msg.speaker === 'ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                            )}
                            {msg.speaker === 'ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>
                            )}
                        </div>
                        {msg.audioUrl && <audio controls style={{ width: '100%', height: 28, marginTop: 4 }} src={msg.audioUrl} />}
                    </div>
                ))}
            </div>
        )

        return (
            <div className="lx">
                {/* Mobile */}
                <div className="lx-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)' }}>
                        {heroBanner}
                        {replayRow}
                        <button className="lx-back-btn" onClick={() => onComplete(messages)}>
                            <ChevronLeft size={14} /> Back to Course
                        </button>
                    </div>
                </div>
                {/* Desktop */}
                <div className="lx-desktop" style={{ flexDirection: 'column', gap: 20, display: 'flex' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {heroBanner}
                        <div className="lx-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)', letterSpacing: '-.01em' }}>Replay Session</div>
                                <div style={{ fontSize: 12, color: 'var(--v-400)', fontWeight: 400 }}>Listen back through the conversation</div>
                            </div>
                            {replayRow}
                            <button className="lx-back-btn" onClick={() => onComplete(messages)}>
                                <ChevronLeft size={14} /> Back to Course
                            </button>
                        </div>
                    </div>
                    {transcriptList}
                </div>
            </div>
        )
    }

    /* ════════════════════════════════
       LESSON SCREEN
    ════════════════════════════════ */

    // History: all messages except the last AI message (which is pinned at top)
    const historyMessages = lastAiMsg
        ? messages.filter(m => m.id !== lastAiMsg.id)
        : messages

    return (
        <div className="lx">

            {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
            <div className="lx-mobile">

                {/* Gradient header */}
                <div className="lx-header">
                    <div className="lx-header-orb1" /><div className="lx-header-orb2" />
                    <div className="lx-header-top">
                        <button className="lx-hbtn" onClick={() => onComplete(messages)} aria-label="Back">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="lx-hcenter">
                            <div className="lx-eyebrow">Conversation</div>
                            <div className="lx-htitle">{conversation.scenario}</div>
                            <div className="lx-htimer">{formatTime(elapsedTime)}</div>
                        </div>
                        <button className="lx-hbtn" onClick={() => setSettingsOpen(true)} aria-label="Settings">
                            <Settings size={15} />
                        </button>
                    </div>
                    <div className="lx-prog-wrap">
                        <div className="lx-prog-track">
                            <div className="lx-prog-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="lx-prog-meta">
                            <span className="lx-prog-txt">Turn {currentTurnIdx + 1} of {conversation.turns.length}</span>
                            <span className="lx-prog-txt">{Math.round(progressPct)}%</span>
                        </div>
                    </div>
                </div>

                {/* Pinned zone */}
                <div className="lx-pinned">

                    {/* Latest AI message — always visible */}
                    {lastAiMsg && (
                        <div>
                            <div className="lx-pin-role">
                                {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                                {showSpeaking ? ' — speaking now' : ''}
                            </div>
                            <div className={`lx-pin-bubble${showSpeaking ? ' speaking' : ''}`}>
                                {getTurnText(conversation.turns[lastAiMsg.turnOrder], language) || lastAiMsg.content}
                                {getRomanization(conversation.turns[lastAiMsg.turnOrder], language) && (
                                    <div style={{ fontSize: 11.5, fontStyle: 'italic', color: 'var(--v-400)', marginTop: 5, lineHeight: 1.4 }}>
                                        {getRomanization(conversation.turns[lastAiMsg.turnOrder], language)}
                                    </div>
                                )}
                                {showEN && conversation.turns[lastAiMsg.turnOrder]?.text && (
                                    <div style={{ fontSize: 11.5, color: 'var(--v-400)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--v-100)', display: 'flex', gap: 5, lineHeight: 1.4 }}>
                                        <span>🇬🇧</span><span>{conversation.turns[lastAiMsg.turnOrder].text}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Your line — shown when waiting to record or countdown */}
                    {isUserTurn && currentTurn && !isProcessing && (showStart || showCd) && (
                        <div className="lx-say-card">
                            <div className="lx-say-glow" />
                            <div className="lx-say-header">
                                <div className="lx-say-badge">↗</div>
                                <span className="lx-say-label">Your line</span>
                            </div>
                            <div className="lx-say-text">"{getTurnText(currentTurn, language)}"</div>
                            {getRomanization(currentTurn, language) && (
                                <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                            )}
                            {showEN && currentTurn.text && (
                                <div className="lx-say-en"><span>🇬🇧</span><span>{currentTurn.text}</span></div>
                            )}
                        </div>
                    )}

                    {/* Recording timer — shown while recording */}
                    {isRecording && (
                        <div className="lx-timer-card">
                            <div className="lx-timer-top">
                                <span className="lx-timer-rec-lbl">
                                    <span className="lx-timer-dot" />Recording
                                </span>
                                <span className={`lx-timer-cd${timerUrgent ? ' urgent' : ''}`}>
                                    {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s` : '…'}
                                </span>
                            </div>
                            <div className="lx-timer-bar">
                                <div className={`lx-timer-fill${timerUrgent ? ' urgent' : ''}`} style={{ width: `${timerPct}%` }} />
                            </div>
                            {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                        </div>
                    )}
                </div>

                {/* History scroll */}
                <div className="lx-history" ref={historyRef}>
                    {historyMessages.length > 0 && (
                        <div className="lx-hist-divider">
                            <div className="lx-hist-line" />
                            <div className="lx-hist-txt">Earlier</div>
                            <div className="lx-hist-line" />
                        </div>
                    )}
                    {historyMessages.map(msg => (
                        <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                            <div className="lx-brole">{msg.role}</div>
                            <div className={`lx-bubble ${msg.speaker}`}>
                                {msg.speaker === 'ai'
                                    ? getTurnText(conversation.turns[msg.turnOrder], language) || msg.content
                                    : msg.content}
                                {msg.speaker === 'ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                    <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                                )}
                                {msg.speaker === 'ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                    <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* Ghost listening bubble during recording */}
                    {isRecording && <div className="lx-ghost">Listening…</div>}
                    <div style={{ height: 8 }} />
                </div>

                {/* Bottom controls */}
                <div className="lx-bottom">

                    {/* AI Speaking */}
                    {showSpeaking && (
                        <>
                            {renderWave(28)}
                            <span className="lx-hint-txt" style={{ color: 'var(--v-500)' }}>AI is speaking…</span>
                        </>
                    )}

                    {/* Processing */}
                    {showProc && (
                        <>
                            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="lx-dot-bounce"
                                         style={{ width: 7, height: 7, '--delay': `${i * .16}s` } as React.CSSProperties} />
                                ))}
                            </div>
                            <span className="lx-hint-txt">Processing…</span>
                        </>
                    )}

                    {!showSpeaking && !showProc && (
                        <>
                            {/* Line hint above mic */}
                            {(showStart || showStop || showCd) && currentTurn && (
                                <div className="lx-tx-hint">
                                    {showCd
                                        ? `Recording in ${countdownLeft}s…`
                                        : showStop
                                            ? getTurnText(currentTurn, language)
                                            : 'Tap mic to start'}
                                </div>
                            )}

                            <div className="lx-ctrl-row">
                                <button className="lx-side-btn" onClick={() => onComplete(messages)} aria-label="Back">
                                    <ChevronLeft size={16} />
                                </button>

                                {(showStart || showStop || showCd) && (
                                    <button
                                        className={`lx-mic-btn ${showStop ? 'stop' : showCd ? 'countdown' : 'start'}`}
                                        onClick={showStart ? startRecording : showStop ? stopRecording : undefined}
                                        aria-label={showStart ? 'Start recording' : showStop ? 'Stop recording' : `Recording in ${countdownLeft}s`}
                                    >
                                        {showStop && <><div className="lx-ring1" /><div className="lx-ring2" /></>}
                                        {showStop
                                            ? <Square size={22} fill="white" />
                                            : showCd
                                                ? <span className="lx-cd-num">{countdownLeft}</span>
                                                : <Mic size={26} />}
                                    </button>
                                )}

                                <button className="lx-side-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings">
                                    <Settings size={15} />
                                </button>
                            </div>

                            <div className="lx-hint-txt">
                                {showStart ? 'Tap to record your response'
                                    : showStop  ? 'Tap to finish speaking'
                                        : showCd    ? `Auto-recording in ${countdownLeft}s`
                                            : ''}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ══ DESKTOP ══════════════════════════════════════════════════════════ */}
            <div className="lx-desktop">

                {/* Sidebar */}
                <div className="lx-sidebar">
                    <div className="lx-panel">
                        <div className="lx-panel-title">Session</div>
                        <div className="lx-session-name">{conversation.scenario}</div>
                        <div className="lx-session-meta">
                            Turn {currentTurnIdx + 1} of {conversation.turns.length} · {Math.round(progressPct)}% complete
                        </div>
                        <div className="lx-desk-prog-track">
                            <div className="lx-desk-prog-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="lx-divider" />
                        <div className="lx-desk-timer">{formatTime(elapsedTime)}</div>
                        <div className="lx-desk-timer-lbl">Elapsed</div>
                    </div>
                    <div className="lx-panel">
                        <div className="lx-panel-title">Settings</div>
                        {renderSettings()}
                    </div>
                </div>

                {/* Main column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`lx-pill ${pillClass}`}><div className="lx-dot" />{pillLabel}</div>
                    </div>

                    {/* Chat history */}
                    <div className="lx-chat" ref={chatScrollRef}>
                        {messages.length === 0 && (
                            <div className="lx-chat-empty">Conversation will appear here…</div>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                                <div className="lx-brole">{msg.role}</div>
                                <div className={`lx-bubble ${msg.speaker}`}>
                                    {msg.speaker === 'ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language) || msg.content
                                        : msg.content}
                                    {msg.speaker === 'ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                        <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                                    )}
                                    {msg.speaker === 'ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                        <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>
                                    )}
                                </div>
                                {msg.audioUrl && <audio controls style={{ width: '100%', height: 28, marginTop: 4 }} src={msg.audioUrl} />}
                            </div>
                        ))}
                    </div>

                    {/* Controls card */}
                    <div className="lx-ctrl">

                        {/* Latest AI line pinned */}
                        {lastAiMsg && (
                            <div>
                                <div className="lx-pin-role" style={{ marginBottom: 6 }}>
                                    {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                                    {showSpeaking ? ' — speaking now' : ''}
                                </div>
                                <div className={`lx-pin-bubble${showSpeaking ? ' speaking' : ''}`}>
                                    {getTurnText(conversation.turns[lastAiMsg.turnOrder], language) || lastAiMsg.content}
                                </div>
                            </div>
                        )}

                        {/* Your line */}
                        {(showStart || showStop || showCd) && isUserTurn && currentTurn && (
                            <div className="lx-say-card">
                                <div className="lx-say-glow" />
                                <div className="lx-say-header">
                                    <div className="lx-say-badge">↗</div>
                                    <span className="lx-say-label">Your line</span>
                                </div>
                                <div className="lx-say-text">"{getTurnText(currentTurn, language)}"</div>
                                {getRomanization(currentTurn, language) && (
                                    <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                                )}
                                {showEN && currentTurn.text && (
                                    <div className="lx-say-en"><span>🇬🇧</span><span>{currentTurn.text}</span></div>
                                )}
                            </div>
                        )}

                        {/* Recording timer */}
                        {showStop && (
                            <div className="lx-timer-card">
                                <div className="lx-timer-top">
                                    <span className="lx-timer-rec-lbl"><span className="lx-timer-dot" />Recording</span>
                                    <span className={`lx-timer-cd${timerUrgent ? ' urgent' : ''}`}>
                                        {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s` : '…'}
                                    </span>
                                </div>
                                <div className="lx-timer-bar">
                                    <div className={`lx-timer-fill${timerUrgent ? ' urgent' : ''}`} style={{ width: `${timerPct}%` }} />
                                </div>
                                {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                            </div>
                        )}

                        {/* Action row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {showStart && (
                                <button className="lx-desk-rec start" onClick={startRecording}>
                                    <Mic size={14} /> Start Recording
                                </button>
                            )}
                            {showStop && (
                                <button className="lx-desk-rec stop" onClick={stopRecording}>
                                    <Square size={13} fill="var(--red-500)" /> Stop Recording
                                </button>
                            )}
                            {showSpeaking && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {renderWave(22)}
                                    <span className="lx-ctrl-status">AI is speaking…</span>
                                </div>
                            )}
                            {showProc && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="lx-dot-bounce"
                                                 style={{ width: 6, height: 6, '--delay': `${i * .16}s` } as React.CSSProperties} />
                                        ))}
                                    </div>
                                    <span className="lx-ctrl-status">Processing…</span>
                                </div>
                            )}
                            {showCd && (
                                <span className="lx-ctrl-status">Auto-recording in {countdownLeft}s…</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sheet */}
            {settingsOpen && (
                <>
                    <div className="lx-overlay" onClick={() => setSettingsOpen(false)} />
                    <div className="lx-sheet">
                        <div className="lx-sheet-handle" />
                        <div className="lx-sheet-title">Settings</div>
                        {renderSettings()}
                        <button className="lx-sheet-done" onClick={() => setSettingsOpen(false)}>Done</button>
                    </div>
                </>
            )}
        </div>
    )
}