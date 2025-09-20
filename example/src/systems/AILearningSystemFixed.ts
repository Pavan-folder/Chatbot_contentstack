/**
 * ==============================================
 * AI LEARNING SYSTEM - SELF-IMPROVING CHATBOT
 * ==============================================
 * Advanced machine learning system that improves
 * chatbot responses based on user interactions
 */

interface UserInteraction {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  rating?: number;
  context: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  responseTime: number;
}

interface LearningPattern {
  id: string;
  trigger: string;
  response: string;
  effectiveness: number;
  usageCount: number;
  lastUsed: Date;
  context: string[];
  userSegments: string[];
}

interface UserProfile {
  id: string;
  preferences: Record<string, any>;
  interactionHistory: UserInteraction[];
  learningProgress: number;
  satisfactionScore: number;
  commonTopics: string[];
  preferredResponseStyle: 'formal' | 'casual' | 'friendly' | 'professional';
}

class AILearningEngine {
  private interactions: Map<string, UserInteraction[]> = new Map();
  private patterns: Map<string, LearningPattern[]> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private learningRate: number = 0.1;
  private minConfidence: number = 0.7;

  constructor() {
    this.initializeLearningSystem();
  }

  /**
   * Initialize the learning system with default patterns
   */
  private async initializeLearningSystem() {
    console.log('🤖 Initializing AI Learning System...');

    // Load existing data from storage
    await this.loadFromStorage();

    // Set up periodic learning cycles
    setInterval(() => {
      this.performLearningCycle();
    }, 30000); // Every 30 seconds

    console.log('✅ AI Learning System initialized');
  }

  /**
   * Record a new user interaction
   */
  async recordInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> {
    const fullInteraction: UserInteraction = {
      ...interaction,
      id: this.generateId(),
      timestamp: new Date()
    };

    // Store interaction
    const userInteractions = this.interactions.get(interaction.userId) || [];
    userInteractions.push(fullInteraction);
    this.interactions.set(interaction.userId, userInteractions);

    // Update user profile
    await this.updateUserProfile(interaction.userId, fullInteraction);

    // Analyze and learn from interaction
    await this.analyzeInteraction(fullInteraction);
  }

  /**
   * Generate improved response based on learning
   */
  async generateImprovedResponse(
    userId: string,
    message: string,
    context: string[] = []
  ): Promise<string> {
    // Get user profile
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.generateFallbackResponse(message);
    }

    // Find relevant patterns
    const relevantPatterns = this.findRelevantPatterns(message, context, profile);

    if (relevantPatterns.length > 0 && relevantPatterns[0].effectiveness > this.minConfidence) {
      const bestPattern = relevantPatterns[0];
      await this.updatePatternUsage(bestPattern.id);
      return this.adaptResponse(bestPattern.response, profile);
    }

    // Generate new response using learning insights
    return this.generateAdaptiveResponse(message, profile);
  }

  /**
   * Update user profile based on interaction
   */
  private async updateUserProfile(userId: string, interaction: UserInteraction): Promise<void> {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        id: userId,
        preferences: {},
        interactionHistory: [],
        learningProgress: 0,
        satisfactionScore: 0.5,
        commonTopics: [],
        preferredResponseStyle: 'friendly'
      };
    }

    // Update interaction history
    profile.interactionHistory.push(interaction);

    // Analyze preferences
    await this.analyzeUserPreferences(profile, interaction);

    // Update satisfaction score
    if (interaction.rating) {
      profile.satisfactionScore =
        (profile.satisfactionScore + interaction.rating) / 2;
    }

    // Update common topics
    this.updateCommonTopics(profile, interaction);

    this.userProfiles.set(userId, profile);
    await this.saveUserProfile(profile);
  }

  /**
   * Analyze interaction for learning opportunities
   */
  private async analyzeInteraction(interaction: UserInteraction): Promise<void> {
    // Extract patterns from successful interactions
    if (interaction.rating && interaction.rating > 3) {
      await this.createOrUpdatePattern(interaction);
    }

    // Learn from context and sentiment
    await this.learnFromContext(interaction);
  }

  /**
   * Find relevant patterns for a message
   */
  private findRelevantPatterns(
    message: string,
    context: string[],
    profile: UserProfile
  ): LearningPattern[] {
    const allPatterns: LearningPattern[] = [];

    // Get patterns by context
    context.forEach(ctx => {
      const contextPatterns = this.patterns.get(ctx) || [];
      allPatterns.push(...contextPatterns);
    });

    // Get patterns by user segment
    profile.commonTopics.forEach(topic => {
      const topicPatterns = this.patterns.get(topic) || [];
      allPatterns.push(...topicPatterns);
    });

    // Sort by effectiveness and relevance
    return allPatterns
      .filter(pattern => this.calculateRelevance(pattern, message, context) > 0.5)
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Calculate pattern relevance to current context
   */
  private calculateRelevance(pattern: LearningPattern, message: string, context: string[]): number {
    let relevance = 0;

    // Keyword matching
    const keywords = pattern.trigger.toLowerCase().split(' ');
    const messageWords = message.toLowerCase().split(' ');

    const keywordMatches = keywords.filter(keyword =>
      messageWords.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;

    relevance += (keywordMatches / keywords.length) * 0.6;

    // Context matching
    const contextMatches = pattern.context.filter(ctx =>
      context.some(c => c.toLowerCase().includes(ctx.toLowerCase()))
    ).length;

    relevance += (contextMatches / pattern.context.length) * 0.4;

    return Math.min(relevance, 1);
  }

  /**
   * Adapt response based on user profile
   */
  private adaptResponse(response: string, profile: UserProfile): string {
    let adapted = response;

    // Adapt based on preferred style
    switch (profile.preferredResponseStyle) {
      case 'formal':
        adapted = this.makeFormal(adapted);
        break;
      case 'casual':
        adapted = this.makeCasual(adapted);
        break;
      case 'professional':
        adapted = this.makeProfessional(adapted);
        break;
    }

    // Add personalized elements
    if (profile.preferences.name) {
      adapted = adapted.replace('{name}', profile.preferences.name);
    }

    return adapted;
  }

  /**
   * Generate adaptive response using learning insights
   */
  private generateAdaptiveResponse(message: string, profile: UserProfile): string {
    // Use learning insights to generate better responses
    const insights = this.extractInsights(profile);

    // Apply insights to improve response quality
    return this.applyInsights(message, insights, profile);
  }

  /**
   * Extract insights from user profile
   */
  private extractInsights(profile: UserProfile): any {
    return {
      commonTopics: profile.commonTopics,
      preferredStyle: profile.preferredResponseStyle,
      satisfactionLevel: profile.satisfactionScore,
      interactionCount: profile.interactionHistory.length
    };
  }

  /**
   * Apply insights to improve response
   */
  private applyInsights(message: string, insights: any, profile: UserProfile): string {
    // Generate response based on insights
    let response = '';

    if (insights.interactionCount < 5) {
      response = "I'm still learning about your preferences. How can I help you today?";
    } else if (insights.satisfactionLevel < 0.3) {
      response = "I notice you might not be fully satisfied. I'm learning to serve you better. What would you like me to improve?";
    } else {
      response = "Based on our previous conversations, I understand you might be interested in " +
                insights.commonTopics.slice(0, 2).join(' and ') + ". How can I assist you today?";
    }

    return response;
  }

  /**
   * Create or update learning pattern
   */
  private async createOrUpdatePattern(interaction: UserInteraction): Promise<void> {
    const patternId = this.generatePatternId(interaction);

    let pattern = {
      id: patternId,
      trigger: interaction.message,
      response: interaction.response,
      effectiveness: interaction.rating || 0.5,
      usageCount: 1,
      lastUsed: new Date(),
      context: interaction.context,
      userSegments: [interaction.userId]
    };

    // Store pattern by context
    interaction.context.forEach(ctx => {
      const contextPatterns = this.patterns.get(ctx) || [];
      const existingIndex = contextPatterns.findIndex(p => p.id === patternId);

      if (existingIndex >= 0) {
        // Update existing pattern
        contextPatterns[existingIndex] = {
          ...contextPatterns[existingIndex],
          effectiveness: (contextPatterns[existingIndex].effectiveness + pattern.effectiveness) / 2,
          usageCount: contextPatterns[existingIndex].usageCount + 1,
          lastUsed: new Date()
        };
      } else {
        contextPatterns.push(pattern);
      }

      this.patterns.set(ctx, contextPatterns);
    });
  }

  /**
   * Update pattern usage statistics
   */
  private async updatePatternUsage(patternId: string): Promise<void> {
    // Find and update pattern across all contexts
    for (const [context, patterns] of this.patterns.entries()) {
      const patternIndex = patterns.findIndex(p => p.id === patternId);
      if (patternIndex >= 0) {
        patterns[patternIndex].usageCount++;
        patterns[patternIndex].lastUsed = new Date();
        this.patterns.set(context, patterns);
      }
    }
  }

  /**
   * Perform learning cycle to improve patterns
   */
  private async performLearningCycle(): Promise<void> {
    // Analyze interaction patterns
    for (const [userId, interactions] of this.interactions.entries()) {
      if (interactions.length > 10) {
        await this.analyzeInteractionPatterns(userId, interactions);
      }
    }

    // Clean up old patterns
    await this.cleanupOldPatterns();

    // Save learning progress
    await this.saveLearningProgress();
  }

  /**
   * Analyze interaction patterns for insights
   */
  private async analyzeInteractionPatterns(userId: string, interactions: UserInteraction[]): Promise<void> {
    // Find patterns in user behavior
    const recentInteractions = interactions.slice(-20);

    // Analyze sentiment trends
    const sentimentTrend = this.analyzeSentimentTrend(recentInteractions);

    // Update user profile based on analysis
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.learningProgress = Math.min(profile.learningProgress + 0.01, 1);
      this.userProfiles.set(userId, profile);
    }
  }

  /**
   * Analyze sentiment trend
   */
  private analyzeSentimentTrend(interactions: UserInteraction[]): 'improving' | 'declining' | 'stable' {
    if (interactions.length < 5) return 'stable';

    const recent = interactions.slice(-3);
    const older = interactions.slice(-8, -5);

    const recentAvg = recent.reduce((sum, i) => sum + (i.rating || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, i) => sum + (i.rating || 0), 0) / older.length;

    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  /**
   * Clean up old or ineffective patterns
   */
  private async cleanupOldPatterns(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    for (const [context, patterns] of this.patterns.entries()) {
      const activePatterns = patterns.filter(pattern =>
        pattern.lastUsed > cutoffDate && pattern.effectiveness > 0.3
      );

      this.patterns.set(context, activePatterns);
    }
  }

  /**
   * Update common topics for user
   */
  private updateCommonTopics(profile: UserProfile, interaction: UserInteraction): void {
    // Extract topics from message
    const topics = this.extractTopics(interaction.message);

    topics.forEach(topic => {
      const index = profile.commonTopics.indexOf(topic);
      if (index > -1) {
        // Increase topic frequency
        profile.commonTopics.splice(index, 1);
        profile.commonTopics.unshift(topic);
      } else {
        profile.commonTopics.unshift(topic);
        if (profile.commonTopics.length > 10) {
          profile.commonTopics = profile.commonTopics.slice(0, 10);
        }
      }
    });
  }

  /**
   * Extract topics from message
   */
  private extractTopics(message: string): string[] {
    const commonTopics = [
      'help', 'support', 'question', 'problem', 'feature', 'bug',
      'account', 'login', 'password', 'payment', 'billing', 'order',
      'product', 'service', 'technical', 'general'
    ];

    const lowerMessage = message.toLowerCase();
    return commonTopics.filter(topic => lowerMessage.includes(topic));
  }

  /**
   * Analyze user preferences
   */
  private async analyzeUserPreferences(profile: UserProfile, interaction: UserInteraction): Promise<void> {
    // Analyze response style preference
    if (interaction.rating && interaction.rating > 4) {
      // User liked the response style
      const styleKeywords = {
        formal: ['please', 'thank you', 'sir', 'madam', 'regards'],
        casual: ['hey', 'cool', 'awesome', 'yeah', 'okay'],
        friendly: ['great', 'wonderful', 'fantastic', 'love', 'happy'],
        professional: ['certainly', 'absolutely', 'definitely', 'expert', 'solution']
      };

      const message = interaction.message.toLowerCase();
      for (const [style, keywords] of Object.entries(styleKeywords)) {
        const matches = keywords.filter(keyword => message.includes(keyword)).length;
        if (matches > 0) {
          profile.preferredResponseStyle = style as any;
          break;
        }
      }
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generatePatternId(interaction: UserInteraction): string {
    return `pattern_${interaction.userId}_${Date.now()}`;
  }

  private makeFormal(response: string): string {
    return response
      .replace(/\bhey\b/gi, 'Hello')
      .replace(/\byeah\b/gi, 'Yes')
      .replace(/\bokay\b/gi, 'Certainly');
  }

  private makeCasual(response: string): string {
    return response
      .replace(/\bHello\b/gi, 'Hey')
      .replace(/\bYes\b/gi, 'Yeah')
      .replace(/\bCertainly\b/gi, 'Sure');
  }

  private makeProfessional(response: string): string {
    return response
      .replace(/Hey/g, 'Hello')
      .replace(/Yeah/g, 'Yes')
      .replace(/Sure/g, 'Certainly');
  }

  private generateFallbackResponse(message: string): string {
    return `I understand you're asking about: "${message}". I'm still learning about your preferences. How can I assist you better?`;
  }

  private async learnFromContext(interaction: UserInteraction): Promise<void> {
    // Learn associations between context and successful responses
    if (interaction.rating && interaction.rating > 3) {
      interaction.context.forEach(ctx => {
        const contextPatterns = this.patterns.get(ctx) || [];
        contextPatterns.push({
          id: this.generateId(),
          trigger: interaction.message,
          response: interaction.response,
          effectiveness: interaction.rating,
          usageCount: 1,
          lastUsed: new Date(),
          context: interaction.context,
          userSegments: [interaction.userId]
        });
        this.patterns.set(ctx, contextPatterns);
      });
    }
  }

  // Storage methods
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('aiLearningData');
      if (stored) {
        const data = JSON.parse(stored);
        this.interactions = new Map(data.interactions);
        this.patterns = new Map(data.patterns);
        this.userProfiles = new Map(data.userProfiles);
      }
    } catch (error) {
      console.warn('Failed to load AI learning data:', error);
    }
  }

  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      localStorage.setItem(`userProfile_${profile.id}`, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  private async saveLearningProgress(): Promise<void> {
    try {
      const data = {
        interactions: Array.from(this.interactions.entries()),
        patterns: Array.from(this.patterns.entries()),
        userProfiles: Array.from(this.userProfiles.entries())
      };
      localStorage.setItem('aiLearningData', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save learning progress:', error);
    }
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): any {
    const profiles = Array.from(this.userProfiles.values());
    const totalInteractions = Array.from(this.interactions.values()).flat().length;
    const totalPatterns = Array.from(this.patterns.values()).flat().length;

    return {
      totalInteractions,
      totalPatterns,
      totalUsers: this.userProfiles.size,
      averageSatisfaction: this.userProfiles.size > 0 ?
        profiles.reduce((sum, profile) => sum + (profile.satisfactionScore || 0), 0) / this.userProfiles.size : 0
    };
  }

  /**
   * Reset learning data
   */
  async resetLearningData(): Promise<void> {
    this.interactions.clear();
    this.patterns.clear();
    this.userProfiles.clear();
    localStorage.removeItem('aiLearningData');
    console.log('🧹 AI Learning data reset');
  }
}

// Export singleton instance
export const aiLearningEngine = new AILearningEngine();
export default AILearningEngine;
