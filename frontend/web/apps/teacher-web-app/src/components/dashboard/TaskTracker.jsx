import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

const TaskTracker = ({ tasks = [], loading }) => {
  const [taskList, setTaskList] = useState([
    {
      id: '1',
      title: 'Grade Math Assignment #5',
      dueDate: 'Today, 5:00 PM',
      priority: 'high',
      completed: false,
      category: 'grading'
    },
    {
      id: '2',
      title: 'Prepare Chemistry Quiz',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium',
      completed: false,
      category: 'planning'
    },
    {
      id: '3',
      title: 'Update Student Attendance Records',
      dueDate: 'Today, 3:00 PM',
      priority: 'high',
      completed: true,
      category: 'admin'
    },
    {
      id: '4',
      title: 'Review Lab Reports',
      dueDate: 'This Week',
      priority: 'low',
      completed: false,
      category: 'grading'
    },
    {
      id: '5',
      title: 'Send Parent Updates',
      dueDate: 'Friday, 4:00 PM',
      priority: 'medium',
      completed: false,
      category: 'communication'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const toggleTask = (id) => {
    setTaskList(taskList.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTaskList(taskList.filter(task => task.id !== id));
  };

  const filteredTasks = taskList.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: taskList.length,
    completed: taskList.filter(t => t.completed).length,
    pending: taskList.filter(t => !t.completed).length,
    high: taskList.filter(t => t.priority === 'high' && !t.completed).length
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: { bg: '#fee2e2', color: '#ef4444', border: '#fecaca' },
      medium: { bg: '#fef3c7', color: '#f59e0b', border: '#fde68a' },
      low: { bg: '#dbeafe', color: '#3b82f6', border: '#bfdbfe' }
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="task-tracker card">
        <div className="card-header">
          <h3>Task Tracker</h3>
        </div>
        <div className="card-content">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  const completionPercentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="task-tracker card">
      <div className="card-header">
        <div className="header-content">
          <div className="header-title">
            <CheckCircle2 size={20} />
            <h3>Task Tracker</h3>
          </div>
          <p className="tracker-subtitle">Manage your daily tasks</p>
        </div>
        <button className="add-task-btn">
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="card-content">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-percentage">{completionPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.high}</span>
              <span className="stat-label">Urgent</span>
            </div>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All <span className="count">{stats.total}</span>
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active <span className="count">{stats.pending}</span>
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed <span className="count">{stats.completed}</span>
          </button>
        </div>

        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-tasks">
              <CheckCircle2 size={48} color="var(--primary-green)" />
              <p>No tasks found</p>
              <span>Add a task to get started</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priorityStyle = getPriorityColor(task.priority);

              return (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    className="task-checkbox"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} color="var(--primary-green)" />
                    ) : (
                      <Circle size={20} color="var(--text-muted)" />
                    )}
                  </button>

                  <div className="task-content">
                    <div className="task-header">
                      <h4 className="task-title">{task.title}</h4>
                      <div
                        className="priority-badge"
                        style={{
                          background: priorityStyle.bg,
                          color: priorityStyle.color,
                          border: `1px solid ${priorityStyle.border}`
                        }}
                      >
                        {task.priority === 'high' && <AlertCircle size={12} />}
                        {task.priority}
                      </div>
                    </div>

                    <div className="task-meta">
                      <span className="task-due">
                        <Clock size={14} />
                        {task.dueDate}
                      </span>
                      <span className="task-category">{task.category}</span>
                    </div>
                  </div>

                  <button
                    className="delete-task-btn"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .header-content {
          flex: 1;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tracker-subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .add-task-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-task-btn:hover {
          background: var(--primary-green-dark);
          transform: translateY(-1px);
        }

        .progress-section {
          background: var(--bg-tertiary);
          padding: 1.25rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .progress-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .progress-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-green);
        }

        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-green), #16a34a);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          background: var(--bg-tertiary);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .filter-tabs button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.5rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .filter-tabs button:hover {
          background: var(--bg-hover);
        }

        .filter-tabs button.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .count {
          padding: 0.125rem 0.375rem;
          background: var(--bg-glass);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .filter-tabs button.active .count {
          background: var(--primary-green);
          color: white;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-tasks {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }

        .empty-tasks p {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 1rem 0 0.5rem;
        }

        .empty-tasks span {
          font-size: 0.875rem;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .task-item:hover {
          border-color: var(--primary-green);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .task-item.completed {
          opacity: 0.6;
        }

        .task-item.completed .task-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-checkbox {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .task-checkbox:hover {
          transform: scale(1.1);
        }

        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .task-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }

        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .task-due {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .task-category {
          padding: 0.125rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }

        .delete-task-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .task-item:hover .delete-task-btn {
          opacity: 1;
        }

        .delete-task-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .progress-stats {
            gap: 0.5rem;
          }

          .tasks-list {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(TaskTracker);
