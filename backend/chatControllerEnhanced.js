const { EventEmitter } = require('events');
const llmService = require('./llmServiceEnhanced');
const contentstackService = require('./contentstackServiceEnhanced');

class ChatController extends EventEmitter {
  constructor() {
    super();
    this.activeStreams = new Map();
  }

  async handleChat(req, res) {
    const {
      messages,
      provider = 'openai',
      model = null,
      stream = true,
      contentstackConfig = null
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
        details: 'Please provide an array of message objects with role and content'
      });
    }

    // Validate provider
    const availableProviders = llmService.getAvailableProviders();
    const providerInfo = availableProviders.find(p => p.id === provider);

    if (!providerInfo) {
      return res.status(400).json({
        error: 'Invalid provider',
        details: `Supported providers: ${availableProviders.map(p => p.id).join(', ')}`
      });
    }

    // Check if provider is configured
    if (!llmService.isProviderConfigured(provider)) {
      return res.status(400).json({
        error: 'Provider not configured',
        details: `${providerInfo.name} requires a valid API key. Please configure ${provider.toUpperCase()}_API_KEY environment variable.`
      });
    }

    // Initialize Contentstack if config provided
    if (contentstackConfig) {
      try {
        contentstackService.initializeStack(
          contentstackConfig.apiKey,
          contentstackConfig.deliveryToken,
          contentstackConfig.environment,
          contentstackConfig.stackAlias
        );
      } catch (error) {
        console.warn('⚠️ Failed to initialize Contentstack:', error.message);
      }
    }

    const requestId = Date.now().toString();
    this.activeStreams.set(requestId, { req, res });

    try {
      // Extract the latest user message for content search
      const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      // Fetch relevant content from Contentstack
      let relevantContent = [];
      if (userMessage && contentstackService.isConfigured()) {
        try {
          relevantContent = await contentstackService.fetchRelevantContent(userMessage, {
            limit: 3,
            contentTypes: contentstackConfig?.contentTypes
          });
          console.log(`📄 Found ${relevantContent.length} relevant content entries`);
        } catch (error) {
          console.warn('⚠️ Error fetching content:', error.message);
        }
      }

      // Generate response using LLM with streaming
      const streamResponse = await llmService.generateResponse(provider, messages, {
        stream: true,
        model: model,
        contentstackData: relevantContent
      });

      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      let totalTokens = 0;
      let responseTime = Date.now();

      try {
        for await (const chunk of streamResponse) {
          if (req.aborted) {
            console.log(`⏹️ Request ${requestId} aborted by client`);
            break;
          }

          let content = '';

          if (provider === 'anthropic') {
            // Handle Anthropic streaming format
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              content = chunk.delta.text;
            }
          } else {
            // Handle OpenAI/Groq streaming format
            content = chunk.choices?.[0]?.delta?.content || '';
          }

          if (content) {
            totalTokens += content.split(' ').length;
            res.write(`data: ${JSON.stringify({
              content,
              provider,
              model: model || providerInfo.defaultModel,
              tokens: totalTokens,
              contentstackUsed: relevantContent.length > 0,
              contentstackEntries: relevantContent.length
            })}\n\n`);
          }
        }
      } catch (streamError) {
        console.error('❌ Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({
          error: 'Stream processing failed',
          details: streamError.message
        })}\n\n`);
      }

      responseTime = Date.now() - responseTime;

      // Send completion event
      res.write(`data: ${JSON.stringify({
        done: true,
        totalTokens,
        responseTime: `${responseTime}ms`,
        provider,
        model: model || providerInfo.defaultModel,
        contentstackUsed: relevantContent.length > 0,
        contentstackEntries: relevantContent.length
      })}\n\n`);

      res.write('data: [DONE]\n\n');
      res.end();

      console.log(`✅ Request ${requestId} completed: ${totalTokens} tokens, ${responseTime}ms`);

    } catch (error) {
      console.error('❌ Error in chat:', error);

      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Chat processing failed',
          details: error.message,
          provider,
          model: model || providerInfo.defaultModel
        }));
      } else {
        res.write(`data: ${JSON.stringify({
          error: 'Processing failed',
          details: error.message
        })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } finally {
      this.activeStreams.delete(requestId);
    }
  }

  /**
   * Get available providers and their status
   */
  getProviders(req, res) {
    try {
      const providers = llmService.getAvailableProviders();
      const configuredProviders = llmService.getConfiguredProviders();

      res.json({
        providers,
        configuredProviders,
        contentstackConfigured: contentstackService.isConfigured(),
        contentstackStatus: contentstackService.getStatus()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get providers',
        details: error.message
      });
    }
  }

  /**
   * Test a provider with a simple message
   */
  async testProvider(req, res) {
    const { provider, model } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    try {
      const testMessages = [
        { role: 'user', content: 'Hello! Please respond with a simple greeting.' }
      ];

      const response = await llmService.generateResponse(provider, testMessages, {
        stream: false,
        model: model
      });

      res.json({
        success: true,
        provider,
        model: model,
        response: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        provider,
        model: model
      });
    }
  }

  /**
   * Search Contentstack content
   */
  async searchContent(req, res) {
    const { query, contentTypes, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const results = await contentstackService.fetchRelevantContent(query, {
        contentTypes,
        limit: parseInt(limit)
      });

      res.json({
        query,
        results,
        count: results.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Content search failed',
        details: error.message,
        query
      });
    }
  }

  /**
   * Get chat statistics
   */
  getStats(req, res) {
    res.json({
      activeStreams: this.activeStreams.size,
      totalProviders: llmService.getAvailableProviders().length,
      configuredProviders: llmService.getConfiguredProviders().length,
      contentstackConfigured: contentstackService.isConfigured(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Abort a specific chat request
   */
  abortChat(req, res) {
    const { requestId } = req.params;

    if (this.activeStreams.has(requestId)) {
      const stream = this.activeStreams.get(requestId);
      stream.req.aborted = true;

      res.json({
        success: true,
        message: `Request ${requestId} aborted`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        error: 'Request not found',
        requestId
      });
    }
  }
}

module.exports = new ChatController();
