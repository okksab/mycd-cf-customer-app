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
    
    // Store booking data in sessionStorage and navigate to preview page
    const bookingData = {
      ...formData,
      selectedTiming
    };
    sessionStorage.setItem('bookingPreviewData', JSON.stringify(bookingData));
    window.location.href = '/booking-preview';
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



        @media (max-width: 480px) {
          .timing-options {
            flex-direction: column;
            gap: 1rem;
          }
          
          .form-section {
            padding: 1rem;
          }
          

        }
      `}</style>
    </div>
  );
};