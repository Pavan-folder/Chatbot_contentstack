import React, { useState, useEffect } from 'react';
import '../styles/chatbot-design-system.css';

interface AnalyticsData {
  overview: {
    totalRequests: number;
    totalUsers: number;
    avgResponseTime: number;
    successRate: number;
  };
  providerUsage: {
    openai: number;
    groq: number;
    anthropic: number;
  };
  topQueries: Array<{ query: string; count: number }>;
  recentErrors: Array<{
    timestamp: string;
    error: string;
    provider: string;
    context: string;
  }>;
  dailyStats: Record<string, any>;
  performanceMetrics: {
    responseTimes: Array<{ timestamp: string; responseTime: number; success: boolean }>;
    errorRate: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3006/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chatbot-container" style={{ width: '800px', height: '600px' }}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">📊</div>
          <div className="chatbot-header-text">
            <h3 className="chatbot-title">Analytics Dashboard</h3>
            <p className="chatbot-subtitle">Loading...</p>
          </div>
        </div>
        <div className="chatbot-messages" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="chatbot-loading">
            <span>Loading analytics data</span>
            <div className="chatbot-loading-dots">
              <div className="chatbot-loading-dot"></div>
              <div className="chatbot-loading-dot"></div>
              <div className="chatbot-loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chatbot-container" style={{ width: '800px', height: '600px' }}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">📊</div>
          <div className="chatbot-header-text">
            <h3 className="chatbot-title">Analytics Dashboard</h3>
            <p className="chatbot-subtitle">Error loading data</p>
          </div>
        </div>
        <div className="chatbot-messages" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: 'var(--chat-text-secondary)' }}>
            <p>❌ Error: {error}</p>
            <button
              onClick={fetchAnalytics}
              style={{
                background: 'var(--chat-primary)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="chatbot-container" style={{ width: '900px', height: '700px' }} data-theme="modern">
      <div className="chatbot-header">
        <div className="chatbot-avatar">📊</div>
        <div className="chatbot-header-text">
          <h3 className="chatbot-title">Analytics Dashboard</h3>
          <p className="chatbot-subtitle">Real-time insights and metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="chatbot-messages" style={{ padding: '16px', overflowY: 'auto' }}>
        {/* Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--chat-bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--chat-border-light)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--chat-text-secondary)', fontSize: '14px' }}>Total Requests</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--chat-primary)' }}>
              {analytics.overview.totalRequests.toLocaleString()}
            </p>
          </div>

          <div style={{ background: 'var(--chat-bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--chat-border-light)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--chat-text-secondary)', fontSize: '14px' }}>Active Users</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--chat-secondary)' }}>
              {analytics.overview.totalUsers.toLocaleString()}
            </p>
          </div>

          <div style={{ background: 'var(--chat-bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--chat-border-light)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--chat-text-secondary)', fontSize: '14px' }}>Avg Response Time</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--chat-accent)' }}>
              {formatTime(analytics.overview.avgResponseTime)}
            </p>
          </div>

          <div style={{ background: 'var(--chat-bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--chat-border-light)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--chat-text-secondary)', fontSize: '14px' }}>Success Rate</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--chat-success)' }}>
              {analytics.overview.successRate}%
            </p>
          </div>
        </div>

        {/* Provider Usage */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Provider Usage</h4>
          <div style={{ display: 'flex', gap: '16px' }}>
            {Object.entries(analytics.providerUsage).map(([provider, count]) => (
              <div key={provider} style={{
                background: 'var(--chat-bg-secondary)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--chat-border-light)',
                flex: 1,
                textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--chat-text-secondary)', textTransform: 'uppercase' }}>
                  {provider}
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--chat-primary)' }}>
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Queries */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Popular Queries</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {analytics.topQueries.slice(0, 5).map((item, index) => (
              <div key={index} style={{
                background: 'var(--chat-bg-secondary)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--chat-border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--chat-text-primary)' }}>
                  {item.query}
                </span>
                <span style={{
                  background: 'var(--chat-primary)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        {analytics.recentErrors.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Recent Errors</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {analytics.recentErrors.map((error, index) => (
                <div key={index} style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#dc2626'
                }}>
                  <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                    {formatDate(error.timestamp)} • {error.provider}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {error.error}
                  </div>
                  {error.context && (
                    <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                      Context: {error.context}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Chart Placeholder */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Performance Metrics</h4>
          <div style={{
            background: 'var(--chat-bg-secondary)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--chat-border-light)',
            textAlign: 'center',
            color: 'var(--chat-text-secondary)'
          }}>
            <p>📈 Performance charts would be displayed here</p>
            <p style={{ fontSize: '12px' }}>Response time trends, error rate graphs, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
