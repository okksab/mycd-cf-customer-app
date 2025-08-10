import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface BookingHistory {
  id: string;
  requestId: string;
  service: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  status: 'completed' | 'cancelled' | 'pending' | 'in-progress';
  driverName?: string;
  amount?: number;
}

export const DashboardHistory: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'cancelled' | 'pending'>('all');

  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookingHistory = async () => {
      try {
        // Get current user info from JWT
        const currentUserResponse = await apiService.getCurrentUser();
        if (!currentUserResponse.success) {
          throw new Error('Failed to get user info');
        }
        
        const mobile = currentUserResponse.data.mobile;
        
        // Fetch customer leads from API using mobile number
        const leadsResponse = await apiService.getCustomerLeadsByMobile(mobile);
        if (leadsResponse.success) {
          // Map leads to booking history format
          const mappedBookings = leadsResponse.data.map((lead: any) => ({
            id: lead.id?.toString() || lead.requestId,
            requestId: lead.requestId,
            service: lead.serviceCategory || 'Service',
            fromLocation: lead.fromLocation,
            toLocation: lead.toLocation,
            date: lead.createdAt,
            status: mapLeadStatusToBookingStatus(lead.status),
            driverName: undefined, // Not available in lead data
            amount: undefined // Not available in lead data
          }));
          setBookings(mappedBookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error('Failed to load booking history:', error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingHistory();
  }, []);

  const mapLeadStatusToBookingStatus = (leadStatus: string): 'completed' | 'cancelled' | 'pending' | 'in-progress' => {
    switch (leadStatus?.toUpperCase()) {
      case 'CONVERTED_TO_TRIP':
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_DRIVER':
      case 'REJECTED_BY_ADMIN':
        return 'cancelled';
      case 'ACCEPTED_BY_DRIVER':
      case 'SENT_TO_DRIVERS':
        return 'in-progress';
      default:
        return 'pending';
    }
  };

  const filteredBookings = bookings.filter(booking => 
    activeFilter === 'all' || booking.status === activeFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      default: return status;
    }
  };

  return (
    <div className="dashboard-history">
      <div className="history-header">
        <h2>📋 Booking History</h2>
        <p>View and manage your past bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({bookings.filter(b => b.status === 'completed').length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner">🔄</div>
            <p>Loading booking history...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No bookings found</h3>
            <p>No bookings match the selected filter.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-info">
                  <h3>{booking.service}</h3>
                  <p className="request-id">Request ID: {booking.requestId}</p>
                </div>
                <div 
                  className="booking-status"
                  style={{ 
                    backgroundColor: `${getStatusColor(booking.status)}20`,
                    color: getStatusColor(booking.status)
                  }}
                >
                  {getStatusText(booking.status)}
                </div>
              </div>

              <div className="booking-details">
                <div className="location-info">
                  <div className="location-item">
                    <span className="location-icon">📍</span>
                    <div>
                      <strong>From:</strong> {booking.fromLocation}
                    </div>
                  </div>
                  {booking.toLocation && (
                    <div className="location-item">
                      <span className="location-icon">🎯</span>
                      <div>
                        <strong>To:</strong> {booking.toLocation}
                      </div>
                    </div>
                  )}
                </div>

                <div className="booking-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{new Date(booking.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  {booking.driverName && (
                    <div className="meta-item">
                      <span className="meta-icon">👤</span>
                      <span>Driver: {booking.driverName}</span>
                    </div>
                  )}
                  
                  {booking.amount && (
                    <div className="meta-item">
                      <span className="meta-icon">💰</span>
                      <span>₹{booking.amount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.href = `/booking-status/${booking.requestId}`}
                >
                  View
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    // Store booking data for rebooking
                    const rebookData = {
                      fromLocation: booking.fromLocation,
                      toLocation: booking.toLocation,
                      serviceCategory: booking.service,
                      serviceType: booking.service,
                      serviceDuration: '1 hour',
                      vehicleType: 'car',
                      selectedTiming: 'now'
                    };
                    sessionStorage.setItem('bookingPreviewData', JSON.stringify(rebookData));
                    window.location.href = '/booking-preview';
                  }}
                >
                  Book Again
                </button>
                <button className="action-btn secondary">Support Request</button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx="true">{`
        .dashboard-history {
          max-width: 800px;
          margin: 0 auto;
        }

        .history-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .history-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .history-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
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

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }

        .booking-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .booking-info h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .request-id {
          color: #6b7280;
          font-size: 0.8rem;
          margin: 0;
        }

        .booking-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .booking-details {
          margin-bottom: 1rem;
        }

        .location-info {
          margin-bottom: 1rem;
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #374151;
        }

        .location-icon {
          font-size: 1rem;
        }

        .booking-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .meta-icon {
          font-size: 0.9rem;
        }

        .booking-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 1rem;
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

        .action-btn.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .action-btn.secondary:hover {
          background: #e5e7eb;
        }

        .action-btn.danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
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

        .loading-state {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

        @media (max-width: 480px) {
          .booking-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .booking-status {
            align-self: flex-start;
          }
          
          .booking-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .booking-actions {
            justify-content: stretch;
          }
          
          .action-btn {
            flex: 1;
            text-align: center;
          }
          
          .filter-tabs {
            padding: 0.125rem;
          }
          
          .filter-tab {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};