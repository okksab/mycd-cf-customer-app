import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerStore } from '../stores/customerStore';
import { CustomerLeadForm } from './CustomerLeadForm';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customerData, requests, clearCustomerSession } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<'booking' | 'history' | 'offers' | 'profile'>('booking');

  const handleLogout = () => {
    clearCustomerSession();
    navigate('/');
  };

  const handleUpgrade = () => {
    // Navigate to upgrade flow
    navigate('/upgrade');
  };

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <div className="user-info">
          <h2>Welcome, {customerData?.firstName}!</h2>
          <p>Customer • {customerData?.mobile}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'booking' && (
          <div className="tab-content">
            <CustomerLeadForm 
              onComplete={() => {
                // After booking completion, switch to history tab
                setActiveTab('history');
              }} 
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content">
            <h3>Request History</h3>
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No requests found</p>
                <button onClick={() => setActiveTab('booking')} className="btn btn-primary">
                  Make Your First Booking
                </button>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>{request.service}</h4>
                      <span className={`status ${request.status}`}>{request.status}</span>
                    </div>
                    <div className="request-details">
                      <p><strong>From:</strong> {request.fromLocation}</p>
                      {request.toLocation && <p><strong>To:</strong> {request.toLocation}</p>}
                      <p><strong>Request ID:</strong> {request.requestId}</p>
                      <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/booking-status/${request.requestId}`)}
                      className="btn btn-secondary"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="tab-content">
            <h3>Special Offers</h3>
            <div className="offers-list">
              <div className="offer-card">
                <div className="offer-icon">🎉</div>
                <div className="offer-content">
                  <h4>First Ride Discount</h4>
                  <p>Get 20% off on your first booking</p>
                  <span className="offer-code">Code: FIRST20</span>
                </div>
              </div>
              <div className="offer-card">
                <div className="offer-icon">💰</div>
                <div className="offer-content">
                  <h4>Weekend Special</h4>
                  <p>Flat ₹100 off on weekend bookings</p>
                  <span className="offer-code">Code: WEEKEND100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <h3>Profile</h3>
            <div className="profile-info">
              <div className="profile-section">
                <h4>Personal Information</h4>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{customerData?.firstName} {customerData?.lastName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Mobile:</span>
                  <span className="value">{customerData?.mobile}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className="value status-guest">Not Registered</span>
                </div>
              </div>

              <div className="upgrade-section">
                <h4>🔁 Complete Registration</h4>
                <p>Complete your profile for full access:</p>
                <ul className="benefits-list">
                  <li>✓ Complete Trip History</li>
                  <li>✓ Wallet Top-up</li>
                  <li>✓ Subscription Plans</li>
                  <li>✓ Driver Review & Feedback</li>
                  <li>✓ Priority Support</li>
                </ul>
                <button onClick={handleUpgrade} className="btn btn-primary upgrade-btn">
                  Complete Registration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-navigation">
        <button 
          onClick={() => setActiveTab('booking')}
          className={`nav-btn ${activeTab === 'booking' ? 'active' : ''}`}
        >
          <span className="nav-icon">🚗</span>
          <span className="nav-label">Booking</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('offers')}
          className={`nav-btn ${activeTab === 'offers' ? 'active' : ''}`}
        >
          <span className="nav-icon">🎁</span>
          <span className="nav-label">Offers</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </div>

      <style jsx="true">{`
        .customer-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          background: white;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-container {
          flex-shrink: 0;
        }

        .brand-logo {
          height: 40px;
          max-width: 120px;
          object-fit: contain;
        }

        .user-info {
          flex: 1;
          margin-left: 1rem;
        }

        .user-info h2 {
          color: #003B71;
          font-size: 1.25rem;
          margin: 0 0 0.25rem 0;
        }

        .user-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        .dashboard-content {
          flex: 1;
          padding: 1rem;
          padding-bottom: 80px;
        }

        .tab-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .tab-content h3 {
          color: #003B71;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .request-header h4 {
          color: #1f2937;
          margin: 0;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status.confirmed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status.pending {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .request-details p {
          margin: 0.5rem 0;
          color: #374151;
          font-size: 0.9rem;
        }

        .offers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .offer-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .offer-icon {
          font-size: 2rem;
        }

        .offer-content h4 {
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .offer-content p {
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }

        .offer-code {
          background: #F28C00;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .profile-info {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .profile-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .profile-section h4 {
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          color: #1f2937;
          font-weight: 600;
        }

        .status-guest {
          color: #f59e0b;
        }

        .upgrade-section h4 {
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .benefits-list li {
          color: #374151;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .upgrade-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .bottom-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          padding: 0.5rem;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        }

        .nav-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.75rem 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
        }

        .nav-btn.active {
          color: #F28C00;
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-primary {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.3);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .user-info {
            margin-left: 0;
          }

          .offer-card {
            flex-direction: column;
            text-align: center;
          }

          .info-row {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};