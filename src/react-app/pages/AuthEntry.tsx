import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGuestStore } from '../stores/guestStore';
import { GuestFlow } from '../components/GuestFlow';

export const AuthEntry: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, features, error, clearError, initAuth } = useAuthStore();
  const { isSessionActive } = useGuestStore();
  
  const [currentView, setCurrentView] = useState<'selection' | 'guest' | 'register-mobile' | 'login'>('selection');
  const [activeTab, setActiveTab] = useState<'guest' | 'account'>('guest');

  useEffect(() => {
    initAuth();
    if (isAuthenticated) {
      navigate('/dashboard/home');
    }
  }, [isAuthenticated, initAuth, navigate]);

  const selectFlow = (flow: string) => {
    setCurrentView(flow as any);
  };

  const goBack = () => {
    setCurrentView('selection');
    clearError();
  };

  const onGuestComplete = () => {
    // Guest completed lead submission
    console.log('Guest flow completed');
  };

  if (currentView === 'guest') {
    return <GuestFlow onBack={goBack} onComplete={onGuestComplete} />;
  }

  return (
    <div className="auth-entry">

      
      {/* User Type Selection */}
      {currentView === 'selection' && (
        <div className="selection-screen">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="logo-container">
              <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              onClick={() => setActiveTab('guest')}
              className={`tab-btn ${activeTab === 'guest' ? 'active' : ''}`}
            >
              Guest Mode
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            >
              Account Login
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Guest Mode Tab */}
            {activeTab === 'guest' && (
              <div className="tab-panel guest-panel">
                <div className="panel-header">
                  <h3>Quick Booking</h3>
                  <p>Book a driver instantly without creating an account</p>
                </div>
                
                {features.guestMode && (
                  <button className="primary-btn guest-btn" onClick={() => selectFlow('guest')}>
                    <div className="btn-icon">🚗</div>
                    <span>Continue as Guest</span>
                  </button>
                )}
                
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>One-time booking</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Mobile verification</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Instant service</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Login Tab */}
            {activeTab === 'account' && (
              <div className="tab-panel account-panel">
                <div className="panel-header">
                  <h3>Create Account or Sign In</h3>
                  <p>Get full access to all features and track your bookings</p>
                </div>

                {/* Registration Options */}
                <div className="auth-options">
                  {features.mobileOtpRegistration && (
                    <button className="primary-btn register-btn" onClick={() => selectFlow('register-mobile')}>
                      <div className="btn-icon">📱</div>
                      <span>Register with Mobile</span>
                    </button>
                  )}

                  {features.pinLogin && (
                    <button className="secondary-btn login-btn" onClick={() => selectFlow('login')}>
                      <div className="btn-icon">🔑</div>
                      <span>Sign In</span>
                    </button>
                  )}
                </div>

                {/* Social Login Options */}
                {features.ssoRegistration && (
                  <div className="social-section">
                    <div className="divider">
                      <span className="divider-text">or continue with</span>
                    </div>
                    
                    <div className="social-buttons">
                      <button className="social-btn facebook-btn" disabled={!features.socialLogin}>
                        Facebook
                      </button>
                      <button className="social-btn google-btn" disabled>
                        Google
                      </button>
                      <button className="social-btn twitter-btn" disabled>
                        Twitter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      <style jsx="true">{`
        .auth-entry {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .selection-screen {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          height: 150px;
          max-width: 400px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .tab-btn.active {
          background: #F28C00;
          color: white;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .tab-btn:not(.active):hover {
          color: #003B71;
          background: rgba(0, 59, 113, 0.05);
        }

        .tab-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          min-height: 400px;
        }

        .tab-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .panel-header h3 {
          color: #003B71;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .panel-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .primary-btn {
          background: #F28C00;
          border: none;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          font-family: inherit;
        }

        .primary-btn:hover {
          background: #e6741d;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(242, 140, 0, 0.3);
        }

        .secondary-btn {
          background: white;
          border: 2px solid #003B71;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: #003B71;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          font-family: inherit;
        }

        .secondary-btn:hover {
          background: #003B71;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 59, 113, 0.3);
        }

        .btn-icon {
          font-size: 1.25rem;
        }

        .auth-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .feature-icon {
          color: #F28C00;
          font-weight: bold;
          font-size: 0.875rem;
        }

        .social-section {
          margin-top: 1rem;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 1rem 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.875rem;
          position: relative;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-banner {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: #fef2f2;
          color: #dc2626;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          border: 1px solid #fecaca;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 90vw;
        }

        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .auth-entry {
            padding: 0.75rem;
            align-items: flex-start;
            padding-top: 2rem;
          }
          
          .selection-screen {
            max-width: 100%;
          }
          
          .tab-content {
            padding: 1.5rem;
          }
          
          .brand-logo {
            height: 80px;
            max-width: 250px;
          }
          
          .primary-btn, .secondary-btn {
            padding: 0.875rem 1rem;
          }
          
          .social-buttons {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .social-btn {
            padding: 0.875rem 1rem;
            gap: 0.75rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};