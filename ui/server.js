const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const UPLOADS_DIR = '../.instance/ui-uploads';

// Configure multer for file uploads
const upload = multer({ 
  dest: UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat endpoint - Ask questions
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).send(`
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i> Please enter a question.
        </div>
      `);
    }

    const response = await axios.post(`${BACKEND_URL}/api/v1/ask`, {
      question: question.trim()
    });

    res.send(`
      <div class="chat-message mb-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-start mb-2">
              <i class="bi bi-person-circle me-2 text-primary fs-4"></i>
              <div class="flex-grow-1">
                <strong class="text-primary">You:</strong>
                <p class="mb-0 mt-1">${question}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-message mb-3">
        <div class="card bg-light">
          <div class="card-body">
            <div class="d-flex align-items-start mb-2">
              <i class="bi bi-robot me-2 text-success fs-4"></i>
              <div class="flex-grow-1">
                <strong class="text-success">Assistant:</strong>
                <p class="mb-0 mt-1">${response.data.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// Upload PDF file
app.post('/api/upload/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send(`
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i> Please select a PDF file.
        </div>
      `);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/upload/pdf`, formData, {
      headers: formData.getHeaders()
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.send(`
      <div class="alert alert-success" role="alert">
        <i class="bi bi-check-circle-fill"></i> 
        PDF uploaded successfully: ${req.file.originalname}
      </div>
    `);
  } catch (error) {
    console.error('Error uploading PDF:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error uploading PDF: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// Upload text file
app.post('/api/upload/text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send(`
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i> Please select a text file.
        </div>
      `);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'text/plain'
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/upload/text`, formData, {
      headers: formData.getHeaders()
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.send(`
      <div class="alert alert-success" role="alert">
        <i class="bi bi-check-circle-fill"></i> 
        Text file uploaded successfully: ${req.file.originalname}
      </div>
    `);
  } catch (error) {
    console.error('Error uploading text file:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error uploading text file: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// Upload direct text
app.post('/api/upload/direct', async (req, res) => {
  try {
    const { text, title } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).send(`
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i> Please enter some text.
        </div>
      `);
    }

    const response = await axios.post(`${BACKEND_URL}/api/v1/upload`, {
      text: text.trim(),
      title: title || 'Direct Text Upload'
    });

    res.send(`
      <div class="alert alert-success" role="alert">
        <i class="bi bi-check-circle-fill"></i> 
        Text uploaded successfully!
      </div>
    `);
  } catch (error) {
    console.error('Error uploading direct text:', error);
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error uploading text: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// List documents
app.get('/api/documents', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/list`);
    const documents = response.data.documents || [];

    if (documents.length === 0) {
      return res.send(`
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle-fill"></i> No documents found.
        </div>
      `);
    }

    const documentList = documents.map((doc, index) => `
      <div class="card mb-2">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="card-title mb-1">
                <i class="bi bi-file-earmark-text me-2"></i>
                ${doc.title || `Document ${index + 1}`}
              </h6>
              <small class="text-muted">
                ${doc.type || 'Unknown type'} • 
                ${doc.size ? `${doc.size} chars` : 'Size unknown'}
              </small>
            </div>
            <span class="badge bg-primary">${index + 1}</span>
          </div>
        </div>
      </div>
    `).join('');

    res.send(`
      <div class="mb-3">
        <h6><i class="bi bi-files me-2"></i>Documents (${documents.length})</h6>
      </div>
      ${documentList}
    `);
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error loading documents: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// Reset/clear all documents
app.post('/api/reset', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/v1/reset`);

    res.send(`
      <div class="alert alert-success" role="alert">
        <i class="bi bi-check-circle-fill"></i> 
        All documents have been cleared successfully!
      </div>
    `);
  } catch (error) {
    console.error('Error resetting documents:', error);
    res.status(500).send(`
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error clearing documents: ${error.response?.data?.detail || error.message}
      </div>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Document Assistant HTMX client running on http://localhost:${PORT}`);
  console.log(`📡 Backend API expected at ${BACKEND_URL}/api/v1`);
});

module.exports = app;
