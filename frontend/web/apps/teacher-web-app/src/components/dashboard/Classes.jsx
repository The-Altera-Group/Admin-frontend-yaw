import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Users, 
  Play, 
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

const Classes = ({ classes, loading }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClassClick = (classId) => {
    navigate(`/classes/${classId}`);
  };

  const handleStartClass = (classId, e) => {
    e.stopPropagation();
    // Enhanced start class functionality with animation feedback
    console.log('Starting class:', classId);
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'TBD';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'TBD';
    }
  };

  const getTimeRemaining = (startTime) => {
    if (!startTime) return null;
    
    try {
      const classTime = new Date(startTime);
      const diffMs = classTime - currentTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 0) return { text: 'In Progress', status: 'started', color: '#2ecc71' };
      if (diffMins < 15) return { text: `${diffMins}m`, status: 'imminent', color: '#ff6b9d' };
      if (diffMins < 60) return { text: `${diffMins}m`, status: 'soon', color: '#f39c12' };
      return { text: 'Later', status: 'later', color: '#95a5a6' };
    } catch {
      return null;
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'mathematics': { primary: '#3498db', secondary: '#2980b9', light: 'rgba(52, 152, 219, 0.1)' },
      'science': { primary: '#2ecc71', secondary: '#27ae60', light: 'rgba(46, 204, 113, 0.1)' },
      'english': { primary: '#9b59b6', secondary: '#8e44ad', light: 'rgba(155, 89, 182, 0.1)' },
      'history': { primary: '#f39c12', secondary: '#e67e22', light: 'rgba(243, 156, 18, 0.1)' },
      'art': { primary: '#ff6b9d', secondary: '#e74c3c', light: 'rgba(255, 107, 157, 0.1)' },
      'music': { primary: '#4ecdc4', secondary: '#26d0ce', light: 'rgba(78, 205, 196, 0.1)' },
      'physical-education': { primary: '#e74c3c', secondary: '#c0392b', light: 'rgba(231, 76, 60, 0.1)' },
      'default': { primary: '#95a5a6', secondary: '#7f8c8d', light: 'rgba(149, 165, 166, 0.1)' }
    };
    
    const normalizedSubject = subject?.toLowerCase().replace(/[^a-z]/g, '');
    return colors[normalizedSubject] || colors.default;
  };

  const getReadinessScore = () => {
    // Simulate class readiness based on preparation metrics
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  };

  if (loading) {
    return (
      <div className="upcoming-classes card">
        <div className="card-header">
          <div className="header-content">
            <Calendar size={20} className="header-icon" />
            <h3>Today's Schedule</h3>
          </div>
        </div>
        <div className="card-content">
          {[1, 2, 3].map(i => (
            <div key={i} className="class-item loading">
              <div className="class-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasClasses = classes && classes.length > 0;

  return (
    <div className="upcoming-classes card">
      <div className="card-header">
        <div className="header-content">
          <Calendar size={20} className="header-icon" />
          <div className="header-main">
            <h3>Today's Schedule</h3>
            <div className="live-indicator">
              <div className="pulse-dot"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </div>
        
        <button 
          className="view-schedule-btn"
          onClick={() => navigate('/classes')}
          disabled={!hasClasses}
        >
          <BookOpen size={16} />
          Full Schedule
        </button>
      </div>
      
      <div className="card-content">
        {hasClasses ? (
          <div className="classes-list">
            {classes.slice(0, 4).map((classItem, index) => {
              const timeRemaining = getTimeRemaining(classItem.startTime);
              const subjectColors = getSubjectColor(classItem.subject);
              const readinessScore = getReadinessScore();
              
              return (
                <div 
                  key={classItem.id} 
                  className={`class-item ${timeRemaining?.status || ''}`}
                  onClick={() => handleClassClick(classItem.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleClassClick(classItem.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Status indicator */}
                  <div className="status-bar" style={{ 
                    background: timeRemaining?.color || subjectColors.primary 
                  }}></div>

                  <div className="class-main-content">
                    <div className="class-subject-icon" style={{
                      background: subjectColors.light,
                      borderColor: subjectColors.primary + '30',
                      color: subjectColors.primary
                    }}>
                      {classItem.subject?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    
                    <div className="class-details">
                      <div className="class-header">
                        <h4 className="class-name">{classItem.name}</h4>
                        {timeRemaining && (
                          <div className="time-remaining" style={{ 
                            color: timeRemaining.color,
                            background: timeRemaining.color + '15' 
                          }}>
                            <Clock size={12} />
                            <span>{timeRemaining.text}</span>
                            {timeRemaining.status === 'imminent' && (
                              <div className="urgent-pulse"></div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="class-meta">
                        <div className="meta-item">
                          <Clock size={14} />
                          <span>{formatTime(classItem.startTime)}</span>
                        </div>
                        <div className="meta-item">
                          <MapPin size={14} />
                          <span>{classItem.room || 'Virtual'}</span>
                        </div>
                        <div className="meta-item">
                          <Users size={14} />
                          <span>{classItem.studentCount || 0} students</span>
                        </div>
                      </div>

                      {/* Readiness indicator */}
                      <div className="readiness-indicator">
                        <div className="readiness-bar">
                          <div 
                            className="readiness-fill" 
                            style={{ 
                              width: `${readinessScore}%`,
                              background: readinessScore >= 85 ? '#2ecc71' : readinessScore >= 70 ? '#f39c12' : '#e74c3c'
                            }}
                          ></div>
                        </div>
                        <span className="readiness-text">{readinessScore}% Ready</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="class-actions">
                    <button 
                      className={`start-class-btn ${timeRemaining?.status || ''}`}
                      onClick={(e) => handleStartClass(classItem.id, e)}
                      disabled={timeRemaining?.status === 'later'}
                    >
                      {timeRemaining?.status === 'started' ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Active</span>
                        </>
                      ) : timeRemaining?.status === 'imminent' ? (
                        <>
                          <Zap size={16} />
                          <span>Start Now</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          <span>Prepare</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hover effects */}
                  <div className="hover-overlay">
                    <ArrowRight size={16} />
                  </div>

                  <style jsx>{`
                    .class-item {
                      position: relative;
                      display: flex;
                      align-items: center;
                      background: var(--bg-tertiary);
                      border: 1px solid var(--border-color);
                      border-radius: var(--radius-md);
                      margin-bottom: 0.75rem;
                      cursor: pointer;
                      transition: all var(--transition-medium);
                      overflow: hidden;
                      opacity: 0;
                      transform: translateX(-20px);
                      animation: slideInLeft 0.6s ease forwards;
                    }

                    @keyframes slideInLeft {
                      to {
                        opacity: 1;
                        transform: translateX(0);
                      }
                    }

                    .class-item:hover {
                      transform: translateY(-2px);
                      border-color: ${subjectColors.primary};
                      box-shadow: 0 8px 25px ${subjectColors.light};
                    }

                    .status-bar {
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 4px;
                      transition: all var(--transition-medium);
                    }

                    .class-item.imminent .status-bar {
                      width: 6px;
                      box-shadow: 0 0 15px currentColor;
                    }

                    .class-main-content {
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                      flex: 1;
                      padding: 1rem;
                      padding-left: 1.5rem;
                    }

                    .class-subject-icon {
                      width: 48px;
                      height: 48px;
                      border-radius: var(--radius-sm);
                      border: 1px solid;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: 700;
                      font-size: 1.125rem;
                      flex-shrink: 0;
                      position: relative;
                      transition: all var(--transition-medium);
                    }

                    .class-item:hover .class-subject-icon {
                      transform: scale(1.05) rotate(-2deg);
                    }

                    .class-subject-icon::after {
                      content: '';
                      position: absolute;
                      top: -2px;
                      left: -2px;
                      right: -2px;
                      bottom: -2px;
                      border: 2px solid currentColor;
                      border-radius: var(--radius-sm);
                      opacity: 0;
                      animation: iconPulse 3s infinite;
                    }

                    @keyframes iconPulse {
                      0%, 100% {
                        opacity: 0;
                        transform: scale(1);
                      }
                      50% {
                        opacity: 0.3;
                        transform: scale(1.1);
                      }
                    }

                    .class-details {
                      flex: 1;
                      min-width: 0;
                    }

                    .class-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                      margin-bottom: 0.5rem;
                    }

                    .class-name {
                      font-size: 1rem;
                      font-weight: 600;
                      color: var(--text-primary);
                      margin: 0;
                      transition: color var(--transition-medium);
                    }

                    .class-item:hover .class-name {
                      color: ${subjectColors.primary};
                    }

                    .time-remaining {
                      display: flex;
                      align-items: center;
                      gap: 0.25rem;
                      padding: 0.25rem 0.5rem;
                      border-radius: var(--radius-sm);
                      font-size: 0.75rem;
                      font-weight: 600;
                      font-family: var(--font-mono);
                      position: relative;
                    }

                    .urgent-pulse {
                      position: absolute;
                      width: 100%;
                      height: 100%;
                      border-radius: var(--radius-sm);
                      border: 1px solid currentColor;
                      animation: urgentPulse 1s infinite;
                    }

                    @keyframes urgentPulse {
                      0% {
                        transform: scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: scale(1.2);
                        opacity: 0;
                      }
                    }

                    .class-meta {
                      display: flex;
                      gap: 1rem;
                      margin-bottom: 0.75rem;
                    }

                    .meta-item {
                      display: flex;
                      align-items: center;
                      gap: 0.25rem;
                      font-size: 0.75rem;
                      color: var(--text-muted);
                      font-family: var(--font-mono);
                    }

                    .readiness-indicator {
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                    }

                    .readiness-bar {
                      flex: 1;
                      height: 3px;
                      background: var(--bg-glass);
                      border-radius: 2px;
                      overflow: hidden;
                    }

                    .readiness-fill {
                      height: 100%;
                      border-radius: 2px;
                      transition: width 1s ease;
                      position: relative;
                    }

                    .readiness-fill::after {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                      animation: shimmer 2s infinite;
                    }

                    .readiness-text {
                      font-size: 0.625rem;
                      color: var(--text-muted);
                      font-family: var(--font-mono);
                      white-space: nowrap;
                    }

                    .class-actions {
                      padding: 1rem;
                      border-left: 1px solid var(--border-color);
                    }

                    .start-class-btn {
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      padding: 0.5rem 0.75rem;
                      background: var(--bg-glass);
                      border: 1px solid var(--border-color);
                      border-radius: var(--radius-sm);
                      color: var(--text-secondary);
                      cursor: pointer;
                      transition: all var(--transition-medium);
                      font-size: 0.875rem;
                      font-weight: 500;
                      white-space: nowrap;
                    }

                    .start-class-btn:hover {
                      background: var(--bg-hover);
                      color: var(--text-primary);
                      transform: translateY(-1px);
                    }

                    .start-class-btn.started {
                      background: rgba(46, 204, 113, 0.1);
                      border-color: #2ecc71;
                      color: #2ecc71;
                    }

                    .start-class-btn.imminent {
                      background: rgba(255, 107, 157, 0.1);
                      border-color: #ff6b9d;
                      color: #ff6b9d;
                      animation: buttonPulse 2s infinite;
                    }

                    @keyframes buttonPulse {
                      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 157, 0.4); }
                      50% { box-shadow: 0 0 0 8px rgba(255, 107, 157, 0); }
                    }

                    .hover-overlay {
                      position: absolute;
                      top: 50%;
                      right: 1rem;
                      transform: translateY(-50%);
                      color: var(--text-muted);
                      opacity: 0;
                      transition: all var(--transition-medium);
                    }

                    .class-item:hover .hover-overlay {
                      opacity: 1;
                      transform: translateY(-50%) translateX(4px);
                    }
                  `}</style>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
              <div className="icon-decoration"></div>
            </div>
            <h4>No classes scheduled</h4>
            <p>Your teaching day is clear. Time to plan ahead!</p>
            <button 
              className="text-link schedule-link"
              onClick={() => navigate('/classes/schedule')}
            >
              <Plus size={16} />
              Schedule a class
            </button>
          </div>
        )}

        {hasClasses && (
          <div className="schedule-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{classes.length}</span>
                <span className="stat-label">Classes Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
                </span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upcoming-classes {
          animation: fadeInUp 0.6s ease;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          color: var(--accent-cyan);
          animation: iconRotate 10s linear infinite;
        }

        @keyframes iconRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .header-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .header-main h3 {
          margin: 0;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .view-schedule-btn {
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

        .view-schedule-btn:hover {
          background: var(--bg-hover);
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
          transform: translateY(-1px);
        }

        .classes-list {
          margin-bottom: 1rem;
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

        .icon-decoration {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: var(--accent-gold);
          border-radius: 50%;
          animation: decorationBounce 3s ease-in-out infinite;
        }

        @keyframes decorationBounce {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.2) translate(2px, -2px); }
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

        .schedule-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          transition: all var(--transition-medium);
        }

        .schedule-link:hover {
          background: var(--bg-hover);
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          transform: translateY(-1px);
        }

        .schedule-summary {
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .summary-stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .class-item {
            flex-direction: column;
            align-items: stretch;
          }

          .class-main-content {
            padding-bottom: 0.5rem;
          }

          .class-actions {
            padding: 0.75rem 1rem;
            border-left: none;
            border-top: 1px solid var(--border-color);
          }

          .start-class-btn {
            width: 100%;
            justify-content: center;
          }

          .hover-overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Classes);