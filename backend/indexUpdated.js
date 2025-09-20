const express = require('express');
const cors = require('cors');
require('dotenv').config();
const chatController = require('./chatControllerUpdated');
const ContentstackManagement = require('@contentstack/management');

const app = express();
const PORT = 3006;

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Chat Agent Backend API' });
});

// OAuth routes for Contentstack Developer Hub
app.get('/auth', (req, res) => {
  const clientId = process.env.CONTENTSTACK_CLIENT_ID;
  const redirectUri = process.env.CONTENTSTACK_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'OAuth configuration missing' });
  }
  const authUrl = `https://app.contentstack.com/#!/apps/${clientId}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=stack`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }
  try {
    const client = ContentstackManagement.client();
    const response = await client.oauth().exchangeCodeForToken({
      code,
      client_id: process.env.CONTENTSTACK_CLIENT_ID,
      client_secret: process.env.CONTENTSTACK_CLIENT_SECRET,
      redirect_uri: process.env.CONTENTSTACK_REDIRECT_URI,
    });
    // Store the access token (in a real app, store securely)
    process.env.CONTENTSTACK_ACCESS_TOKEN = response.access_token;
    res.send('Authenticated successfully. You can now use stack-level APIs.');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Chat endpoint
app.post('/chat', (req, res) => {
  chatController.handleChat(req, res);
});

// Analytics endpoints
app.get('/analytics', (req, res) => {
  chatController.getAnalytics(req, res);
});

app.get('/dashboard', (req, res) => {
  chatController.getDashboard(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Analytics available at: http://localhost:${PORT}/analytics`);
  console.log(`Dashboard available at: http://localhost:${PORT}/dashboard`);
});
