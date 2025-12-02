import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Video,
  BookOpen
} from 'lucide-react';

const UpcomingSchedule = ({ schedule = [], loading }) => {
  const [selectedDay, setSelectedDay] = useState('today');

  const defaultSchedule = [
    {
      id: '1',
      title: 'Mathematics 101',
      type: 'class',
      time: '09:00 AM',
      duration: '50 min',
      location: 'Room 204',
      students: 28,
      status: 'upcoming',
      isOnline: false
    },
    {
      id: '2',
      title: 'Physics Lab Session',
      type: 'lab',
      time: '11:00 AM',
      duration: '90 min',
      location: 'Lab 3',
      students: 24,
      status: 'upcoming',
      isOnline: false
    },
    {
      id: '3',
      title: 'Parent Meeting - Sarah J.',
      type: 'meeting',
      time: '02:00 PM',
      duration: '30 min',
      location: 'Virtual',
      students: null,
      status: 'upcoming',
      isOnline: true
    },
    {
      id: '4',
      title: 'Chemistry Advanced',
      type: 'class',
      time: '03:30 PM',
      duration: '60 min',
      location: 'Room 305',
      students: 22,
      status: 'upcoming',
      isOnline: false
    }
  ];

  const scheduleData = schedule.length > 0 ? schedule : defaultSchedule;

  const getTypeStyle = (type) => {
    const styles = {
      class: {
        bg: '#dbeafe',
        color: '#3b82f6',
        icon: BookOpen
      },
      lab: {
        bg: '#dcfce7',
        color: '#22c55e',
        icon: Users
      },
      meeting: {
        bg: '#fef3c7',
        color: '#f59e0b',
        icon: Video
      }
    };
    return styles[type] || styles.class;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes;
  };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isNow = (item) => {
    const currentMinutes = getCurrentTime();
    const itemMinutes = parseTime(item.time);
    const durationMinutes = parseInt(item.duration);
    return currentMinutes >= itemMinutes && currentMinutes < itemMinutes + durationMinutes;
  };

  if (loading) {
    return (
      <div className="upcoming-schedule card">
        <div className="card-header">
          <h3>Upcoming Schedule</h3>
        </div>
        <div className="card-content">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-schedule card">
      <div className="card-header">
        <div className="header-content">
          <Calendar size={20} />
          <div>
            <h3>Upcoming Schedule</h3>
            <p className="schedule-subtitle">Today's classes and events</p>
          </div>
        </div>
        <div className="day-selector">
          <button
            className={selectedDay === 'today' ? 'active' : ''}
            onClick={() => setSelectedDay('today')}
          >
            Today
          </button>
          <button
            className={selectedDay === 'tomorrow' ? 'active' : ''}
            onClick={() => setSelectedDay('tomorrow')}
          >
            Tomorrow
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="schedule-timeline">
          {scheduleData.map((item, index) => {
            const typeStyle = getTypeStyle(item.type);
            const TypeIcon = typeStyle.icon;
            const isCurrentClass = isNow(item);

            return (
              <div
                key={item.id}
                className={`schedule-item ${isCurrentClass ? 'active' : ''}`}
              >
                <div className="time-marker">
                  <div className="time-dot" style={{ background: typeStyle.color }}></div>
                  {index < scheduleData.length - 1 && <div className="time-line"></div>}
                </div>

                <div className="schedule-card">
                  {isCurrentClass && <div className="live-indicator">LIVE NOW</div>}

                  <div className="schedule-header">
                    <div
                      className="schedule-icon"
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.color
                      }}
                    >
                      <TypeIcon size={18} />
                    </div>
                    <div className="schedule-title">
                      <h4>{item.title}</h4>
                      <div className="schedule-meta">
                        <span className="schedule-time">
                          <Clock size={14} />
                          {item.time}
                        </span>
                        <span className="schedule-duration">• {item.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="schedule-details">
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                      {item.isOnline && (
                        <span className="online-badge">
                          <Video size={12} />
                          Online
                        </span>
                      )}
                    </div>
                    {item.students && (
                      <div className="detail-item">
                        <Users size={14} />
                        <span>{item.students} students</span>
                      </div>
                    )}
                  </div>

                  <button className="view-details-btn">
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {scheduleData.length === 0 && (
          <div className="empty-schedule">
            <Calendar size={48} color="var(--text-muted)" />
            <p>No classes scheduled</p>
            <span>Enjoy your free day!</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-content > div {
          flex: 1;
        }

        .schedule-subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .day-selector {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .day-selector button {
          padding: 0.375rem 0.875rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .day-selector button:hover {
          background: var(--bg-hover);
        }

        .day-selector button.active {
          background: var(--primary-green);
          color: white;
        }

        .schedule-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .schedule-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .schedule-item.active .schedule-card {
          border: 2px solid var(--primary-green);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
        }

        .time-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .time-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 2px var(--border-color);
        }

        .time-line {
          width: 2px;
          flex: 1;
          background: var(--border-color);
          margin: 0.5rem 0;
        }

        .schedule-card {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .schedule-card:hover {
          border-color: var(--primary-green);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .live-indicator {
          position: absolute;
          top: -10px;
          right: 1rem;
          background: #ef4444;
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          letter-spacing: 0.05em;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .schedule-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .schedule-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .schedule-title h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.375rem 0;
        }

        .schedule-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .schedule-duration {
          font-weight: 500;
        }

        .schedule-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.875rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .detail-item svg {
          color: var(--text-muted);
        }

        .online-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: auto;
          padding: 0.125rem 0.5rem;
          background: #dbeafe;
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.25rem;
        }

        .view-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--primary-green);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .view-details-btn:hover {
          color: var(--primary-green-dark);
          gap: 0.5rem;
        }

        .empty-schedule {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }

        .empty-schedule p {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 1rem 0 0.5rem;
        }

        .empty-schedule span {
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .schedule-header {
            flex-direction: column;
          }

          .day-selector {
            width: 100%;
            margin-top: 0.5rem;
          }

          .day-selector button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(UpcomingSchedule);
