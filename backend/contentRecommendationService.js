const contentstackService = require('./contentstackService');

class ContentRecommendationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Enhanced content search with multiple strategies
  async findRelevantContent(query, options = {}) {
    const {
      limit = 5,
      contentTypes = [],
      similarityThreshold = 0.3,
      includeMetadata = true
    } = options;

    const cacheKey = `${query}-${limit}-${contentTypes.join(',')}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      // Get base content from Contentstack
      const baseContent = await contentstackService.fetchRelevantContent(query);

      // Apply multiple recommendation strategies
      const recommendations = await this.applyRecommendationStrategies(
        query,
        baseContent,
        { limit, contentTypes, similarityThreshold }
      );

      // Score and rank results
      const scoredResults = this.scoreAndRankResults(query, recommendations);

      // Filter by threshold and limit
      const filteredResults = scoredResults
        .filter(result => result.score >= similarityThreshold)
        .slice(0, limit);

      const result = {
        query,
        results: filteredResults,
        totalFound: scoredResults.length,
        strategies: ['semantic', 'keyword', 'contextual'],
        metadata: includeMetadata ? {
          searchTimestamp: new Date().toISOString(),
          processingTime: Date.now() - Date.parse(new Date().toISOString()),
          strategiesUsed: ['semantic', 'keyword', 'contextual']
        } : null
      };

      this.setCachedResult(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error in content recommendation:', error);
      return {
        query,
        results: [],
        totalFound: 0,
        error: error.message,
        metadata: {
          searchTimestamp: new Date().toISOString(),
          error: true
        }
      };
    }
  }

  // Apply multiple recommendation strategies
  async applyRecommendationStrategies(query, baseContent, options) {
    const strategies = await Promise.all([
      this.semanticSearch(query, options),
      this.keywordSearch(query, options),
      this.contextualSearch(query, options)
    ]);

    // Combine and deduplicate results
    const combinedResults = new Map();

    strategies.forEach(strategyResults => {
      strategyResults.forEach(result => {
        const key = `${result.contentType}-${result.id || result.title}`;
        if (!combinedResults.has(key)) {
          combinedResults.set(key, result);
        } else {
          // Merge scores if result already exists
          const existing = combinedResults.get(key);
          existing.score = (existing.score + result.score) / 2;
          existing.strategies = [...(existing.strategies || []), ...(result.strategies || [])];
        }
      });
    });

    return Array.from(combinedResults.values());
  }

  // Semantic similarity search
  async semanticSearch(query, options) {
    // This would integrate with embedding models for semantic similarity
    // For now, we'll use keyword-based semantic matching
    const semanticTerms = this.extractSemanticTerms(query);
    const results = [];

    // Mock semantic search results
    const mockSemanticResults = [
      {
        id: 'semantic-1',
        title: 'Understanding AI and Machine Learning',
        content: 'Comprehensive guide to artificial intelligence and machine learning concepts',
        contentType: 'article',
        score: 0.8,
        strategies: ['semantic'],
        tags: ['AI', 'machine learning', 'technology']
      },
      {
        id: 'semantic-2',
        title: 'Natural Language Processing Basics',
        content: 'Introduction to NLP techniques and applications',
        contentType: 'tutorial',
        score: 0.6,
        strategies: ['semantic'],
        tags: ['NLP', 'AI', 'text processing']
      }
    ];

    return mockSemanticResults.filter(result =>
      semanticTerms.some(term =>
        result.title.toLowerCase().includes(term) ||
        result.content.toLowerCase().includes(term) ||
        result.tags.some(tag => tag.toLowerCase().includes(term))
      )
    );
  }

  // Keyword-based search
  async keywordSearch(query, options) {
    const keywords = this.extractKeywords(query);
    const results = [];

    // Mock keyword search results
    const mockKeywordResults = [
      {
        id: 'keyword-1',
        title: 'JavaScript Best Practices',
        content: 'Essential JavaScript coding standards and best practices',
        contentType: 'guide',
        score: 0.7,
        strategies: ['keyword'],
        tags: ['JavaScript', 'programming', 'best practices']
      },
      {
        id: 'keyword-2',
        title: 'React Component Patterns',
        content: 'Common patterns for building React components',
        contentType: 'tutorial',
        score: 0.5,
        strategies: ['keyword'],
        tags: ['React', 'components', 'patterns']
      }
    ];

    return mockKeywordResults.filter(result =>
      keywords.some(keyword =>
        result.title.toLowerCase().includes(keyword) ||
        result.content.toLowerCase().includes(keyword) ||
        result.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    );
  }

  // Contextual search based on conversation context
  async contextualSearch(query, options) {
    // This would analyze conversation history for context
    // For now, we'll use topic modeling
    const topics = this.extractTopics(query);
    const results = [];

    // Mock contextual search results
    const mockContextualResults = [
      {
        id: 'contextual-1',
        title: 'Web Development Trends 2024',
        content: 'Latest trends and technologies in web development',
        contentType: 'article',
        score: 0.6,
        strategies: ['contextual'],
        tags: ['web development', 'trends', 'technology']
      },
      {
        id: 'contextual-2',
        title: 'Building Scalable Applications',
        content: 'Architecture patterns for scalable software systems',
        contentType: 'guide',
        score: 0.4,
        strategies: ['contextual'],
        tags: ['architecture', 'scalability', 'software']
      }
    ];

    return mockContextualResults.filter(result =>
      topics.some(topic =>
        result.title.toLowerCase().includes(topic) ||
        result.content.toLowerCase().includes(topic) ||
        result.tags.some(tag => tag.toLowerCase().includes(topic))
      )
    );
  }

  // Score and rank results using multiple factors
  scoreAndRankResults(query, results) {
    return results.map(result => {
      let score = result.score || 0;

      // Boost score based on title match
      if (result.title && query.toLowerCase().includes(result.title.toLowerCase().split(' ')[0])) {
        score += 0.2;
      }

      // Boost score based on content relevance
      const queryWords = query.toLowerCase().split(' ');
      const titleWords = result.title.toLowerCase().split(' ');
      const contentWords = result.content.toLowerCase().split(' ');

      const titleMatches = queryWords.filter(word =>
        titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
      ).length;

      const contentMatches = queryWords.filter(word =>
        contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
      ).length;

      score += (titleMatches * 0.1) + (contentMatches * 0.05);

      // Boost score for recent content (if available)
      if (result.publishDate) {
        const daysSincePublished = (Date.now() - new Date(result.publishDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) {
          score += 0.1; // Boost recent content
        }
      }

      // Normalize score
      score = Math.min(score, 1.0);

      return {
        ...result,
        score: Math.round(score * 100) / 100
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Extract semantic terms from query
  extractSemanticTerms(query) {
    const semanticTerms = [
      'explain', 'describe', 'what is', 'how to', 'guide', 'tutorial',
      'introduction', 'overview', 'basics', 'fundamentals', 'advanced',
      'best practices', 'examples', 'implementation', 'use case'
    ];

    return semanticTerms.filter(term =>
      query.toLowerCase().includes(term)
    );
  }

  // Extract keywords from query
  extractKeywords(query) {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'how', 'what', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other'].includes(word));
  }

  // Extract topics from query
  extractTopics(query) {
    const topics = [];
    const queryLower = query.toLowerCase();

    // Technology topics
    if (queryLower.match(/ai|artificial intelligence|machine learning|ml|neural|deep learning/)) {
      topics.push('artificial intelligence', 'machine learning');
    }

    // Programming topics
    if (queryLower.match(/javascript|react|node|python|java|programming|code|development/)) {
      topics.push('programming', 'development');
    }

    // Web topics
    if (queryLower.match(/web|website|frontend|backend|api|database/)) {
      topics.push('web development');
    }

    // Business topics
    if (queryLower.match(/business|strategy|marketing|sales|management/)) {
      topics.push('business');
    }

    return topics;
  }

  // Get related content recommendations
  async getRelatedContent(contentId, options = {}) {
    const { limit = 3, excludeCurrent = true } = options;

    // This would typically query for content with similar tags, categories, or topics
    // For now, return mock related content
    return [
      {
        id: 'related-1',
        title: 'Related Content 1',
        content: 'This content is related to the current topic',
        contentType: 'article',
        score: 0.7,
        tags: ['related', 'similar']
      },
      {
        id: 'related-2',
        title: 'Related Content 2',
        content: 'Another piece of related content',
        contentType: 'tutorial',
        score: 0.6,
        tags: ['related', 'tutorial']
      }
    ].slice(0, limit);
  }

  // Get trending content
  async getTrendingContent(options = {}) {
    const { limit = 5, timeframe = '7d' } = options;

    // This would typically query analytics for popular content
    // For now, return mock trending content
    return [
      {
        id: 'trending-1',
        title: 'Most Popular Content',
        content: 'This is currently trending content',
        contentType: 'article',
        views: 1250,
        score: 0.9,
        tags: ['trending', 'popular']
      },
      {
        id: 'trending-2',
        title: 'Hot Topic Discussion',
        content: 'Content generating lots of engagement',
        contentType: 'discussion',
        views: 890,
        score: 0.8,
        tags: ['trending', 'discussion']
      }
    ].slice(0, limit);
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    if (this.cache.size > 1000) {
      const oldestKeys = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 100)
        .map(([key]) => key);

      oldestKeys.forEach(key => this.cache.delete(key));
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxAge: this.cacheTimeout,
      hitRate: 0 // Would need to track hits/misses for this
    };
  }
}

module.exports = new ContentRecommendationService();
