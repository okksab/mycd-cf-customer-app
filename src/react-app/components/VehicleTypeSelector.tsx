import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
  sort_order?: number;
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
  const [showAll, setShowAll] = useState(false);
  const [displayedTypes, setDisplayedTypes] = useState<VehicleType[]>([]);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  useEffect(() => {
    if (vehicleTypes.length > 0) {
      const sortedTypes = [...vehicleTypes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setDisplayedTypes(showAll ? sortedTypes : sortedTypes.slice(0, 5));
    }
  }, [vehicleTypes, showAll]);

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
      <div className={`vehicle-types-container ${showAll ? 'scrollable' : ''}`}>
        <div className="vehicle-types-list">
          {displayedTypes.map(vehicleType => (
            <div
              key={vehicleType.id}
              className={`vehicle-type-row ${selectedVehicleType === vehicleType.id ? 'selected' : ''}`}
              onClick={() => handleVehicleTypeSelect(vehicleType.id)}
            >
              <div className="vehicle-icon">{vehicleType.icon}</div>
              <div className="vehicle-info">
                <h4 className="vehicle-name">{vehicleType.name}</h4>
                <p className="vehicle-description">{vehicleType.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {!showAll && vehicleTypes.length > 5 && (
          <button 
            className="load-more-btn" 
            onClick={() => setShowAll(true)}
          >
            Load More ({vehicleTypes.length - 5} more)
          </button>
        )}
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

        .vehicle-types-container {
          position: relative;
        }

        .vehicle-types-container.scrollable {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .vehicle-types-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .vehicle-type-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .vehicle-type-row:hover {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.05);
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.15);
        }

        .vehicle-type-row.selected {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.1);
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .vehicle-info {
          flex: 1;
        }

        .vehicle-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .vehicle-name {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .vehicle-description {
          margin: 0;
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .load-more-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .load-more-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
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
          .vehicle-type-row {
            padding: 0.75rem;
            gap: 0.75rem;
          }
          
          .vehicle-icon {
            font-size: 1.5rem;
          }
          
          .vehicle-name {
            font-size: 0.9rem;
          }
          
          .vehicle-description {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};