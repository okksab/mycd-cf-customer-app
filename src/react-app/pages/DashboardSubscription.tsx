import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const DashboardSubscription: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch subscription data from API
    setTimeout(() => {
      setCurrentPlan({
        id: 1,
        name: 'Premium Plan',
        price: 299,
        validTill: '2025-01-15',
        features: ['Free cancellations: 5/month', 'Chat & Voice access', 'Manual driver selection', 'Priority support']
      });
      
      setAvailablePlans([
        {
          id: 1,
          name: 'Basic Plan',
          price: 99,
          validity: 30,
          features: ['Free cancellations: 3/month', 'Chat access', 'Standard support']
        },
        {
          id: 2,
          name: 'Premium Plan',
          price: 299,
          validity: 30,
          features: ['Free cancellations: 5/month', 'Chat & Voice access', 'Manual driver selection', 'Priority support']
        },
        {
          id: 3,
          name: 'VIP Plan',
          price: 599,
          validity: 30,
          features: ['Unlimited cancellations', 'Chat & Voice access', 'Manual driver selection', 'Early feature access', 'Personalized support']
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const validTill = new Date(dateString);
    const diffTime = validTill.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="dashboard-subscription loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-subscription">
      <div className="subscription-header">
        <h2>⭐ My Subscription</h2>
        <p>Manage your subscription plan and benefits</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="current-plan-card">
          <div className="plan-header">
            <div className="plan-info">
              <h3>{currentPlan.name}</h3>
              <div className="plan-price">₹{currentPlan.price}/month</div>
            </div>
            <div className="plan-status active">Active</div>
          </div>
          
          <div className="plan-validity">
            <div className="validity-info">
              <span className="validity-label">Valid till:</span>
              <span className="validity-date">{formatDate(currentPlan.validTill)}</span>
            </div>
            <div className="days-remaining">
              {getDaysRemaining(currentPlan.validTill)} days remaining
            </div>
          </div>

          <div className="plan-features">
            <h4>Your Benefits:</h4>
            <ul>
              {currentPlan.features.map((feature: string, index: number) => (
                <li key={index}>✅ {feature}</li>
              ))}
            </ul>
          </div>

          <div className="plan-actions">
            <button className="action-btn secondary">Manage Plan</button>
            <button className="action-btn primary">Renew Now</button>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="available-plans">
        <h3>Available Plans</h3>
        <div className="plans-grid">
          {availablePlans.map((plan) => (
            <div key={plan.id} className={`plan-card ${currentPlan?.id === plan.id ? 'current' : ''}`}>
              <div className="plan-card-header">
                <h4>{plan.name}</h4>
                <div className="plan-card-price">
                  <span className="price">₹{plan.price}</span>
                  <span className="period">/{plan.validity} days</span>
                </div>
              </div>

              <div className="plan-card-features">
                <ul>
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <button 
                className={`plan-card-btn ${currentPlan?.id === plan.id ? 'current' : 'upgrade'}`}
                disabled={currentPlan?.id === plan.id}
              >
                {currentPlan?.id === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-subscription {
          max-width: 800px;
          margin: 0 auto;
        }

        .dashboard-subscription.loading {
          text-align: center;
          padding: 3rem;
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

        .subscription-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subscription-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .subscription-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .current-plan-card {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .plan-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .plan-price {
          font-size: 1.2rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .plan-status {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .plan-validity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .validity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .validity-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .validity-date {
          font-weight: 600;
        }

        .days-remaining {
          font-size: 0.9rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .plan-features {
          margin-bottom: 1.5rem;
        }

        .plan-features h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-features li {
          padding: 0.25rem 0;
          font-size: 0.9rem;
        }

        .plan-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: white;
          color: #10b981;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .available-plans {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .available-plans h3 {
          color: #1f2937;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .plan-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .plan-card:hover {
          border-color: #F58220;
          box-shadow: 0 4px 12px rgba(245, 130, 32, 0.1);
        }

        .plan-card.current {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .plan-card-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .plan-card-header h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .plan-card-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }

        .price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #F58220;
        }

        .period {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .plan-card-features ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }

        .plan-card-features li {
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .plan-card-features li:last-child {
          border-bottom: none;
        }

        .plan-card-btn {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .plan-card-btn.upgrade {
          background: #F58220;
          color: white;
        }

        .plan-card-btn.upgrade:hover {
          background: #e6741d;
        }

        .plan-card-btn.current {
          background: #10b981;
          color: white;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .current-plan-card {
            padding: 1.5rem;
          }
          
          .plan-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .plan-validity {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .plan-actions {
            flex-direction: column;
          }
          
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};