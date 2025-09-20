const { EventEmitter } = require('events');
const llmService = require('./llmService');
const contentstackService = require('./contentstackService');

class ChatController extends EventEmitter {
  constructor() {
    super();
  }

  async handleChat(req, res) {
    const { messages, provider = 'openrouter' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Use only free providers: openai and groq; exclude anthropic (paid)
    if (provider === 'anthropic') {
      return res.status(400).json({ error: 'Anthropic provider is not supported in free version' });
    }

    // Check if API key is dummy or missing
    const apiKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY;
    const isMock = !apiKey || apiKey === 'dummy'; // Use mock if no valid API key

    // Mock response for demo
    if (isMock) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      const mockResponse = "Hi! I am your helpful chat agent. Please provide some content or context so I can assist you better.";
      const words = mockResponse.split(' ');
      let index = 0;
      const interval = setInterval(() => {
        if (index < words.length) {
          res.write(`data: ${JSON.stringify({ content: words[index] + ' ' })}\n\n`);
          index++;
        } else {
          res.write('data: [DONE]\n\n');
          res.end();
          clearInterval(interval);
        }
      }, 100);
      return;
    }

    try {
      const userMessage = messages[messages.length - 1].content;
      const relevantContent = await contentstackService.fetchRelevantContent(userMessage);

      // Generate response using LLM with streaming
      const stream = await llmService.generateResponse(provider, messages, { stream: true });

      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
      }

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Error in chat:', error);
      // Fallback to mock response if LLM call fails
      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
      }
      const mockResponse = "Hello! I'm a demo chat agent. Based on your question about tours in Italy, here are some recommendations: 1. Rome Colosseum Tour, 2. Venice Gondola Ride, 3. Florence Duomo Visit. For more details, please provide a real API key.";
      const words = mockResponse.split(' ');
      let index = 0;
      const interval = setInterval(() => {
        if (index < words.length) {
          res.write(`data: ${JSON.stringify({ content: words[index] + ' ' })}\n\n`);
          index++;
        } else {
          res.write('data: [DONE]\n\n');
          res.end();
          clearInterval(interval);
        }
      }, 100);
    }
  }
}

module.exports = new ChatController();
