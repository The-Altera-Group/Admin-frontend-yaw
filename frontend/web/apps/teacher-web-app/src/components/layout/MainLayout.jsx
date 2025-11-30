import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ 
  children, 
  user, 
  onLogout, 
  activeView 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On mobile, start with sidebar collapsed (hidden)
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        // On desktop, start with sidebar expanded
        setIsSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const sidebarWidth = isSidebarCollapsed && !isMobile ? 80 : 280;
  const mainContentMargin = isMobile ? 0 : sidebarWidth;

  return (
    <div className="main-layout">
      <Sidebar 
        user={user}
        activeView={activeView}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobile={isMobile}
      />
      
      <div 
        className="main-content"
        style={{ 
          marginLeft: `${mainContentMargin}px`,
          width: `calc(100% - ${mainContentMargin}px)`
        }}
      >
        <TopBar 
          user={user} 
          isMobile={isMobile}
        />
        
        <main className="content-area">
          {children}
        </main>
      </div>

      <style jsx>{`
        .main-layout {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: all var(--transition-medium);
          background: var(--bg-primary);
        }

        .content-area {
          width: 100%;
          flex: 1;
          overflow-y: auto;
          background: var(--bg-primary);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .content-area {
            padding: var(--space-md);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(MainLayout);