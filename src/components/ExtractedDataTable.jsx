import React, { useState } from 'react'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import './ExtractedDataTable.css'

function ExtractedDataTable({ data, onDataUpdate }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (index, currentValue) => {
    setEditingIndex(index)
    setEditValue(currentValue)
  }

  const handleSave = (index) => {
    const updatedData = [...data]
    updatedData[index].value = editValue
    onDataUpdate(updatedData)
    setEditingIndex(null)
  }

  const handleCancel = () => {
    setEditingIndex(null)
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Extracted Value</th>
            <th>Confidence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="field-name">{item.field}</td>
              <td className="field-value">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span>{item.value}</span>
                )}
              </td>
              <td>
                <span className={`confidence-badge ${item.confidence >= 80 ? 'high' : item.confidence >= 50 ? 'medium' : 'low'}`}>
                  {item.confidence}%
                </span>
              </td>
              <td>
                {editingIndex === index ? (
                  <div className="action-buttons">
                    <button className="save-btn" onClick={() => handleSave(index)}>
                      <FiCheck />
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <button className="edit-btn" onClick={() => handleEdit(index, item.value)}>
                    <FiEdit2 />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExtractedDataTable
