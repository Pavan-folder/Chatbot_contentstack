class ContentstackService {
  constructor() {
    // Temporarily disable Contentstack initialization to fix server startup
    this.stack = null;
  }

  async fetchRelevantContent(query) {
    try {
      // Return empty content to allow LLM to respond based on its knowledge
      return [];
    } catch (error) {
      console.error('Error fetching content from Contentstack:', error);
      return [];
    }
  }
}

module.exports = new ContentstackService();
