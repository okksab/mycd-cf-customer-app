import React, { useState } from 'react';
import { ServiceSelector } from '../components/ServiceSelector';
import { VehicleTypeSelector } from '../components/VehicleTypeSelector';
import { GooglePlacesAutocomplete } from '../components/GooglePlacesAutocomplete';
import { apiService } from '../services/apiService';

export const DashboardBook: React.FC = () => {
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    serviceType: '',
    serviceCategory: '',
    serviceDuration: '',
    vehicleType: '',
    scheduledTime: '',
    specialRequirements: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTiming, setSelectedTiming] = useState('now');

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all mandatory fields
    if (!formData.fromLocation.trim()) {
      alert('Please enter pickup location');
      return;
    }
    
    if (!formData.toLocation.trim()) {
      alert('Please enter destination location');
      return;
    }
    
    if (!formData.serviceType || !formData.serviceCategory || !formData.serviceDuration) {
      alert('Please complete service selection (category, type, and duration)');
      return;
    }
    
    if (!formData.vehicleType) {
      alert('Please select a vehicle type');
      return;
    }
    
    // Validate timing
    if (selectedTiming === 'scheduled' && !formData.scheduledTime) {
      alert('Please select scheduled date and time');
      return;
    }
    
    setShowPreview(true);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Get user data from session/localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
      
      // Generate unique lead ID
      const leadIdResponse = await apiService.generateLeadId(userData.state || userSession.state);
      const leadId = leadIdResponse.data;
      
      // Build lead data dynamically
      const leadData = {
        request_id: leadId,
        customer_first_name: userData.firstName || userSession.firstName || '',
        customer_last_name: userData.lastName || userSession.lastName || '',
        mobile_number: userData.mobile || userSession.mobile || '',
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        service_type: formData.serviceType,
        service_category: formData.serviceCategory,
        service_subcategory: formData.serviceType,
        service_duration: formData.serviceDuration,
        duration: selectedTiming === 'now' ? 'immediate' : 'scheduled',
        special_requirements: formData.specialRequirements || null,
        vehicle_type: formData.vehicleType,
        scheduled_time: selectedTiming === 'scheduled' ? formData.scheduledTime : null,
        lead_type: selectedTiming === 'now' ? 'INSTANT' : 'SCHEDULED',
        customer_id: userData.customerId || userSession.customerId || null,
        geo_state: userData.state || userSession.state || null,
        geo_city: userData.city || userSession.city || null,
        geo_pincode: userData.pincode || userSession.pincode || null
      };
      
      // Create lead
      await apiService.createLead(leadData);
      
      // Navigate to booking status page
      window.location.href = `/booking-status/${leadId}`;
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dashboard-book">
      <div className="book-header">
        <h2>🚗 Book Your Driver</h2>
        <p>Fill in the details for your booking request</p>
      </div>

      <form onSubmit={handlePreview} className="booking-form">
        {/* Location Section */}
        <div className="form-section">
          <h3>📍 Trip Details</h3>
          
          <div className="form-group">
            <label>From Location</label>
            <GooglePlacesAutocomplete
              value={formData.fromLocation}
              onChange={(value) => handleInputChange('fromLocation', value)}
              placeholder="Enter pickup location"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>To Location</label>
            <GooglePlacesAutocomplete
              value={formData.toLocation}
              onChange={(value) => handleInputChange('toLocation', value)}
              placeholder="Enter destination"
              className="form-input"
              required
            />
          </div>


        </div>

        {/* Service Category Section */}
        <div className="form-section">
          <h3>🚙 Service Selection</h3>
          
          <ServiceSelector 
            onSelectionChange={(selection) => {
              handleInputChange('serviceCategory', selection.categoryName);
              handleInputChange('serviceType', selection.subcategoryName);
              handleInputChange('serviceDuration', selection.durationName);
            }}
          />
        </div>

        {/* Vehicle Type Section */}
        <div className="form-section">
          <h3>🚗 Vehicle Type</h3>
          
          <VehicleTypeSelector 
            selectedVehicleType={formData.vehicleType}
            onSelectionChange={(vehicleType) => handleInputChange('vehicleType', vehicleType)}
          />
        </div>

        {/* Timing Section */}
        <div className="form-section">
          <h3>⏰ Timing</h3>
          
          <div className="timing-options">
            <label className="radio-option">
              <input
                type="radio"
                name="timing"
                value="now"
                checked={selectedTiming === 'now'}
                onChange={(e) => setSelectedTiming(e.target.value)}
              />
              <span className="radio-label">Book Now</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="timing"
                value="scheduled"
                checked={selectedTiming === 'scheduled'}
                onChange={(e) => setSelectedTiming(e.target.value)}
              />
              <span className="radio-label">Schedule for Later</span>
            </label>
          </div>

          <div className="form-group">
            <label>Scheduled Time (if applicable)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
            />
          </div>
        </div>

        {/* Special Requirements */}
        <div className="form-section">
          <h3>📝 Special Requirements (Optional)</h3>
          
          <div className="form-group">
            <textarea
              className="form-input"
              placeholder="Any special requirements or notes..."
              rows={3}
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.fromLocation || !formData.toLocation || !formData.serviceType || !formData.serviceDuration || !formData.vehicleType}
          className="btn btn-primary submit-btn"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              📋 Preview and Submit
            </>
          )}
        </button>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>📋 Review Your Booking Request</h3>
              <button onClick={() => setShowPreview(false)} className="close-btn">×</button>
            </div>
            
            <div className="preview-details">
              <div className="preview-row">
                <span className="label">From Location:</span>
                <span className="value">{formData.fromLocation}</span>
              </div>
              <div className="preview-row">
                <span className="label">To Location:</span>
                <span className="value">{formData.toLocation}</span>
              </div>
              <div className="preview-row">
                <span className="label">Service Category:</span>
                <span className="value">{formData.serviceCategory}</span>
              </div>
              <div className="preview-row">
                <span className="label">Service Type:</span>
                <span className="value">{formData.serviceType}</span>
              </div>
              <div className="preview-row">
                <span className="label">Duration:</span>
                <span className="value">{formData.serviceDuration}</span>
              </div>
              <div className="preview-row">
                <span className="label">Vehicle Type:</span>
                <span className="value">{formData.vehicleType}</span>
              </div>
              <div className="preview-row">
                <span className="label">Timing:</span>
                <span className="value">
                  {selectedTiming === 'now' ? 'Book Now' : `Scheduled: ${formData.scheduledTime}`}
                </span>
              </div>
              {formData.specialRequirements && (
                <div className="preview-row">
                  <span className="label">Special Requirements:</span>
                  <span className="value">{formData.specialRequirements}</span>
                </div>
              )}
            </div>
            
            <div className="preview-actions">
              <button 
                onClick={() => setShowPreview(false)} 
                className="btn btn-secondary"
              >
                ← Back
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  '🚗 Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .dashboard-book {
          max-width: 600px;
          margin: 0 auto;
        }

        .book-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .book-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .book-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-section h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }



        .timing-options {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .radio-label {
          font-weight: 500;
          color: #374151;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1rem;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        /* Preview Modal */
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .preview-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .preview-header h3 {
          color: #003B71;
          margin: 0;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #374151;
        }

        .preview-details {
          margin-bottom: 1.5rem;
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .preview-row:last-child {
          border-bottom: none;
        }

        .preview-row .label {
          font-weight: 600;
          color: #6b7280;
          flex-shrink: 0;
        }

        .preview-row .value {
          color: #1f2937;
          text-align: right;
          flex: 1;
          margin-left: 1rem;
          word-break: break-word;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .preview-actions .btn {
          width: auto;
          min-width: 120px;
        }

        @media (max-width: 480px) {
          .timing-options {
            flex-direction: column;
            gap: 1rem;
          }
          
          .form-section {
            padding: 1rem;
          }
          
          .preview-content {
            margin: 0.5rem;
            padding: 1.5rem;
          }
          
          .preview-row {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .preview-row .value {
            text-align: left;
            margin-left: 0;
          }
          
          .preview-actions {
            flex-direction: column;
          }
          
          .preview-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};