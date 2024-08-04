import React, { useState } from 'react';
import { processDocument } from '../api';

function FileUpload({ onFileProcessed }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to process.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const processedLineItems = await processDocument(file);
      onFileProcessed(processedLineItems);
    } catch (error) {
      console.error('Error processing document:', error);
      setError('An error occurred while processing the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          id="file-upload"
          className="file-input"
        />
        <label htmlFor="file-upload" className="file-label">
          {file ? file.name : 'Choose a file'}
        </label>
      </div>
      <button type="submit" disabled={!file || loading} className="submit-button">
        {loading ? 'Processing...' : 'Process Document'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}

export default FileUpload;
