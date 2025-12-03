import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User, ChevronDown, LogOut, HelpCircle, Calendar, Clock } from 'lucide-react';

const TopBar = ({ user, isMobile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { 
      id: 1, 
      type: 'assignment', 
      message: 'New submission from Sarah Johnson', 
      time: '5m ago', 
      read: false
    },
    { 
      id: 2, 
      type: 'system', 
      message: 'System maintenance tonight at 10 PM', 
      time: '1h ago', 
      read: false
    },
    { 
      id: 3, 
      type: 'message', 
      message: 'Parent message from Michael Chen', 
      time: '2h ago', 
      read: true
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className="top-bar">
      <div className="top-bar-content">
        {/* Left Section - Welcome only */}
        <div className="top-bar-left">
          <div className="welcome-section">
            <h1 className="greeting-text">
              {getGreeting()}, {user?.firstName}!
            </h1>
            <div className="date-time-info">
              <div className="date-info">
                <Calendar size={14} />
                <span>{getCurrentDate()}</span>
              </div>
              <div className="time-info">
                <Clock size={14} />
                <span>{getCurrentTime()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section - Hidden on mobile */}
        {!isMobile && (
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search classes, students, assignments..."
              className="search-input"
            />
          </div>
        )}

        {/* Actions Section */}
        <div className="top-bar-actions">
          {/* Search Button - Only show on mobile */}
          {isMobile && (
            <button className="action-btn mobile-search-btn" title="Search">
              <Search size={20} />
            </button>
          )}

          {/* Notifications */}
          <div className="notification-container" ref={notificationsRef}>
            <button
              className="action-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <span className="notification-count">{unreadCount} unread</span>
                </div>
                
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-icon">
                        <Bell size={14} />
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-time">
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="dropdown-footer">
                  <button className="text-link">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Settings - Hidden on mobile */}
          {!isMobile && (
            <button className="action-btn" title="Settings">
              <Settings size={20} />
            </button>
          )}

          {/* Profile Menu */}
          <div className="profile-container" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar-sm">
                <User size={16} />
              </div>
              {!isMobile && (
                <>
                  <span className="user-name">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown size={14} className="dropdown-arrow" />
                </>
              )}
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-section">
                  <div className="profile-info">
                    <div className="user-avatar-md">
                      <User size={20} />
                    </div>
                    <div className="user-details">
                      <strong>{user?.firstName} {user?.lastName}</strong>
                      <span>{user?.email}</span>
                      <div className="user-role">Senior Educator</div>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-section">
                  <button className="dropdown-item">
                    <User size={16} />
                    My Profile
                  </button>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    Settings
                  </button>
                  <button className="dropdown-item">
                    <HelpCircle size={16} />
                    Help & Support
                  </button>
                </div>
                
                <div className="dropdown-section">
                  <button className="dropdown-item logout-item">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .top-bar {
          background: var(--bg-secondary);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .top-bar-content {
          height: 100%;
          padding: var(--space-sm) var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-lg);
        }

        .top-bar-left {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .welcome-section {
          min-width: 0;
          flex: 1;
        }

        .greeting-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-time-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .date-info,
        .time-info {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-muted);
          font-size: var(--text-sm);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          white-space: nowrap;
        }

        .time-info {
          color: var(--primary-green);
          font-family: var(--font-family-mono);
          font-weight: 600;
        }

        .search-container {
          position: relative;
          flex: 0 1 400px;
          min-width: 200px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          color: var(--text-primary);
          font-size: var(--text-sm);
          transition: all var(--transition-medium);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
          background: var(--bg-primary);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          z-index: 2;
        }

        .top-bar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .action-btn {
          position: relative;
          padding: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-medium);
          flex-shrink: 0;
        }

        .action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .notification-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .mobile-search-btn {
          display: none;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: var(--primary-green);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--white);
          border: 2px solid var(--bg-secondary);
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 320px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .dropdown-header {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-tertiary);
        }

        .dropdown-header h4 {
          margin: 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .notification-count {
          font-size: var(--text-xs);
          color: var(--text-muted);
          background: var(--bg-hover);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }

        .notification-item:hover {
          background: var(--bg-hover);
        }

        .notification-item.unread {
          background: rgba(5, 150, 105, 0.05);
          border-left: 3px solid var(--primary-green);
        }

        .notification-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-medium);
          min-width: 0;
        }

        .profile-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .user-avatar-sm {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          flex-shrink: 0;
        }

        .user-name {
          font-size: var(--text-sm);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 280px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .dropdown-section {
          padding: var(--space-sm);
          border-bottom: 1px solid var(--border-color);
        }

        .user-avatar-md {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          flex-shrink: 0;
        }

        .user-details strong {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-details span {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: var(--text-xs);
          color: var(--primary-green);
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          margin-bottom: 0.25rem;
        }

        .dropdown-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .dropdown-item.logout-item:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .top-bar {
            height: auto;
            min-height: 64px;
          }

          .top-bar-content {
            padding: var(--space-md);
            gap: var(--space-sm);
            flex-wrap: wrap;
          }

          .top-bar-left {
            flex: 1;
            min-width: 0;
          }

          .greeting-text {
            font-size: 1.125rem;
          }

          .date-time-info {
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .date-info,
          .time-info {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }

          .search-container {
            display: none;
          }

          .mobile-search-btn {
            display: flex;
          }

          .user-name {
            display: none;
          }

          .dropdown-arrow {
            display: none;
          }

          .profile-btn {
            padding: 0.5rem;
          }

          .notification-dropdown,
          .profile-dropdown {
            width: 90vw;
            max-width: 320px;
            right: 0;
          }

          .action-btn {
            padding: 0.5rem;
          }

          .top-bar-actions {
            flex-shrink: 0;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .top-bar-content {
            padding: 0.75rem;
          }

          .greeting-text {
            font-size: 1rem;
          }

          .top-bar-actions {
            gap: 0.375rem;
          }

          .date-time-info {
            gap: 0.375rem;
          }

          .date-info,
          .time-info {
            font-size: 0.6875rem;
            padding: 0.2rem 0.375rem;
          }

          .action-btn {
            padding: 0.375rem;
          }

          .notification-badge {
            width: 16px;
            height: 16px;
            font-size: 0.625rem;
          }
        }
      `}</style>
    </header>
  );
};

export default React.memo(TopBar);