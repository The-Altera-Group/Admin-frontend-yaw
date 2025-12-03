import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

const StudentPerformanceChart = ({ data = [], loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const defaultData = [
    { label: 'Mon', value: 78, students: 24 },
    { label: 'Tue', value: 82, students: 26 },
    { label: 'Wed', value: 75, students: 23 },
    { label: 'Thu', value: 88, students: 28 },
    { label: 'Fri', value: 85, students: 27 },
    { label: 'Sat', value: 80, students: 25 },
    { label: 'Sun', value: 90, students: 29 }
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const maxValue = Math.max(...chartData.map(d => d.value));
  const avgValue = Math.round(chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length);
  const trend = chartData[chartData.length - 1].value > chartData[0].value ? 'up' : 'down';
  const trendPercent = Math.abs(
    ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
  ).toFixed(1);

  if (loading) {
    return (
      <div className="performance-chart card">
        <div className="card-header">
          <h3>Student Performance</h3>
        </div>
        <div className="card-content">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-chart card">
      <div className="card-header">
        <div className="header-content">
          <h3>Student Performance</h3>
          <p className="chart-subtitle">Average class scores over time</p>
        </div>
        <div className="period-selector">
          <button
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button
            className={selectedPeriod === 'year' ? 'active' : ''}
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="chart-stats">
          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <Target size={18} />
            </div>
            <div>
              <div className="stat-value">{avgValue}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
              <Users size={18} />
            </div>
            <div>
              <div className="stat-value">{chartData[chartData.length - 1].students}</div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>

          <div className="stat-box">
            <div
              className="stat-icon"
              style={{
                background: trend === 'up' ? '#dcfce7' : '#fee2e2',
                color: trend === 'up' ? '#22c55e' : '#ef4444'
              }}
            >
              {trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <div className="stat-value" style={{ color: trend === 'up' ? '#22c55e' : '#ef4444' }}>
                {trend === 'up' ? '+' : '-'}{trendPercent}%
              </div>
              <div className="stat-label">Trend</div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-grid">
            {[100, 75, 50, 25, 0].map((line) => (
              <div key={line} className="grid-line">
                <span className="grid-label">{line}%</span>
              </div>
            ))}
          </div>

          <div className="chart-bars">
            {chartData.map((item, index) => (
              <div key={index} className="bar-container">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      height: `${(item.value / 100) * 100}%`,
                      background:
                        item.value >= 85
                          ? 'linear-gradient(180deg, #22c55e, #16a34a)'
                          : item.value >= 70
                          ? 'linear-gradient(180deg, #3b82f6, #2563eb)'
                          : 'linear-gradient(180deg, #f59e0b, #d97706)'
                    }}
                  >
                    <div className="bar-tooltip">
                      <div className="tooltip-value">{item.value}%</div>
                      <div className="tooltip-students">{item.students} students</div>
                    </div>
                  </div>
                  {item.value === maxValue && (
                    <div className="peak-indicator">★</div>
                  )}
                </div>
                <div className="bar-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#22c55e' }}></div>
            <span>Excellent (85%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }}></div>
            <span>Good (70-84%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Needs Improvement (&lt;70%)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header-content p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .period-selector {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .period-selector button {
          padding: 0.375rem 0.75rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .period-selector button:hover {
          background: var(--bg-hover);
        }

        .period-selector button.active {
          background: var(--primary-green);
          color: white;
        }

        .chart-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .chart-container {
          position: relative;
          height: 250px;
          margin-bottom: 1rem;
        }

        .chart-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .grid-line {
          display: flex;
          align-items: center;
          border-bottom: 1px dashed var(--border-color);
          padding-right: 1rem;
        }

        .grid-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-right: 0.5rem;
          min-width: 35px;
          text-align: right;
        }

        .chart-bars {
          position: absolute;
          bottom: 30px;
          left: 45px;
          right: 0;
          height: 220px;
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar-wrapper {
          width: 100%;
          height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          position: relative;
        }

        .bar {
          width: 100%;
          max-width: 50px;
          border-radius: 0.375rem 0.375rem 0 0;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .bar:hover {
          opacity: 0.8;
          transform: translateY(-3px);
        }

        .bar:hover .bar-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(5px);
          background: var(--gray-900);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .bar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: var(--gray-900);
        }

        .tooltip-value {
          font-weight: 700;
          font-size: 0.875rem;
        }

        .tooltip-students {
          font-size: 0.6875rem;
          opacity: 0.8;
          margin-top: 0.125rem;
        }

        .peak-indicator {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          color: #f59e0b;
          font-size: 1.25rem;
          animation: twinkle 2s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.1); }
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .chart-stats {
            grid-template-columns: 1fr;
          }

          .period-selector {
            width: 100%;
            margin-top: 0.5rem;
          }

          .period-selector button {
            flex: 1;
          }

          .chart-legend {
            flex-direction: column;
            gap: 0.5rem;
          }

          .chart-container {
            height: 200px;
          }

          .bar-wrapper {
            height: 170px;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(StudentPerformanceChart);
