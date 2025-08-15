import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { DashboardLayout } from '../components/DashboardLayout';

export const BookingStatus: React.FC = () => {
  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="request-id">Request ID: {leadData.requestId}</div>
        <div 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(leadData.status) }}
        >
          {getStatusText(leadData.status)}
        </div>
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
            <span className="label">From:</span>
            <span className="value">{leadData.fromLocation}</span>
          </div>
          <div className="detail-row">
            <span className="label">To:</span>
            <span className="value">{leadData.toLocation}</span>
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
          color: #003B71;
          margin: 0 0 1rem 0;
        }

        .request-id {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
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
        }

        .status-section h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
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

        .driver-info {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .driver-avatar {
          flex-shrink: 0;
        }

        .driver-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #e5e7eb;
        }

        .driver-details {
          flex: 1;
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
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .driver-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message-btn {
          background: #3b82f6;
          color: white;
        }

        .message-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .call-btn {
          background: #10b981;
          color: white;
        }

        .call-btn:hover:not(:disabled) {
          background: #059669;
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
          background: #003B71;
          color: white;
        }

        .status-actions button:hover {
          background: #002a52;
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
          
          .status-actions {
            flex-direction: column;
          }
          
          .driver-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
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