import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const displayName = React.useMemo(() => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.name || 'User';
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-brand">
          <h1>Welcome, {displayName}</h1>
        </div>
        <div className="nav-user">
          {user?.profile_picture ? (
            <img src={user.profile_picture} className="user-avatar" alt={user.name} />
          ) : (
            <div className="user-avatar-placeholder">
              {displayName.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Advertisement Section */}
      <div className="bottom-ad-section">
        <div className="ad-banner">
          <div className="ad-content">
            <span className="ad-text">🎉 Special Offer: Get 20% off on your next booking!</span>
            <button className="ad-close">×</button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link to="/dashboard/home" className={`nav-item ${isActive('/dashboard/home') ? 'active' : ''}`}>
          <div className="nav-icon">🏠</div>
          <span className="nav-label">Home</span>
        </Link>
        
        <Link to="/dashboard/book" className={`nav-item ${isActive('/dashboard/book') ? 'active' : ''}`}>
          <div className="nav-icon">📝</div>
          <span className="nav-label">Book</span>
        </Link>
        
        <Link to="/dashboard/history" className={`nav-item ${isActive('/dashboard/history') ? 'active' : ''}`}>
          <div className="nav-icon">📋</div>
          <span className="nav-label">History</span>
        </Link>
        
        <Link to="/dashboard/notifications" className={`nav-item ${isActive('/dashboard/notifications') ? 'active' : ''}`}>
          <div className="nav-icon">🔔</div>
          <span className="nav-label">Inbox</span>
        </Link>
        
        <Link to="/dashboard/profile" className={`nav-item ${isActive('/dashboard/profile') ? 'active' : ''}`}>
          <div className="nav-icon">👤</div>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>

      <style jsx="true">{`
        .dashboard-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .top-nav {
          background: white;
          padding: 0.875rem 1rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand h1 {
          color: #003B71;
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #F58220;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .main-content {
          flex: 1;
          padding: 0.875rem;
          padding-bottom: 140px;
          min-height: calc(100vh - 180px);
          overflow-y: auto;
        }

        .bottom-ad-section {
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 0.5rem;
          position: fixed;
          bottom: 70px;
          left: 0;
          right: 0;
          z-index: 99;
        }

        .ad-banner {
          background: linear-gradient(135deg, #F28C00 0%, #ff9500 100%);
          border-radius: 8px;
          padding: 0.75rem;
          margin: 0 0.5rem;
        }

        .ad-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ad-text {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          flex: 1;
        }

        .ad-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ad-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .bottom-nav {
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 0.375rem;
          display: flex;
          justify-content: space-around;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          text-decoration: none;
          color: #64748b;
          border-radius: 6px;
          transition: all 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          min-width: 56px;
        }

        .nav-item:hover {
          background: rgba(245, 130, 32, 0.08);
          color: #F58220;
        }

        .nav-item.active {
          color: #F58220;
          background: rgba(245, 130, 32, 0.08);
        }

        .nav-icon {
          font-size: 1.125rem;
          margin-bottom: 0.125rem;
        }

        .nav-label {
          font-size: 0.65rem;
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .top-nav {
            padding: 0.75rem;
          }
          
          .nav-brand h1 {
            font-size: 1.1rem;
          }
          
          .main-content {
            padding: 0.75rem;
            padding-bottom: 130px;
          }
          
          .bottom-ad-section {
            bottom: 65px;
            padding: 0.375rem;
          }
          
          .ad-banner {
            margin: 0 0.25rem;
            padding: 0.625rem;
          }
          
          .ad-text {
            font-size: 0.8rem;
          }
          
          .nav-item {
            padding: 0.4rem;
            min-width: 50px;
          }
          
          .nav-icon {
            font-size: 1.1rem;
          }
          
          .nav-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
};