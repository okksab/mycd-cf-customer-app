import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { DashboardLayout } from '../components/DashboardLayout';

export const BookingPreview: React.FC = () => {
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get booking data from sessionStorage
    const data = sessionStorage.getItem('bookingPreviewData');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      // Redirect back if no data
      window.location.href = '/dashboard';
    }
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) return;
    
    setIsLoading(true);
    
    try {
      // Get customer info from JWT (secure approach)
      const currentUserResponse = await apiService.getCurrentUser();
      const customerData = currentUserResponse.success ? currentUserResponse.data : {};
      
      const leadData = {
        customer_first_name: customerData.firstName || 'Guest',
        customer_last_name: customerData.lastName || 'User',
        mobile_number: customerData.mobile || '',
        from_location: bookingData.fromLocation,
        to_location: bookingData.toLocation,
        service_type: bookingData.serviceType,
        service_category: bookingData.serviceCategory,
        service_subcategory: bookingData.serviceType,
        service_duration: bookingData.serviceDuration,
        duration: bookingData.selectedTiming === 'now' ? 'immediate' : 'scheduled',
        special_requirements: bookingData.specialRequirements || null,
        vehicle_type: bookingData.vehicleType,
        scheduled_time: bookingData.selectedTiming === 'scheduled' ? bookingData.scheduledTime : null,
        lead_type: bookingData.selectedTiming === 'now' ? 'INSTANT' : 'SCHEDULED',
        customer_id: customerData.customerId || null,
        geo_state: customerData.state || null,
        geo_city: customerData.city || null,
        geo_pincode: customerData.pincode || null
      };
      
      // Create lead
      const response = await apiService.createLead(leadData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create lead');
      }
      
      // Clear preview data
      sessionStorage.removeItem('bookingPreviewData');
      
      // Navigate to booking status page with generated lead ID
      const createdLead = response.data;
      window.location.href = `/booking-status/${createdLead.requestId}`;
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="booking-preview loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="booking-preview">
      <div className="logo-container">
        <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }} />
      </div>
      <div className="preview-header">
        <h2>📋 Review Your Booking Request</h2>
        <p>Please review all details before confirming your booking</p>
      </div>
      
      <div className="preview-content">
        <div className="preview-section">
          <h3>📍 Trip Details</h3>
          <div className="detail-row">
            <span className="label">From Location:</span>
            <span className="value">{bookingData.fromLocation}</span>
          </div>
          <div className="detail-row">
            <span className="label">To Location:</span>
            <span className="value">{bookingData.toLocation}</span>
          </div>
        </div>

        <div className="preview-section">
          <h3>🚙 Service Details</h3>
          <div className="detail-row">
            <span className="label">Service Category:</span>
            <span className="value">{bookingData.serviceCategory}</span>
          </div>
          <div className="detail-row">
            <span className="label">Service Type:</span>
            <span className="value">{bookingData.serviceType}</span>
          </div>
          <div className="detail-row">
            <span className="label">Duration:</span>
            <span className="value">{bookingData.serviceDuration}</span>
          </div>
          <div className="detail-row">
            <span className="label">Vehicle Type:</span>
            <span className="value">{bookingData.vehicleType}</span>
          </div>
        </div>

        <div className="preview-section">
          <h3>⏰ Timing</h3>
          <div className="detail-row">
            <span className="label">Booking Type:</span>
            <span className="value">
              {bookingData.selectedTiming === 'now' ? 'Book Now' : `Scheduled: ${bookingData.scheduledTime}`}
            </span>
          </div>
        </div>

        {bookingData.specialRequirements && (
          <div className="preview-section">
            <h3>📝 Special Requirements</h3>
            <div className="detail-row">
              <span className="value special-req">{bookingData.specialRequirements}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="preview-actions">
        <button 
          onClick={handleBack} 
          className="btn btn-secondary"
          disabled={isLoading}
        >
          ← Back to Edit
        </button>
        <button 
          onClick={handleConfirmBooking}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Submitting...
            </>
          ) : (
            '🚗 Confirm Booking'
          )}
        </button>
      </div>

      <style jsx="true">{`
        .booking-preview {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .logo-container {
          text-align: center;
          margin-bottom: 2rem;
          padding-top: 1rem;
        }

        .brand-logo {
          height: 80px;
          max-width: 300px;
          object-fit: contain;
        }

        .preview-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .preview-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .preview-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .preview-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .preview-section h3 {
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
          flex-shrink: 0;
        }

        .detail-row .value {
          color: #1f2937;
          text-align: right;
          flex: 1;
          margin-left: 1rem;
          word-break: break-word;
        }

        .detail-row .value.special-req {
          text-align: left;
          margin-left: 0;
          font-style: italic;
          background: #f9fafb;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 150px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-primary {
          background: #003B71;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #002a52;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .booking-preview.loading {
          text-align: center;
          padding: 2rem;
        }

        @media (max-width: 480px) {
          .booking-preview {
            padding: 0.5rem;
          }
          
          .preview-section {
            padding: 1rem;
          }
          
          .detail-row {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .detail-row .value {
            text-align: left;
            margin-left: 0;
          }
          
          .preview-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
};