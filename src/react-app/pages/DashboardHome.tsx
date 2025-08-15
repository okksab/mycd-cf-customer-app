import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AdBanner } from '../components/AdBanner';
import { RecentRequestsCarousel } from '../components/RecentRequestsCarousel';

export const DashboardHome: React.FC = () => {
  const { user } = useAuthStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [walletBalance, setWalletBalance] = useState(1250.50);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const userActivityRef = useRef<NodeJS.Timeout | null>(null);
  const slides = [
    { id: 'book', title: '🚗 Need a Professional Driver?', subtitle: 'Book instantly for any occasion - weddings, events, or daily commute' },
    { id: 'share', title: '🤝 Share Us with Your Friends', subtitle: 'Help your friends discover MyCallDriver.com' },
    { id: 'wallet', title: '💳 Your Wallet Balance', subtitle: `₹${walletBalance.toFixed(2)} available for bookings` }
  ];

  useEffect(() => {
    const startAutoSlide = () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
      if (isAutoSliding) {
        autoSlideRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 2000);
      }
    };

    startAutoSlide();
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [slides.length, isAutoSliding]);

  const handleUserInteraction = () => {
    setIsAutoSliding(false);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    if (userActivityRef.current) clearTimeout(userActivityRef.current);
    
    userActivityRef.current = setTimeout(() => {
      setIsAutoSliding(true);
    }, 5000);
  };

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          loadMap(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Location access denied. Using default location.');
          // Default to Bangalore coordinates
          const defaultLat = 12.9716;
          const defaultLng = 77.5946;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          loadMap(defaultLat, defaultLng);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationError('Geolocation not supported');
      // Default to Bangalore coordinates
      const defaultLat = 12.9716;
      const defaultLng = 77.5946;
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      loadMap(defaultLat, defaultLng);
    }
  }, []);

  const loadMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    // Create map container
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Create Leaflet map
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Initialize map
      const L = (window as any).L;
      const map = L.map(mapContainer).setView([lat, lng], 15);

      // Add OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add user location marker
      const userIcon = L.divIcon({
        html: '<div style="background: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        className: 'user-location-marker'
      });

      L.marker([lat, lng], { icon: userIcon })
        .addTo(map);

      // Add accuracy circle
      L.circle([lat, lng], {
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.1,
        radius: 100
      }).addTo(map);

      setMapLoaded(true);
    };
    document.head.appendChild(script);
  };

  return (
    <div className="dashboard-home">
      {/* Advertisement Banner */}
      <AdBanner />

      {/* Hero CTA Section - Slideshow */}
      <div className="hero-cta-section">
        <div className="hero-cta-card">
          <div className="cta-content">
            <div className="cta-header">
              <h3>{slides[currentSlide].title}</h3>
              <p>{slides[currentSlide].subtitle}</p>
            </div>
            
            {/* Slide 1: Book Driver */}
            {currentSlide === 0 && (
              <Link to="/dashboard/book" className="hero-cta-button">
                <span className="cta-icon">🚗</span>
                <span className="cta-text">Book Your Driver Now</span>
                <span className="cta-arrow">→</span>
              </Link>
            )}
            
            {/* Slide 2: Share with Friends */}
            {currentSlide === 1 && (
              <div className="share-section">
                <div className="share-content">
                  <div className="share-buttons">
                    <button 
                      className="share-btn whatsapp"
                      onClick={() => {
                        const message = "Hey! I found this amazing driver booking service. Try MyCallDriver.com - it's really convenient! Check it out: https://customer.mycalldriver.com";
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <div className="share-icon-wrapper">
                        <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                        </svg>
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    <button 
                      className="share-btn facebook"
                      onClick={() => {
                        const url = "https://customer.mycalldriver.com";
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                      }}
                    >
                      <div className="share-icon-wrapper">
                        <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span>Facebook</span>
                    </button>
                    <button 
                      className="share-btn twitter"
                      onClick={() => {
                        const message = "Just discovered MyCallDriver.com - great for booking professional drivers! Check it out:";
                        const url = "https://customer.mycalldriver.com";
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                    >
                      <div className="share-icon-wrapper">
                        <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </div>
                      <span>Twitter</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Slide 3: Wallet Balance */}
            {currentSlide === 2 && (
              <div className="wallet-section">
                <div className="wallet-display">
                  <div className="balance-amount">₹{walletBalance.toFixed(2)}</div>
                  <div className="balance-actions">
                    <Link to="/dashboard/wallet" className="wallet-btn primary">
                      <span className="wallet-icon">💰</span>
                      <span>Add Money</span>
                    </Link>
                    <Link to="/dashboard/wallet" className="wallet-btn secondary">
                      <span className="wallet-icon">📊</span>
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Controls */}
          <div className="slide-controls">
            <button 
              onClick={() => {
                handleUserInteraction();
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
              }}
              className="slide-nav-btn prev-btn"
            >
              ‹
            </button>
            

            
            <button 
              onClick={() => {
                handleUserInteraction();
                setCurrentSlide((prev) => (prev + 1) % slides.length);
              }}
              className="slide-nav-btn next-btn"
            >
              ›
            </button>
          </div>
          
          <div className="cta-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-dots"></div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <h3>Your Location</h3>
        <div className="map-container">
          {!mapLoaded ? (
            <div className="map-placeholder">
              <div className="loading-spinner">🔄</div>
              <p>Loading map...</p>
              {locationError && <p className="location-error">{locationError}</p>}
            </div>
          ) : null}
          <div 
            ref={mapRef} 
            className="osm-map" 
            style={{ display: mapLoaded ? 'block' : 'none' }}
          ></div>
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
          margin: 1rem 0;
        }

        .hero-cta-card {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: none;
          height: 280px;
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        .cta-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cta-header {
          text-align: center;
          flex-shrink: 0;
        }

        .cta-header h3 {
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .cta-header p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
          font-weight: 400;
        }

        .hero-cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .hero-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.25);
        }

        .hero-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .hero-cta-button:hover::before {
          left: 100%;
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

        .share-section {
          display: flex;
          justify-content: center;
          flex: 1;
          align-items: center;
        }

        .share-content {
          text-align: center;
          width: 100%;
        }



        .share-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          align-items: flex-start;
        }

        .share-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 70px;
          height: 80px;
          font-weight: 500;
          font-size: 0.75rem;
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .share-icon-wrapper {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .share-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .share-btn:hover .share-icon-wrapper {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .share-btn.whatsapp:hover {
          background: rgba(37, 211, 102, 0.25);
          border-color: rgba(37, 211, 102, 0.5);
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
        }

        .share-btn.facebook:hover {
          background: rgba(24, 119, 242, 0.25);
          border-color: rgba(24, 119, 242, 0.5);
          box-shadow: 0 4px 15px rgba(24, 119, 242, 0.2);
        }

        .share-btn.twitter:hover {
          background: rgba(29, 161, 242, 0.25);
          border-color: rgba(29, 161, 242, 0.5);
          box-shadow: 0 4px 15px rgba(29, 161, 242, 0.2);
        }

        .share-icon {
          width: 16px;
          height: 16px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
          flex-shrink: 0;
        }

        .wallet-section {
          display: flex;
          justify-content: center;
          flex: 1;
          align-items: center;
        }

        .wallet-display {
          text-align: center;
        }

        .balance-amount {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: -0.01em;
        }



        .balance-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .wallet-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .wallet-btn.primary {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .wallet-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .wallet-btn:hover {
          transform: translateY(-2px);
        }

        .wallet-btn.primary:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.25);
        }

        .wallet-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .wallet-icon {
          font-size: 1.1rem;
        }

        .slide-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 1rem;
          z-index: 3;
          pointer-events: none;
        }

        .slide-nav-btn {
          background: rgba(0, 0, 0, 0.4);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.3rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          flex-shrink: 0;
          pointer-events: all;
        }

        .slide-nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
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
          top: -60px;
          right: -60px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .decoration-dots {
          position: absolute;
          bottom: 30px;
          right: 30px;
          width: 80px;
          height: 80px;
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 12px 12px;
          opacity: 0.6;
        }

        .map-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: none;
        }

        .map-container {
          height: 250px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .osm-map {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          position: relative;
          z-index: 1;
        }

        .map-section h3 {
          color: #F28C00;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .map-section h3::before {
          content: '🗺️';
          font-size: 1.2rem;
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

        .location-error {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }



        @media (max-width: 480px) {
          .hero-cta-card {
            padding: 1rem;
            margin: 0 0.5rem;
            height: 260px;
          }
          
          .cta-header h3 {
            font-size: 1.1rem;
          }
          
          .cta-header p {
            font-size: 0.8rem;
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
          
          .share-buttons {
            gap: 0.75rem;
          }
          
          .share-btn {
            padding: 0.75rem;
            min-width: 70px;
          }
          
          .balance-amount {
            font-size: 1.6rem;
          }
          
          .balance-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .slide-controls {
            padding: 0 0.5rem;
          }
          
          .slide-nav-btn {
            width: 32px;
            height: 32px;
            font-size: 1.2rem;
          }
          
          .wallet-btn {
            padding: 0.5rem 1rem;
          }
          
          .map-container {
            height: 250px;
          }
          

        }
      `}</style>
    </div>
  );
};