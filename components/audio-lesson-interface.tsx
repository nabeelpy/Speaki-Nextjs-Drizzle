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
import { Settings, Mic, Square, Play, StopCircle, Volume2 } from 'lucide-react'

interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordDelaySeconds?: number
}

const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger','user','you','student','customer','learner','friend']
const AI_ROLE_ALIASES   = ['officer','ai','agent','system','teacher','assistant','me']

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
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
}
function cleanVoiceName(n: string) {
    return n.replace(/Microsoft\s*/gi,'').replace(/Google\s*/gi,'').replace(/Apple\s*/gi,'')
        .replace(/Online\s*\(Natural\)\s*/gi,'').replace(/\(.*?\)/g,'').trim()
}

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.lx {
  /* ── Palette ── */
  --blue-50:   #EFF6FF;
  --blue-100:  #DBEAFE;
  --blue-200:  #BFDBFE;
  --blue-300:  #93C5FD;
  --blue-400:  #60A5FA;
  --blue-500:  #3B82F6;
  --blue-600:  #2563EB;
  --blue-700:  #1D4ED8;
  --blue-800:  #1E40AF;
  --blue-900:  #1E3A8A;

  --slate-50:  #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;

  --red-50:    #FEF2F2;
  --red-400:   #F87171;
  --red-500:   #EF4444;
  --red-600:   #DC2626;

  --green-50:  #F0FDF4;
  --green-400: #4ADE80;
  --green-500: #22C55E;
  --green-600: #16A34A;

  /* ── Semantic ── */
  --bg:        var(--slate-50);
  --bg-alt:    #FFFFFF;
  --surface:   #FFFFFF;
  --surface-2: var(--slate-50);
  --surface-3: var(--blue-50);
  --border:    var(--slate-200);
  --border-2:  var(--slate-300);
  --brand:     var(--blue-600);
  --brand-lt:  var(--blue-500);
  --brand-dk:  var(--blue-700);
  --brand-bg:  var(--blue-50);
  --brand-bdr: var(--blue-200);

  --text:      var(--slate-900);
  --text-2:    var(--slate-700);
  --text-3:    var(--slate-500);
  --text-4:    var(--slate-400);

  /* ── Radii ── */
  --r-xs: 8px;
  --r-sm: 12px;
  --r-md: 16px;
  --r-lg: 20px;
  --r-xl: 28px;

  /* ── Shadows ── */
  --shadow-xs: 0 1px 2px rgba(15,23,42,.04);
  --shadow-sm: 0 1px 4px rgba(15,23,42,.06), 0 2px 8px rgba(15,23,42,.04);
  --shadow-md: 0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04);
  --shadow-lg: 0 8px 24px rgba(15,23,42,.10), 0 2px 6px rgba(15,23,42,.05);
  --shadow-brand: 0 4px 16px rgba(37,99,235,.30), 0 1px 3px rgba(37,99,235,.15);

  font-family: 'Geist', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
  background: var(--bg);
}

/* ── Responsive ── */
@media (max-width: 767px) {
  .lx {
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .lx-desktop { display: none !important; }
  .lx-mobile  { display: flex !important; flex: 1 1 0; min-height: 0; flex-direction: column; }
}
@media (min-width: 768px) {
  .lx { background: transparent; width: 100%; }
  .lx-mobile  { display: none !important; }
  .lx-desktop { display: grid !important; }
}

/* ════════════════════════════════
   PROGRESS BAR
════════════════════════════════ */
.lx-progress { height: 3px; background: var(--blue-100); flex-shrink: 0; }
.lx-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-500), var(--blue-700));
  transition: width 0.45s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 6px rgba(37,99,235,.35);
}

/* ════════════════════════════════
   TOP NAV (mobile)
════════════════════════════════ */
.lx-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
}
.lx-nav-title { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.015em; }
.lx-nav-sub   { font-size: 11px; color: var(--text-4); margin-top: 1px; }
.lx-nav-right { display: flex; align-items: center; gap: 10px; }
.lx-timer-chip {
  font-size: 12px; font-weight: 600; color: var(--brand);
  font-family: 'Geist Mono', monospace;
  background: var(--brand-bg); border: 1px solid var(--brand-bdr);
  padding: 4px 10px; border-radius: 99px;
}
.lx-icon-btn {
  width: 34px; height: 34px; border-radius: var(--r-xs);
  border: 1px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-3);
  box-shadow: var(--shadow-xs);
  transition: background .12s, border-color .12s, color .12s;
}
.lx-icon-btn:hover { background: var(--slate-100); border-color: var(--border-2); color: var(--text-2); }

/* ════════════════════════════════
   SCROLL AREA
════════════════════════════════ */
.lx-scroll {
  flex: 1 1 0; min-height: 0; overflow-y: auto;
  padding: 16px 15px 8px;
  display: flex; flex-direction: column; gap: 10px;
  scrollbar-width: none;
  background: var(--bg);
}
.lx-scroll::-webkit-scrollbar { display: none; }

/* ════════════════════════════════
   STATUS PILL
════════════════════════════════ */
.lx-status-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2px;
}
.lx-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 99px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  border: 1px solid transparent;
}
.lx-pill.idle  { background: var(--slate-100); color: var(--text-3); border-color: var(--border); }
.lx-pill.speak { background: var(--blue-50);   color: var(--blue-600); border-color: var(--blue-200); }
.lx-pill.rec   { background: var(--red-50);    color: var(--red-600);  border-color: #FCA5A5; }
.lx-pill.proc  { background: var(--green-50);  color: var(--green-600); border-color: #86EFAC; }
.lx-pill.count { background: #FFFBEB; color: #D97706; border-color: #FCD34D; }
.lx-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.lx-pill.rec .lx-dot   { animation: lxBlink .85s ease-in-out infinite; }
.lx-pill.speak .lx-dot { animation: lxPulse 1.2s ease-in-out infinite; }
@keyframes lxBlink { 0%,100%{opacity:1} 50%{opacity:.15} }
@keyframes lxPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:.4} }
.lx-pct { font-size: 11px; font-weight: 500; color: var(--text-4); }

/* ════════════════════════════════
   AI PROMPT CARD
════════════════════════════════ */
.lx-prompt-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
  position: relative; overflow: hidden;
}
.lx-prompt-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--blue-400), var(--blue-700));
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
.lx-prompt-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--blue-500);
  margin-bottom: 9px; display: flex; align-items: center; gap: 5px;
}
.lx-prompt-text {
  font-size: 15px; font-weight: 500; color: var(--text); line-height: 1.7;
}
.lx-prompt-text::before { content: '"'; color: var(--blue-400); margin-right: 1px; }
.lx-prompt-text::after  { content: '"'; color: var(--blue-400); margin-left: 1px; }
.lx-prompt-rom { font-size: 12px; color: var(--text-4); margin-top: 7px; font-style: italic; }
.lx-prompt-en  {
  font-size: 12px; color: var(--text-4); margin-top: 7px;
  padding-top: 8px; border-top: 1px solid var(--border);
}

/* ════════════════════════════════
   YOUR LINE CARD
════════════════════════════════ */
.lx-say-card {
  background: linear-gradient(145deg, var(--blue-50) 0%, #EFF8FF 100%);
  border: 1.5px solid var(--blue-200);
  border-radius: var(--r-lg);
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(37,99,235,.08);
  position: relative; overflow: hidden;
}
.lx-say-card::after {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 120px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(37,99,235,.07) 0%, transparent 70%);
  pointer-events: none;
}
.lx-say-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--blue-600);
  margin-bottom: 9px; display: flex; align-items: center; gap: 6px;
}
.lx-say-badge {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--blue-100); border: 1px solid var(--blue-200);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 8px; color: var(--blue-600); font-weight: 700;
}
.lx-say-text { font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.65; position: relative; z-index: 1; }
.lx-say-rom  { font-size: 12px; color: var(--blue-500); margin-top: 6px; font-style: italic; position: relative; z-index: 1; }
.lx-say-en   { font-size: 12px; color: var(--text-4); margin-top: 6px; padding-top: 7px; border-top: 1px solid var(--blue-200); position: relative; z-index: 1; }

/* ════════════════════════════════
   RECORDING TIMER
════════════════════════════════ */
.lx-timer-wrap {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 13px 15px;
  box-shadow: var(--shadow-xs);
}
.lx-timer-bar  { height: 4px; background: var(--slate-100); border-radius: 99px; overflow: hidden; }
.lx-timer-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  transition: width .5s linear, background .3s;
}
.lx-timer-fill.urgent { background: linear-gradient(90deg, var(--red-500), var(--red-400)); }
.lx-timer-label {
  font-size: 11px; font-weight: 500; color: var(--text-3); margin-top: 6px;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Geist Mono', monospace;
}
.lx-live-tx {
  margin-top: 10px; padding: 10px 12px;
  background: var(--slate-50); border-radius: var(--r-xs);
  font-size: 13px; color: var(--text-2); font-style: italic;
  line-height: 1.55; min-height: 40px; border: 1px solid var(--border);
}

/* ════════════════════════════════
   BOTTOM CONTROLS (mobile)
════════════════════════════════ */
.lx-bottom {
  flex-shrink: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 16px 18px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  box-shadow: 0 -4px 20px rgba(15,23,42,.06);
}
.lx-controls-row { display: flex; align-items: center; justify-content: center; gap: 14px; width: 100%; }

/* Mic button */
.lx-mic-btn {
  width: 66px; height: 66px; border-radius: 50%; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  position: relative; -webkit-tap-highlight-color: transparent;
  transition: transform .12s, box-shadow .15s;
}
.lx-mic-btn.start {
  background: linear-gradient(145deg, var(--blue-500), var(--blue-700));
  box-shadow: var(--shadow-brand);
  color: white;
}
.lx-mic-btn.start:hover  { transform: scale(1.06); box-shadow: 0 6px 24px rgba(37,99,235,.45); }
.lx-mic-btn.start:active { transform: scale(0.94); }
.lx-mic-btn.stop {
  background: linear-gradient(145deg, var(--red-400), var(--red-600));
  box-shadow: 0 4px 16px rgba(239,68,68,.35);
  color: white;
}
.lx-mic-btn.stop:hover  { transform: scale(1.06); }
.lx-mic-btn.stop:active { transform: scale(0.94); }

/* Pulse rings when recording */
.lx-ring1 {
  position: absolute; inset: -9px; border-radius: 50%;
  border: 2px solid rgba(239,68,68,.3);
  animation: lxRipple 1.5s ease-out infinite; pointer-events: none;
}
.lx-ring2 {
  position: absolute; inset: -18px; border-radius: 50%;
  border: 1.5px solid rgba(239,68,68,.15);
  animation: lxRipple 1.5s ease-out .5s infinite; pointer-events: none;
}
@keyframes lxRipple { 0%{transform:scale(.86);opacity:.9} 100%{transform:scale(1.5);opacity:0} }

.lx-state-btn {
  flex: 1; max-width: 200px; height: 50px; border-radius: var(--r-md);
  border: 1px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
  color: var(--text-3); pointer-events: none; box-shadow: var(--shadow-xs);
}
.lx-btn-hint { font-size: 11px; font-weight: 500; color: var(--text-4); letter-spacing: .015em; text-align: center; }

/* ════════════════════════════════
   WAVE BARS
════════════════════════════════ */
.lx-wave { display: flex; align-items: center; gap: 3px; }
.lx-wave-bar {
  width: 3px; border-radius: 99px;
  background: linear-gradient(180deg, var(--blue-400), var(--blue-600));
  animation: lxWave var(--dur) ease-in-out var(--delay) infinite alternate;
}
@keyframes lxWave { from{transform:scaleY(.1)} to{transform:scaleY(1)} }

/* ════════════════════════════════
   DESKTOP GRID
════════════════════════════════ */
.lx-desktop {
  grid-template-columns: 280px 1fr;
  gap: 20px; align-items: start; width: 100%;
}
.lx-sidebar { display: flex; flex-direction: column; gap: 12px; }

.lx-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 18px;
  box-shadow: var(--shadow-sm);
}
.lx-panel-title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 14px;
}
.lx-session-name { font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.4; margin-bottom: 3px; }
.lx-session-meta { font-size: 12px; color: var(--text-3); margin-bottom: 12px; }
.lx-desk-timer {
  font-size: 32px; font-weight: 800; color: var(--brand);
  font-family: 'Geist Mono', monospace;
  letter-spacing: -0.03em; line-height: 1; margin-bottom: 2px;
}
.lx-desk-timer-lbl { font-size: 10px; color: var(--text-4); letter-spacing: .05em; text-transform: uppercase; }

/* ── Chat feed ── */
.lx-chat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px;
  max-height: 340px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: var(--shadow-sm);
  scrollbar-width: thin; scrollbar-color: var(--slate-200) transparent;
}
.lx-chat::-webkit-scrollbar { width: 3px; }
.lx-chat::-webkit-scrollbar-thumb { background: var(--slate-200); border-radius: 99px; }
.lx-chat-empty { text-align: center; color: var(--text-4); font-size: 12px; padding: 24px 0; }

.lx-bw { display: flex; flex-direction: column; max-width: 80%; }
.lx-bw.ai   { align-self: flex-start; }
.lx-bw.user { align-self: flex-end; }
.lx-brole {
  font-size: 9px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; margin-bottom: 4px; padding: 0 4px;
}
.lx-bw.ai   .lx-brole { color: var(--blue-400); }
.lx-bw.user .lx-brole { color: var(--blue-500); text-align: right; }

.lx-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; }
.lx-bubble.ai {
  background: var(--slate-50); color: var(--text);
  border: 1px solid var(--border); border-top-left-radius: 4px;
}
.lx-bubble.user {
  background: linear-gradient(135deg, var(--blue-600), var(--blue-700));
  color: white; border-top-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(37,99,235,.25);
}
.lx-brom { font-size: 11px; font-style: italic; opacity: .6; margin-top: 5px; }
.lx-ben  { font-size: 11px; opacity: .55; margin-top: 4px; }

/* ── Desktop controls ── */
.lx-ctrl {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-sm);
}
.lx-ctrl-status { font-size: 12px; font-weight: 500; color: var(--text-3); }

.lx-desk-rec {
  padding: 12px 26px; border-radius: var(--r-md); border: none;
  font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  transition: transform .12s, box-shadow .15s, background .15s;
  align-self: flex-start;
}
.lx-desk-rec:active { transform: scale(.97); }
.lx-desk-rec.start {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; box-shadow: var(--shadow-brand);
}
.lx-desk-rec.start:hover { box-shadow: 0 6px 20px rgba(37,99,235,.4); }
.lx-desk-rec.stop {
  background: var(--red-50); color: var(--red-600);
  border: 1.5px solid #FCA5A5;
}
.lx-desk-rec.stop:hover { background: #FEE2E2; }

/* ════════════════════════════════
   SETTINGS SHEET
════════════════════════════════ */
.lx-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.35);
  backdrop-filter: blur(8px); z-index: 60;
}
.lx-sheet {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 61;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 48px;
  max-height: 80vh; overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(15,23,42,.12);
}
.lx-sheet-handle { width: 36px; height: 3px; background: var(--slate-200); border-radius: 99px; margin: 0 auto 18px; }
.lx-sheet-title  { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
.lx-field        { margin-bottom: 14px; }
.lx-field-label  {
  display: block; font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 7px;
}
.lx-sheet-done {
  width: 100%; padding: 13px; border: none; border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; font-weight: 700; font-size: 15px;
  font-family: 'Geist', sans-serif; cursor: pointer; margin-top: 8px;
  box-shadow: var(--shadow-brand);
}

/* ════════════════════════════════
   COMPLETION
════════════════════════════════ */
.lx-done-hero {
  background: linear-gradient(145deg, var(--blue-600) 0%, var(--blue-800) 100%);
  border-radius: var(--r-xl); padding: 28px 24px; text-align: center;
  color: white; box-shadow: 0 8px 32px rgba(37,99,235,.35);
  position: relative; overflow: hidden;
}
.lx-done-hero::before {
  content: ''; position: absolute; top: -50px; right: -50px;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%);
}
.lx-done-hero::after {
  content: ''; position: absolute; bottom: -40px; left: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%);
}
.lx-done-check {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.4);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; font-size: 24px; font-weight: 700;
}
.lx-done-title { font-size: 22px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.02em; }
.lx-done-sub   { font-size: 13px; opacity: .75; margin-bottom: 20px; }
.lx-done-stats { display: flex; gap: 1px; border-radius: var(--r-md); overflow: hidden; background: rgba(255,255,255,.15); }
.lx-done-stat  { flex: 1; padding: 14px 0; text-align: center; background: rgba(255,255,255,.08); }
.lx-done-num   { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 3px; font-family: 'Geist Mono', monospace; }
.lx-done-nm    { font-size: 10px; opacity: .65; letter-spacing: .06em; text-transform: uppercase; }

.lx-replay-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; border: none; border-radius: var(--r-xs);
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  box-shadow: var(--shadow-brand);
  transition: box-shadow .15s;
}
.lx-replay-btn:hover { box-shadow: 0 6px 20px rgba(37,99,235,.4); }
.lx-replay-btn.stop-v {
  background: var(--red-50); color: var(--red-600);
  border: 1.5px solid #FCA5A5; box-shadow: none;
}
.lx-prog-track { flex: 1; }
.lx-prog-bar   { height: 3px; background: var(--slate-100); border-radius: 99px; overflow: hidden; }
.lx-prog-fill  { height: 100%; background: linear-gradient(90deg, var(--blue-500), var(--blue-400)); border-radius: 99px; transition: width .4s; }
.lx-prog-label { font-size: 10px; color: var(--text-4); margin-top: 4px; font-family: 'Geist Mono', monospace; }

.lx-back-btn {
  width: 100%; padding: 12px; border: 1px solid var(--border);
  border-radius: var(--r-md); background: var(--surface); color: var(--text-3);
  font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; box-shadow: var(--shadow-xs);
  transition: background .12s, color .12s;
}
.lx-back-btn:hover { background: var(--slate-50); color: var(--text-2); }

.lx-txlist {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 18px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: var(--shadow-sm);
}
.lx-txlist-title {
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 6px;
}

/* Divider */
.lx-divider { height: 1px; background: var(--border); margin: 4px 0; }
`

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AudioLessonInterface({
                                                 conversation,
                                                 onComplete,
                                                 defaultLanguage = DEFAULT_LANG,
                                                 defaultVoiceAgentId,
                                                 recordDelaySeconds = 4,
                                             }: AudioLessonInterfaceProps) {

    const [messages,        setMessages]       = useState<ConversationMessage[]>([])
    const [currentTurnIdx,  setCurrentTurnIdx] = useState(0)
    const [isListening,     setIsListening]    = useState(false)
    const [isRecording,     setIsRecording]    = useState(false)
    const [isProcessing,    setIsProcessing]   = useState(false)
    const [conversationEnd, setConversationEnd]= useState(false)
    const [elapsedTime,     setElapsedTime]    = useState(0)
    const [liveTranscript,  setLiveTranscript] = useState('')
    const [isPlayingAll,    setIsPlayingAll]   = useState(false)
    const [playPct,         setPlayPct]        = useState(0)
    const [language,        setLanguage]       = useState(defaultLanguage)
    const [voiceAgentId,    setVoiceAgentId]   = useState(defaultVoiceAgentId ?? '')
    const [browserVoices,   setBrowserVoices]  = useState<SpeechSynthesisVoice[]>([])
    const [countdownActive, setCountdownActive]= useState(false)
    const [countdownLeft,   setCountdownLeft]  = useState(0)
    const [recTimeLeft,     setRecTimeLeft]    = useState<number|null>(null)
    const [userRoleNorm,    setUserRoleNorm]   = useState<string|null>(null)
    const [aiRoleNorm,      setAiRoleNorm]     = useState<string|null>(null)
    const [settingsOpen,    setSettingsOpen]   = useState(false)
    const [savedLang]                          = useState<string|null>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('selected-language-code') : null)

    const scrollRef     = useRef<HTMLDivElement>(null)
    const chatScrollRef = useRef<HTMLDivElement>(null)
    const vrRef         = useRef(new VoiceRecorder())
    const ttsRef        = useRef(new TextToSpeech())
    const timerRef      = useRef<NodeJS.Timeout|null>(null)
    const cdRef         = useRef<NodeJS.Timeout|null>(null)
    const cdTurnRef     = useRef<number|null>(null)
    const recTRef       = useRef<NodeJS.Timeout|null>(null)
    const initialized   = useRef(false)
    const idxRef        = useRef(0)
    const isRecRef      = useRef(false)
    const isListRef     = useRef(false)
    const isProcRef     = useRef(false)
    const transcriptRef = useRef('')
    const langRef       = useRef(defaultLanguage)
    const uRoleRef      = useRef<string|null>(null)
    const aRoleRef      = useRef<string|null>(null)
    const voiceRef      = useRef<SpeechSynthesisVoice|null>(null)
    const endedRef      = useRef(false)

    useEffect(() => { idxRef.current = currentTurnIdx }, [currentTurnIdx])
    useEffect(() => { langRef.current = language }, [language])
    useEffect(() => { uRoleRef.current = userRoleNorm }, [userRoleNorm])
    useEffect(() => { aRoleRef.current = aiRoleNorm }, [aiRoleNorm])

    useEffect(() => {
        const id = 'lx-styles'
        if (!document.getElementById(id)) {
            const el = document.createElement('style'); el.id = id; el.textContent = STYLES
            document.head.appendChild(el)
        }
    }, [])

    useEffect(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
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

    const excludedLangs = ['fr-FR','es-ES','ar-SA','es-US','zh-CH','zh-CN']
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
        timerRef.current = setInterval(() => setElapsedTime(p => p+1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    /* ── Derived ─────────────────────────────────────────────────────────────── */
    const isUserTurnByIdx = (idx: number) => {
        const turn = conversation.turns[idx]; if (!turn) return false
        const n = normalizeRole(turn.role), u = uRoleRef.current
        return (u ? n===u : USER_ROLE_ALIASES.includes(n)) || (!AI_ROLE_ALIASES.includes(n) && idx%2===1)
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

    /* ── Core logic ──────────────────────────────────────────────────────────── */
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
                    setRecTimeLeft(null); if (isRecRef.current) stopRecording()
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
        const turnIdx = idxRef.current
        const turn = conversation.turns[turnIdx]
        const transcript = transcriptRef.current
        const lang = langRef.current
        try {
            isProcRef.current = true; setIsProcessing(true)
            const audioBlob = await vrRef.current.stopRecording()
            setIsRecording(false)
            const userText = transcript.trim() || turn.text
            const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)
            const userMsg: ConversationMessage = {
                id:`msg-${Date.now()}`, role:turn.role, content:userText,
                speaker:'user', audioUrl, timestamp:new Date().toISOString(), turnOrder:turnIdx,
            }
            setMessages(prev => [...prev, userMsg])
            if (turnIdx >= conversation.turns.length-1) { setTimeout(() => endConv(), 800); return }
            const nextIdx = turnIdx+1
            const nextTurn = conversation.turns[nextIdx]
            setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
            setTimeout(() => { isProcRef.current = false; setIsProcessing(false); playAI(getTurnText(nextTurn, lang), nextTurn.role, nextIdx) }, 900)
        } catch (e) {
            isProcRef.current = false; setIsProcessing(false)
            isRecRef.current = false; setIsRecording(false); console.error(e)
        }
    }

    const startCd = (turnIdx: number) => {
        cdTurnRef.current = turnIdx; setCountdownLeft(recordDelaySeconds); setCountdownActive(true)
        if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
        cdRef.current = setInterval(() => {
            if (cdTurnRef.current !== idxRef.current || isListRef.current || endedRef.current) { cancelCd(); return }
            setCountdownLeft(prev => {
                const next = prev-1
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
            id:`msg-${Date.now()}`, role, content:message,
            speaker:'ai', timestamp:new Date().toISOString(), turnOrder,
        }])
        ttsRef.current.speak(message, {
            lang:langRef.current, voice:voiceRef.current??undefined,
            onEnd: () => {
                isListRef.current = false; setIsListening(false)
                const nextIdx = turnOrder+1
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
            let detAI: string|null = null
            if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) detAI = normalizeRole(t0.role)
            const n = normalizeRole(first.role)
            const isAI = detAI ? n===detAI : AI_ROLE_ALIASES.includes(n)
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
        let uRole: string|null = null
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) uRole = normalizeRole(t1.role)
        for (let i = 0; i < n; i++) {
            const turn = conversation.turns[i]; setPlayPct(((i+1)/n)*100)
            const rn = normalizeRole(turn.role)
            const isUser = uRole ? rn===uRole : USER_ROLE_ALIASES.includes(rn)||(!AI_ROLE_ALIASES.includes(rn)&&i%2===1)
            if (isUser) {
                const m = messages.find(m => m.speaker==='user'&&m.turnOrder===i)
                if (m?.audioUrl) await new Promise<void>(res => { const a=new Audio(m.audioUrl!); a.onended=()=>res(); a.onerror=()=>res(); a.play() })
            } else {
                await new Promise<void>(res => ttsRef.current.speak(getTurnText(turn,language),{ lang:language,voice:voiceRef.current??undefined,onEnd:()=>res() }))
            }
            await new Promise(res => setTimeout(res, 400))
        }
        setIsPlayingAll(false); setPlayPct(100)
    }

    /* ── Settings ────────────────────────────────────────────────────────────── */
    const renderSettings = () => (
        <>
            <div className="lx-field">
                <span className="lx-field-label">Language / Accent</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger>
                    <SelectContent>
                        {getLanguages().map(c => <SelectItem key={c} value={c}>{LANGUAGE_LABELS[c]||c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="lx-field">
                <span className="lx-field-label">Voice</span>
                <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select voice"/></SelectTrigger>
                    <SelectContent>
                        {browserVoices.filter(v=>v.lang.split('-')[0]===language.split('-')[0]).map(v=>(
                            <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>{cleanVoiceName(v.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    )

    /* ── Wave bars ───────────────────────────────────────────────────────────── */
    const waveH = [16, 28, 40, 22, 48, 20, 36, 14, 32, 22]
    const renderWave = (scale = 1) => (
        <div className="lx-wave">
            {waveH.map((h, i) => (
                <div key={i} className="lx-wave-bar" style={{
                    height: `${h * scale}px`,
                    '--dur':   `${0.3 + i * 0.07}s`,
                    '--delay': `${i * 0.045}s`,
                } as React.CSSProperties}/>
            ))}
        </div>
    )

    /* ── COMPLETION ──────────────────────────────────────────────────────────── */
    if (conversationEnd) {
        const userMsgCount = messages.filter(m => m.speaker==='user').length

        const heroBanner = (
            <div className="lx-done-hero">
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
            <div style={{display:'flex',alignItems:'center',gap:12}}>
                <button className={`lx-replay-btn${isPlayingAll?' stop-v':''}`}
                        onClick={isPlayingAll ? ()=>{ttsRef.current.stop();setIsPlayingAll(false)} : playAll}
                >
                    {isPlayingAll ? <><StopCircle size={14}/> Stop</> : <><Play size={14}/> Replay</>}
                </button>
                <div className="lx-prog-track">
                    <div className="lx-prog-bar"><div className="lx-prog-fill" style={{width:`${playPct}%`}}/></div>
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
                            {msg.speaker==='ai' ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content : msg.content}
                            {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) &&
                            <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>}
                            {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text &&
                            <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>}
                        </div>
                        {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:4}} src={msg.audioUrl}/>}
                    </div>
                ))}
            </div>
        )

        return (
            <div className="lx">
                {/* Mobile */}
                <div className="lx-mobile" style={{display:'flex',flexDirection:'column'}}>
                    <div className="lx-progress"><div className="lx-progress-fill" style={{width:'100%'}}/></div>
                    <div style={{flex:'1 1 0',minHeight:0,overflowY:'auto',padding:'20px 15px',display:'flex',flexDirection:'column',gap:12,background:'var(--bg)'}}>
                        {heroBanner}{replayRow}
                        <button className="lx-back-btn" onClick={()=>onComplete(messages)}>← Back to Course</button>
                    </div>
                </div>
                {/* Desktop */}
                <div className="lx-desktop" style={{flexDirection:'column',gap:20,display:'flex'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                        {heroBanner}
                        <div className="lx-panel" style={{display:'flex',flexDirection:'column',gap:14}}>
                            <div>
                                <div style={{fontSize:15,fontWeight:700,marginBottom:4,color:'var(--text)'}}>Replay Session</div>
                                <div style={{fontSize:12,color:'var(--text-3)'}}>Listen back through the conversation</div>
                            </div>
                            {replayRow}
                            <button className="lx-back-btn" onClick={()=>onComplete(messages)}>← Back to Course</button>
                        </div>
                    </div>
                    {transcriptList}
                </div>
            </div>
        )
    }

    /* ── LESSON SCREEN ───────────────────────────────────────────────────────── */
    return (
        <div className="lx">

            {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
            <div className="lx-mobile">

                <div className="lx-progress">
                    <div className="lx-progress-fill" style={{width:`${progressPct}%`}}/>
                </div>

                <div className="lx-nav">
                    <div>
                        <div className="lx-nav-title">{conversation.scenario}</div>
                        <div className="lx-nav-sub">Turn {currentTurnIdx+1} / {conversation.turns.length}</div>
                    </div>
                    <div className="lx-nav-right">
                        <div className="lx-timer-chip">{formatTime(elapsedTime)}</div>
                        <button className="lx-icon-btn" onClick={()=>setSettingsOpen(true)}>
                            <Settings size={14}/>
                        </button>
                    </div>
                </div>

                <div className="lx-scroll" ref={scrollRef}>

                    <div className="lx-status-row">
                        <div className={`lx-pill ${pillClass}`}>
                            <div className="lx-dot"/>{pillLabel}
                        </div>
                        <span className="lx-pct">{Math.round(progressPct)}% done</span>
                    </div>

                    {/* AI Prompt */}
                    {lastAiMsg && (
                        <div className="lx-prompt-card">
                            <div className="lx-prompt-label">
                                <Volume2 size={10}/>
                                {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                            </div>
                            <div className="lx-prompt-text">
                                {getTurnText(conversation.turns[lastAiMsg.turnOrder], language)||lastAiMsg.content}
                            </div>
                            {getRomanization(conversation.turns[lastAiMsg.turnOrder], language) && (
                                <div className="lx-prompt-rom">{getRomanization(conversation.turns[lastAiMsg.turnOrder], language)}</div>
                            )}
                            {showEN && conversation.turns[lastAiMsg.turnOrder]?.text && (
                                <div className="lx-prompt-en">🇬🇧 {conversation.turns[lastAiMsg.turnOrder].text}</div>
                            )}
                        </div>
                    )}

                    {/* Your line */}
                    {isUserTurn && currentTurn && !isProcessing && (
                        <div className="lx-say-card">
                            <div className="lx-say-label">
                                <span className="lx-say-badge">↗</span>
                                Your line
                            </div>
                            <div className="lx-say-text">"{getTurnText(currentTurn, language)}"</div>
                            {getRomanization(currentTurn, language) && (
                                <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                            )}
                            {showEN && currentTurn.text && (
                                <div className="lx-say-en">🇬🇧 {currentTurn.text}</div>
                            )}
                        </div>
                    )}

                    {/* Timer */}
                    {isRecording && (
                        <div className="lx-timer-wrap">
                            <div className="lx-timer-bar">
                                <div className={`lx-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                            </div>
                            <div className="lx-timer-label">
                                <span>Recording</span>
                                <span>{recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s left` : 'Finishing…'}</span>
                            </div>
                            {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                        </div>
                    )}

                    <div style={{height:8}}/>
                </div>

                {/* Bottom controls */}
                <div className="lx-bottom">
                    {showSpeaking && (
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                            {renderWave(1)}
                            <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>AI is speaking…</span>
                        </div>
                    )}

                    {showProc && (
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                            <div style={{display:'flex',gap:6,alignItems:'center',height:32}}>
                                {[0,1,2].map(i=>(
                                    <div key={i} style={{
                                        width:8, height:8, borderRadius:'50%',
                                        background:'linear-gradient(135deg,var(--blue-400),var(--blue-600))',
                                        animation:`lxBlink .8s ease-in-out ${i*.18}s infinite`
                                    }}/>
                                ))}
                            </div>
                            <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>Processing…</span>
                        </div>
                    )}

                    {!showSpeaking && !showProc && (
                        <div className="lx-controls-row">
                            {showCd && (
                                <div className="lx-state-btn">
                                    <span style={{fontSize:20,fontWeight:800,color:'#D97706'}}>{countdownLeft}</span>
                                    <span style={{fontSize:12}}>Starting…</span>
                                </div>
                            )}
                            {(showStart || showStop) && (
                                <button
                                    className={`lx-mic-btn ${showStart?'start':'stop'}`}
                                    onClick={showStart ? startRecording : stopRecording}
                                >
                                    {showStop && <><div className="lx-ring1"/><div className="lx-ring2"/></>}
                                    {showStart ? <Mic size={26}/> : <Square size={22} fill="white"/>}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="lx-btn-hint">
                        {showStart    ? 'Tap to record your response'
                            : showStop  ? 'Tap to finish recording'
                                : showCd    ? `Auto-starting in ${countdownLeft}s`
                                    : showProc  ? 'Processing response…'
                                        : showSpeaking ? 'AI is speaking'
                                            : ''}
                    </div>
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
                            Turn {currentTurnIdx+1} of {conversation.turns.length} · {Math.round(progressPct)}%
                        </div>
                        <div className="lx-progress" style={{borderRadius:4}}>
                            <div className="lx-progress-fill" style={{width:`${progressPct}%`}}/>
                        </div>
                        <div className="lx-divider" style={{margin:'14px 0'}}/>
                        <div className="lx-desk-timer">{formatTime(elapsedTime)}</div>
                        <div className="lx-desk-timer-lbl">Elapsed</div>
                    </div>

                    <div className="lx-panel">
                        <div className="lx-panel-title">Settings</div>
                        {renderSettings()}
                    </div>
                </div>

                {/* Main */}
                <div style={{display:'flex',flexDirection:'column',gap:14}}>

                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`lx-pill ${pillClass}`}><div className="lx-dot"/>{pillLabel}</div>
                    </div>

                    {/* Chat */}
                    <div className="lx-chat" ref={chatScrollRef}>
                        {messages.length === 0 && <div className="lx-chat-empty">Conversation will appear here…</div>}
                        {messages.map(msg => (
                            <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                                <div className="lx-brole">{msg.role}</div>
                                <div className={`lx-bubble ${msg.speaker}`}>
                                    {msg.speaker==='ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content
                                        : msg.content}
                                    {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                        <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                                    )}
                                    {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                        <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>
                                    )}
                                </div>
                                {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:4}} src={msg.audioUrl}/>}
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="lx-ctrl">
                        {lastAiMsg && (
                            <div className="lx-prompt-card" style={{borderRadius:'var(--r-md)'}}>
                                <div className="lx-prompt-label">
                                    <Volume2 size={10}/>
                                    {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                                </div>
                                <div className="lx-prompt-text">
                                    {getTurnText(conversation.turns[lastAiMsg.turnOrder], language)||lastAiMsg.content}
                                </div>
                            </div>
                        )}

                        {(showStart || showStop || showCd) && isUserTurn && currentTurn && (
                            <div className="lx-say-card" style={{borderRadius:'var(--r-md)'}}>
                                <div className="lx-say-label">
                                    <span className="lx-say-badge">↗</span> Your line
                                </div>
                                <div className="lx-say-text">"{getTurnText(currentTurn, language)}"</div>
                                {getRomanization(currentTurn, language) && (
                                    <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                                )}
                                {showEN && currentTurn.text && (
                                    <div className="lx-say-en">🇬🇧 {currentTurn.text}</div>
                                )}
                            </div>
                        )}

                        {showStop && (
                            <div className="lx-timer-wrap">
                                <div className="lx-timer-bar">
                                    <div className={`lx-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                                </div>
                                <div className="lx-timer-label">
                                    <span>Recording</span>
                                    <span>{recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s left` : 'Finishing…'}</span>
                                </div>
                                {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                            </div>
                        )}

                        <div style={{display:'flex',alignItems:'center',gap:14}}>
                            {showStart && (
                                <button className="lx-desk-rec start" onClick={startRecording}>
                                    <Mic size={15}/> Start Recording
                                </button>
                            )}
                            {showStop && (
                                <button className="lx-desk-rec stop" onClick={stopRecording}>
                                    <Square size={14} fill="var(--red-500)"/> Stop Recording
                                </button>
                            )}
                            {showSpeaking && (
                                <div style={{display:'flex',alignItems:'center',gap:12}}>
                                    {renderWave(0.65)}
                                    <span className="lx-ctrl-status">AI is speaking…</span>
                                </div>
                            )}
                            {showProc && <span className="lx-ctrl-status">Processing your response…</span>}
                            {showCd   && <span className="lx-ctrl-status">Auto-starting in {countdownLeft}s…</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sheet */}
            {settingsOpen && (
                <>
                    <div className="lx-overlay" onClick={()=>setSettingsOpen(false)}/>
                    <div className="lx-sheet">
                        <div className="lx-sheet-handle"/>
                        <div className="lx-sheet-title">Settings</div>
                        {renderSettings()}
                        <button className="lx-sheet-done" onClick={()=>setSettingsOpen(false)}>Done</button>
                    </div>
                </>
            )}
        </div>
    )
}