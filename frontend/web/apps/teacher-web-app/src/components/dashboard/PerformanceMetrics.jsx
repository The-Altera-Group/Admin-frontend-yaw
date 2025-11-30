import React from 'react';
import { TrendingUp, Target, Award, Clock } from 'lucide-react';

const PerformanceMetrics = ({ stats, loading }) => {
  const metrics = [
    {
      title: 'Class Performance',
      value: '87%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Learning Goals',
      value: '12/15',
      change: '80% achieved',
      trend: 'stable',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Student Engagement',
      value: '94%',
      change: '+8.1%',
      trend: 'up',
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Avg. Response Time',
      value: '4.2h',
      change: '-1.3h',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="performance-metrics card">
        <div className="card-header">
          <h3>Performance Metrics</h3>
        </div>
        <div className="card-content">
          <div className="metrics-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-metrics card">
      <div className="card-header">
        <h3>Performance Metrics</h3>
        <span className="card-subtitle">This month's progress</span>
      </div>
      
      <div className="card-content">
        <div className="metrics-grid">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.title} className="metric-item">
                <div className="metric-icon">
                  <IconComponent size={20} />
                </div>
                <div className="metric-content">
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-title">{metric.title}</div>
                  <div className={`metric-change ${metric.trend}`}>
                    {metric.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PerformanceMetrics);