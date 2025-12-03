import React, { useState } from 'react';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';

const Notifications = ({ notifications = [], loading }) => {
  const [dismissed, setDismissed] = useState([]);

  const defaultNotifications = [
    {
      id: '1',
      type: 'urgent',
      title: 'Assignment Deadline',
      message: 'Math Assignment #5 is due in 2 hours',
      time: '2 hours',
      action: 'Review Submissions',
      link: '/assignments/5'
    },
    {
      id: '2',
      type: 'success',
      title: 'New Student Enrolled',
      message: 'Sarah Johnson has joined your Chemistry class',
      time: '3 hours',
      action: 'View Profile',
      link: '/students/sarah-johnson'
    },
    {
      id: '3',
      type: 'info',
      title: 'Upcoming Meeting',
      message: 'Parent-Teacher conference tomorrow at 2 PM',
      time: '1 day',
      action: 'View Details',
      link: '/calendar'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Low Attendance Alert',
      message: '3 students have missed 5+ classes this week',
      time: '5 hours',
      action: 'View Report',
      link: '/attendance/report'
    }
  ];

  const activeNotifications = (notifications.length > 0 ? notifications : defaultNotifications)
    .filter(n => !dismissed.includes(n.id));

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
  };

  const getNotificationStyle = (type) => {
    const styles = {
      urgent: {
        bg: '#fef2f2',
        border: '#fecaca',
        icon: '#ef4444',
        iconBg: '#fee2e2'
      },
      success: {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        icon: '#22c55e',
        iconBg: '#dcfce7'
      },
      info: {
        bg: '#eff6ff',
        border: '#bfdbfe',
        icon: '#3b82f6',
        iconBg: '#dbeafe'
      },
      warning: {
        bg: '#fffbeb',
        border: '#fde68a',
        icon: '#f59e0b',
        iconBg: '#fef3c7'
      }
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'urgent':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      case 'warning':
        return Clock;
      default:
        return Info;
    }
  };

  if (loading) {
    return (
      <div className="notifications-widget card">
        <div className="card-header">
          <h3>Notifications</h3>
        </div>
        <div className="card-content">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-widget card">
      <div className="card-header">
        <div className="header-left">
          <Bell size={20} />
          <h3>Notifications</h3>
          {activeNotifications.length > 0 && (
            <span className="notification-badge">{activeNotifications.length}</span>
          )}
        </div>
        <button className="mark-all-read">Mark all read</button>
      </div>

      <div className="card-content">
        {activeNotifications.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} color="#22c55e" />
            <p>All caught up!</p>
            <span>No new notifications</span>
          </div>
        ) : (
          <div className="notifications-list">
            {activeNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const styles = getNotificationStyle(notification.type);

              return (
                <div
                  key={notification.id}
                  className="notification-item"
                  style={{
                    background: styles.bg,
                    borderLeft: `3px solid ${styles.icon}`
                  }}
                >
                  <div className="notification-content">
                    <div
                      className="notification-icon"
                      style={{
                        background: styles.iconBg,
                        color: styles.icon
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="notification-details">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <span className="notification-time">{notification.time} ago</span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      {notification.action && (
                        <button className="notification-action">
                          {notification.action}
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      className="dismiss-btn"
                      onClick={() => handleDismiss(notification.id)}
                      aria-label="Dismiss notification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-widget {
          height: 100%;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .notification-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 0.375rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 10px;
        }

        .mark-all-read {
          font-size: 0.875rem;
          color: var(--primary-green);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .mark-all-read:hover {
          background: var(--bg-hover);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }

        .empty-state p {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 1rem 0 0.5rem;
        }

        .empty-state span {
          font-size: 0.875rem;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .notification-item {
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .notification-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .notification-content {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          position: relative;
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-details {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .notification-header h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .notification-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .notification-action {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--primary-green);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .notification-action:hover {
          color: var(--primary-green-dark);
          gap: 0.5rem;
        }

        .dismiss-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .dismiss-btn:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .notifications-list {
            max-height: 400px;
          }

          .notification-content {
            padding: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Notifications);
