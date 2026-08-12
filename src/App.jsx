import React, { useState } from 'react'
import './App.css'
import Header from './components/Header'
import DocumentUploader from './components/DocumentUploader'
import ExtractedDataTable from './components/ExtractedDataTable'
import FormFiller from './components/FormFiller'
import ExportButton from './components/ExportButton'
import { extractDataWithMockAI } from './utils/mockAI'

function App() {
  const [extractedData, setExtractedData] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleDocumentUpload = async (file) => {
    setUploadedFile(file)
    setIsProcessing(true)
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Extract data using mock AI
      const data = extractDataWithMockAI(file.name)
      setExtractedData(data)
    } catch (error) {
      console.error('Error processing document:', error)
      alert('Error processing document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDataUpdate = (updatedData) => {
    setExtractedData(updatedData)
  }

  const handleExport = () => {
    // Export functionality is handled in ExportButton component
    console.log('Exporting data...')
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="upload-section">
          <DocumentUploader 
            onUpload={handleDocumentUpload}
            isProcessing={isProcessing}
          />
        </div>

        {uploadedFile && (
          <div className="file-info">
            <p>📄 Processing: <strong>{uploadedFile.name}</strong></p>
          </div>
        )}

        {extractedData.length > 0 && (
          <>
            <div className="data-section">
              <div className="section-header">
                <h2>📊 Extracted Information</h2>
                <ExportButton data={extractedData} />
              </div>
              <ExtractedDataTable 
                data={extractedData}
                onDataUpdate={handleDataUpdate}
              />
            </div>

            <div className="form-section">
              <FormFiller extractedData={extractedData} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
