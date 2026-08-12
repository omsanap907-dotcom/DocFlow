import React from 'react'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">📄</span>
          <h1>DocFlow AI</h1>
        </div>
        <p className="tagline">Document Processing & Form Automation</p>
      </div>
    </header>
  )
}

export default Header
