import { useState, useEffect } from 'react';

interface ServiceSelection {
  category: string;
  subcategory: string;
  duration: string;
  categoryName: string;
  subcategoryName: string;
  durationName: string;
}

interface ServiceSelectorProps {
  onSelectionChanged: (selection: ServiceSelection) => void;
}

export const ServiceSelector = ({ onSelectionChanged }: ServiceSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  // Mock service categories data
  const categories = [
    {
      id: 'wedding',
      name: 'Wedding Events',
      subcategories: [
        {
          id: 'bride_groom',
          name: 'Bride/Groom Transport',
          sub_subcategories: [
            { id: '2_hours', name: '2 Hours' },
            { id: '4_hours', name: '4 Hours' },
            { id: 'full_day', name: 'Full Day' }
          ]
        },
        {
          id: 'guest_transport',
          name: 'Guest Transport',
          sub_subcategories: [
            { id: '4_hours', name: '4 Hours' },
            { id: '8_hours', name: '8 Hours' }
          ]
        }
      ]
    },
    {
      id: 'airport',
      name: 'Airport Transfer',
      subcategories: [
        {
          id: 'pickup',
          name: 'Airport Pickup',
          sub_subcategories: [
            { id: 'one_way', name: 'One Way' },
            { id: 'round_trip', name: 'Round Trip' }
          ]
        },
        {
          id: 'drop',
          name: 'Airport Drop',
          sub_subcategories: [
            { id: 'one_way', name: 'One Way' },
            { id: 'round_trip', name: 'Round Trip' }
          ]
        }
      ]
    },
    {
      id: 'daily',
      name: 'Daily Commute',
      subcategories: [
        {
          id: 'office',
          name: 'Office Commute',
          sub_subcategories: [
            { id: 'monthly', name: 'Monthly Package' },
            { id: 'weekly', name: 'Weekly Package' }
          ]
        }
      ]
    },
    {
      id: 'event',
      name: 'Events & Functions',
      subcategories: [
        {
          id: 'corporate',
          name: 'Corporate Events',
          sub_subcategories: [
            { id: '4_hours', name: '4 Hours' },
            { id: '8_hours', name: '8 Hours' }
          ]
        },
        {
          id: 'personal',
          name: 'Personal Events',
          sub_subcategories: [
            { id: '2_hours', name: '2 Hours' },
            { id: '4_hours', name: '4 Hours' }
          ]
        }
      ]
    }
  ];

  const subcategories = categories.find(c => c.id === selectedCategory)?.subcategories || [];
  const durations = subcategories.find(s => s.id === selectedSubcategory)?.sub_subcategories || [];

  const emitSelection = () => {
    const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
    const selectedSubcategoryObj = subcategories.find(s => s.id === selectedSubcategory);
    const selectedDurationObj = durations.find(d => d.id === selectedDuration);
    
    onSelectionChanged({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      duration: selectedDuration,
      categoryName: selectedCategoryObj?.name || '',
      subcategoryName: selectedSubcategoryObj?.name || '',
      durationName: selectedDurationObj?.name || ''
    });
  };

  const onCategoryChange = (e: any) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
    setSelectedDuration('');
  };

  const onSubcategoryChange = (e: any) => {
    setSelectedSubcategory(e.target.value);
    setSelectedDuration('');
  };

  const onDurationChange = (e: any) => {
    setSelectedDuration(e.target.value);
  };

  useEffect(() => {
    emitSelection();
  }, [selectedCategory, selectedSubcategory, selectedDuration]);

  return (
    <div className="service-selector">
      <div className="form-group">
        <label className="form-label">🚗 Service Category</label>
        <select 
          value={selectedCategory} 
          onChange={onCategoryChange} 
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
            value={selectedSubcategory} 
            onChange={onSubcategoryChange} 
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
            value={selectedDuration} 
            onChange={onDurationChange} 
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

      <style>{`
        .service-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-select {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
          background: white;
        }

        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};