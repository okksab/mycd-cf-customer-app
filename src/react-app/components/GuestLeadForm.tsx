import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestStore } from '../stores/guestStore';
import { LocationInput } from './LocationInput';
import { ServiceSelector } from './ServiceSelector';

interface GuestLeadFormProps {
  onBack?: () => void;
  onComplete?: (result: any) => void;
}

export const GuestLeadForm: React.FC<GuestLeadFormProps> = ({ onBack, onComplete }) => {
  const navigate = useNavigate();
  const { guestData, isLoading, error, setError } = useGuestStore();
  
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    serviceType: '',
    serviceCategory: '',
    serviceSubcategory: '',
    serviceDuration: '',
    vehicleType: '',
    tripTiming: 'now',
    scheduleDate: '',
    scheduleTime: '',
    specialRequirements: '',
    fromCoordinates: null as { lat: number; lng: number } | null,
    toCoordinates: null as { lat: number; lng: number } | null
  });

  const [showPreview, setShowPreview] = useState(false);

  const minDate = new Date().toISOString().split('T')[0];

  const canPreview = formData.fromLocation.trim() &&
                    formData.serviceCategory &&
                    formData.serviceSubcategory &&
                    formData.serviceDuration;

  const canSubmit = canPreview;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const onFromLocationSelected = (location: { address: string; lat?: number; lng?: number }) => {
    if (location.lat && location.lng) {
      setFormData(prev => ({
        ...prev,
        fromCoordinates: { lat: location.lat!, lng: location.lng! }
      }));
    }
  };

  const onToLocationSelected = (location: { address: string; lat?: number; lng?: number }) => {
    if (location.lat && location.lng) {
      setFormData(prev => ({
        ...prev,
        toCoordinates: { lat: location.lat!, lng: location.lng! }
      }));
    }
  };

  const onServiceSelection = (selection: any) => {
    setFormData(prev => ({
      ...prev,
      serviceType: 'personal',
      serviceCategory: selection.category,
      serviceSubcategory: selection.subcategory,
      serviceDuration: selection.duration,
      vehicleType: 'sedan'
    }));
  };

  const getServiceDisplayName = () => {
    if (!formData.serviceCategory) return '';
    return `${formData.serviceCategory} - ${formData.serviceSubcategory} (${formData.serviceDuration})`;
  };

  const getTimingDisplayName = () => {
    if (formData.tripTiming === 'now') {
      return 'Book Now';
    } else {
      return `${formData.scheduleDate} at ${formData.scheduleTime}`;
    }
  };

  const handlePreview = () => {
    if (!canPreview) return;
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        requestId: `REQ-${Date.now()}`,
        status: 'submitted'
      };
      
      setShowPreview(false);
      navigate(`/booking-status/${result.requestId}`);
      onComplete?.(result);
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="guest-lead-form">
      <div className="form-header">
        <h3>🚗 Trip Details</h3>
        <p>Complete your booking request</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="lead-form">
        {/* Location Inputs */}
        <div className="form-section">
          <h4>📍 Trip Locations</h4>
          
          <LocationInput
            value={formData.fromLocation}
            onChange={(value) => handleInputChange('fromLocation', value)}
            onLocationSelected={onFromLocationSelected}
            label="From Location"
            placeholder="Enter pickup location"
            required
          />

          <LocationInput
            value={formData.toLocation}
            onChange={(value) => handleInputChange('toLocation', value)}
            onLocationSelected={onToLocationSelected}
            label="To Location"
            placeholder="Enter destination (optional)"
          />
        </div>

        {/* Service Selection */}
        <div className="form-section">
          <h4>🚙 Service Details</h4>
          
          <ServiceSelector onSelectionChanged={onServiceSelection} />
        </div>

        {/* Trip Type */}
        <div className="form-section">
          <h4>⏰ Trip Timing</h4>
          
          <div className="radio-group">
            <label className="radio-option">
              <input 
                type="radio" 
                value="now"
                checked={formData.tripTiming === 'now'}
                onChange={(e) => handleInputChange('tripTiming', e.target.value)}
                name="tripTiming"
              />
              <span className="radio-label">Book Now</span>
            </label>
            
            <label className="radio-option">
              <input 
                type="radio" 
                value="later"
                checked={formData.tripTiming === 'later'}
                onChange={(e) => handleInputChange('tripTiming', e.target.value)}
                name="tripTiming"
              />
              <span className="radio-label">Schedule for Later</span>
            </label>
          </div>

          {/* Schedule Date/Time */}
          {formData.tripTiming === 'later' && (
            <div className="schedule-inputs">
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.scheduleDate}
                    onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                    className="form-input"
                    min={minDate}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input 
                    type="time" 
                    value={formData.scheduleTime}
                    onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Special Requirements */}
        <div className="form-section">
          <h4>📝 Additional Information</h4>
          
          <div className="form-group">
            <label>Special Requirements (Optional)</label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Any special requirements or instructions..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button"
            onClick={handlePreview}
            disabled={!canPreview}
            className="btn btn-secondary"
          >
            👁️ Preview Request
          </button>
          
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '🔄 Submitting...' : '🚗 Submit Request'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>📋 Request Preview</h3>
              <button onClick={closePreview} className="close-btn">×</button>
            </div>
            
            <div className="preview-details">
              <div className="preview-row">
                <span className="label">Customer:</span>
                <span className="value">{guestData?.firstName} {guestData?.lastName}</span>
              </div>
              <div className="preview-row">
                <span className="label">Mobile:</span>
                <span className="value">{guestData?.mobile}</span>
              </div>
              <div className="preview-row">
                <span className="label">From:</span>
                <span className="value">{formData.fromLocation}</span>
              </div>
              {formData.toLocation && (
                <div className="preview-row">
                  <span className="label">To:</span>
                  <span className="value">{formData.toLocation}</span>
                </div>
              )}
              <div className="preview-row">
                <span className="label">Service:</span>
                <span className="value">{getServiceDisplayName()}</span>
              </div>
              <div className="preview-row">
                <span className="label">Timing:</span>
                <span className="value">{getTimingDisplayName()}</span>
              </div>
              {formData.specialRequirements && (
                <div className="preview-row">
                  <span className="label">Requirements:</span>
                  <span className="value">{formData.specialRequirements}</span>
                </div>
              )}
            </div>
            
            <div className="preview-actions">
              <button onClick={closePreview} className="btn btn-secondary">
                ✏️ Edit Details
              </button>
              <button onClick={handleSubmit} className="btn btn-primary">
                🚗 Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <style jsx="true">{`
        .guest-lead-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h3 {
          color: #003B71;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .lead-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section h4 {
          color: #1f2937;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .radio-group {
          display: flex;
          gap: 1rem;
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

        .schedule-inputs {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 150px;
          font-family: inherit;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.3);
        }

        .btn-secondary {
          background: white;
          border: 2px solid #6b7280;
          color: #6b7280;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #6b7280;
          color: white;
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
        }

        .preview-row .value {
          color: #1f2937;
          text-align: right;
          flex: 1;
          margin-left: 1rem;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .guest-lead-form {
            padding: 0.5rem;
          }
          
          .lead-form {
            padding: 1.5rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .radio-group {
            flex-direction: column;
          }
          
          .preview-content {
            margin: 0.5rem;
            padding: 1.5rem;
          }
          
          .preview-row {
            flex-direction: column;
          }
          
          .preview-row .value {
            text-align: left;
            margin-left: 0;
            margin-top: 0.25rem;
          }
          
          .preview-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};