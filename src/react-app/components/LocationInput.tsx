import React, { useState, useRef, useEffect } from 'react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelected?: (location: { address: string; lat?: number; lng?: number }) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  showGPS?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onLocationSelected,
  label,
  placeholder = 'Enter location',
  required = false,
  showGPS = true
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock recent locations
  const recentLocations = [
    { address: 'MG Road, Bangalore', lat: 12.9716, lng: 77.5946 },
    { address: 'Koramangala, Bangalore', lat: 12.9279, lng: 77.6271 },
    { address: 'Electronic City, Bangalore', lat: 12.8456, lng: 77.6603 }
  ];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setError('');
  };

  const selectLocation = (location: { address: string; lat?: number; lng?: number }) => {
    onChange(location.address);
    onLocationSelected?.(location);
    setShowSuggestions(false);
  };

  const detectLocation = async () => {
    if (isDetecting) return;
    
    setIsDetecting(true);
    setError('');
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Mock reverse geocoding
      const mockAddress = 'Current Location, Bangalore';
      const location = {
        address: mockAddress,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      onChange(mockAddress);
      onLocationSelected?.(location);
    } catch (err) {
      setError('Unable to detect location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const hideSuggestions = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="location-input">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      
      <div className="input-container">
        <input
          ref={inputRef}
          value={value}
          onChange={handleInput}
          onFocus={() => setShowSuggestions(true)}
          onBlur={hideSuggestions}
          type="text"
          className="form-input"
          placeholder={placeholder}
        />
        
        {showGPS && (
          <button
            onClick={detectLocation}
            disabled={isDetecting}
            className="gps-button"
            type="button"
          >
            {isDetecting ? '🔄' : '📍'}
          </button>
        )}
      </div>

      {/* Location Suggestions */}
      {showSuggestions && recentLocations.length > 0 && (
        <div className="suggestions-dropdown">
          <div className="suggestion-group">
            <div className="suggestion-header">🕒 Recent Locations</div>
            {recentLocations.map((location, index) => (
              <div
                key={index}
                onClick={() => selectLocation(location)}
                className="suggestion-item"
              >
                <div className="suggestion-address">{location.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <style jsx="true">{`
        .location-input {
          position: relative;
          margin-bottom: 1rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          flex: 1;
          padding-right: 3rem;
        }

        .gps-button {
          position: absolute;
          right: 0.5rem;
          background: none;
          border: none;
          color: #F58220;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
          font-size: 1.2rem;
        }

        .gps-button:hover:not(:disabled) {
          background-color: rgba(245, 130, 32, 0.1);
        }

        .gps-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e6e6e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }

        .suggestion-group {
          padding: 0.5rem 0;
        }

        .suggestion-header {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
          background-color: #f8f9fa;
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .suggestion-item:hover {
          background-color: #f8f9fa;
        }

        .suggestion-address {
          font-size: 0.9rem;
          color: #666;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .text-danger {
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .suggestions-dropdown {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};