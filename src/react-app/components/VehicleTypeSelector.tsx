import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface VehicleTypeSelectorProps {
  onSelectionChange: (vehicleType: string) => void;
  selectedVehicleType?: string;
}

export const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({ 
  onSelectionChange, 
  selectedVehicleType 
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getVehicleTypes();
      if (response.success && response.data) {
        setVehicleTypes(response.data);
      } else {
        throw new Error('Failed to load vehicle types');
      }
    } catch (error) {
      console.error('Failed to load vehicle types:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vehicle types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleTypeSelect = (vehicleTypeId: string) => {
    onSelectionChange(vehicleTypeId);
  };

  if (isLoading) {
    return (
      <div className="vehicle-type-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading vehicle types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-type-selector error">
        <p>Error: {error}</p>
        <button onClick={loadVehicleTypes} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-type-selector">
      <div className="vehicle-types-grid">
        {vehicleTypes.map(vehicleType => (
          <div
            key={vehicleType.id}
            className={`vehicle-type-card ${selectedVehicleType === vehicleType.id ? 'selected' : ''}`}
            onClick={() => handleVehicleTypeSelect(vehicleType.id)}
          >
            <div className="vehicle-icon">{vehicleType.icon}</div>
            <h4 className="vehicle-name">{vehicleType.name}</h4>
            <p className="vehicle-description">{vehicleType.description}</p>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .vehicle-type-selector {
          margin-bottom: 1.5rem;
        }

        .vehicle-type-selector.loading,
        .vehicle-type-selector.error {
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #F28C00;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .vehicle-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .vehicle-type-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .vehicle-type-card:hover {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.15);
        }

        .vehicle-type-card.selected {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.1);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.2);
        }

        .vehicle-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .vehicle-name {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .vehicle-description {
          margin: 0;
          font-size: 0.8rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .retry-btn {
          background: #F28C00;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1rem;
        }

        .retry-btn:hover {
          background: #e6741d;
        }

        .error {
          color: #dc2626;
        }

        @media (max-width: 480px) {
          .vehicle-types-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .vehicle-type-card {
            padding: 0.75rem;
          }
          
          .vehicle-icon {
            font-size: 2rem;
          }
          
          .vehicle-name {
            font-size: 0.9rem;
          }
          
          .vehicle-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};