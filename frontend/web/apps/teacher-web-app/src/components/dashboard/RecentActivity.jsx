import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Megaphone, 
  PenTool, 
  CheckSquare, 
  MessageCircle, 
  FolderOpen, 
  UserPlus,
  Activity,
  Eye,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';

const RecentActivity = ({ activities, loading }) => {
  const navigate = useNavigate();
  const [timeStamps, setTimeStamps] = useState({});

  useEffect(() => {
    const updateTimeStamps = () => {
      const now = new Date();
      const newTimeStamps = {};
      
      if (activities) {
        activities.forEach(activity => {
          newTimeStamps[activity.id] = formatTimestamp(activity.timestamp);
        });
      }
      
      setTimeStamps(newTimeStamps);
    };

    updateTimeStamps();
    const interval = setInterval(updateTimeStamps, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [activities]);

  const getActivityIcon = (type) => {
    const icons = {
      'assignment_graded': FileText,
      'student_submission': Upload,
      'class_updated': BookOpen,
      'announcement': Megaphone,
      'grade_updated': PenTool,
      'attendance_taken': CheckSquare,
      'message_sent': MessageCircle,
      'resource_shared': FolderOpen,
      'student_joined': UserPlus,
      'default': Activity
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      'assignment_graded': { primary: '#3498db', light: 'rgba(52, 152, 219, 0.1)', gradient: 'linear-gradient(135deg, #3498db, #2980b9)' },
      'student_submission': { primary: '#2ecc71', light: 'rgba(46, 204, 113, 0.1)', gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)' },
      'class_updated': { primary: '#9b59b6', light: 'rgba(155, 89, 182, 0.1)', gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)' },
      'announcement': { primary: '#f39c12', light: 'rgba(243, 156, 18, 0.1)', gradient: 'linear-gradient(135deg, #f39c12, #e67e22)' },
      'grade_updated': { primary: '#e74c3c', light: 'rgba(231, 76, 60, 0.1)', gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
      'attendance_taken': { primary: '#4ecdc4', light: 'rgba(78, 205, 196, 0.1)', gradient: 'linear-gradient(135deg, #4ecdc4, #26d0ce)' },
      'message_sent': { primary: '#6c5ce7', light: 'rgba(108, 92, 231, 0.1)', gradient: 'linear-gradient(135deg, #6c5ce7, #5f3dc4)' },
      'resource_shared': { primary: '#ff6b9d', light: 'rgba(255, 107, 157, 0.1)', gradient: 'linear-gradient(135deg, #ff6b9d, #e84393)' },
      'student_joined': { primary: '#00cec9', light: 'rgba(0, 206, 201, 0.1)', gradient: 'linear-gradient(135deg, #00cec9, #00b894)' },
      'default': { primary: '#95a5a6', light: 'rgba(149, 165, 166, 0.1)', gradient: 'linear-gradient(135deg, #95a5a6, #7f8c8d)' }
    };
    return colors[type] || colors.default;
  };

  const getActionText = (type) => {
    const actions = {
      'assignment_graded': 'Review Grades',
      'student_submission': 'View Submission',
      'class_updated': 'View Changes',
      'announcement': 'Read More',
      'grade_updated': 'See Details',
      'attendance_taken': 'View Report',
      'message_sent': 'Open Chat',
      'resource_shared': 'View Resource',
      'student_joined': 'Welcome',
      'default': 'View'
    };
    return actions[type] || actions.default;
  };

  const getPriorityLevel = (type, metadata) => {
    if (type === 'announcement' && metadata?.urgent) return 'high';
    if (type === 'student_submission' && metadata?.late) return 'medium';
    if (type === 'grade_updated') return 'medium';
    return 'low';
  };

  const getNavigationPath = (activity) => {
    const { type, metadata } = activity;
    
    switch (type) {
      case 'assignment_graded':
        return `/assignments/${metadata?.assignmentId}/grades`;
      case 'student_submission':
        return `/assignments/${metadata?.assignmentId}/submissions`;
      case 'class_updated':
        return `/classes/${metadata?.classId}`;
      case 'announcement':
        return `/announcements/${metadata?.announcementId}`;
      case 'grade_updated':
        return `/grades/${metadata?.studentId}`;
      case 'attendance_taken':
        return `/attendance/${metadata?.classId}`;
      case 'message_sent':
        return '/messages';
      case 'resource_shared':
        return `/resources/${metadata?.resourceId}`;
      case 'student_joined':
        return `/students/${metadata?.studentId}`;
      default:
        return '/activity';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    try {
      const now = new Date();
      const activityDate = new Date(timestamp);
      const diffInMs = now - activityDate;
      const diffInMins = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMs / 3600000);
      const diffInDays = Math.floor(diffInMs / 86400000);

      if (diffInMins < 1) return 'Just now';
      if (diffInMins < 60) return `${diffInMins}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return activityDate.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const handleActivityAction = (activity) => {
    const path = getNavigationPath(activity);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="recent-activity card">
        <div className="card-header">
          <div className="header-content">
            <Activity size={20} className="header-icon" />
            <h3>Recent Activity</h3>
          </div>
        </div>
        <div className="card-content">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="activity-item loading">
              <div className="activity-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasActivities = activities && activities.length > 0;

  return (
    <div className="recent-activity card">
      <div className="card-header">
        <div className="header-content">
          <Activity size={20} className="header-icon" />
          <div className="header-main">
            <h3>Recent Activity</h3>
            <div className="activity-indicator">
              <TrendingUp size={14} />
              <span>Live Feed</span>
            </div>
          </div>
        </div>
        
        <button 
          className="view-all-btn"
          onClick={() => navigate('/activity')}
          disabled={!hasActivities}
        >
          <Eye size={16} />
          View All
        </button>
      </div>
      
      <div className="card-content">
        {hasActivities ? (
          <div className="activities-list">
            {activities.slice(0, 6).map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorConfig = getActivityColor(activity.type);
              const priority = getPriorityLevel(activity.type, activity.metadata);
              
              return (
                <div 
                  key={activity.id} 
                  className={`activity-item priority-${priority}`}
                  onClick={() => handleActivityAction(activity)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline connector */}
                  <div className="timeline-connector">
                    {index < activities.length - 1 && <div className="connector-line"></div>}
                  </div>

                  <div className="activity-icon-container" style={{
                    background: colorConfig.light,
                    borderColor: colorConfig.primary + '30'
                  }}>
                    <IconComponent size={16} style={{ color: colorConfig.primary }} />
                    
                    {/* Priority indicator */}
                    {priority === 'high' && (
                      <div className="priority-pulse" style={{ borderColor: colorConfig.primary }}></div>
                    )}
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.title}</h4>
                      <div className="activity-meta">
                        <Clock size={12} />
                        <span className="activity-time">
                          {timeStamps[activity.id] || formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="activity-description">{activity.description}</p>
                    
                    {/* Activity tags */}
                    {activity.metadata?.tags && (
                      <div className="activity-tags">
                        {activity.metadata.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="activity-tag" style={{
                            background: colorConfig.light,
                            color: colorConfig.primary
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="activity-actions">
                    <button 
                      className="action-btn"
                      style={{ 
                        borderColor: colorConfig.primary + '30',
                        color: colorConfig.primary
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityAction(activity);
                      }}
                    >
                      {getActionText(activity.type)}
                    </button>
                  </div>

                  <style jsx>{`
                    .activity-item {
                      position: relative;
                      display: flex;
                      align-items: flex-start;
                      gap: 0.75rem;
                      padding: 1rem;
                      margin-bottom: 0.75rem;
                      background: var(--bg-glass);
                      border: 1px solid var(--border-color);
                      border-radius: var(--radius-md);
                      cursor: pointer;
                      transition: all var(--transition-medium);
                      opacity: 0;
                      transform: translateY(10px);
                      animation: fadeInUp 0.5s ease forwards;
                    }

                    @keyframes fadeInUp {
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }

                    .activity-item:hover {
                      background: var(--bg-hover);
                      border-color: ${colorConfig.primary}40;
                      transform: translateY(-2px);
                      box-shadow: 0 8px 25px ${colorConfig.light};
                    }

                    .activity-item:last-child {
                      margin-bottom: 0;
                    }

                    .activity-item.priority-high {
                      border-left: 3px solid #e74c3c;
                      animation: priorityGlow 2s infinite alternate;
                    }

                    @keyframes priorityGlow {
                      0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.2); }
                      100% { box-shadow: 0 0 0 4px rgba(231, 76, 60, 0); }
                    }

                    .timeline-connector {
                      position: absolute;
                      left: 28px;
                      top: 3rem;
                      width: 2px;
                      height: calc(100% + 0.75rem);
                      z-index: 0;
                    }

                    .connector-line {
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(to bottom, ${colorConfig.primary}40, transparent);
                      position: relative;
                    }

                    .connector-line::after {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 20px;
                      background: ${colorConfig.primary}60;
                      animation: flowDown 3s linear infinite;
                    }

                    @keyframes flowDown {
                      0% {
                        transform: translateY(-20px);
                        opacity: 0;
                      }
                      50% {
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(calc(100% + 20px));
                        opacity: 0;
                      }
                    }

                    .activity-icon-container {
                      position: relative;
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      border: 1px solid;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                      z-index: 2;
                      transition: all var(--transition-medium);
                    }

                    .activity-item:hover .activity-icon-container {
                      transform: scale(1.1);
                      box-shadow: 0 0 20px ${colorConfig.primary}40;
                    }

                    .priority-pulse {
                      position: absolute;
                      width: 100%;
                      height: 100%;
                      border: 2px solid;
                      border-radius: 50%;
                      animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                      0% {
                        transform: scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: scale(1.4);
                        opacity: 0;
                      }
                    }

                    .activity-content {
                      flex: 1;
                      min-width: 0;
                    }

                    .activity-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                      gap: 0.5rem;
                      margin-bottom: 0.25rem;
                    }

                    .activity-title {
                      font-size: 0.875rem;
                      font-weight: 600;
                      color: var(--text-primary);
                      margin: 0;
                      line-height: 1.3;
                      transition: color var(--transition-medium);
                    }

                    .activity-item:hover .activity-title {
                      color: ${colorConfig.primary};
                    }

                    .activity-meta {
                      display: flex;
                      align-items: center;
                      gap: 0.25rem;
                      flex-shrink: 0;
                    }

                    .activity-time {
                      font-size: 0.75rem;
                      color: var(--text-muted);
                      font-family: var(--font-mono);
                      white-space: nowrap;
                    }

                    .activity-description {
                      font-size: 0.8rem;
                      color: var(--text-muted);
                      margin: 0 0 0.5rem 0;
                      line-height: 1.4;
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    }

                    .activity-tags {
                      display: flex;
                      gap: 0.25rem;
                      flex-wrap: wrap;
                      margin-bottom: 0.5rem;
                    }

                    .activity-tag {
                      font-size: 0.625rem;
                      padding: 0.125rem 0.375rem;
                      border-radius: var(--radius-sm);
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.025em;
                    }

                    .activity-actions {
                      align-self: center;
                    }

                    .action-btn {
                      background: transparent;
                      border: 1px solid;
                      padding: 0.375rem 0.75rem;
                      border-radius: var(--radius-sm);
                      font-size: 0.75rem;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all var(--transition-medium);
                      white-space: nowrap;
                    }

                    .action-btn:hover {
                      background: ${colorConfig.primary}15;
                      transform: translateY(-1px);
                    }
                  `}</style>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Activity size={48} />
              <div className="empty-particles">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`empty-particle particle-${i}`}></div>
                ))}
              </div>
            </div>
            <h4>Your activity feed is quiet</h4>
            <p>Start interacting with your classes to see updates here</p>
            <button 
              className="text-link start-link"
              onClick={() => navigate('/classes')}
            >
              <Zap size={16} />
              Begin teaching
            </button>
          </div>
        )}

        {hasActivities && (
          <div className="activity-summary">
            <div className="summary-info">
              <span className="summary-text">
                Showing latest {Math.min(activities.length, 6)} activities
              </span>
              <button 
                className="refresh-activities"
                onClick={() => window.location.reload()}
                title="Refresh activities"
              >
                <Activity size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .recent-activity {
          animation: fadeInUp 0.6s ease;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          color: var(--accent-purple);
          animation: iconPulse 3s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { 
            transform: scale(1); 
            filter: drop-shadow(0 0 5px var(--accent-purple)); 
          }
          50% { 
            transform: scale(1.05); 
            filter: drop-shadow(0 0 15px var(--accent-purple)); 
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

        .activity-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .view-all-btn {
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

        .view-all-btn:hover {
          background: var(--bg-hover);
          color: var(--accent-purple);
          border-color: var(--accent-purple);
          transform: translateY(-1px);
        }

        .activities-list {
          position: relative;
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

        .empty-particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .empty-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--accent-purple);
          border-radius: 50%;
        }

        .particle-0 {
          top: 10%;
          right: 20%;
          animation: floatParticle1 4s ease-in-out infinite;
        }

        .particle-1 {
          bottom: 20%;
          left: 10%;
          animation: floatParticle2 3s ease-in-out infinite 1s;
        }

        .particle-2 {
          top: 60%;
          right: 10%;
          animation: floatParticle3 5s ease-in-out infinite 0.5s;
        }

        @keyframes floatParticle1 {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.5; 
          }
          50% { 
            transform: translate(10px, -15px) scale(1.2); 
            opacity: 1; 
          }
        }

        @keyframes floatParticle2 {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translate(-8px, -20px) scale(1.1); 
            opacity: 0.8; 
          }
        }

        @keyframes floatParticle3 {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.4; 
          }
          50% { 
            transform: translate(15px, -10px) scale(1.3); 
            opacity: 0.9; 
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

        .start-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          transition: all var(--transition-medium);
        }

        .start-link:hover {
          background: var(--bg-hover);
          border-color: var(--accent-purple);
          color: var(--accent-purple);
          transform: translateY(-1px);
        }

        .activity-summary {
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .summary-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .refresh-activities {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-medium);
        }

        .refresh-activities:hover {
          color: var(--accent-purple);
          background: var(--bg-glass);
          transform: rotate(180deg);
        }

        @media (max-width: 768px) {
          .activity-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .activity-actions {
            align-self: flex-start;
          }

          .timeline-connector {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(RecentActivity);