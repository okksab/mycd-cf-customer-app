import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { DashboardLayout } from '../components/DashboardLayout';

export const BookingStatus: React.FC = () => {
  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullFrom, setShowFullFrom] = useState(false);
  const [showFullTo, setShowFullTo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Start with full 15 minutes
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

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
          
          // Calculate remaining time based on booking creation time
          const bookingTime = new Date(response.data.createdAt).getTime();
          const currentTime = new Date().getTime();
          const timeDiff = Math.floor((currentTime - bookingTime) / 1000);
          
          // For very recent bookings or invalid dates, start fresh timer
          let remainingTime;
          if (isNaN(bookingTime) || timeDiff < 0 || timeDiff < 60) {
            remainingTime = 15 * 60; // Fresh 15 minutes
            // Set timer start time to current time for new bookings
            if (!timerStartTime) {
              setTimerStartTime(currentTime);
            }
          } else {
            remainingTime = Math.max(0, (15 * 60) - timeDiff);
            // Set timer start time to booking creation time
            if (!timerStartTime) {
              setTimerStartTime(bookingTime);
            }
          }
          
          setTimeLeft(remainingTime);
          setIsTimerActive(remainingTime > 0);
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

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerActive || !timerStartTime) return;

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsed = Math.floor((currentTime - timerStartTime) / 1000);
      const remaining = Math.max(0, (15 * 60) - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setIsTimerActive(false);
        // Auto-confirm when timer expires
        if (leadData && leadData.status !== 'CANCELLED_BY_CUSTOMER') {
          handleAutoConfirm();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timerStartTime, leadData]);

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
      case 'CONFIRMED': return 'Booking Confirmed';
      case 'AUTO_CONFIRMED': return 'Auto Confirmed';
      default: return status.replace(/_/g, ' ');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = async () => {
    const cancellationCharge = !isTimerActive ? 25 : 0;
    const message = cancellationCharge > 0 
      ? `Are you sure you want to cancel this booking? A cancellation charge of ₹${cancellationCharge} will be deducted from your wallet.`
      : 'Are you sure you want to cancel this booking?';
      
    if (window.confirm(message)) {
      try {
        // API call to cancel booking with charges
        const cancelData = {
          requestId: leadData.requestId,
          cancellationCharge: cancellationCharge,
          reason: 'CANCELLED_BY_CUSTOMER'
        };
        
        console.log('Cancelling booking with charges:', cancelData);
        
        // Update booking status
        setLeadData(prev => ({ ...prev, status: 'CANCELLED_BY_CUSTOMER' }));
        setIsTimerActive(false);
        
        // Show confirmation message
        if (cancellationCharge > 0) {
          alert(`Booking cancelled. ₹${cancellationCharge} cancellation charge has been deducted from your wallet.`);
        } else {
          alert('Booking cancelled successfully.');
        }
        
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleConfirm = async () => {
    try {
      // API call to confirm booking
      console.log('Confirming booking:', leadData.requestId);
      setLeadData(prev => ({ ...prev, status: 'CONFIRMED' }));
      setIsTimerActive(false);
      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleAutoConfirm = async () => {
    try {
      // API call to auto-confirm booking
      console.log('Auto-confirming booking:', leadData.requestId);
      setLeadData(prev => ({ ...prev, status: 'AUTO_CONFIRMED' }));
      alert('Your booking has been automatically confirmed!');
    } catch (error) {
      console.error('Failed to auto-confirm booking:', error);
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
              <div className="driver-placeholder">
                👤
              </div>
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
                <button 
                  className="driver-btn rate-btn" 
                  disabled={leadData.status !== 'CONVERTED_TO_TRIP' && leadData.status !== 'COMPLETED'}
                  onClick={() => window.location.href = `/rate-trip/${leadData.requestId}`}
                >
                  ⭐ Rate Trip
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
          
          {/* Trip Timing Details */}
          <div className="timing-section">
            <div className="detail-row">
              <span className="label">Trip Submitted:</span>
              <span className="value">{leadData.createdAt ? new Date(leadData.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Just now'}</span>
            </div>
            {(leadData.status === 'CONFIRMED' || leadData.status === 'AUTO_CONFIRMED') && (
              <div className="detail-row">
                <span className="label">Confirmed At:</span>
                <span className="value">{leadData.status === 'AUTO_CONFIRMED' ? 'Auto-confirmed after 15 minutes' : 'Manually confirmed'}</span>
              </div>
            )}
          </div>
          
          {/* Cancellation Window */}
          {leadData.status !== 'CANCELLED_BY_CUSTOMER' && leadData.status !== 'COMPLETED' && (
            <div className="cancellation-window">
              <div className="timer-section">
                {(leadData.status !== 'CONFIRMED' && leadData.status !== 'AUTO_CONFIRMED') ? (
                  <>
                    <div className="timer-info">
                      <span className="timer-label">Free Cancellation Window:</span>
                      <span className={`timer-display ${timeLeft <= 300 ? 'warning' : ''}`}>
                        {isTimerActive ? formatTime(timeLeft) : '00:00'}
                      </span>
                    </div>
                    {!isTimerActive && (
                      <div className="timeout-notice">
                        ⚠️ Cancellation will incur ₹25 charge
                      </div>
                    )}
                  </>
                ) : (
                  <div className="confirmed-notice">
                    <div className="confirmed-status">
                      ✅ Booking {leadData.status === 'AUTO_CONFIRMED' ? 'Auto-Confirmed' : 'Confirmed'}
                    </div>
                    <div className="cancellation-charge-notice">
                      ⚠️ Cancellation will incur ₹25 charge
                    </div>
                  </div>
                )}
              </div>
              
              <div className="cancellation-actions">
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={leadData.status === 'CANCELLED_BY_CUSTOMER'}
                >
                  ❌ Cancel Request
                </button>
                {(leadData.status !== 'CONFIRMED' && leadData.status !== 'AUTO_CONFIRMED') && (
                  <button 
                    className="confirm-btn"
                    onClick={handleConfirm}
                    disabled={!isTimerActive || leadData.status === 'CANCELLED_BY_CUSTOMER'}
                  >
                    ✅ Confirm
                  </button>
                )}
              </div>
              
              <div className="action-note">
                {(leadData.status !== 'CONFIRMED' && leadData.status !== 'AUTO_CONFIRMED') ? (
                  <>
                    • <span className="cancel-text">Cancel</span>: Cancel the request<br />
                    • <span className="confirm-text">Confirm</span>: Get the driver quickly
                  </>
                ) : (
                  <>• <span className="cancel-text">Cancel Request</span>: Cancel confirmed booking (₹25 charge applies)</>
                )}
              </div>
            </div>
          )}
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

        .timing-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .timing-section .detail-row {
          border-bottom: none;
          margin-bottom: 0.5rem;
        }

        .timing-section .label {
          color: #F28C00;
          font-weight: 600;
        }

        .cancellation-window {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(242, 140, 0, 0.05);
          border-radius: 8px;
          border: 2px solid rgba(242, 140, 0, 0.2);
        }

        .timer-section {
          margin-bottom: 1rem;
        }

        .timer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .timer-label {
          font-size: 0.9rem;
          color: #F28C00;
          font-weight: 600;
        }

        .timer-display {
          font-size: 1.2rem;
          font-weight: 700;
          color: #F28C00;
          font-family: monospace;
        }

        .timer-display.warning {
          color: #ef4444;
          animation: pulse-timer 1s infinite;
        }

        .action-note {
          font-size: 0.85rem;
          color: #6b7280;
          text-align: center;
          margin: 0.75rem 0;
          padding: 0.5rem;
          background: rgba(242, 140, 0, 0.08);
          border-radius: 6px;
          font-style: italic;
        }

        .cancel-text {
          color: #ef4444;
          font-weight: 600;
        }

        .confirm-text {
          color: #10b981;
          font-weight: 600;
        }

        @keyframes pulse-timer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .timeout-notice {
          font-size: 0.8rem;
          color: #ef4444;
          font-weight: 500;
          text-align: center;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        .confirmed-notice {
          text-align: center;
        }

        .confirmed-status {
          font-size: 0.9rem;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
        }

        .cancellation-charge-notice {
          font-size: 0.8rem;
          color: #ef4444;
          font-weight: 500;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        .cancellation-actions {
          display: flex;
          gap: 0.75rem;
        }

        .cancel-btn, .confirm-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: rgba(242, 140, 0, 0.1);
          color: #F28C00;
          border: 2px solid #F28C00;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #F28C00;
          color: white;
        }

        .confirm-btn {
          background: #F28C00;
          color: white;
        }

        .confirm-btn:hover:not(:disabled) {
          background: #e6741d;
        }

        .cancel-btn:disabled, .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .driver-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f3f4f6;
          border: 3px solid #F28C00;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #6b7280;
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
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .driver-btn {
          flex: 1;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-width: 90px;
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

        .rate-btn {
          background: #F28C00;
          color: white;
        }

        .rate-btn:hover:not(:disabled) {
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