import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  FileText, 
  Target,
  Award,
  BarChart3,
  GraduationCap
} from 'lucide-react';

const StatsCards = ({ stats, loading }) => {
  const [animationTriggered, setAnimationTriggered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationTriggered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatValue = (value, title) => {
    if (title.includes('Grade') || title.includes('Rate')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getTrendDirection = (trend) => {
    if (trend.startsWith('+')) return 'up';
    if (trend.startsWith('-')) return 'down';
    return 'stable';
  };

  const statItems = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'blue',
      trend: '+2 this week',
      description: 'Enrolled students across all classes',
      metric: 'Students',
      change: '+5.2%',
      bgPattern: 'dots'
    },
    {
      title: 'Active Classes',
      value: stats?.activeClasses || 0,
      icon: BookOpen,
      color: 'green',
      trend: '3 today',
      description: 'Currently running classes',
      metric: 'Classes',
      change: '+12.0%',
      bgPattern: 'grid'
    },
    {
      title: 'Assignments Due',
      value: stats?.assignmentsDue || 0,
      icon: Clock,
      color: 'orange',
      trend: '2 urgent',
      description: 'Pending assignments to review',
      metric: 'Tasks',
      change: '-8.3%',
      bgPattern: 'waves'
    },
    {
      title: 'Average Grade',
      value: stats?.averageGrade || 0,
      icon: TrendingUp,
      color: 'purple',
      trend: '+3% from last month',
      description: 'Class average performance',
      metric: 'Performance',
      change: '+3.1%',
      bgPattern: 'triangle'
    },
    {
      title: 'Attendance Rate',
      value: stats?.attendanceRate || 0,
      icon: CheckCircle,
      color: 'teal',
      trend: '94% average',
      description: 'Overall student attendance',
      metric: 'Attendance',
      change: '+1.8%',
      bgPattern: 'circles'
    },
    {
      title: 'Course Progress',
      value: Math.round((stats?.totalStudents || 0) * 0.73),
      icon: Target,
      color: 'pink',
      trend: '73% completion',
      description: 'Average course completion rate',
      metric: 'Progress',
      change: '+7.5%',
      bgPattern: 'hexagon'
    }
  ];

  if (loading) {
    return (
      <div className="stats-grid">
        {statItems.map((_, index) => (
          <div key={index} className="stat-card loading">
            <div className="stat-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid">
        {statItems.map((stat, index) => {
          const IconComponent = stat.icon;
          const trendDirection = getTrendDirection(stat.change);
          
          return (
            <StatCard
              key={stat.title}
              stat={stat}
              IconComponent={IconComponent}
              formatValue={formatValue}
              trendDirection={trendDirection}
              index={index}
              animationTriggered={animationTriggered}
            />
          );
        })}
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

const StatCard = ({ stat, IconComponent, formatValue, trendDirection, index, animationTriggered }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [countAnimation, setCountAnimation] = useState(0);

  useEffect(() => {
    if (animationTriggered) {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCountAnimation(stat.value);
          clearInterval(timer);
        } else {
          setCountAnimation(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [animationTriggered, stat.value]);

  const getColorVars = (color) => {
    const colors = {
      blue: { 
        primary: 'var(--accent-blue)', 
        secondary: 'var(--accent-blue-light)', 
        light: 'rgba(59, 130, 246, 0.1)' 
      },
      green: { 
        primary: 'var(--primary-green)', 
        secondary: 'var(--primary-green-light)', 
        light: 'rgba(5, 150, 105, 0.1)' 
      },
      orange: { 
        primary: 'var(--accent-orange)', 
        secondary: 'var(--accent-orange-light)', 
        light: 'rgba(245, 158, 11, 0.1)' 
      },
      purple: { 
        primary: 'var(--accent-purple)', 
        secondary: 'var(--accent-purple-light)', 
        light: 'rgba(139, 92, 246, 0.1)' 
      },
      teal: { 
        primary: 'var(--accent-cyan)', 
        secondary: 'var(--accent-cyan-light)', 
        light: 'rgba(6, 182, 212, 0.1)' 
      },
      pink: { 
        primary: 'var(--accent-pink)', 
        secondary: 'var(--accent-pink-light)', 
        light: 'rgba(236, 72, 153, 0.1)' 
      }
    };
    return colors[color] || colors.blue;
  };

  const colorVars = getColorVars(stat.color);

  return (
    <div 
      className={`stat-card ${stat.color} ${animationTriggered ? 'animate-in' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="stat-background-pattern"></div>
      
      <div className="stat-header">
        <div className="stat-icon-container">
          <IconComponent size={24} />
          <div className="icon-pulse"></div>
        </div>
        
        <div className="stat-trend-container">
          <span className={`stat-trend ${trendDirection}`}>
            {stat.change}
          </span>
          <span className="stat-metric">{stat.metric}</span>
        </div>
      </div>
      
      <div className="stat-content">
        <div className="stat-value-container">
          <h3 className="stat-value">
            {formatValue(animationTriggered ? countAnimation : 0, stat.title)}
          </h3>
          <div className="value-decoration"></div>
        </div>
        
        <p className="stat-title">{stat.title}</p>
        <p className="stat-description">{stat.description}</p>
        
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: animationTriggered ? `${Math.min(stat.value * 2, 100)}%` : '0%',
                backgroundColor: colorVars.primary 
              }}
            ></div>
          </div>
          <span className="progress-text">{stat.trend}</span>
        </div>
      </div>

      <div className="stat-glow"></div>
      
      {/* Interactive hover effects */}
      <div className={`hover-overlay ${isHovered ? 'active' : ''}`}>
        <div className="hover-particles">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`hover-particle particle-${i}`}></div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-medium);
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
        }

        .stat-card.animate-in {
          animation: fadeInScale 0.6s ease forwards;
        }

        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .stat-card:hover {
          transform: translateY(-6px);
          border-color: ${colorVars.primary};
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 0 1px ${colorVars.primary}40;
        }

        .stat-card.blue { border-left: 4px solid ${colorVars.primary}; }
        .stat-card.green { border-left: 4px solid ${colorVars.primary}; }
        .stat-card.orange { border-left: 4px solid ${colorVars.primary}; }
        .stat-card.purple { border-left: 4px solid ${colorVars.primary}; }
        .stat-card.teal { border-left: 4px solid ${colorVars.primary}; }
        .stat-card.pink { border-left: 4px solid ${colorVars.primary}; }

        .stat-background-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          opacity: 0.03;
          background: ${colorVars.primary};
          border-radius: 50%;
          transform: translate(40px, -40px);
          transition: all var(--transition-medium);
        }

        .stat-card:hover .stat-background-pattern {
          opacity: 0.08;
          transform: translate(20px, -20px) scale(1.2);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .stat-icon-container {
          position: relative;
          width: 56px;
          height: 56px;
          background: ${colorVars.light};
          border: 1px solid ${colorVars.primary}30;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colorVars.primary};
          transition: all var(--transition-medium);
        }

        .stat-card:hover .stat-icon-container {
          background: ${colorVars.primary}20;
          border-color: ${colorVars.primary};
          transform: rotate(5deg) scale(1.05);
        }

        .icon-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid ${colorVars.primary};
          border-radius: var(--radius-md);
          opacity: 0;
          animation: iconPulse 3s infinite;
        }

        @keyframes iconPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .stat-trend-container {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          position: relative;
        }

        .stat-trend.up {
          color: var(--accent-green);
          background: rgba(46, 204, 113, 0.1);
        }

        .stat-trend.down {
          color: var(--accent-pink);
          background: rgba(255, 107, 157, 0.1);
        }

        .stat-trend.stable {
          color: var(--accent-gold);
          background: rgba(244, 208, 63, 0.1);
        }

        .stat-metric {
          font-size: 0.625rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-content {
          position: relative;
          z-index: 2;
        }

        .stat-value-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          line-height: 1;
          background: linear-gradient(135deg, var(--text-primary), ${colorVars.primary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }

        .value-decoration {
          position: absolute;
          bottom: -4px;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, ${colorVars.primary}, transparent);
          border-radius: 2px;
          transition: width var(--transition-slow);
          width: ${animationTriggered ? '60px' : '0px'};
        }

        .stat-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
        }

        .stat-description {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-glass);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${colorVars.primary};
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .stat-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${colorVars.primary}, transparent);
          opacity: 0;
          transition: opacity var(--transition-medium);
        }

        .stat-card:hover .stat-glow {
          opacity: 0.8;
        }

        .hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity var(--transition-medium);
        }

        .hover-overlay.active {
          opacity: 1;
        }

        .hover-particles {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hover-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: ${colorVars.primary};
          border-radius: 50%;
          opacity: 0;
        }

        .hover-overlay.active .hover-particle {
          animation: particleFloat 2s ease-out forwards;
        }

        .particle-0 {
          top: 30%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle-1 {
          top: 60%;
          left: 70%;
          animation-delay: 0.3s;
        }

        .particle-2 {
          top: 80%;
          left: 40%;
          animation-delay: 0.6s;
        }

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-10px, -20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-20px, -40px) scale(0);
          }
        }

        @media (max-width: 768px) {
          .stat-card {
            padding: 1.25rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .progress-indicator {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }

          .progress-text {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(StatsCards);