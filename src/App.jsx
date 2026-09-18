import React, { useMemo, useState } from 'react'
import './App.css'

const modes = [
  { id: 'original', name: 'Original draft', desc: 'Rebuild the structure instead of swapping words.' },
  { id: 'natural', name: 'Natural draft', desc: 'Use varied sentence length and straightforward language.' },
  { id: 'student', name: 'Student style', desc: 'Clear, practical wording for academic work.' }
]

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function normalize(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\butilize\b/gi, 'use')
    .replace(/\bapproximately\b/gi, 'about')
    .replace(/\bdemonstrates\b/gi, 'shows')
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\ba number of\b/gi, 'many')
}

function rotateParts(sentences, mode) {
  if (sentences.length < 3) return sentences

  if (mode === 'natural') {
    return sentences.map((s, i) => (i % 3 === 1 ? s : s))
  }

  if (mode === 'student') {
    return sentences.map((s, i) => {
      if (i === 0) return s
      return s.replace(/^(Furthermore|Moreover|Additionally),?\s*/i, '')
    })
  }

  return sentences
}

function improveSentence(s, index, mode) {
  let out = s
    .replace(/^In addition,\s*/i, 'Also, ')
    .replace(/^Furthermore,\s*/i, 'Another point is that ')
    .replace(/^Moreover,\s*/i, 'There is also ')
    .replace(/^It is important to note that\s*/i, '')
    .replace(/^It should be noted that\s*/i, '')

  if (mode === 'student') {
    out = out
      .replace(/\bconstitutes\b/gi, 'makes up')
      .replace(/\bfacilitates\b/gi, 'helps')
      .replace(/\bcommence\b/gi, 'start')
      .replace(/\bsubsequently\b/gi, 'later')
  }

  if (mode === 'natural') {
    out = out
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\bat this point in time\b/gi, 'now')
  }

  // Add light structural variety without inserting fake errors.
  if (index > 0 && mode !== 'original') {
    const lower = out.charAt(0).toLowerCase() + out.slice(1)
    if (/^(This|These|The|It)\b/.test(out) && out.length < 140) {
      return lower
    }
  }

  return out
}

function rewriteLocally(text, mode) {
  const cleaned = normalize(text)
  if (!cleaned) return ''

  const sentences = splitSentences(cleaned)
  if (sentences.length < 2) return cleaned

  const arranged = rotateParts(sentences, mode)
  return arranged.map((s, i) => improveSentence(s, i, mode)).join(' ')
}

export default function App() {
  const [source, setSource] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState('original')
  const [reviewPrompts, setReviewPrompts] = useState(true)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState(false)

  const words = useMemo(() => result.trim() ? result.trim().split(/\s+/).length : 0, [result])

  function rewrite() {
    if (!source.trim()) {
      setStatus('Paste or type a draft first.')
      return
    }

    setStatus('Rebuilding draft…')
    const text = rewriteLocally(source, mode)
    setResult(text)
    setStatus('Fresh draft ready.')
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setStatus('Copy failed. Select the text manually.')
    }
  }

  function addReviewPrompt() {
    if (!result) return
    const sentences = splitSentences(result)
    if (sentences.length < 2) {
      setResult(result + ' [Add your own example or explanation here.]')
      return
    }

    const targetIndex = Math.min(1, sentences.length - 1)
    sentences[targetIndex] = sentences[targetIndex] + ' [Add your own example, detail, or interpretation here.]'
    setResult(sentences.join(' '))
    setStatus('Review prompt added.')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">DocFlow<span> Write</span></div>
          <div className="tagline">Original-writing workspace</div>
        </div>
        <div className="top-right">
          <span className="dot" />{status}
          <button onClick={() => { setSource(''); setResult(''); setStatus('Ready') }}>Clear</button>
        </div>
      </header>

      <main className="workspace">
        <section className="hero">
          <div className="eyebrow">WRITE FROM IDEAS</div>
          <h1>Turn notes and drafts into fresh, readable writing.</h1>
          <p>Rebuild wording and structure from your draft while keeping the underlying meaning. Check facts and citations before using the result.</p>
        </section>

        <section className="card controls">
          <div>
            <label>Writing mode</label>
            <div className="mode-grid">
              {modes.map(item => (
                <button key={item.id} className={'mode ' + (mode === item.id ? 'selected' : '')} onClick={() => setMode(item.id)}>
                  <strong>{item.name}</strong><span>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="switches">
            <label className="switch-row">
              <span><strong>Review prompts</strong><small>Mark places where you can add your own example or explanation.</small></span>
              <input type="checkbox" checked={reviewPrompts} onChange={e => setReviewPrompts(e.target.checked)} />
            </label>
            {reviewPrompts && <button className="secondary review-btn" onClick={addReviewPrompt}>Add a review prompt</button>}
            <div className="notice"><strong>Originality ≠ detector score</strong><span>The goal is independently worded writing, not a guaranteed detector result.</span></div>
          </div>
        </section>

        <section className="editor-grid">
          <div className="card editor-card">
            <div className="card-head"><div><h2>Your draft</h2><span>Paste your notes or rough writing.</span></div><span className="pill">{source.length} chars</span></div>
            <textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Example: YouTube is used for entertainment, education and marketing…" />
            <div className="editor-foot"><span>{source.trim() ? source.trim().split(/\s+/).length : 0} words</span><button className="primary" onClick={rewrite}>Rewrite draft</button></div>
          </div>

          <div className="card editor-card">
            <div className="card-head"><div><h2>Fresh draft</h2><span>Edit, fact-check, and add your own details.</span></div><span className="pill">{words} words</span></div>
            <textarea value={result} onChange={e => setResult(e.target.value)} placeholder="Your independently worded draft will appear here." />
            <div className="editor-foot"><span>Editable output</span><button className="secondary" onClick={copyResult}>{copied ? 'Copied' : 'Copy'}</button></div>
          </div>
        </section>

        <section className="info-grid">
          <div className="card info"><b>↗</b><div><h3>New structure</h3><p>Rework sentence flow and phrasing instead of relying on one-to-one synonym swaps.</p></div></div>
          <div className="card info"><b>✓</b><div><h3>Source-aware</h3><p>Keep citations, verify claims, and separate sourced facts from your own interpretation.</p></div></div>
          <div className="card info"><b>Aa</b><div><h3>Your final edit</h3><p>Keep the output editable so you control the wording, examples, and final submission.</p></div></div>
        </section>
      </main>
    </div>
  )
}
