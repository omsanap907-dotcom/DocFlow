import React, { useRef } from 'react'
import { FiUpload, FiFile } from 'react-icons/fi'
import './DocumentUploader.css'

function DocumentUploader({ onUpload, isProcessing }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div 
      className="uploader-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="uploader-box" onClick={handleClick}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
        />
        <div className="uploader-content">
          {isProcessing ? (
            <div className="processing">
              <div className="spinner"></div>
              <p>Processing document...</p>
            </div>
          ) : (
            <>
              <FiUpload className="upload-icon" />
              <h3>Drop your document here</h3>
              <p>or click to browse</p>
              <div className="supported-formats">
                <FiFile />
                <span>PDF, DOC, DOCX, TXT, PNG, JPG</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentUploader
