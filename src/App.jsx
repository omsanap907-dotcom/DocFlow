import React, { useMemo, useState } from 'react'
import './App.css'

const modes = [
  { id: 'original', name: 'Original draft', desc: 'Rebuild wording and structure from the source.' },
  { id: 'natural', name: 'Natural draft', desc: 'Prefer direct language and varied sentence rhythm.' },
  { id: 'student', name: 'Student style', desc: 'Clear, practical wording for academic work.' }
]

const vocabularyRules = [
  ['utilize', 'use'], ['approximately', 'about'], ['demonstrates', 'shows'],
  ['facilitates', 'helps'], ['commence', 'start'], ['subsequently', 'later'],
  ['numerous', 'many'], ['obtain', 'get'], ['individuals', 'people'],
  ['regarding', 'about'], ['prior to', 'before'], ['in order to', 'to'],
  ['a number of', 'many'], ['due to the fact that', 'because']
]

const genericPatterns = [
  ['It is important to note that', /it is important to note that/gi],
  ['It should be noted that', /it should be noted that/gi],
  ['plays a crucial role in', /plays a crucial role in/gi],
  ['plays a significant role in', /plays a significant role in/gi],
  ['In today\'s digital age', /in today['’]s digital age/gi],
  ['from X to Y construction', /\bfrom\b[^.!?]{1,80}\bto\b/gi]
]

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const splitSentences = text => text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)

function analyzeText(text) {
  const findings = []
  vocabularyRules.forEach(([from]) => {
    const count = (text.match(new RegExp('\\b' + escapeRegExp(from) + '\\b', 'gi')) || []).length
    if (count) findings.push({ type: 'Vocabulary', pattern: from, count, suggestion: 'Prefer simpler, more direct wording.' })
  })
  genericPatterns.forEach(([pattern, re]) => {
    const count = (text.match(re) || []).length
    if (count) findings.push({ type: 'Structure', pattern, count, suggestion: 'Consider a more specific sentence structure.' })
  })
  const sentences = splitSentences(text)
  const openings = sentences.map(s => (s.match(/^[A-Za-z]+/) || [''])[0].toLowerCase()).filter(Boolean)
  const repeated = [...new Set(openings)].filter(w => openings.filter(x => x === w).length >= 3)
  repeated.forEach(word => findings.push({ type: 'Repetition', pattern: 'Repeated opening: ' + word, count: openings.filter(x => x === word).length, suggestion: 'Vary sentence openings where it improves readability.' }))
  return findings
}

function normalize(text) {
  let out = text.trim().replace(/\s+/g, ' ')
  vocabularyRules.forEach(([from, to]) => { out = out.replace(new RegExp('\\b' + escapeRegExp(from) + '\\b', 'gi'), to) })
  out = out.replace(/it is important to note that\s*/gi, '').replace(/it should be noted that\s*/gi, '')
  out = out.replace(/plays a crucial role in/gi, 'helps').replace(/plays a significant role in/gi, 'helps')
  out = out.replace(/in today['’]s digital age/gi, 'today')
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').trim()
}

function rewriteLocally(text, mode) {
  const sentences = splitSentences(normalize(text))
  if (sentences.length < 2) return sentences.join(' ')
  return sentences.map((s, i) => {
    let out = s.replace(/^(Furthermore|Moreover|Additionally|In addition),?\s*/i, '')
    if (mode === 'natural') out = out.replace(/^This (?:is|was) /i, '').replace(/^These (?:are|were) /i, '')
    if (mode === 'student') out = out.replace(/\bconstitutes\b/gi, 'makes up').replace(/\bfacilitate\b/gi, 'help')
    return out
  }).join(' ')
}

export default function App() {
  const [source, setSource] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState('original')
  const [reviewPrompts, setReviewPrompts] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(true)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState(false)
  const [findings, setFindings] = useState([])
  const words = useMemo(() => result.trim() ? result.trim().split(/\s+/).length : 0, [result])

  function rewrite() {
    if (!source.trim()) return setStatus('Paste or type a draft first.')
    setStatus('Analyzing style patterns…')
    setFindings(analyzeText(source))
    setResult(rewriteLocally(source, mode))
    setStatus('Fresh draft ready.')
  }
  async function copyResult() {
    if (!result) return
    try { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    catch { setStatus('Copy failed. Select the text manually.') }
  }
  function addReviewPrompt() {
    if (!result) return
    const sentences = splitSentences(result); const i = Math.min(1, sentences.length - 1)
    sentences[i] += ' [Add your own example, detail, or interpretation here.]'
    setResult(sentences.join(' ')); setStatus('Review prompt added.')
  }
  return <div className="app-shell">
    <header className="topbar"><div><div className="brand">DocFlow<span> Write</span></div><div className="tagline">Original-writing workspace</div></div><div className="top-right"><span className="dot" />{status}<button onClick={() => {setSource('');setResult('');setFindings([]);setStatus('Ready')}}>Clear</button></div></header>
    <main className="workspace">
      <section className="hero"><div className="eyebrow">WRITE FROM IDEAS</div><h1>Turn drafts into clear, specific writing.</h1><p>Detect generic patterns, simplify vocabulary, and vary sentence structures while preserving meaning.</p></section>
      <section className="card controls"><div><label>Writing mode</label><div className="mode-grid">{modes.map(item => <button key={item.id} className={'mode ' + (mode === item.id ? 'selected' : '')} onClick={() => setMode(item.id)}><strong>{item.name}</strong><span>{item.desc}</span></button>)}</div></div><div className="switches"><label className="switch-row"><span><strong>Review prompts</strong><small>Mark places for your own examples or interpretation.</small></span><input type="checkbox" checked={reviewPrompts} onChange={e => setReviewPrompts(e.target.checked)} /></label>{reviewPrompts && <button className="secondary review-btn" onClick={addReviewPrompt}>Add a review prompt</button>}<label className="switch-row"><span><strong>Show style analysis</strong><small>See generic vocabulary and repeated structures.</small></span><input type="checkbox" checked={showAnalysis} onChange={e => setShowAnalysis(e.target.checked)} /></label><div className="notice"><strong>Pattern analysis, not detector bypass</strong><span>Rules improve specificity and readability; they do not guarantee an AI-detector result.</span></div></div></section>
      {showAnalysis && findings.length > 0 && <section className="card analysis"><div className="card-head"><div><h2>Style patterns found</h2><span>{findings.length} findings</span></div><span className="pill">Review</span></div><div className="finding-grid">{findings.map((f,i) => <div className="finding" key={i}><b>{f.type}</b><strong>{f.pattern}</strong><span>{f.count} occurrence{f.count === 1 ? '' : 's'} · {f.suggestion}</span></div>)}</div></section>}
      <section className="editor-grid"><div className="card editor-card"><div className="card-head"><div><h2>Your draft</h2><span>Paste notes or rough writing.</span></div><span className="pill">{source.length} chars</span></div><textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Paste your draft here…"/><div className="editor-foot"><span>{source.trim() ? source.trim().split(/\s+/).length : 0} words</span><button className="primary" onClick={rewrite}>Analyze & rewrite</button></div></div><div className="card editor-card"><div className="card-head"><div><h2>Fresh draft</h2><span>Edit, fact-check, and add your own details.</span></div><span className="pill">{words} words</span></div><textarea value={result} onChange={e => setResult(e.target.value)} placeholder="Your independently worded draft will appear here."/><div className="editor-foot"><span>Editable output</span><button className="secondary" onClick={copyResult}>{copied ? 'Copied' : 'Copy'}</button></div></div></section>
      <section className="info-grid"><div className="card info"><b>↗</b><div><h3>Vocabulary rules</h3><p>Flags inflated or vague wording and suggests direct alternatives.</p></div></div><div className="card info"><b>⌁</b><div><h3>Structure rules</h3><p>Finds repeated openings, stock phrases, and generic constructions.</p></div></div><div className="card info"><b>✓</b><div><h3>Human contribution</h3><p>Review prompts leave room for your examples, evidence, and interpretation.</p></div></div></section>
    </main></div>
}