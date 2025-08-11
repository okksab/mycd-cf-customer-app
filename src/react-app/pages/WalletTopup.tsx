import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface WalletTopupProps {
  onBack?: () => void;
}

export const WalletTopup: React.FC<WalletTopupProps> = ({ onBack }) => {
  const [customerData, setCustomerData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const quickAmounts = [500, 750, 999];

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        setCustomerData(response.data);
      }
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAmountSelect = (quickAmount: number) => {
    setSelectedAmount(quickAmount.toString());
    setAmount(quickAmount.toString());
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSelectedAmount('');
  };

  const handleReviewAndPay = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setShowReview(true);
  };

  const handlePayNow = () => {
    alert(`Payment of ₹${amount} initiated. This would integrate with payment gateway.`);
  };

  const goBack = () => {
    if (showReview) {
      setShowReview(false);
    } else if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="wallet-topup loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="wallet-topup">
      <div className="topup-header">
        <button className="back-btn" onClick={goBack}>← Back</button>
        <h2>💳 Add Money to Wallet</h2>
      </div>

      {!showReview ? (
        <div className="topup-form">
          {/* Customer Information */}
          <div className="customer-info-card">
            <h3>Customer Information</h3>
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{customerData?.firstName} {customerData?.lastName}</span>
            </div>
            <div className="info-row">
              <span className="label">Customer ID:</span>
              <span className="value">{customerData?.customerIdCode || customerData?.customerId}</span>
            </div>
            <div className="info-row">
              <span className="label">Mobile Number:</span>
              <span className="value">{customerData?.mobile}</span>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="amount-section">
            <h3>Select Amount</h3>
            
            {/* Quick Amount Options */}
            <div className="quick-amounts">
              {quickAmounts.map((quickAmount) => (
                <label key={quickAmount} className="quick-amount-option">
                  <input
                    type="radio"
                    name="quickAmount"
                    value={quickAmount}
                    checked={selectedAmount === quickAmount.toString()}
                    onChange={() => handleQuickAmountSelect(quickAmount)}
                  />
                  <span className="radio-label">₹{quickAmount}</span>
                </label>
              ))}
            </div>

            {/* Manual Amount Input */}
            <div className="manual-amount">
              <label htmlFor="amount">Or enter custom amount:</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max="50000"
              />
            </div>
          </div>

          {/* Review and Pay Button */}
          <div className="action-section">
            <button 
              className="review-btn"
              onClick={handleReviewAndPay}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Review and Pay
            </button>
          </div>
        </div>
      ) : (
        <div className="review-section">
          <h3>Review Payment Details</h3>
          
          {/* Customer Information Review */}
          <div className="review-card">
            <h4>Customer Information</h4>
            <div className="review-row">
              <span className="label">Name:</span>
              <span className="value">{customerData?.firstName} {customerData?.lastName}</span>
            </div>
            <div className="review-row">
              <span className="label">Customer ID:</span>
              <span className="value">{customerData?.customerIdCode || customerData?.customerId}</span>
            </div>
            <div className="review-row">
              <span className="label">Mobile Number:</span>
              <span className="value">{customerData?.mobile}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="review-card">
            <h4>Payment Details</h4>
            <div className="review-row">
              <span className="label">Top-up Amount:</span>
              <span className="value amount">₹{amount}</span>
            </div>
            <div className="review-row">
              <span className="label">Payment Method:</span>
              <span className="value">Online Payment</span>
            </div>
          </div>

          {/* Pay Now Button */}
          <div className="action-section">
            <button className="pay-now-btn" onClick={handlePayNow}>
              Pay Now ₹{amount}
            </button>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .wallet-topup {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .wallet-topup.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          text-align: center;
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

        .topup-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
        }

        .back-btn:hover {
          background: #e9ecef;
        }

        .topup-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .customer-info-card, .amount-section, .review-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #f1f5f9;
        }

        .customer-info-card h3, .amount-section h3, .review-card h4 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .info-row, .review-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-row:last-child, .review-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          color: #1f2937;
          font-weight: 600;
        }

        .value.amount {
          color: #F28C00;
          font-size: 1.2rem;
        }

        .quick-amounts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .quick-amount-option {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-amount-option:hover {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.05);
        }

        .quick-amount-option input[type="radio"] {
          display: none;
        }

        .quick-amount-option input[type="radio"]:checked + .radio-label {
          color: #F28C00;
          font-weight: 700;
        }

        .quick-amount-option:has(input[type="radio"]:checked) {
          border-color: #F28C00;
          background: rgba(242, 140, 0, 0.1);
        }

        .radio-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .manual-amount {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .manual-amount label {
          color: #374151;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .manual-amount input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .manual-amount input:focus {
          outline: none;
          border-color: #F28C00;
          box-shadow: 0 0 0 3px rgba(242, 140, 0, 0.1);
        }

        .action-section {
          text-align: center;
        }

        .review-btn, .pay-now-btn {
          width: 100%;
          padding: 1rem;
          background: #F28C00;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .review-btn:hover:not(:disabled), .pay-now-btn:hover {
          background: #e6741d;
          transform: translateY(-1px);
        }

        .review-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .review-section h3 {
          color: #1f2937;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        @media (max-width: 480px) {
          .quick-amounts {
            grid-template-columns: 1fr;
          }
          
          .topup-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .topup-header h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
};