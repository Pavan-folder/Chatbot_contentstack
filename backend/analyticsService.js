const fs = require('fs').promises;
const path = require('path');

class AnalyticsService {
  constructor() {
    this.analyticsFile = path.join(__dirname, 'analytics.json');
    this.initializeAnalytics();
  }

  async initializeAnalytics() {
    try {
      await fs.access(this.analyticsFile);
    } catch (error) {
      // Create initial analytics file if it doesn't exist
      const initialAnalytics = {
        totalRequests: 0,
        totalUsers: 0,
        providerUsage: {
          openai: 0,
          groq: 0,
          anthropic: 0
        },
        contentQueries: [],
        performanceMetrics: [],
        errorLogs: [],
        dailyStats: {},
        popularQueries: {},
        responseTimes: [],
        userSessions: new Set()
      };
      await this.saveAnalytics(initialAnalytics);
    }
  }

  async saveAnalytics(analytics) {
    try {
      await fs.writeFile(this.analyticsFile, JSON.stringify(analytics, null, 2));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  async loadAnalytics() {
    try {
      const data = await fs.readFile(this.analyticsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      return null;
    }
  }

  async trackRequest(req, provider, responseTime, success = true) {
    const analytics = await this.loadAnalytics();
    if (!analytics) return;

    // Update basic metrics
    analytics.totalRequests++;

    // Track provider usage
    if (analytics.providerUsage[provider] !== undefined) {
      analytics.providerUsage[provider]++;
    }

    // Track response time
    analytics.responseTimes.push({
      timestamp: new Date().toISOString(),
      provider,
      responseTime,
      success
    });

    // Keep only last 1000 response times
    if (analytics.responseTimes.length > 1000) {
      analytics.responseTimes = analytics.responseTimes.slice(-1000);
    }

    // Track user sessions (using IP as identifier)
    const userId = req.ip || req.connection.remoteAddress;
    if (userId && !analytics.userSessions.has(userId)) {
      analytics.userSessions.add(userId);
      analytics.totalUsers = analytics.userSessions.size;
    }

    // Track daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = {
        requests: 0,
        errors: 0,
        avgResponseTime: 0
      };
    }
    analytics.dailyStats[today].requests++;
    if (!success) {
      analytics.dailyStats[today].errors++;
    }

    // Calculate average response time for today
    const todayStats = analytics.dailyStats[today];
    todayStats.avgResponseTime = analytics.responseTimes.length > 0
      ? analytics.responseTimes.slice(-100).reduce((sum, rt) => sum + rt.responseTime, 0) / Math.min(100, analytics.responseTimes.length)
      : responseTime;

    // Track content queries
    if (req.body && req.body.messages && req.body.messages.length > 0) {
      const userMessage = req.body.messages[req.body.messages.length - 1].content;
      if (userMessage && userMessage.length > 10) {
        const queryKey = userMessage.toLowerCase().substring(0, 50);
        analytics.popularQueries[queryKey] = (analytics.popularQueries[queryKey] || 0) + 1;

        analytics.contentQueries.push({
          timestamp: new Date().toISOString(),
          query: userMessage.substring(0, 200), // Limit query length
          provider,
          responseTime,
          success
        });

        // Keep only last 1000 queries
        if (analytics.contentQueries.length > 1000) {
          analytics.contentQueries = analytics.contentQueries.slice(-1000);
        }
      }
    }

    await this.saveAnalytics(analytics);
  }

  async trackError(error, provider, context = '') {
    const analytics = await this.loadAnalytics();
    if (!analytics) return;

    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      provider,
      context,
      stack: error.stack
    };

    analytics.errorLogs.push(errorLog);

    // Keep only last 100 errors
    if (analytics.errorLogs.length > 100) {
      analytics.errorLogs = analytics.errorLogs.slice(-100);
    }

    await this.saveAnalytics(analytics);
  }

  async getAnalytics() {
    const analytics = await this.loadAnalytics();
    if (!analytics) return null;

    // Calculate performance metrics
    const avgResponseTime = analytics.responseTimes.length > 0
      ? analytics.responseTimes.reduce((sum, rt) => sum + rt.responseTime, 0) / analytics.responseTimes.length
      : 0;

    const successRate = analytics.totalRequests > 0
      ? ((analytics.totalRequests - analytics.errorLogs.length) / analytics.totalRequests) * 100
      : 100;

    // Get top queries
    const topQueries = Object.entries(analytics.popularQueries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Get recent errors
    const recentErrors = analytics.errorLogs.slice(-5);

    return {
      overview: {
        totalRequests: analytics.totalRequests,
        totalUsers: analytics.totalUsers,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        successRate: Math.round(successRate * 100) / 100
      },
      providerUsage: analytics.providerUsage,
      topQueries,
      recentErrors,
      dailyStats: analytics.dailyStats,
      performanceMetrics: {
        responseTimes: analytics.responseTimes.slice(-50), // Last 50 for chart
        errorRate: 100 - successRate
      }
    };
  }

  async getDashboardData() {
    const analytics = await this.loadAnalytics();
    if (!analytics) return null;

    const now = new Date();
    const last7Days = {};

    // Generate last 7 days data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = analytics.dailyStats[dateStr] || {
        requests: 0,
        errors: 0,
        avgResponseTime: 0
      };
    }

    return {
      summary: {
        today: analytics.dailyStats[now.toISOString().split('T')[0]] || { requests: 0, errors: 0, avgResponseTime: 0 },
        thisWeek: Object.values(last7Days).reduce((acc, day) => ({
          requests: acc.requests + day.requests,
          errors: acc.errors + day.errors,
          avgResponseTime: acc.avgResponseTime + day.avgResponseTime
        }), { requests: 0, errors: 0, avgResponseTime: 0 }),
        total: {
          requests: analytics.totalRequests,
          users: analytics.totalUsers,
          errors: analytics.errorLogs.length
        }
      },
      charts: {
        dailyRequests: last7Days,
        providerUsage: analytics.providerUsage,
        topQueries: Object.entries(analytics.popularQueries)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      },
      recentActivity: {
        recentQueries: analytics.contentQueries.slice(-10).reverse(),
        recentErrors: analytics.errorLogs.slice(-5)
      }
    };
  }
}

module.exports = new AnalyticsService();
