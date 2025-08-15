import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { DashboardLayout } from '../components/DashboardLayout';

interface TripInfo {
  requestId: string;
  fromLocation: string;
  toLocation: string;
  driverName: string;
  date: string;
  status: string;
}

interface ChatMessage {
  id: number;
  type: 'bot' | 'user';
  text: string;
  options?: string[];
  rating?: number;
}

export const RateTrip: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);

  const questions = [
    {
      id: 'overall',
      text: 'How would you rate your overall experience?',
      type: 'rating'
    },
    {
      id: 'driver',
      text: 'How was your driver?',
      options: ['Excellent', 'Good', 'Average', 'Poor']
    },
    {
      id: 'punctuality',
      text: 'Was the driver on time?',
      options: ['Yes, perfectly on time', 'Slightly late but acceptable', 'Very late']
    },
    {
      id: 'vehicle',
      text: 'How was the vehicle condition?',
      options: ['Excellent - very clean', 'Good - clean enough', 'Average - okay', 'Poor - needs improvement']
    },
    {
      id: 'recommend',
      text: 'Would you recommend MyCallDriver to others?',
      options: ['Definitely yes', 'Probably yes', 'Maybe', 'Probably not', 'Definitely not']
    }
  ];

  useEffect(() => {
    loadTripInfo();
    startChat();
  }, [requestId]);

  const loadTripInfo = async () => {
    try {
      // Mock data - replace with actual API call
      setTripInfo({
        requestId: requestId || '',
        fromLocation: 'Kumbakonam',
        toLocation: 'Chennai',
        driverName: 'Raj Kumar',
        date: 'Dec 15, 2024',
        status: 'Completed'
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load trip info:', error);
      setIsLoading(false);
    }
  };

  const startChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: 'Hi! Thanks for choosing MyCallDriver. I\'d love to hear about your recent trip experience. This will only take a minute! 😊'
      }
    ]);
    
    setTimeout(() => {
      askNextQuestion();
    }, 1000);
  };

  const askNextQuestion = () => {
    if (currentStep < questions.length) {
      const question = questions[currentStep];
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        type: 'bot',
        text: question.text,
        ...(question.type === 'rating' ? {} : { options: question.options })
      };
      
      setMessages(prev => [...prev, newMessage]);
    } else {
      // All questions completed
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        text: 'Thank you for your feedback! Your review helps us improve our service. 🙏'
      }]);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const handleResponse = (response: string, rating?: number) => {
    const question = questions[currentStep];
    
    // Add user response
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      type: 'user',
      text: response,
      rating: rating
    }]);

    // Store rating/response
    if (rating) {
      setRatings(prev => ({ ...prev, [question.id]: rating }));
    }

    setCurrentStep(prev => prev + 1);
    
    setTimeout(() => {
      askNextQuestion();
    }, 500);
  };

  const renderStarRating = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className="star-btn"
            onClick={() => handleResponse(`${star} stars`, star)}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="rate-trip loading">
          <div className="loading-spinner">🔄</div>
          <p>Loading trip details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="rate-trip">
        {/* Trip Info Header */}
        <div className="trip-info-header">
          <div className="trip-summary">
            <div className="header-top">
              <h2>🚗 Rate Your Trip</h2>
              <div className="trip-status">
                <span className="status-badge">Completed</span>
              </div>
            </div>
            
            <div className="trip-details">
              <div className="trip-route">
                <div className="route-container">
                  <div className="location-point from">
                    <div className="location-icon">📍</div>
                    <span className="location-text">{tripInfo?.fromLocation}</span>
                  </div>
                  <div className="route-line"></div>
                  <div className="location-point to">
                    <div className="location-icon">🎯</div>
                    <span className="location-text">{tripInfo?.toLocation}</span>
                  </div>
                </div>
              </div>
              
              <div className="trip-meta">
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <span className="meta-text">{tripInfo?.driverName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">{tripInfo?.date}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🏷️</span>
                  <span className="meta-text">#{tripInfo?.requestId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-bubble">
                  {message.type === 'bot' && <div className="bot-avatar">🤖</div>}
                  <div className="message-content">
                    <p>{message.text}</p>
                    {message.rating && (
                      <div className="rating-display">
                        {'⭐'.repeat(message.rating)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Show options for current question */}
                {message.type === 'bot' && 
                 message.id === messages.length && 
                 currentStep < questions.length && (
                  <div className="response-options">
                    {questions[currentStep]?.type === 'rating' ? (
                      renderStarRating()
                    ) : (
                      <div className="option-buttons">
                        {message.options?.map((option, index) => (
                          <button
                            key={index}
                            className="option-btn"
                            onClick={() => handleResponse(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style jsx="true">{`
        .rate-trip {
          max-width: 600px;
          margin: 0 auto;
          padding-bottom: 2rem;
        }



        .rate-trip.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .trip-info-header {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 20px rgba(242, 140, 0, 0.2);
          margin-bottom: 1rem;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .trip-summary h2 {
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .status-badge {
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
        }

        .route-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .location-point {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 120px;
        }

        .location-icon {
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          border: 1px solid rgba(255,255,255,0.3);
          flex-shrink: 0;
        }

        .location-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .route-line {
          width: 30px;
          height: 2px;
          background: rgba(255,255,255,0.4);
          border-radius: 1px;
          position: relative;
        }

        .route-line::after {
          content: '→';
          position: absolute;
          right: -8px;
          top: -8px;
          color: rgba(255,255,255,0.8);
          font-size: 0.8rem;
        }

        .trip-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-icon {
          width: 20px;
          height: 20px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          flex-shrink: 0;
        }

        .meta-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.95);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-container {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 1rem;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message {
          display: flex;
          flex-direction: column;
        }

        .message.bot {
          align-items: flex-start;
        }

        .message.user {
          align-items: flex-end;
        }

        .message-bubble {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          max-width: 80%;
        }

        .bot-avatar {
          font-size: 1.8rem;
          flex-shrink: 0;
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.3);
        }

        .message-content {
          background: #f8f9fa;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid rgba(242, 140, 0, 0.1);
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
          border: none;
          box-shadow: 0 3px 12px rgba(242, 140, 0, 0.3);
        }

        .message-content p {
          margin: 0;
          line-height: 1.4;
        }

        .rating-display {
          margin-top: 0.5rem;
          font-size: 1.2rem;
        }

        .response-options {
          margin-top: 1rem;
          margin-left: 2rem;
        }

        .star-rating {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          padding: 1rem 0;
        }

        .star-btn {
          background: rgba(242, 140, 0, 0.1);
          border: 2px solid rgba(242, 140, 0, 0.3);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 1.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .star-btn:hover {
          transform: scale(1.1);
          background: #F28C00;
          border-color: #F28C00;
          box-shadow: 0 4px 15px rgba(242, 140, 0, 0.4);
        }

        .option-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .option-btn {
          background: white;
          border: 2px solid rgba(242, 140, 0, 0.3);
          color: #F28C00;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .option-btn:hover {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
          border-color: #F28C00;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(242, 140, 0, 0.3);
        }

        @media (max-width: 480px) {
          .trip-info-header {
            padding: 1rem;
          }
          
          .trip-summary h2 {
            font-size: 1.1rem;
          }
          
          .message-bubble {
            max-width: 90%;
          }
          
          .response-options {
            margin-left: 1rem;
          }
          
          .star-rating {
            justify-content: center;
          }
        }
        `}</style>
      </div>
    </DashboardLayout>
  );
};