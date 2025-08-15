import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/apiService';

interface Request {
  request_id: string;
  from_location: string;
  to_location?: string;
  status: string;
  created_at: string;
  service_category?: string;
  service_category_name?: string;
}

export const RecentRequestsCarousel = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);



  // Display top 5 requests with Show All card
  const displayRequests = [...recentRequests.slice(0, 5), { isLoadMore: true }];

  useEffect(() => {
    const loadRecentRequests = async () => {
      try {
        // Get current user info from JWT
        const currentUserResponse = await apiService.getCurrentUser();
        console.log('Current user response:', currentUserResponse);
        
        if (!currentUserResponse.success) {
          throw new Error('Failed to get user info');
        }
        
        const mobile = currentUserResponse.data.mobile;
        console.log('Customer mobile:', mobile);
        
        // Fetch customer leads from API using mobile number
        const leadsResponse = await apiService.getCustomerLeadsByMobile(mobile);
        console.log('Leads response:', leadsResponse);
        
        if (leadsResponse.success) {
          console.log('Leads data:', leadsResponse.data);
          // Map leads to request format
          const mappedRequests = leadsResponse.data.map((lead: any) => ({
            request_id: lead.requestId,
            from_location: lead.fromLocation,
            to_location: lead.toLocation,
            status: lead.status.toLowerCase(),
            created_at: lead.createdAt,
            service_category_name: lead.serviceCategory
          }));
          console.log('Mapped requests:', mappedRequests);
          setRecentRequests(mappedRequests);
        } else {
          console.log('Leads response failed:', leadsResponse);
          setRecentRequests([]);
        }
      } catch (error) {
        console.error('Failed to load recent requests:', error);
        setRecentRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentRequests();
  }, []);

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      completed: '✅',
      pending: '⏳',
      cancelled: '❌',
      in_progress: '🚗',
      assigned: '👤',
      confirmed: '✅'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextSlide = () => {
    if (currentIndex < displayRequests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToHistory = () => {
    navigate('/dashboard/history');
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="recent-requests">
        <h3>Recent Requests</h3>
        <div className="loading-state">
          <div className="loading-spinner">🔄</div>
          <p>Loading recent requests...</p>
        </div>

        <style>{`
          .recent-requests {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
          }

          .recent-requests h3 {
            margin: 0 0 1rem 0;
            color: #003B71;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .loading-state {
            text-align: center;
            padding: 2rem;
            color: #666;
          }

          .loading-spinner {
            font-size: 1.5rem;
            animation: spin 1s linear infinite;
            margin-bottom: 0.5rem;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (recentRequests.length === 0) {
    return (
      <div className="recent-requests">
        <h3>Recent Requests</h3>
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No recent requests found</p>
        </div>

        <style>{`
          .recent-requests {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
          }

          .recent-requests h3 {
            margin: 0 0 1rem 0;
            color: #003B71;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .empty-state {
            text-align: center;
            padding: 2rem;
            color: #666;
          }

          .empty-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="recent-requests">
      <h3>Recent Requests</h3>
      
      <div className="carousel-container">
        <div className="carousel-wrapper">
          <div 
            className="carousel-track" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {displayRequests.map((request: any, index) => (
              <div key={request.request_id || 'load-more'} className="carousel-slide">
                {request.isLoadMore ? (
                  <div className="load-more-card" onClick={goToHistory}>
                    <div className="load-more-icon">📝</div>
                    <div className="load-more-text">Load More</div>
                    <div className="load-more-subtitle">View all requests</div>
                  </div>
                ) : (
                  <div className="request-card">
                    <div className="request-row">
                      <span className="label">Request ID:</span>
                      <span className="value">#{request.request_id}</span>
                    </div>
                    
                    <div className="request-row">
                      <span className="label">Request Date:</span>
                      <span className="value">{formatDate(request.created_at)}</span>
                    </div>
                    
                    <div className="request-row">
                      <span className="label">From:</span>
                      <span className="value">
                        {(() => {
                          const parts = request.from_location?.split(',').map(p => p.trim()) || [];
                          return parts.find(p => p.match(/kumbakonam|chennai|bangalore|mumbai|delhi|hyderabad|pune|kolkata|coimbatore|madurai|salem|trichy/i)) || parts[parts.length - 3] || parts[0] || request.from_location;
                        })()}
                      </span>
                    </div>
                    
                    <div className="request-row">
                      <span className="label">To:</span>
                      <span className="value">
                        {request.to_location ? (() => {
                          const parts = request.to_location?.split(',').map(p => p.trim()) || [];
                          return parts.find(p => p.match(/kumbakonam|chennai|bangalore|mumbai|delhi|hyderabad|pune|kolkata|coimbatore|madurai|salem|trichy/i)) || parts[parts.length - 3] || parts[0] || request.to_location;
                        })() : 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="request-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => navigate(`/booking-status/${request.request_id}`)}
                      >
                        View
                      </button>
                      <button 
                        className="action-btn rate-btn"
                        onClick={() => navigate(`/rate-trip/${request.request_id}`)}
                      >
                        Rate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="carousel-controls">
          <button 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="carousel-btn prev-btn"
          >
            ‹
          </button>
          
          <div className="carousel-indicators">
            {displayRequests.map((_, index) => (
              <span 
                key={index}
                onClick={() => goToSlide(index)}
                className={`indicator ${currentIndex === index ? 'active' : ''}`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextSlide}
            disabled={currentIndex === displayRequests.length - 1}
            className="carousel-btn next-btn"
          >
            ›
          </button>
        </div>
      </div>

      <style>{`
        .recent-requests {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
          border: none;
        }

        .recent-requests h3 {
          margin: 0 0 1rem 0;
          color: #F28C00;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recent-requests h3::before {
          content: '📋';
          font-size: 1.2rem;
        }

        .carousel-container {
          position: relative;
        }

        .carousel-wrapper {
          overflow: hidden;
          border-radius: 8px;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.3s ease;
        }

        .carousel-slide {
          min-width: 100%;
          flex-shrink: 0;
        }

        .request-card {
          background: white;
          border-radius: 10px;
          padding: 1rem;
          border-left: 4px solid #F28C00;
          border-right: 4px solid #F28C00;
          box-shadow: 0 2px 12px rgba(242, 140, 0, 0.1);
          transition: all 0.2s ease;
        }

        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(242, 140, 0, 0.15);
        }

        .request-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 600;
        }

        .value {
          font-size: 0.8rem;
          color: #333;
          font-weight: 500;
          text-align: right;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn {
          background: rgba(242, 140, 0, 0.1);
          color: #F28C00;
        }

        .view-btn:hover {
          background: #F28C00;
          color: white;
        }

        .rate-btn {
          background: rgba(242, 140, 0, 0.1);
          color: #F28C00;
        }

        .rate-btn:hover {
          background: #F28C00;
          color: white;
        }

        .load-more-card {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
          border-radius: 8px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .load-more-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(242, 140, 0, 0.3);
        }

        .load-more-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .load-more-text {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .load-more-subtitle {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .carousel-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding: 0 0.5rem;
        }

        .carousel-btn {
          background: #F28C00;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          font-family: inherit;
          box-shadow: 0 2px 4px rgba(242, 140, 0, 0.2);
        }

        .carousel-btn:hover:not(:disabled) {
          background: #e6741d;
          transform: scale(1.05);
        }

        .carousel-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .carousel-indicators {
          display: flex;
          gap: 0.5rem;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator.active {
          background: #F28C00;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};