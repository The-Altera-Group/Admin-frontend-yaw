import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import calendarService from '../services/calendarService';
import { useApi } from '../hooks/useApi';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  FileText,
  Video,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Download,
  Edit2,
  Trash2,
  Loader,
  RefreshCw
} from 'lucide-react';

const Calendar = () => {
  const { user, logout } = useAuth();

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // API integration
  const { data: events, loading, error, execute: fetchEvents } = useApi(
    calendarService.getAll,
    { immediate: true, initialData: [] }
  );

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'class',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    class: '',
    attendees: [],
    color: '#3b82f6',
    reminder: '15min'
  });

  // Event types with colors
  const eventTypes = [
    { id: 'class', name: 'Class Session', color: '#3b82f6', icon: Users },
    { id: 'meeting', name: 'Meeting', color: '#8b5cf6', icon: Users },
    { id: 'deadline', name: 'Deadline', color: '#ef4444', icon: AlertCircle },
    { id: 'event', name: 'School Event', color: '#10b981', icon: CalendarIcon },
    { id: 'lesson', name: 'Lesson Plan', color: '#f59e0b', icon: FileText },
    { id: 'online', name: 'Online Class', color: '#06b6d4', icon: Video }
  ];

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!events || !Array.isArray(events)) return [];
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString || event.startDate === dateString);
  };

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length === 0) {
      // Open create event modal
      setEventForm({
        ...eventForm,
        date: date.toISOString().split('T')[0]
      });
      setShowEventModal(true);
    }
  };

  // Handle create event
  const handleCreateEvent = async () => {
    try {
      await calendarService.create({
        ...eventForm,
        attendees: eventForm.attendees
      });
      fetchEvents();
      setShowEventModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to create event: ' + (err.message || 'Unknown error'));
    }
  };

  // Reset form
  const resetForm = () => {
    setEventForm({
      title: '',
      type: 'class',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      class: '',
      attendees: [],
      color: '#3b82f6',
      reminder: '15min'
    });
    setSelectedEvent(null);
  };

  // Handle delete event
  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarService.delete(id);
        fetchEvents();
        setSelectedEvent(null);
      } catch (err) {
        alert('Failed to delete event: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Handle export calendar
  const handleExport = async () => {
    try {
      await calendarService.export({ format: 'ical' });
    } catch (err) {
      alert('Failed to export calendar: ' + (err.message || 'Unknown error'));
    }
  };

  // Format month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Calculate statistics
  const upcomingEvents = events && Array.isArray(events) ? events.filter(e => new Date(e.date || e.startDate || 0) >= new Date()).length : 0;
  const todayEvents = events && Array.isArray(events) ? events.filter(e => (e.date || e.startDate) === new Date().toISOString().split('T')[0]).length : 0;
  const classesThisWeek = events && Array.isArray(events) ? events.filter(e => {
    const eventDate = new Date(e.date || e.startDate || 0);
    const today = new Date();
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return e.type === 'class' && eventDate >= today && eventDate <= weekEnd;
  }).length : 0;

  return (
    <MainLayout user={user} onLogout={logout} activeView="calendar">
      <div className="calendar-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Calendar & Planning</h1>
              <p className="page-subtitle">Manage your schedule and events</p>
            </div>

            <div className="header-actions">
              <button className="action-btn secondary" onClick={handleExport}>
                <Download size={18} />
                Export
              </button>
              <button className="action-btn primary" onClick={() => {
                setEventForm({ ...eventForm, date: new Date().toISOString().split('T')[0] });
                setShowEventModal(true);
              }}>
                <Plus size={18} />
                New Event
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading calendar...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load calendar</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchEvents}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Statistics */}
            <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <CalendarIcon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{todayEvents}</div>
              <div className="stat-label">Today's Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{upcomingEvents}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{classesThisWeek}</div>
              <div className="stat-label">Classes This Week</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {events.filter(e => e.type === 'deadline').length}
              </div>
              <div className="stat-label">Pending Deadlines</div>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="calendar-controls">
          <div className="controls-left">
            <button className="nav-btn" onClick={goToPreviousMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className="nav-btn" onClick={goToNextMonth}>
              <ChevronRight size={20} />
            </button>
            <button className="today-btn" onClick={goToToday}>
              Today
            </button>
            <h2 className="current-month">
              {monthName} {year}
            </h2>
          </div>

          <div className="controls-right">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Events</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
              <button
                className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button
                className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-container">
          <div className="calendar-grid">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getCalendarDays().map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const filteredDayEvents = dayEvents.filter(e =>
                filterType === 'all' || e.type === filterType
              );

              return (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${isSelected(day.date) ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  <div className="day-events">
                    {filteredDayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="event-pill"
                        style={{ background: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <span className="event-time">{event.startTime}</span>
                        <span className="event-title">{event.title}</span>
                      </div>
                    ))}
                    {filteredDayEvents.length > 3 && (
                      <div className="more-events">
                        +{filteredDayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event Details Sidebar */}
          {selectedEvent && (
            <div className="event-details-sidebar">
              <div className="sidebar-header">
                <h3>Event Details</h3>
                <button className="close-btn" onClick={() => setSelectedEvent(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="sidebar-content">
                <div className="event-type-badge" style={{ background: selectedEvent.color + '20', color: selectedEvent.color }}>
                  {eventTypes.find(t => t.type === selectedEvent.type)?.name || selectedEvent.type}
                </div>

                <h2 className="event-title-large">{selectedEvent.title}</h2>

                <div className="event-info-list">
                  <div className="info-item">
                    <CalendarIcon size={18} />
                    <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={18} />
                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                  {selectedEvent.location && (
                    <div className="info-item">
                      <MapPin size={18} />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.attendees && (
                    <div className="info-item">
                      <Users size={18} />
                      <span>{selectedEvent.attendees} attendees</span>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="event-description">
                    <h4>Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.recurring && (
                  <div className="recurring-info">
                    <AlertCircle size={16} />
                    <span>Repeats {selectedEvent.recurring}</span>
                  </div>
                )}

                <div className="sidebar-actions">
                  <button className="action-btn secondary">
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* Create Event Modal */}
        {showEventModal && (
          <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Event</h2>
                <button className="close-modal-btn" onClick={() => setShowEventModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label>Event Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter event title..."
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Event Type *</label>
                    <select
                      className="form-select"
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    >
                      {eventTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>End Time *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Location</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Room number or location..."
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Event description..."
                      rows="3"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Reminder</label>
                    <select
                      className="form-select"
                      value={eventForm.reminder}
                      onChange={(e) => setEventForm({ ...eventForm, reminder: e.target.value })}
                    >
                      <option value="none">No Reminder</option>
                      <option value="15min">15 minutes before</option>
                      <option value="30min">30 minutes before</option>
                      <option value="1hour">1 hour before</option>
                      <option value="1day">1 day before</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Event Color</label>
                    <input
                      type="color"
                      className="form-input color-input"
                      value={eventForm.color}
                      onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleCreateEvent}>
                  <Save size={18} />
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .calendar-page {
          padding: var(--space-lg);
          background: var(--bg-primary);
          min-height: 100vh;
        }

        /* Loading and Error States */
        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 2rem;
        }

        .loading-state p {
          margin-top: 1rem;
          color: var(--text-muted);
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--primary-green);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 1rem 0 0.5rem;
        }

        .error-state p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .btn-retry {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-retry:hover {
          background: var(--primary-green-hover);
        }

        /* Header */
        .page-header {
          margin-bottom: var(--space-lg);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-md);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .action-btn.primary {
          background: var(--primary-green);
          color: white;
        }

        .action-btn.primary:hover {
          background: var(--primary-green-hover);
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: white;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .action-btn.delete {
          background: #fee2e2;
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .action-btn.delete:hover {
          background: #ef4444;
          color: white;
        }

        /* Statistics */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon-wrapper.blue { background: #3b82f6; }
        .stat-icon-wrapper.green { background: #10b981; }
        .stat-icon-wrapper.purple { background: #8b5cf6; }
        .stat-icon-wrapper.orange { background: #f59e0b; }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Calendar Controls */
        .calendar-controls {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .nav-btn {
          padding: 0.5rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .today-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .today-btn:hover {
          background: var(--primary-green);
          border-color: var(--primary-green);
          color: white;
        }

        .current-month {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .filter-select {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary-green);
        }

        .view-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          padding: 4px;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: white;
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Calendar Container */
        .calendar-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        .calendar-grid {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--border-color);
        }

        .calendar-day-header {
          background: white;
          padding: var(--space-md);
          text-align: center;
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .calendar-day {
          background: white;
          min-height: 120px;
          padding: var(--space-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .calendar-day:hover {
          background: var(--bg-secondary);
        }

        .calendar-day.other-month {
          opacity: 0.4;
        }

        .calendar-day.today {
          background: #dcfce7;
        }

        .calendar-day.selected {
          outline: 2px solid var(--primary-green);
          outline-offset: -2px;
        }

        .day-number {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .calendar-day.today .day-number {
          background: var(--primary-green);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .day-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .event-pill {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.75rem;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .event-time {
          font-weight: 600;
        }

        .event-title {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-events {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          padding: 2px 6px;
          font-weight: 500;
        }

        /* Event Details Sidebar */
        .event-details-sidebar {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          position: sticky;
          top: var(--space-lg);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .event-type-badge {
          width: fit-content;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .event-title-large {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .event-info-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .event-description {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .event-description h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 var(--space-xs) 0;
        }

        .event-description p {
          font-size: 0.875rem;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.5;
        }

        .recurring-info {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm);
          background: #fef3c7;
          border-radius: 0.5rem;
          color: #92400e;
          font-size: 0.875rem;
        }

        .sidebar-actions {
          display: flex;
          gap: var(--space-sm);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-color);
        }

        .sidebar-actions .action-btn {
          flex: 1;
          justify-content: center;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal-content {
          background: white;
          border-radius: 0.75rem;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-modal-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .color-input {
          height: 48px;
          cursor: pointer;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-sm);
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .cancel-btn:hover {
          background: var(--bg-secondary);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          background: var(--primary-green);
          border: none;
          color: white;
        }

        .submit-btn:hover {
          background: var(--primary-green-hover);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }

          .event-details-sidebar {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 500px;
            width: calc(100% - 2rem);
            z-index: 999;
          }
        }

        @media (max-width: 768px) {
          .calendar-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .calendar-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .controls-left,
          .controls-right {
            width: 100%;
            justify-content: space-between;
          }

          .calendar-day {
            min-height: 80px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .calendar-grid {
            gap: 0;
          }

          .calendar-day {
            min-height: 60px;
            padding: 4px;
          }

          .day-number {
            font-size: 0.875rem;
          }

          .event-pill {
            font-size: 0.625rem;
            padding: 1px 4px;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Calendar;
