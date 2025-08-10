import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuthStore } from '../stores/authStore';

export const DashboardMore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'notifications' | 'profile'>('subscription');
  const [isLoading, setIsLoading] = useState(false);
  
  // Subscription data
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  
  // Notifications data
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Profile data
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'subscription') {
        // Mock subscription data
        setTimeout(() => {
          setCurrentPlan({
            name: 'Premium Plan',
            price: 299,
            validTill: '2025-01-15',
            features: ['Free cancellations: 5/month', 'Chat & Voice access', 'Manual driver selection']
          });
          setIsLoading(false);
        }, 500);
      } else if (activeTab === 'notifications') {
        // Mock notifications data
        setTimeout(() => {
          setNotifications([
            { id: 1, title: 'Booking Confirmed', message: 'Your driver is on the way', time: '2 hours ago', read: false },
            { id: 2, title: 'Payment Successful', message: 'Payment of ₹450 completed', time: '1 day ago', read: true },
            { id: 3, title: 'New Offer Available', message: 'Get 20% off on your next ride', time: '2 days ago', read: true }
          ]);
          setIsLoading(false);
        }, 500);
      } else if (activeTab === 'profile') {
        // Get current user data
        const currentUserResponse = await apiService.getCurrentUser();
        if (currentUserResponse.success) {
          setProfileData(currentUserResponse.data);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load tab data:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const validTill = new Date(dateString);
    const diffTime = validTill.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Calling logout...');
      await logout();
      console.log('Logout successful, redirecting...');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      window.location.href = '/';
    }
  };

  const renderSubscriptionTab = () => (
    <div className="tab-content">
      {currentPlan ? (
        <>
          <div className="current-plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h3>{currentPlan.name}</h3>
                <div className="plan-price">₹{currentPlan.price}/month</div>
              </div>
              <div className="plan-status active">Active</div>
            </div>
            
            <div className="plan-validity">
              <div className="validity-info">
                <span className="validity-label">Valid till:</span>
                <span className="validity-date">{formatDate(currentPlan.validTill)}</span>
              </div>
              <div className="days-remaining">
                {getDaysRemaining(currentPlan.validTill)} days left
              </div>
            </div>

            <div className="plan-features">
              <h4>Your Benefits:</h4>
              <ul>
                {currentPlan.features.map((feature: string, index: number) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="action-btn secondary">Change Plan</button>
              <button className="action-btn primary">Renew Now</button>
            </div>
          </div>

          <div className="subscription-actions">
            <button className="subscription-action-btn">
              <span className="action-icon">📊</span>
              <span>Usage Statistics</span>
            </button>
            <button className="subscription-action-btn">
              <span className="action-icon">💳</span>
              <span>Payment History</span>
            </button>
            <button className="subscription-action-btn">
              <span className="action-icon">❓</span>
              <span>Plan Help</span>
            </button>
          </div>
        </>
      ) : (
        <div className="no-subscription">
          <div className="no-sub-icon">⭐</div>
          <h3>No Active Subscription</h3>
          <p>Subscribe to enjoy premium features</p>
          <button className="action-btn primary">View Plans</button>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-content">
      <div className="notifications-header">
        <h3>Recent Notifications</h3>
        <button className="mark-all-read">Mark All Read</button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <div className="notification-settings">
        <h4>Notification Settings</h4>
        <div className="setting-item">
          <span>Booking Updates</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>Promotional Offers</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>Payment Alerts</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="tab-content">
      {profileData ? (
        <>
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profileData.firstName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="profile-info">
              <h3>{profileData.firstName} {profileData.lastName}</h3>
              <p>{profileData.mobile}</p>
              <div className="profile-status">
                <span className="status-badge verified">Verified</span>
              </div>
            </div>
          </div>

          <div className="profile-sections">
            <div className="profile-section">
              <h4>Account Information</h4>
              <div className="info-item">
                <span className="info-label">Customer ID:</span>
                <span className="info-value">{profileData.customerIdCode || profileData.customerId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">Dec 2024</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value">{profileData.customerType}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-action-btn">
                <span className="action-icon">✏️</span>
                <span>Edit Profile</span>
              </button>
              <button className="profile-action-btn">
                <span className="action-icon">🔒</span>
                <span>Change PIN</span>
              </button>
              <button className="profile-action-btn">
                <span className="action-icon">❓</span>
                <span>Help & Support</span>
              </button>
              <button className="profile-action-btn logout" onClick={handleLogout}>
                <span className="action-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="profile-loading">
          <div className="loading-spinner">🔄</div>
          <p>Loading profile...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-more">
      <div className="more-header">
        <h2>⚙️ More Options</h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          ⭐ Subscription
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner">🔄</div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'subscription' && renderSubscriptionTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'profile' && renderProfileTab()}
          </>
        )}
      </div>

      <style jsx="true">{`
        .dashboard-more {
          max-width: 800px;
          margin: 0 auto;
        }

        .more-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .more-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .more-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .tab-btn.active {
          background: #F28C00;
          color: white;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .tab-btn:not(.active):hover {
          color: #003B71;
          background: rgba(0, 59, 113, 0.05);
        }

        .tab-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-height: 400px;
        }

        .tab-content {
          padding: 1.5rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Subscription Tab Styles */
        .current-plan-card {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .plan-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .plan-price {
          font-size: 1rem;
          opacity: 0.9;
        }

        .plan-status {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .plan-validity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .validity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .validity-label {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .validity-date {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .days-remaining {
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
        }

        .plan-features {
          margin-bottom: 1rem;
        }

        .plan-features h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-features li {
          padding: 0.25rem 0;
          font-size: 0.8rem;
        }

        .plan-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .action-btn.primary {
          background: white;
          color: #10b981;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .subscription-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .subscription-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .subscription-action-btn:hover {
          background: rgba(245, 130, 32, 0.08);
          border-color: #F58220;
        }

        .no-subscription {
          text-align: center;
          padding: 2rem;
        }

        .no-sub-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Notifications Tab Styles */
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .notifications-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: #F58220;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .notifications-list {
          margin-bottom: 2rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }

        .notification-item.unread {
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .notification-content p {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .notification-settings {
          border-top: 1px solid #f3f4f6;
          padding-top: 1.5rem;
        }

        .notification-settings h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          font-size: 0.9rem;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #F58220;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        /* Profile Tab Styles */
        .profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #003B71 0%, #0056a3 100%);
          color: white;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .profile-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .profile-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.2rem;
        }

        .profile-info p {
          margin: 0 0 0.5rem 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-badge.verified {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-section {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
        }

        .profile-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #6b7280;
        }

        .info-value {
          color: #1f2937;
          font-weight: 500;
        }

        .profile-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .profile-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .profile-action-btn:hover {
          background: rgba(245, 130, 32, 0.08);
          border-color: #F58220;
        }

        .profile-action-btn.logout {
          background: rgba(239, 68, 68, 0.05);
          border-color: #fecaca;
          color: #dc2626;
        }

        .profile-action-btn.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .action-icon {
          font-size: 1.2rem;
        }

        .empty-notifications {
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .profile-loading {
          text-align: center;
          padding: 2rem;
        }

        @media (max-width: 480px) {
          .tab-navigation {
            padding: 0.125rem;
          }
          
          .tab-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          
          .tab-content {
            padding: 1rem;
          }
          
          .plan-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .plan-validity {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
          
          .plan-actions {
            flex-direction: column;
          }
          
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          
          .subscription-actions,
          .profile-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};