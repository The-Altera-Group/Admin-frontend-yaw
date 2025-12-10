import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileEdit, 
  CheckSquare, 
  Megaphone, 
  PenTool, 
  Calendar, 
  Upload,
  Zap,
  ArrowRight,
  Plus,
  Sparkles
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);
  const containerRef = useRef(null);

  const quickActions = [
    {
      id: 'create-assignment',
      label: 'Create Assignment',
      icon: FileEdit,
      description: 'Design engaging assignments for your students',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      action: () => navigate('/assignments/create'),
      badge: 'Popular',
      estimatedTime: '5 min'
    },
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: CheckSquare,
      description: 'Mark student attendance quickly',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      action: () => navigate('/attendance/today'),
      badge: 'Quick',
      estimatedTime: '2 min'
    },
    {
      id: 'send-announcement',
      label: 'Send Announcement',
      icon: Megaphone,
      description: 'Share important updates with your class',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      action: () => navigate('/announcements/create'),
      badge: 'Urgent',
      estimatedTime: '3 min'
    },
    {
      id: 'grade-papers',
      label: 'Grade Papers',
      icon: PenTool,
      description: 'Review and evaluate student submissions',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
      action: () => navigate('/assignments?filter=ungraded'),
      badge: '12 Pending',
      estimatedTime: '15 min'
    },
    {
      id: 'schedule-class',
      label: 'Schedule Class',
      icon: Calendar,
      description: 'Plan your upcoming teaching sessions',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600',
      action: () => navigate('/classes/create'),
      badge: 'New',
      estimatedTime: '10 min'
    },
    {
      id: 'share-resource',
      label: 'Share Resource',
      icon: Upload,
      description: 'Upload materials for student access',
      color: 'pink',
      gradient: 'from-pink-500 to-rose-600',
      action: () => navigate('/resources/upload'),
      badge: 'Enhanced',
      estimatedTime: '7 min'
    }
  ];

  const handleActionClick = async (action) => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      // Add haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      action.action();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getColorStyles = (color) => {
    const styles = {
      blue: { 
        primary: '#3498db', 
        secondary: '#2980b9', 
        light: 'rgba(52, 152, 219, 0.1)',
        gradient: 'linear-gradient(135deg, #3498db, #2980b9)'
      },
      green: { 
        primary: '#2ecc71', 
        secondary: '#27ae60', 
        light: 'rgba(46, 204, 113, 0.1)',
        gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)'
      },
      orange: { 
        primary: '#ff7f50', 
        secondary: '#ff6347', 
        light: 'rgba(255, 127, 80, 0.1)',
        gradient: 'linear-gradient(135deg, #ff7f50, #ff6347)'
      },
      purple: { 
        primary: '#9b59b6', 
        secondary: '#8e44ad', 
        light: 'rgba(155, 89, 182, 0.1)',
        gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
      },
      teal: { 
        primary: '#4ecdc4', 
        secondary: '#26d0ce', 
        light: 'rgba(78, 205, 196, 0.1)',
        gradient: 'linear-gradient(135deg, #4ecdc4, #26d0ce)'
      },
      pink: { 
        primary: '#ff6b9d', 
        secondary: '#e74c3c', 
        light: 'rgba(255, 107, 157, 0.1)',
        gradient: 'linear-gradient(135deg, #ff6b9d, #e74c3c)'
      }
    };
    return styles[color] || styles.blue;
  };

  return (
    <div className="quick-actions card">
      <div className="card-header">
        <div className="header-content">
          <div className="header-main">
            <Zap className="header-icon" size={20} />
            <h3>Quick Actions</h3>
            <div className="header-sparkle">
              <Sparkles size={16} />
            </div>
          </div>
          <span className="actions-subtitle">Streamline your workflow</span>
        </div>
        
        <button 
          className="add-action-btn"
          title="Customize actions"
        >
          <Plus size={16} />
          Customize
        </button>
      </div>
      
      <div className="card-content">
        <div className="actions-grid" ref={containerRef}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            const colorStyles = getColorStyles(action.color);
            const isHovered = hoveredAction === action.id;
            
            return (
              <div
                key={action.id}
                className={`action-card ${action.color} ${isHovered ? 'hovered' : ''}`}
                onClick={() => handleActionClick(action)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                disabled={isCreating}
                title={action.description}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background effects */}
                <div className="card-background">
                  <div className="gradient-overlay"></div>
                  <div className="pattern-overlay"></div>
                </div>

                {/* Badge */}
                {action.badge && (
                  <div className="action-badge">
                    {action.badge}
                  </div>
                )}

                {/* Main content */}
                <div className="action-content">
                  <div className="action-icon-container">
                    <div className="icon-background"></div>
                    <IconComponent className="action-icon" size={24} />
                    <div className="icon-pulse"></div>
                  </div>
                  
                  <div className="action-details">
                    <h4 className="action-label">{action.label}</h4>
                    <p className="action-description">{action.description}</p>
                    
                    <div className="action-meta">
                      <span className="estimated-time">
                        <span className="time-dot"></span>
                        {action.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action arrow */}
                <div className="action-arrow">
                  <ArrowRight size={18} />
                </div>

                {/* Hover particles */}
                <div className="hover-particles">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`particle particle-${i}`}></div>
                  ))}
                </div>

                <style jsx>{`
                  .action-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-medium);
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: slideInUp 0.6s ease forwards;
                  }

                  @keyframes slideInUp {
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  .action-card:hover {
                    transform: translateY(-4px);
                    border-color: ${colorStyles.primary};
                    box-shadow: 
                      0 10px 30px ${colorStyles.light},
                      0 0 0 1px ${colorStyles.primary}40;
                  }

                  .action-card:active {
                    transform: translateY(-2px) scale(0.98);
                  }

                  .card-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    opacity: 0;
                    transition: all var(--transition-medium);
                  }

                  .action-card:hover .card-background {
                    opacity: 1;
                  }

                  .gradient-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: ${colorStyles.gradient};
                    opacity: 0.03;
                  }

                  .pattern-overlay {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle, ${colorStyles.primary}15 1px, transparent 1px);
                    background-size: 10px 10px;
                    opacity: 0.5;
                    transform: translate(30px, -30px);
                  }

                  .action-badge {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: ${colorStyles.primary};
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    z-index: 3;
                    animation: badgePulse 3s infinite;
                  }

                  @keyframes badgePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }

                  .action-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                    position: relative;
                    z-index: 2;
                  }

                  .action-icon-container {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                  }

                  .icon-background {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: ${colorStyles.light};
                    border: 1px solid ${colorStyles.primary}20;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-medium);
                  }

                  .action-card:hover .icon-background {
                    background: ${colorStyles.primary}20;
                    border-color: ${colorStyles.primary};
                    transform: rotate(-5deg) scale(1.05);
                  }

                  .action-icon {
                    color: ${colorStyles.primary};
                    position: relative;
                    z-index: 2;
                    transition: all var(--transition-medium);
                  }

                  .action-card:hover .action-icon {
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 10px ${colorStyles.primary}40);
                  }

                  .icon-pulse {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 2px solid ${colorStyles.primary};
                    border-radius: var(--radius-sm);
                    opacity: 0;
                    animation: iconPulseEffect 2s infinite;
                  }

                  .action-card:hover .icon-pulse {
                    animation-duration: 1s;
                  }

                  @keyframes iconPulseEffect {
                    0% {
                      transform: scale(1);
                      opacity: 1;
                    }
                    100% {
                      transform: scale(1.4);
                      opacity: 0;
                    }
                  }

                  .action-details {
                    flex: 1;
                    min-width: 0;
                  }

                  .action-label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem 0;
                    transition: color var(--transition-medium);
                  }

                  .action-card:hover .action-label {
                    color: ${colorStyles.primary};
                  }

                  .action-description {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin: 0 0 0.5rem 0;
                    line-height: 1.4;
                  }

                  .action-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                  }

                  .estimated-time {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                  }

                  .time-dot {
                    width: 4px;
                    height: 4px;
                    background: ${colorStyles.primary};
                    border-radius: 50%;
                    animation: timeDotPulse 2s infinite;
                  }

                  @keyframes timeDotPulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                  }

                  .action-arrow {
                    color: var(--text-muted);
                    transition: all var(--transition-medium);
                    position: relative;
                    z-index: 2;
                  }

                  .action-card:hover .action-arrow {
                    color: ${colorStyles.primary};
                    transform: translateX(4px);
                  }

                  .hover-particles {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 1;
                  }

                  .particle {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    background: ${colorStyles.primary};
                    border-radius: 50%;
                    opacity: 0;
                    transition: all var(--transition-medium);
                  }

                  .action-card:hover .particle {
                    animation: particleFloat 1.5s ease-out infinite;
                  }

                  .particle-0 {
                    top: 20%;
                    left: 15%;
                    animation-delay: 0s;
                  }

                  .particle-1 {
                    top: 70%;
                    left: 80%;
                    animation-delay: 0.3s;
                  }

                  .particle-2 {
                    top: 40%;
                    left: 60%;
                    animation-delay: 0.6s;
                  }

                  .particle-3 {
                    top: 80%;
                    left: 30%;
                    animation-delay: 0.9s;
                  }

                  @keyframes particleFloat {
                    0% {
                      opacity: 0;
                      transform: translate(0, 0) scale(0);
                    }
                    50% {
                      opacity: 1;
                      transform: translate(-10px, -15px) scale(1);
                    }
                    100% {
                      opacity: 0;
                      transform: translate(-20px, -30px) scale(0);
                    }
                  }
                `}</style>
              </div>
            );
          })}
        </div>

        <div className="additional-actions">
          <div className="workflow-tips">
            <div className="tip-icon">💡</div>
            <span>Tip: Use keyboard shortcuts for faster access</span>
          </div>
          
          <button 
            className="text-link view-all-tools"
            onClick={() => navigate('/tools')}
          >
            Explore all teaching tools
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .quick-actions {
          animation: fadeInUp 0.6s ease;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-icon {
          color: var(--accent-gold);
          animation: iconGlow 3s ease-in-out infinite alternate;
        }

        @keyframes iconGlow {
          0% { filter: drop-shadow(0 0 5px var(--accent-gold)); }
          100% { filter: drop-shadow(0 0 15px var(--accent-gold)); }
        }

        .header-sparkle {
          color: var(--accent-gold);
          opacity: 0.6;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.6; 
            transform: rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: rotate(180deg); 
          }
        }

        .actions-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .add-action-btn {
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

        .add-action-btn:hover {
          background: var(--bg-hover);
          color: var(--accent-gold);
          border-color: var(--accent-gold);
          transform: translateY(-1px);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .additional-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .workflow-tips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .tip-icon {
          animation: tipBounce 3s ease-in-out infinite;
        }

        @keyframes tipBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .view-all-tools {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-medium);
        }

        .view-all-tools:hover {
          transform: translateX(4px);
        }

        @media (max-width: 1024px) {
          .actions-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .additional-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .workflow-tips {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(QuickActions);