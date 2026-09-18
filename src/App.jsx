import React, { useMemo, useState } from 'react'
import './App.css'

const modes = [
  { id: 'original', name: 'Original rewrite', desc: 'Fresh wording and structure from your ideas.' },
  { id: 'natural', name: 'Natural draft', desc: 'Varied sentence rhythm and simpler language.' },
  { id: 'student', name: 'Student style', desc: 'Clear writing for everyday academic work.' }
]

function splitSentences(text) {
  return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
}

function rewriteLocally(text, mode) {
  const input = text.trim()
  if (!input) return ''
  const basic = input
    .replace(/\butilize\b/gi, 'use')
    .replace(/\bapproximately\b/gi, 'about')
    .replace(/\bdemonstrates\b/gi, 'shows')
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\ba number of\b/gi, 'many')

  const sentences = splitSentences(basic)
  if (sentences.length < 2) return basic

  if (mode === 'natural' && sentences.length >= 3) {
    const next = [...sentences]
    const first = next.shift()
    next.splice(1, 0, first)
    return next.join(' ')
  }

  return sentences.join(' ')
}

export default function App() {
  const [source, setSource] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState('original')
  const [imperfections, setImperfections] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState(false)

  const words = useMemo(() => result.trim() ? result.trim().split(/\s+/).length : 0, [result])

  function rewrite() {
    if (!source.trim()) {
      setStatus('Paste or type a draft first.')
      return
    }
    setStatus('Rewriting…')
    let text = rewriteLocally(source, mode)
    if (imperfections && text.split(/\s+/).length > 45) {
      const words = text.split(' ')
      words.splice(Math.floor(words.length * 0.35), 0, 'maybe')
      text = words.join(' ')
    }
    setResult(text)
    setStatus('Draft rewritten.')
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">DocFlow<span> Write</span></div>
          <div className="tagline">Original-writing workspace</div>
        </div>
        <div className="top-right"><span className="dot" />{status}<button onClick={() => {setSource(''); setResult(''); setStatus('Ready')}}>Clear</button></div>
      </header>

      <main className="workspace">
        <section className="hero">
          <div className="eyebrow">WRITE FROM IDEAS</div>
          <h1>Turn notes and drafts into fresh, readable writing.</h1>
          <p>Rewrite for clarity and originality while keeping the core meaning. Review facts and cite sources where required.</p>
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
            <label className="switch-row"><span><strong>Allow mild imperfections</strong><small>Loosen the prose slightly for drafting.</small></span><input type="checkbox" checked={imperfections} onChange={e => setImperfections(e.target.checked)} /></label>
            <div className="notice"><strong>Originality ≠ detector score</strong><span>This tool does not promise to bypass Turnitin or AI detectors.</span></div>
          </div>
        </section>

        <section className="editor-grid">
          <div className="card editor-card">
            <div className="card-head"><div><h2>Your draft</h2><span>Paste your notes or rough writing.</span></div><span className="pill">{source.length} chars</span></div>
            <textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Example: YouTube is used for entertainment, education and marketing…" />
            <div className="editor-foot"><span>{source.trim() ? source.trim().split(/\s+/).length : 0} words</span><button className="primary" onClick={rewrite}>Rewrite draft</button></div>
          </div>

          <div className="card editor-card">
            <div className="card-head"><div><h2>Fresh draft</h2><span>Review, fact-check, and edit before submitting.</span></div><span className="pill">{words} words</span></div>
            <textarea value={result} onChange={e => setResult(e.target.value)} placeholder="Your rewritten draft will appear here." />
            <div className="editor-foot"><span>Editable output</span><button className="secondary" onClick={copyResult}>{copied ? 'Copied' : 'Copy'}</button></div>
          </div>
        </section>

        <section className="info-grid">
          <div className="card info"><b>✓</b><div><h3>Fresh wording</h3><p>Build independently worded text from your own notes and research.</p></div></div>
          <div className="card info"><b>↗</b><div><h3>Source-aware</h3><p>Keep citations and verify claims instead of hiding the source.</p></div></div>
          <div className="card info"><b>Aa</b><div><h3>Human editing</h3><p>Output stays editable so you remain in control of the final version.</p></div></div>
        </section>
      </main>
    </div>
  )
}
