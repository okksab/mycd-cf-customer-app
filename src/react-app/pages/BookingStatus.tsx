import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { DashboardLayout } from '../components/DashboardLayout';

export const BookingStatus: React.FC = () => {
  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullFrom, setShowFullFrom] = useState(false);
  const [showFullTo, setShowFullTo] = useState(false);

  useEffect(() => {
    // Extract requestId from URL
    const pathParts = window.location.pathname.split('/');
    const requestId = pathParts[pathParts.length - 1];
    
    if (!requestId) {
      setError('Invalid booking reference');
      setIsLoading(false);
      return;
    }

    const fetchLeadStatus = async () => {
      try {
        const response = await apiService.getLeadStatus(requestId);
        if (response.success) {
          console.log('Lead data received:', response.data);
          setLeadData(response.data);
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch booking status');
        }
      } catch (err) {
        setError('Failed to fetch booking status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return '#3b82f6';
      case 'SENT_TO_DRIVERS': return '#f59e0b';
      case 'ACCEPTED_BY_DRIVER': return '#10b981';
      case 'CONVERTED_TO_TRIP': return '#059669';
      case 'CANCELLED_BY_CUSTOMER': return '#ef4444';
      case 'CANCELLED_BY_DRIVER': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'Request Received';
      case 'SENT_TO_DRIVERS': return 'Finding Driver';
      case 'ACCEPTED_BY_DRIVER': return 'Driver Assigned';
      case 'CONVERTED_TO_TRIP': return 'Trip Started';
      case 'CANCELLED_BY_CUSTOMER': return 'Cancelled by You';
      case 'CANCELLED_BY_DRIVER': return 'Driver Cancelled';
      default: return status.replace(/_/g, ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="booking-status loading">
        <div className="loading-spinner"></div>
        <p>Loading booking status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-status error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/dashboard'}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="booking-status">
      <div className="status-header">
        <h2>🚗 Booking Status</h2>
      </div>

      <div className="status-content">
        <div className="status-section">
          <h3>🚗 Your Driver</h3>
          <div className="driver-info">
            <div className="driver-avatar">
              <img 
                src={leadData.assignedDriverId ? (leadData.driverProfilePicture || '/default-driver.png') : '/default-driver.png'} 
                alt="Driver" 
                className="driver-photo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-driver.png';
                }}
              />
            </div>
            <div className="driver-details">
              <div className="detail-row">
                <span className="label">Driver Name:</span>
                <span className="value">{leadData.assignedDriverId ? `${leadData.driverFirstName || 'Driver'} ${leadData.driverLastName || 'Assigned'}` : 'TBA - To Be Assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Driver ID:</span>
                <span className="value">{leadData.assignedDriverId ? (leadData.driverCode || leadData.assignedDriverId) : 'TBA - To Be Assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value driver-status">{getStatusText(leadData.status)}</span>
              </div>
              <div className="driver-actions">
                <button className="driver-btn message-btn" disabled={!leadData.assignedDriverId}>
                  💬 Message Driver
                </button>
                <button className="driver-btn call-btn" disabled={!leadData.assignedDriverId}>
                  📞 Call Driver
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="status-section">
          <h3>📍 Your Trip</h3>
          <div className="detail-row">
            <span className="label">Request ID:</span>
            <span className="value">{leadData.requestId}</span>
          </div>
          <div className="detail-row">
            <span className="label">From:</span>
            <div className="location-value">
              <span className="value">
                {showFullFrom ? leadData.fromLocation : (() => {
                  const parts = leadData.fromLocation?.split(',').map(p => p.trim()) || [];
                  const cityName = parts.find(p => p.match(/kumbakonam|chennai|bangalore|mumbai|delhi|hyderabad|pune|kolkata|coimbatore|madurai|salem|trichy/i)) || parts[parts.length - 3] || parts[0];
                  return cityName;
                })()}
              </span>
              {leadData.fromLocation?.includes(',') && (
                <button 
                  className="show-more-btn" 
                  onClick={() => setShowFullFrom(!showFullFrom)}
                >
                  {showFullFrom ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
          <div className="detail-row">
            <span className="label">To:</span>
            <div className="location-value">
              <span className="value">
                {showFullTo ? leadData.toLocation : (() => {
                  const parts = leadData.toLocation?.split(',').map(p => p.trim()) || [];
                  const cityName = parts.find(p => p.match(/kumbakonam|chennai|bangalore|mumbai|delhi|hyderabad|pune|kolkata|coimbatore|madurai|salem|trichy/i)) || parts[parts.length - 3] || parts[0];
                  return cityName;
                })()}
              </span>
              {leadData.toLocation?.includes(',') && (
                <button 
                  className="show-more-btn" 
                  onClick={() => setShowFullTo(!showFullTo)}
                >
                  {showFullTo ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
          <div className="detail-row">
            <span className="label">Service:</span>
            <span className="value">{leadData.serviceCategory}</span>
          </div>
          <div className="detail-row">
            <span className="label">Duration:</span>
            <span className="value">{leadData.serviceDuration}</span>
          </div>
        </div>

        <div className="status-section">
          <h3>👤 Booking Details</h3>
          <div className="detail-row">
            <span className="label">Customer:</span>
            <span className="value">{leadData.customerFirstName} {leadData.customerLastName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Contact:</span>
            <span className="value">{leadData.mobileNumber}</span>
          </div>
        </div>

        {leadData.specialRequirements && (
          <div className="status-section">
            <h3>📝 Special Requirements</h3>
            <div className="special-req">{leadData.specialRequirements}</div>
          </div>
        )}
      </div>

      <div className="status-actions">
        <button onClick={() => window.location.href = '/dashboard'}>
          Back to Dashboard
        </button>
        <button onClick={() => window.location.reload()}>
          Refresh Status
        </button>
      </div>

      <style jsx="true">{`
        .booking-status {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .status-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .status-header h2 {
          color: #F28C00;
          margin: 0 0 1rem 0;
        }

        .request-id {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .status-badge.pulsing {
          animation: pulse 2s infinite;
        }

        .status-icon {
          font-size: 1.1rem;
        }

        @keyframes pulse {
          0% { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          50% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); }
          100% { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .status-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid #F28C00;
        }

        .status-section h3 {
          color: #F28C00;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #F28C00;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .detail-row .label {
          font-weight: 600;
          color: #6b7280;
        }

        .detail-row .value {
          color: #1f2937;
          text-align: right;
        }

        .location-value {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .show-more-btn {
          background: none;
          border: none;
          color: #F28C00;
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .show-more-btn:hover {
          color: #e6741d;
        }

        .driver-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
        }

        .driver-avatar {
          flex-shrink: 0;
        }

        .driver-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #F28C00;
        }

        .driver-details {
          width: 100%;
        }

        .driver-status {
          font-weight: 600;
          color: #10b981;
        }

        .driver-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .driver-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .driver-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .driver-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message-btn {
          background: #F28C00;
          color: white;
        }

        .message-btn:hover:not(:disabled) {
          background: #e6741d;
        }

        .call-btn {
          background: #F28C00;
          color: white;
        }

        .call-btn:hover:not(:disabled) {
          background: #e6741d;
        }

        .special-req {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          font-style: italic;
        }

        .status-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .status-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          background: #F28C00;
          color: white;
        }

        .status-actions button:hover {
          background: #e6741d;
        }

        .loading {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #003B71;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          padding: 3rem;
        }

        .error h2 {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .error button {
          padding: 0.75rem 1.5rem;
          background: #003B71;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .booking-status {
            padding: 0.5rem;
          }
          
          .status-section {
            padding: 1rem;
          }
          
          .detail-row {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .detail-row .value {
            text-align: left;
          }
          
          .location-value {
            align-items: flex-start;
          }
          
          .status-actions {
            flex-direction: column;
          }
          
          .driver-info {
            gap: 1rem;
          }
          
          .driver-photo {
            width: 60px;
            height: 60px;
          }
          
          .driver-actions {
            flex-direction: column;
          }
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
};