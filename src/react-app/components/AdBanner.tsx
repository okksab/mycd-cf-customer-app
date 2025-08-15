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
    <div className="ad-section">
      <div className="ad-banner">
        <div className="ad-placeholder">
          <div className="ad-text">Advertisement</div>
          <div className="ad-dimensions">{adDimensions}</div>
        </div>
      </div>

      <style jsx="true">{`
        .ad-section {
          margin-bottom: 1rem;
        }

        .ad-banner {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: none;
          text-align: center;
        }

        .ad-placeholder {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #F28C00;
          font-weight: 600;
          width: 320px;
          height: 100px;
          position: relative;
        }

        .ad-placeholder::before {
          content: '📺';
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .ad-text {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .ad-dimensions {
          font-size: 0.7rem;
          opacity: 0.6;
          color: #6c757d;
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