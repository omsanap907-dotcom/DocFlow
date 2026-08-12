import React, { useState } from 'react'
import { FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import './FormFiller.css'

function FormFiller({ extractedData }) {
  const [formUrl, setFormUrl] = useState('')
  const [isFilled, setIsFilled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFillForm = () => {
    if (!formUrl) {
      alert('Please enter a form URL')
      return
    }

    // Simulate form filling
    setIsFilled(true)
    alert('✅ Form fields have been matched and filled! Please review before submitting.')
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert('🎉 Form submitted successfully!')
      setIsFilled(false)
    }, 2000)
  }

  const handleUrlChange = (e) => {
    setFormUrl(e.target.value)
    setIsFilled(false)
  }

  return (
    <div className="form-filler">
      <h3>🔗 Online Form Automation</h3>
      
      <div className="form-url-section">
        <label htmlFor="formUrl">Enter Form URL:</label>
        <div className="url-input-group">
          <input
            id="formUrl"
            type="url"
            placeholder="https://example.com/form"
            value={formUrl}
            onChange={handleUrlChange}
            className="url-input"
          />
          <button 
            onClick={handleFillForm}
            className="fill-form-btn"
            disabled={!formUrl}
          >
            <FiSend /> Fill Form
          </button>
        </div>
      </div>

      {extractedData.length > 0 && (
        <div className="field-mapping">
          <h4>Field Mapping Preview</h4>
          <div className="mapping-grid">
            {extractedData.map((item, index) => (
              <div key={index} className="mapping-item">
                <span className="mapping-field">{item.field}</span>
                <span className="mapping-arrow">→</span>
                <span className="mapping-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFilled && (
        <div className="review-section">
          <div className="review-banner">
            <FiCheckCircle className="review-icon" />
            <span>Form filled successfully! Please review before submitting.</span>
          </div>
          <button 
            onClick={handleSubmit}
            className="submit-form-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      )}
    </div>
  )
}

export default FormFiller
