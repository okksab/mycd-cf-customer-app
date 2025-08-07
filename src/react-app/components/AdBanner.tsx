import React, { useState, useEffect } from 'react';

export const AdBanner: React.FC = () => {
  const [adDimensions, setAdDimensions] = useState('320x100');

  useEffect(() => {
    const updateDimensions = () => {
      setAdDimensions(window.innerWidth >= 768 ? '728x90' : '320x100');
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="ad-banner">
      <div className="ad-placeholder">
        <div className="ad-text">Advertisement</div>
        <div className="ad-dimensions">{adDimensions}</div>
      </div>

      <style jsx="true">{`
        .ad-banner {
          width: 100%;
          margin: 1rem 0;
          display: flex;
          justify-content: center;
        }

        .ad-placeholder {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          font-weight: 500;
          width: 320px;
          height: 100px;
        }

        .ad-text {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .ad-dimensions {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        @media (min-width: 768px) {
          .ad-placeholder {
            width: 728px;
            height: 90px;
          }
        }
      `}</style>
    </div>
  );
};