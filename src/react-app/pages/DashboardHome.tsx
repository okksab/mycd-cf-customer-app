import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AdBanner } from '../components/AdBanner';
import { RecentRequestsCarousel } from '../components/RecentRequestsCarousel';

export const DashboardHome: React.FC = () => {
  const { user } = useAuthStore();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-home">
      {/* Advertisement Banner */}
      <AdBanner />

      {/* Hero CTA Section */}
      <div className="hero-cta-section">
        <div className="hero-cta-card">
          <div className="cta-content">
            <div className="cta-header">
              <h3>🚗 Need a Professional Driver?</h3>
              <p>Book instantly for any occasion - weddings, events, or daily commute</p>
            </div>
            <Link to="/dashboard/book" className="hero-cta-button">
              <span className="cta-icon">🚗</span>
              <span className="cta-text">Book Your Driver Now</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>
          <div className="cta-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-dots"></div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-container">
          {!mapLoaded ? (
            <div className="map-placeholder">
              <div className="loading-spinner">🔄</div>
              <p>Loading map...</p>
            </div>
          ) : (
            <div className="osm-map">
              <div className="map-content">
                <p>🗺️ Interactive map would be displayed here</p>
                <p>Showing nearby drivers and your location</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests Carousel */}
      <RecentRequestsCarousel />

      <style jsx="true">{`
        .dashboard-home {
          max-width: 800px;
          margin: 0 auto;
          min-height: 100%;
          padding-bottom: 2rem;
        }



        .hero-cta-section {
          margin-bottom: 2rem;
        }

        .hero-cta-card {
          background: linear-gradient(135deg, #003B71 0%, #004080 100%);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 59, 113, 0.3);
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .cta-header h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .cta-header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.4;
        }

        .hero-cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #F28C00 0%, #ff9500 100%);
          color: white;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(242, 140, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .hero-cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(242, 140, 0, 0.5);
          background: linear-gradient(135deg, #ff9500 0%, #ffaa00 100%);
        }

        .cta-icon {
          font-size: 1.3rem;
        }

        .cta-text {
          flex: 1;
        }

        .cta-arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .hero-cta-button:hover .cta-arrow {
          transform: translateX(4px);
        }

        .cta-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .decoration-circle {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: rgba(242, 140, 0, 0.1);
          border-radius: 50%;
        }

        .decoration-dots {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 15px 15px;
        }

        .map-section {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .map-container {
          height: 300px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 1rem;
          z-index: 1;
        }

        .osm-map {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
        }

        .map-content {
          text-align: center;
          color: #0277bd;
        }

        .map-placeholder {
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }



        @media (max-width: 480px) {
          .hero-cta-card {
            padding: 1.5rem;
            margin: 0 0.5rem;
          }
          
          .cta-header h3 {
            font-size: 1.3rem;
          }
          
          .cta-header p {
            font-size: 0.9rem;
          }
          
          .hero-cta-button {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            gap: 0.5rem;
          }
          
          .cta-icon {
            font-size: 1.2rem;
          }
          
          .decoration-circle {
            width: 100px;
            height: 100px;
            top: -30px;
            right: -30px;
          }
          
          .decoration-dots {
            width: 40px;
            height: 40px;
            background-size: 12px 12px;
          }
          
          .map-container {
            height: 250px;
          }
          

        }
      `}</style>
    </div>
  );
};