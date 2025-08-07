import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface GuestBooking {
  id: string;
  requestId: string;
  service: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  status: 'completed' | 'cancelled' | 'pending';
  amount?: number;
}

export const GuestHistory: React.FC = () => {
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch guest bookings
    setTimeout(() => {
      setBookings([
        {
          id: '1',
          requestId: 'GUEST-2024-001',
          service: 'Airport Transfer',
          fromLocation: 'Koramangala, Bangalore',
          toLocation: 'Kempegowda Airport',
          date: '2024-12-10',
          status: 'completed',
          amount: 800
        },
        {
          id: '2',
          requestId: 'GUEST-2024-002',
          service: 'Wedding Event',
          fromLocation: 'MG Road, Bangalore',
          toLocation: 'Palace Grounds',
          date: '2024-12-08',
          status: 'cancelled'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div className="guest-history loading">
        <div className="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="guest-history">
      <div className="history-header">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <h1>Your Bookings</h1>
        <p>View your guest booking history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet.</p>
          <Link to="/" className="btn btn-primary">
            Book Your First Ride
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
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
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                  
                  {booking.amount && (
                    <div className="meta-item">
                      <span className="meta-icon">💰</span>
                      <span>₹{booking.amount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'completed' && (
                  <button className="action-btn primary">Book Again</button>
                )}
                <button className="action-btn secondary">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="guest-actions">
        <Link to="/" className="btn btn-primary">
          Book Another Ride
        </Link>
        <button className="btn btn-secondary">
          Create Account
        </button>
      </div>

      <style jsx="true">{`
        .guest-history {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
          min-height: 100vh;
        }

        .guest-history.loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #003B71;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .history-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          margin-bottom: 1rem;
        }

        .brand-logo {
          height: 60px;
          max-width: 200px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }

        .history-header h1 {
          color: #003B71;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .history-header p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
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

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
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
          margin: 0 0 1.5rem 0;
        }

        .guest-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #e6741d 0%, #d1661a 100%);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 480px) {
          .guest-history {
            padding: 1rem 0.5rem;
          }
          
          .history-header h1 {
            font-size: 1.5rem;
          }
          
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
          
          .guest-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};