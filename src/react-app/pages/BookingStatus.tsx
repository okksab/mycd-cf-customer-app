import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuestStore } from '../stores/guestStore';

export const BookingStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooking = () => {
      try {
        // Try to get booking from guest store first
        const { getRequestById } = useGuestStore.getState();
        const guestRequest = id ? getRequestById(id) : null;
        
        if (guestRequest) {
          setBooking({
            id: guestRequest.requestId,
            service: guestRequest.service,
            fromLocation: guestRequest.fromLocation,
            toLocation: guestRequest.toLocation,
            status: guestRequest.status,
            driverName: 'Rajesh Kumar',
            driverPhone: '+91 98765 43210',
            vehicleNumber: 'KA 01 AB 1234',
            estimatedArrival: '2024-12-15T10:30:00Z',
            amount: guestRequest.amount || 2500
          });
          setIsLoading(false);
        } else {
          // Mock API call for other bookings
          setTimeout(() => {
            setBooking({
              id: id || 'REQ-2024-001',
              service: 'Wedding Event',
              fromLocation: 'MG Road, Bangalore',
              toLocation: 'Palace Grounds, Bangalore',
              status: 'confirmed',
              driverName: 'Rajesh Kumar',
              driverPhone: '+91 98765 43210',
              vehicleNumber: 'KA 01 AB 1234',
              estimatedArrival: '2024-12-15T10:30:00Z',
              amount: 2500
            });
            setIsLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        setIsLoading(false);
      }
    };
    
    loadBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="booking-status loading">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-status error">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <h2>Booking Not Found</h2>
        <p>The booking you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="booking-status">
      <div className="status-header">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <div className="status-icon">✅</div>
        <h1>Booking Confirmed!</h1>
        <p>Your driver has been assigned</p>
      </div>

      <div className="booking-details-card">
        <h2>Booking Details</h2>
        
        <div className="detail-row">
          <span className="label">Booking ID:</span>
          <span className="value">{booking.id}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Service:</span>
          <span className="value">{booking.service}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">From:</span>
          <span className="value">{booking.fromLocation}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">To:</span>
          <span className="value">{booking.toLocation}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Amount:</span>
          <span className="value">₹{booking.amount}</span>
        </div>
      </div>

      <div className="driver-details-card">
        <h2>Driver Details</h2>
        
        <div className="driver-info">
          <div className="driver-avatar">
            {booking.driverName.charAt(0)}
          </div>
          <div className="driver-details">
            <h3>{booking.driverName}</h3>
            <p>{booking.vehicleNumber}</p>
            <p>📞 {booking.driverPhone}</p>
          </div>
        </div>
        
        <div className="driver-actions">
          <button className="btn btn-primary">Call Driver</button>
          <button className="btn btn-secondary">Send Message</button>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard/history')} className="btn btn-secondary">
          View History
        </button>
        <button onClick={() => navigate('/dashboard/book')} className="btn btn-primary">
          Book Another Ride
        </button>
      </div>

      <style jsx="true">{`
        .booking-status {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .booking-status.loading,
        .booking-status.error {
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .logo-container {
          margin-bottom: 2rem;
        }

        .brand-logo {
          height: 60px;
          max-width: 200px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
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

        .status-header {
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .status-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .status-header h1 {
          color: #10b981;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .status-header p {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }

        .booking-details-card,
        .driver-details-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .booking-details-card h2,
        .driver-details-card h2 {
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          color: #1f2937;
          font-weight: 600;
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .driver-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #003B71;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
        }

        .driver-details h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .driver-details p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0.25rem 0;
        }

        .driver-actions {
          display: flex;
          gap: 1rem;
        }

        .driver-actions .btn {
          flex: 1;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .action-buttons .btn {
          flex: 1;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
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
          .booking-status {
            padding: 1rem 0.5rem;
          }
          
          .status-header,
          .booking-details-card,
          .driver-details-card {
            padding: 1.5rem;
          }
          
          .status-header h1 {
            font-size: 1.5rem;
          }
          
          .driver-actions,
          .action-buttons {
            flex-direction: column;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};