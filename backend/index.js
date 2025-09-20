const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

// Import services
const chatController = require('./chatControllerEnhanced');
const llmService = require('./llmServiceEnhanced');
const contentstackService = require('./contentstackServiceEnhanced');

const app = express();
const PORT = process.env.PORT || 3006;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Chat-specific rate limiting (more permissive)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 chat requests per minute
  message: {
    error: 'Too many chat requests, please wait a moment before sending another message.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      llm: {
        providers: llmService.getAvailableProviders().length,
        configured: llmService.getConfiguredProviders().length
      },
      contentstack: contentstackService.getStatus()
    }
  });
});

// API Routes
app.get('/providers', (req, res) => chatController.getProviders(req, res));
app.post('/chat', chatLimiter, (req, res) => chatController.handleChat(req, res));
app.post('/test-provider', chatLimiter, (req, res) => chatController.testProvider(req, res));
app.post('/search-content', (req, res) => chatController.searchContent(req, res));
app.get('/stats', (req, res) => chatController.getStats(req, res));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: 'Internal server error',
    ...(isDevelopment && {
      message: error.message,
      stack: error.stack
    }),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Chat Agent Platform Backend Started!
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health

📋 Available endpoints:
  GET  /health          - Health check
  GET  /providers       - List available LLM providers
  POST /chat           - Send chat message (streaming)
  POST /test-provider  - Test LLM provider
  POST /search-content - Search Contentstack content
  GET  /stats          - System statistics

🔧 Configuration:
  LLM Providers: ${llmService.getAvailableProviders().length} available
  Configured Providers: ${llmService.getConfiguredProviders().length} configured
  Contentstack: ${contentstackService.isConfigured() ? '✅ Configured' : '⚠️ Not configured'}

💡 Tips:
  - Set your API keys in .env file for full functionality
  - Use the /health endpoint to check service status
  - Visit /providers to see available LLM options
  - Try /test-provider to verify provider connections

📚 Documentation: See README.md for detailed setup instructions
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
