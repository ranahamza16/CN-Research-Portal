const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const opportunityRoutes = require('./routes/opportunityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const fs = require('fs');

// Resolve frontend static assets path dynamically
const frontendPath = fs.existsSync(path.join(__dirname, '../frontend'))
  ? path.join(__dirname, '../frontend')
  : (fs.existsSync(path.join(__dirname, 'frontend'))
      ? path.join(__dirname, 'frontend')
      : path.join(__dirname, 'public'));

// Serve frontend static files
app.use(express.static(frontendPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'University Research Opportunity Portal API is operational',
    timestamp: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api/opportunities', opportunityRoutes);

// Catch-all for API 404s
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// For any non-API route, serve index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Handling Middleware (500)
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` University Research Opportunity Portal running!`);
    console.log(` Web Interface: http://localhost:${PORT}`);
    console.log(` REST API Base: http://localhost:${PORT}/api/opportunities`);
    console.log(` Health Check:  http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

startServer();

module.exports = app;
