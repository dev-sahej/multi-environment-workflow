require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Serve static files from the current directory
app.use(express.static(__dirname));

// API to get configuration (so frontend can access environment variables)
app.get('/api/config', (req, res) => {
    res.json({
        backendApiUrl: BACKEND_API_URL
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'frontend',
        timestamp: new Date().toISOString()
    });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server is running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
    console.log(`Backend API URL: ${BACKEND_API_URL}`);
});