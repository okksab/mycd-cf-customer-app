import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  level: number;
  subcategories?: ServiceCategory[];
  sub_subcategories?: ServiceCategory[];
}

interface ServiceSelectorProps {
  onSelectionChange: (selection: {
    category: number | null;
    subcategory: number | null;
    duration: number | null;
    categoryName: string;
    subcategoryName: string;
    durationName: string;
  }) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onSelectionChange }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];
  const selectedSubcategoryData = subcategories.find(s => s.id === selectedSubcategory);
  const durations = selectedSubcategoryData?.sub_subcategories || [];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getServiceCategories();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      } else {
        throw new Error('Failed to load service categories');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const id = categoryId ? parseInt(categoryId) : null;
    setSelectedCategory(id);
    setSelectedSubcategory(null);
    setSelectedDuration(null);
    emitSelection(id, null, null);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    const id = subcategoryId ? parseInt(subcategoryId) : null;
    setSelectedSubcategory(id);
    setSelectedDuration(null);
    emitSelection(selectedCategory, id, null);
  };

  const handleDurationChange = (durationId: string) => {
    const id = durationId ? parseInt(durationId) : null;
    setSelectedDuration(id);
    emitSelection(selectedCategory, selectedSubcategory, id);
  };

  const emitSelection = (categoryId: number | null, subcategoryId: number | null, durationId: number | null) => {
    const categoryData = categories.find(c => c.id === categoryId);
    const subcategoryData = categoryData?.subcategories?.find(s => s.id === subcategoryId);
    const durationData = subcategoryData?.sub_subcategories?.find(d => d.id === durationId);

    onSelectionChange({
      category: categoryId,
      subcategory: subcategoryId,
      duration: durationId,
      categoryName: categoryData?.name || '',
      subcategoryName: subcategoryData?.name || '',
      durationName: durationData?.name || ''
    });
  };

  if (isLoading) {
    return (
      <div className="service-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading service categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-selector error">
        <p>Error: {error}</p>
        <button onClick={loadCategories} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="service-selector">
      <div className="form-group">
        <label className="form-label">🚗 Service Category</label>
        <select 
          value={selectedCategory || ''} 
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="form-select"
        >
          <option value="">Select Service Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div className="form-group">
          <label className="form-label">📋 Service Type</label>
          <select 
            value={selectedSubcategory || ''} 
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select Service Type</option>
            {subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {durations.length > 0 && (
        <div className="form-group">
          <label className="form-label">⏰ Duration</label>
          <select 
            value={selectedDuration || ''} 
            onChange={(e) => handleDurationChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select Duration</option>
            {durations.map(duration => (
              <option key={duration.id} value={duration.id}>
                {duration.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <style jsx="true">{`
        .service-selector {
          margin-bottom: 1.5rem;
        }

        .service-selector.loading,
        .service-selector.error {
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

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          background-color: white;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-select:focus {
          outline: none;
          border-color: #F28C00;
          box-shadow: 0 0 0 3px rgba(242, 140, 0, 0.1);
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
      `}</style>
    </div>
  );
};