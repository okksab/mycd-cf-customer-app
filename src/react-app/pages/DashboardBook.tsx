import React, { useState } from 'react';
import { ServiceSelector } from '../components/ServiceSelector';

export const DashboardBook: React.FC = () => {
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    serviceType: '',
    serviceCategory: '',
    tripType: 'LOCAL',
    scheduledTime: '',
    specialRequirements: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Booking request submitted successfully!');
    }, 2000);
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

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Location Section */}
        <div className="form-section">
          <h3>📍 Trip Details</h3>
          
          <div className="form-group">
            <label>From Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter pickup location"
              value={formData.fromLocation}
              onChange={(e) => handleInputChange('fromLocation', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>To Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter destination (optional for hourly)"
              value={formData.toLocation}
              onChange={(e) => handleInputChange('toLocation', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Trip Type</label>
            <select
              className="form-input"
              value={formData.tripType}
              onChange={(e) => handleInputChange('tripType', e.target.value)}
              required
            >
              <option value="LOCAL">Local</option>
              <option value="OUTSTATION">Outstation</option>
              <option value="DROP">Drop</option>
              <option value="ROUNDTRIP">Round Trip</option>
              <option value="HOURLY">Hourly</option>
            </select>
          </div>
        </div>

        {/* Service Category Section */}
        <div className="form-section">
          <h3>🚙 Service Selection</h3>
          
          <ServiceSelector 
            onSelectionChange={(selection) => {
              handleInputChange('serviceCategory', selection.categoryName);
              handleInputChange('serviceType', selection.subcategoryName);
            }}
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
                defaultChecked
              />
              <span className="radio-label">Book Now</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="timing"
                value="scheduled"
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
          <h3>📝 Special Requirements</h3>
          
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
          disabled={isLoading || !formData.fromLocation || !formData.serviceType}
          className="btn btn-primary submit-btn"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              🚗 Submit Booking Request
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