const Contentstack = require('@contentstack/delivery-sdk');

class ContentstackService {
  constructor() {
    this.stacks = new Map();
    this.defaultStack = null;
  }

  /**
   * Initialize a Contentstack stack connection
   * @param {string} apiKey - Contentstack API key
   * @param {string} deliveryToken - Content delivery token
   * @param {string} environment - Environment name (default: 'production')
   * @param {string} stackAlias - Optional alias for the stack
   */
  initializeStack(apiKey, deliveryToken, environment = 'production', stackAlias = 'default') {
    try {
      const stack = Contentstack.stack({
        api_key: apiKey,
        delivery_token: deliveryToken,
        environment: environment
      });

      this.stacks.set(stackAlias, stack);

      if (!this.defaultStack) {
        this.defaultStack = stack;
      }

      console.log(`✅ Contentstack stack initialized: ${stackAlias}`);
      return stack;
    } catch (error) {
      console.error(`❌ Failed to initialize Contentstack stack ${stackAlias}:`, error);
      throw error;
    }
  }

  /**
   * Set the default stack for operations
   * @param {string} stackAlias - Stack alias to use as default
   */
  setDefaultStack(stackAlias) {
    if (this.stacks.has(stackAlias)) {
      this.defaultStack = this.stacks.get(stackAlias);
      console.log(`✅ Default stack set to: ${stackAlias}`);
    } else {
      throw new Error(`Stack alias '${stackAlias}' not found`);
    }
  }

  /**
   * Get a stack by alias
   * @param {string} stackAlias - Stack alias
   * @returns {Object} Contentstack stack instance
   */
  getStack(stackAlias = 'default') {
    return this.stacks.get(stackAlias) || this.defaultStack;
  }

  /**
   * Fetch relevant content based on user query
   * @param {string} query - User's question or search term
   * @param {Object} options - Search options
   * @returns {Array} Array of relevant content entries
   */
  async fetchRelevantContent(query, options = {}) {
    const {
      stackAlias = 'default',
      contentTypes = null, // Array of content type UIDs to search in
      limit = 5,
      includeCount = false
    } = options;

    try {
      const stack = this.getStack(stackAlias);
      if (!stack) {
        console.warn('⚠️ No Contentstack stack initialized');
        return [];
      }

      // For demo purposes, return mock content if no real stack is configured
      if (process.env.CONTENTSTACK_API_KEY === 'dummy' || !process.env.CONTENTSTACK_API_KEY) {
        return this._getMockContent(query);
      }

      const results = [];

      // Search across multiple content types if specified
      if (contentTypes && Array.isArray(contentTypes)) {
        for (const contentType of contentTypes) {
          try {
            const entries = await this._searchContentType(stack, contentType, query, limit);
            results.push(...entries);
          } catch (error) {
            console.warn(`⚠️ Error searching content type ${contentType}:`, error);
          }
        }
      } else {
        // Search all content types (this might be limited by Contentstack)
        const entries = await this._searchAllContentTypes(stack, query, limit);
        results.push(...entries);
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this._deduplicateResults(results);
      const sortedResults = this._sortByRelevance(uniqueResults, query);

      console.log(`📄 Found ${sortedResults.length} relevant content entries for query: "${query}"`);
      return sortedResults.slice(0, limit);

    } catch (error) {
      console.error('❌ Error fetching content from Contentstack:', error);
      return this._getMockContent(query);
    }
  }

  /**
   * Search within a specific content type
   * @private
   */
  async _searchContentType(stack, contentType, query, limit) {
    try {
      const queryParams = {
        query: {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
          ]
        },
        includeCount: true
      };

      const response = await stack.contentType(contentType).query(queryParams).find();

      return response.entries.map(entry => ({
        id: entry.uid,
        title: entry.title,
        contentType: contentType,
        content: entry,
        relevance: this._calculateRelevance(entry, query),
        url: entry.url || null
      }));
    } catch (error) {
      console.warn(`⚠️ Error searching content type ${contentType}:`, error);
      return [];
    }
  }

  /**
   * Search across all content types (limited implementation)
   * @private
   */
  async _searchAllContentTypes(stack, query, limit) {
    // This is a simplified implementation
    // In a real scenario, you might need to query multiple content types
    const commonContentTypes = ['page', 'article', 'blog_post', 'product', 'tour'];

    const results = [];
    for (const contentType of commonContentTypes) {
      try {
        const entries = await this._searchContentType(stack, contentType, query, Math.ceil(limit / commonContentTypes.length));
        results.push(...entries);
      } catch (error) {
        // Continue with other content types
      }
    }

    return results;
  }

  /**
   * Calculate relevance score for an entry
   * @private
   */
  _calculateRelevance(entry, query) {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Title relevance (highest weight)
    if (entry.title && entry.title.toLowerCase().includes(queryLower)) {
      score += 10;
      // Bonus for exact matches
      if (entry.title.toLowerCase() === queryLower) {
        score += 5;
      }
    }

    // Description relevance
    if (entry.description && entry.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Content relevance (lower weight)
    if (entry.content && JSON.stringify(entry.content).toLowerCase().includes(queryLower)) {
      score += 2;
    }

    return score;
  }

  /**
   * Remove duplicate results
   * @private
   */
  _deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.contentType}-${result.id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort results by relevance score
   * @private
   */
  _sortByRelevance(results, query) {
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get mock content for demo purposes
   * @private
   */
  _getMockContent(query) {
    const mockData = [
      {
        id: 'mock-1',
        title: 'Italy Travel Guide',
        contentType: 'travel_guide',
        content: {
          title: 'Italy Travel Guide',
          description: 'Complete guide to traveling in Italy',
          destinations: ['Rome', 'Venice', 'Florence', 'Milan'],
          tours: [
            'Rome Colosseum Tour',
            'Venice Gondola Experience',
            'Florence Duomo Visit',
            'Amalfi Coast Drive'
          ]
        },
        relevance: 8,
        url: '/travel/italy'
      },
      {
        id: 'mock-2',
        title: 'Rome Historical Tours',
        contentType: 'tour',
        content: {
          title: 'Rome Historical Tours',
          description: 'Explore ancient Rome with expert guides',
          duration: '4 hours',
          price: '€89',
          highlights: ['Colosseum', 'Roman Forum', 'Palatine Hill']
        },
        relevance: 6,
        url: '/tours/rome-historical'
      },
      {
        id: 'mock-3',
        title: 'Venice Cultural Experience',
        contentType: 'experience',
        content: {
          title: 'Venice Cultural Experience',
          description: 'Immerse yourself in Venetian culture',
          activities: ['Gondola ride', 'St. Mark\'s Square', 'Murano glass'],
          duration: '6 hours'
        },
        relevance: 4,
        url: '/experiences/venice-culture'
      }
    ];

    // Filter mock data based on query relevance
    const queryLower = query.toLowerCase();
    return mockData.filter(item =>
      item.title.toLowerCase().includes(queryLower) ||
      item.content.description.toLowerCase().includes(queryLower) ||
      JSON.stringify(item.content).toLowerCase().includes(queryLower)
    );
  }

  /**
   * Get content by ID
   * @param {string} contentType - Content type UID
   * @param {string} entryId - Entry ID
   * @param {string} stackAlias - Stack alias
   * @returns {Object} Content entry
   */
  async getContentById(contentType, entryId, stackAlias = 'default') {
    try {
      const stack = this.getStack(stackAlias);
      if (!stack) {
        throw new Error('No Contentstack stack initialized');
      }

      const response = await stack.contentType(contentType).entry(entryId).fetch();
      return response.entry;
    } catch (error) {
      console.error(`❌ Error fetching content by ID ${entryId}:`, error);
      throw error;
    }
  }

  /**
   * Get all entries of a content type
   * @param {string} contentType - Content type UID
   * @param {Object} options - Query options
   * @param {string} stackAlias - Stack alias
   * @returns {Array} Array of entries
   */
  async getEntries(contentType, options = {}, stackAlias = 'default') {
    try {
      const stack = this.getStack(stackAlias);
      if (!stack) {
        throw new Error('No Contentstack stack initialized');
      }

      const query = stack.contentType(contentType).query(options);
      const response = await query.find();

      return response.entries;
    } catch (error) {
      console.error(`❌ Error fetching entries for ${contentType}:`, error);
      return [];
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return this.stacks.size > 0 && this.defaultStack !== null;
  }

  /**
   * Get service status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      stackCount: this.stacks.size,
      defaultStack: this.defaultStack ? 'configured' : 'none',
      availableStacks: Array.from(this.stacks.keys())
    };
  }
}

module.exports = new ContentstackService();
