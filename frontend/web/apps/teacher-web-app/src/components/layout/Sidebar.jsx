import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, FileText, GraduationCap, Users, CheckSquare, Calendar, FolderOpen, MessageCircle, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ user, onLogout, isCollapsed, onToggleCollapse, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/overview',
      description: 'View your dashboard'
    },
    { 
      id: 'classes', 
      label: 'Classes', 
      icon: BookOpen, 
      path: '/classes', 
      badge: null,
      description: 'Manage your classes'
    },
    { 
      id: 'assignments', 
      label: 'Assignments', 
      icon: FileText, 
      path: '/assignments', 
      badge: 12,
      description: 'View and grade assignments'
    },
    { 
      id: 'grades', 
      label: 'Gradebook', 
      icon: GraduationCap, 
      path: '/grades', 
      badge: null,
      description: 'Student grades and reports'
    },
    { 
      id: 'students', 
      label: 'Students', 
      icon: Users, 
      path: '/students', 
      badge: null,
      description: 'Student management'
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: CheckSquare, 
      path: '/attendance', 
      badge: 3,
      description: 'Track student attendance'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: Calendar, 
      path: '/calendar', 
      badge: null,
      description: 'View calendar events'
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: FolderOpen, 
      path: '/resources', 
      badge: null,
      description: 'Teaching resources'
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageCircle, 
      path: '/messages', 
      badge: 5,
      description: 'Communicate with students'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleDesktopToggle = () => {
    onToggleCollapse(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = isCollapsed && !isMobile ? 100 : 280;

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile */}
      {isMobile && (
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobile}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && isMobile && (
        <div 
          className="mobile-overlay" 
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Header with improved collapse button positioning */}
        <div className="sidebar-header">
          <div className="header-content">
            <div className="school-brand">
              <div className="school-logo">
                <GraduationCap size={isCollapsed && !isMobile ? 20 : 24} />
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="school-info">
                  <h2>OAIS</h2>
                  <span>Teacher Portal</span>
                </div>
              )}
            </div>
            
            {/* Desktop Collapse Button - Better positioned */}
            {!isMobile && (
              <button 
                className="collapse-btn"
                onClick={handleDesktopToggle}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${active ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    aria-current={active ? 'page' : undefined}
                    title={isCollapsed && !isMobile ? item.label : undefined}
                  >
                    <div className="nav-icon-wrapper">
                      <IconComponent size={20} />
                      {item.badge && isCollapsed && !isMobile && (
                        <span className="collapsed-badge">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <div className="avatar-fallback">
                <Users size={16} />
              </div>
            </div>
            
            {(!isCollapsed || isMobile) && (
              <div className="user-info">
                <strong>{user?.firstName} {user?.lastName}</strong>
                <span>{user?.email}</span>
              </div>
            )}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <button 
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      <style jsx>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 150;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-medium);
          box-shadow: var(--shadow-sm);
        }

        .mobile-menu-btn:hover {
          background: var(--bg-hover);
          border-color: var(--primary-green);
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 90;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: var(--bg-secondary);
          z-index: 100;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-medium);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        /* Improved Sidebar Header */
        .sidebar-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.03), rgba(5, 150, 105, 0.01));
          position: relative;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          position: relative;
        }

        .school-brand {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          min-width: 0; /* Prevent overflow */
        }

        .school-logo {
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-green);
          flex-shrink: 0;
        }

        .school-info {
          display: flex;
          flex-direction: column;
          animation: slideIn 0.2s ease-out;
          min-width: 0;
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateX(-10px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        .school-info h2 {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin: 0;
        }

        .school-info span {
          font-size: var(--text-sm);
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Enhanced Collapse Button */
        .collapse-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-medium);
          flex-shrink: 0;
          position: relative;
          box-shadow: var(--shadow-xs);
        }

        .collapse-btn:hover {
          background: var(--primary-green);
          color: var(--white);
          border-color: var(--primary-green);
          transform: scale(1.05);
          box-shadow: var(--shadow-sm);
        }

        .collapse-btn:active {
          transform: scale(0.98);
        }

        /* Collapsed state adjustments */
        .sidebar.collapsed .header-content {
          justify-content: center;
          flex-direction: column;
          gap: var(--space-md);
        }

        .sidebar.collapsed .school-brand {
          justify-content: center;
        }

        .sidebar.collapsed .collapse-btn {
          position: relative;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-md);
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: var(--radius-md);
          position: relative;
          transition: all var(--transition-medium);
          overflow: hidden;
        }

        .nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.05));
          color: var(--primary-green);
          border: 1px solid rgba(5, 150, 105, 0.2);
          box-shadow: var(--shadow-sm);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: var(--primary-green);
          border-radius: 0 2px 2px 0;
        }

        /* Collapsed navigation adjustments */
        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: var(--space-md) var(--space-sm);
        }

        .nav-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .collapsed-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--accent-red);
          color: var(--white);
          font-size: 10px;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 8px;
          min-width: 16px;
          text-align: center;
          border: 2px solid var(--bg-secondary);
          line-height: 1;
        }

        .nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }

        .nav-badge {
          background: var(--primary-green);
          color: var(--white);
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          min-width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          flex-shrink: 0;
          background: var(--bg-tertiary);
        }

        /* Collapsed footer adjustments */
        .sidebar.collapsed .sidebar-footer {
          align-items: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .sidebar.collapsed .user-profile {
          justify-content: center;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          box-shadow: var(--shadow-sm);
        }

        .user-info {
          flex: 1;
          min-width: 0;
          animation: slideIn 0.2s ease-out;
        }

        .user-info strong {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-info > span {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          width: 100%;
          padding: var(--space-sm);
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--error);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: 500;
          transition: all var(--transition-medium);
          min-height: 40px;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--accent-red);
          color: var(--accent-red);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-medium);
            width: 280px;
            box-shadow: var(--shadow-2xl);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          /* Reset collapsed styles on mobile */
          .sidebar.mobile-open .header-content {
            flex-direction: row;
            justify-content: space-between;
          }

          .sidebar.mobile-open .school-brand {
            justify-content: flex-start;
          }

          .sidebar.mobile-open .nav-link {
            justify-content: flex-start;
            padding: var(--space-md);
          }

          .sidebar.mobile-open .sidebar-footer {
            align-items: stretch;
          }

          .sidebar.mobile-open .user-profile {
            justify-content: flex-start;
          }
        }

        /* Scrollbar Styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        /* Focus states for accessibility */
        .collapse-btn:focus,
        .nav-link:focus,
        .logout-btn:focus {
          outline: 2px solid var(--primary-green);
          outline-offset: 2px;
        }

        /* Smooth transitions for state changes */
        .sidebar * {
          transition: all var(--transition-medium);
        }
      `}</style>
    </>
  );
};

export default React.memo(Sidebar);