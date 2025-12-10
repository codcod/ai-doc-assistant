# AI Document Assistant - Web UI

A modern, lightweight web interface for the AI Document Assistant using HTMX,
Bootstrap 5, and Node.js.

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Python backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

### Development mode

```bash
# Install nodemon for auto-restart during development
npm install -g nodemon

# Run in development mode
npm run dev
```

## Backend integration

The HTMX client communicates with the Python backend through these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ask` | Ask questions about documents |
| POST | `/api/v1/upload/pdf` | Upload PDF files |
| POST | `/api/v1/upload/text` | Upload text files |
| POST | `/api/v1/upload` | Upload direct text content |
| GET | `/api/v1/list` | List all documents |
| POST | `/api/v1/reset` | Clear all documents |

## Architecture

```text
UI/
├── server.js              # Express server with API proxy
├── package.json           # Dependencies and scripts
├── uploads/               # Temporary file storage
└── public/
    ├── index.html         # Main HTML with 3 tabs
    ├── app.js            # Client-side JavaScript
    └── styles.css        # Custom styling
```

## Configuration

### Environment variables

```bash
# Server port (default: 3000)
PORT=3000

# Backend URL (default: http://localhost:8000)
BACKEND_URL=http://localhost:8000
```

### File Upload Limits

- **Max file size**: 10MB
- **Supported formats**: PDF, TXT, MD, CSV
- **Temporary storage**: `uploads/` directory

## 🎨 Customization

### Styling

Edit `public/styles.css` to customize:

- Color scheme (CSS variables in `:root`)
- Layout and spacing
- Animation effects
- Responsive breakpoints

### Functionality

Edit `public/app.js` to add:

- New keyboard shortcuts
- Additional UI interactions
- Custom validation
- Enhanced error handling

### Debug mode

Enable verbose logging:

```javascript
// Add to app.js
htmx.config.verboseDebug = true;
```
