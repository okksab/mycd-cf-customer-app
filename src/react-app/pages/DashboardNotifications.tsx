import React, { useState } from 'react';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export const DashboardNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your booking for Wedding Event on Dec 15 has been confirmed. Driver: Rajesh Kumar',
      timestamp: '2024-12-14T10:30:00Z',
      isRead: false,
      actionUrl: '/dashboard/history'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of ₹2,500 for booking REQ-2024-001 has been processed successfully.',
      timestamp: '2024-12-14T09:15:00Z',
      isRead: false
    },
    {
      id: '3',
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your profile information to continue using our services.',
      timestamp: '2024-12-13T16:45:00Z',
      isRead: true,
      actionUrl: '/dashboard/profile'
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Special Offer!',
      message: 'Get 20% off on your next booking. Use code SAVE20. Valid till Dec 31.',
      timestamp: '2024-12-12T12:00:00Z',
      isRead: true
    },
    {
      id: '5',
      type: 'booking',
      title: 'Driver Assigned',
      message: 'Driver Suresh Patel has been assigned for your airport transfer on Dec 10.',
      timestamp: '2024-12-09T14:20:00Z',
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'system' | 'promotion'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '🚗';
      case 'payment': return '💰';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'system': return '#f59e0b';
      case 'promotion': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-notifications">
      <div className="notifications-header">
        <div className="header-content">
          <h2>🔔 Notifications</h2>
          <p>Stay updated with your bookings and account</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-tab ${filter === 'booking' ? 'active' : ''}`}
          onClick={() => setFilter('booking')}
        >
          Bookings
        </button>
        <button
          className={`filter-tab ${filter === 'payment' ? 'active' : ''}`}
          onClick={() => setFilter('payment')}
        >
          Payments
        </button>
        <button
          className={`filter-tab ${filter === 'system' ? 'active' : ''}`}
          onClick={() => setFilter('system')}
        >
          System
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up! No notifications to show.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-icon-wrapper">
                    <span 
                      className="notification-icon"
                      style={{ backgroundColor: `${getTypeColor(notification.type)}20` }}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                    {!notification.isRead && <div className="unread-dot"></div>}
                  </div>
                  
                  <div className="notification-info">
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <div className="notification-meta">
                      <span className="timestamp">{formatTimestamp(notification.timestamp)}</span>
                      <span 
                        className="type-badge"
                        style={{ 
                          backgroundColor: `${getTypeColor(notification.type)}20`,
                          color: getTypeColor(notification.type)
                        }}
                      >
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="notification-actions">
                  {notification.actionUrl && (
                    <button className="action-btn primary">
                      View
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="action-btn danger"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx="true">{`
        .dashboard-notifications {
          max-width: 800px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .header-content h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .header-content p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .mark-all-read-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .mark-all-read-btn:hover {
          background: #e5e7eb;
        }

        .filter-tabs {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .filter-tab {
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
          white-space: nowrap;
        }

        .filter-tab.active {
          background: #F28C00;
          color: white;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .filter-tab:not(.active):hover {
          color: #003B71;
          background: rgba(0, 59, 113, 0.05);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .notification-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }

        .notification-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .notification-card.unread {
          border-left: 4px solid #3b82f6;
          background: rgba(59, 130, 246, 0.02);
        }

        .notification-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .notification-header {
          display: flex;
          gap: 1rem;
          flex: 1;
        }

        .notification-icon-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .notification-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.2rem;
        }

        .unread-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border-radius: 50%;
          border: 2px solid white;
        }

        .notification-info {
          flex: 1;
        }

        .notification-info h3 {
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .notification-info p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .timestamp {
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .type-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: #2563eb;
        }

        .action-btn.danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .action-btn.danger:hover {
          background: #fee2e2;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 480px) {
          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .notification-content {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .notification-actions {
            align-self: flex-end;
          }
          
          .filter-tabs {
            padding: 0.125rem;
          }
          
          .filter-tab {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          
          .notification-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};