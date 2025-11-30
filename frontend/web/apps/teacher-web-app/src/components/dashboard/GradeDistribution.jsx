import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target, 
  Eye,
  Filter,
  ArrowRight,
  Users,
  Percent
} from 'lucide-react';

const GradeDistribution = ({ data, loading }) => {
  const navigate = useNavigate();
  const [hoveredGrade, setHoveredGrade] = useState(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationTriggered(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      normalizedPercentage: Math.max(item.percentage, 5), // Ensure minimum height for visibility
      index
    })).sort((a, b) => {
      const gradeOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
      return (gradeOrder[b.grade] || 0) - (gradeOrder[a.grade] || 0);
    });
  }, [data]);

  const maxPercentage = useMemo(() => {
    if (!chartData.length) return 100;
    return Math.max(...chartData.map(item => item.percentage), 100);
  }, [chartData]);

  const totalStudents = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  const performanceMetrics = useMemo(() => {
    if (!chartData.length) return {};
    
    const aGrades = chartData.find(d => d.grade === 'A')?.percentage || 0;
    const bGrades = chartData.find(d => d.grade === 'B')?.percentage || 0;
    const abCombined = aGrades + bGrades;
    const passingGrades = chartData.filter(d => ['A', 'B', 'C'].includes(d.grade))
                                   .reduce((sum, d) => sum + d.percentage, 0);

    return {
      excellence: Math.round(aGrades),
      proficiency: Math.round(abCombined),
      passing: Math.round(passingGrades),
      average: Math.round(chartData.reduce((sum, d) => {
        const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        return sum + (gradePoints[d.grade] || 0) * d.percentage;
      }, 0) / 100 * 10) / 10
    };
  }, [chartData]);

  const handleBarClick = (grade) => {
    navigate(`/grades?filter=${grade}`);
  };

  if (loading) {
    return (
      <div className="grade-distribution card">
        <div className="card-header">
          <div className="header-content">
            <BarChart3 size={20} className="header-icon" />
            <h3>Grade Distribution</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="distribution-skeleton"></div>
        </div>
      </div>
    );
  }

  const hasData = chartData && chartData.length > 0;

  return (
    <div className="grade-distribution card">
      <div className="card-header">
        <div className="header-content">
          <BarChart3 size={20} className="header-icon" />
          <div className="header-main">
            <h3>Grade Distribution</h3>
            <div className="data-indicator">
              <Users size={14} />
              <span>{totalStudents} students analyzed</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="filter-btn"
            title="Filter options"
          >
            <Filter size={16} />
            Filter
          </button>
          <button 
            className="view-details-btn"
            onClick={() => navigate('/grades')}
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
      
      <div className="card-content">
        {hasData ? (
          <>
            {/* Performance Overview */}
            <div className="performance-overview">
              <div className="metric-card excellence">
                <div className="metric-icon">
                  <Award size={16} />
                </div>
                <div className="metric-content">
                  <span className="metric-value">{performanceMetrics.excellence}%</span>
                  <span className="metric-label">Excellence (A)</span>
                </div>
              </div>
              
              <div className="metric-card proficiency">
                <div className="metric-icon">
                  <Target size={16} />
                </div>
                <div className="metric-content">
                  <span className="metric-value">{performanceMetrics.proficiency}%</span>
                  <span className="metric-label">Proficient (A+B)</span>
                </div>
              </div>
              
              <div className="metric-card passing">
                <div className="metric-icon">
                  <TrendingUp size={16} />
                </div>
                <div className="metric-content">
                  <span className="metric-value">{performanceMetrics.passing}%</span>
                  <span className="metric-label">Passing Rate</span>
                </div>
              </div>
              
              <div className="metric-card average">
                <div className="metric-icon">
                  <Percent size={16} />
                </div>
                <div className="metric-content">
                  <span className="metric-value">{performanceMetrics.average}</span>
                  <span className="metric-label">GPA Average</span>
                </div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="distribution-chart">
              <div className="chart-container">
                {chartData.map((item, index) => (
                  <div 
                    key={item.grade} 
                    className={`distribution-bar ${hoveredGrade === item.grade ? 'hovered' : ''}`}
                    onClick={() => handleBarClick(item.grade)}
                    onMouseEnter={() => setHoveredGrade(item.grade)}
                    onMouseLeave={() => setHoveredGrade(null)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleBarClick(item.grade)}
                    style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                  >
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: animationTriggered ? `${(item.normalizedPercentage / maxPercentage) * 100}%` : '0%',
                          background: item.color || getGradeColor(item.grade)
                        }}
                      >
                        <div className="bar-shimmer"></div>
                      </div>
                      
                      {/* Hover tooltip */}
                      {hoveredGrade === item.grade && (
                        <div className="grade-tooltip">
                          <div className="tooltip-header">
                            <span className="tooltip-grade">{item.grade}</span>
                            <span className="tooltip-percentage">{item.percentage}%</span>
                          </div>
                          <div className="tooltip-content">
                            <span>{item.count} students</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bar-label">
                      <span className="grade-letter">{item.grade}</span>
                      <span className="grade-count">{item.count}</span>
                    </div>

                    <style jsx>{`
                      .distribution-bar {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        cursor: pointer;
                        transition: all var(--transition-medium);
                        opacity: 0;
                        transform: translateY(20px);
                        animation: barSlideIn 0.6s ease forwards;
                      }

                      @keyframes barSlideIn {
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }

                      .distribution-bar:hover {
                        transform: translateY(-4px);
                      }

                      .distribution-bar.hovered .bar-fill {
                        filter: brightness(1.1) drop-shadow(0 0 10px currentColor);
                      }

                      .bar-container {
                        position: relative;
                        width: 32px;
                        height: 120px;
                        display: flex;
                        align-items: flex-end;
                        margin-bottom: 0.5rem;
                      }

                      .bar-fill {
                        width: 100%;
                        border-radius: 6px 6px 2px 2px;
                        transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                        min-height: 8px;
                      }

                      .bar-shimmer {
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                        animation: shimmer 2s infinite;
                      }

                      @keyframes shimmer {
                        0% { left: -100%; }
                        100% { left: 100%; }
                      }

                      .grade-tooltip {
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: var(--bg-primary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-sm);
                        padding: 0.5rem;
                        margin-bottom: 0.5rem;
                        box-shadow: var(--shadow-md);
                        z-index: 10;
                        animation: tooltipFadeIn 0.2s ease;
                        min-width: 80px;
                      }

                      @keyframes tooltipFadeIn {
                        from { opacity: 0; transform: translateX(-50%) translateY(4px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                      }

                      .tooltip-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.25rem;
                      }

                      .tooltip-grade {
                        font-weight: 700;
                        color: var(--text-primary);
                        font-size: 1rem;
                      }

                      .tooltip-percentage {
                        font-weight: 600;
                        color: var(--accent-gold);
                        font-size: 0.875rem;
                        font-family: var(--font-mono);
                      }

                      .tooltip-content {
                        font-size: 0.75rem;
                        color: var(--text-muted);
                      }

                      .bar-label {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.125rem;
                      }

                      .grade-letter {
                        font-weight: 700;
                        color: var(--text-primary);
                        font-size: 0.875rem;
                      }

                      .grade-count {
                        font-size: 0.75rem;
                        color: var(--text-muted);
                        font-family: var(--font-mono);
                      }
                    `}</style>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend and Actions */}
            <div className="distribution-footer">
              <div className="grade-legend">
                {chartData.map(item => (
                  <div 
                    key={item.grade} 
                    className={`legend-item ${hoveredGrade === item.grade ? 'highlighted' : ''}`}
                    onClick={() => handleBarClick(item.grade)}
                    onMouseEnter={() => setHoveredGrade(item.grade)}
                    onMouseLeave={() => setHoveredGrade(null)}
                  >
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: item.color || getGradeColor(item.grade) }}
                    ></div>
                    <span className="legend-grade">{item.grade} Grade</span>
                    <span className="legend-stats">{item.percentage}% ({item.count})</span>
                  </div>
                ))}
              </div>

              <button 
                className="text-link view-gradebook"
                onClick={() => navigate('/grades')}
              >
                Open detailed gradebook
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 size={48} />
              <div className="empty-decoration"></div>
            </div>
            <h4>No grade data available</h4>
            <p>Start grading assignments to see distribution analytics</p>
            <button 
              className="text-link grade-link"
              onClick={() => navigate('/assignments')}
            >
              <Award size={16} />
              Begin grading
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .grade-distribution {
          animation: fadeInUp 0.6s ease;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          color: var(--accent-blue);
          animation: iconFloat 6s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          50% { 
            transform: translateY(-3px) rotate(5deg); 
          }
        }

        .header-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .header-main h3 {
          margin: 0;
        }

        .data-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn,
        .view-details-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-medium);
        }

        .filter-btn:hover {
          background: var(--bg-hover);
          color: var(--accent-orange);
          border-color: var(--accent-orange);
        }

        .view-details-btn:hover {
          background: var(--bg-hover);
          color: var(--accent-blue);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
        }

        .performance-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          transition: all var(--transition-medium);
        }

        .metric-card:hover {
          background: var(--bg-hover);
          transform: translateY(-2px);
        }

        .metric-card.excellence {
          border-left: 3px solid #2ecc71;
        }

        .metric-card.excellence:hover {
          border-left-color: #27ae60;
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
        }

        .metric-card.proficiency {
          border-left: 3px solid #3498db;
        }

        .metric-card.proficiency:hover {
          border-left-color: #2980b9;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
        }

        .metric-card.passing {
          border-left: 3px solid #f39c12;
        }

        .metric-card.passing:hover {
          border-left-color: #e67e22;
          box-shadow: 0 4px 15px rgba(243, 156, 18, 0.2);
        }

        .metric-card.average {
          border-left: 3px solid #9b59b6;
        }

        .metric-card.average:hover {
          border-left-color: #8e44ad;
          box-shadow: 0 4px 15px rgba(155, 89, 182, 0.2);
        }

        .metric-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border-radius: 50%;
          color: var(--text-secondary);
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .metric-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .metric-label {
          font-size: 0.625rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .distribution-chart {
          margin-bottom: 1.5rem;
        }

        .chart-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          padding: 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          position: relative;
        }

        .chart-container::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 1rem;
          right: 1rem;
          height: 1px;
          background: var(--border-color);
        }

        .distribution-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .grade-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-medium);
        }

        .legend-item:hover,
        .legend-item.highlighted {
          background: var(--bg-glass);
          transform: translateY(-1px);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .legend-grade {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .legend-stats {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .view-gradebook {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-medium);
          white-space: nowrap;
        }

        .view-gradebook:hover {
          transform: translateX(4px);
        }

        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
        }

        .empty-icon {
          position: relative;
          display: inline-flex;
          margin-bottom: 1rem;
          color: var(--text-muted);
          opacity: 0.5;
        }

        .empty-decoration {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          background: var(--accent-blue);
          border-radius: 50%;
          opacity: 0.3;
          animation: decorationPulse 3s ease-in-out infinite;
        }

        @keyframes decorationPulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.6; 
          }
        }

        .empty-state h4 {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .grade-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          transition: all var(--transition-medium);
        }

        .grade-link:hover {
          background: var(--bg-hover);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .performance-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .distribution-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .grade-legend {
            justify-content: center;
          }

          .view-gradebook {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

const getGradeColor = (grade) => {
  const colorMap = {
    'A': '#2ecc71',
    'B': '#3498db', 
    'C': '#f39c12',
    'D': '#e67e22',
    'F': '#e74c3c'
  };
  return colorMap[grade] || '#95a5a6';
};

export default React.memo(GradeDistribution);