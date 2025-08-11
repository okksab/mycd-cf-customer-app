import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { WalletTopup } from './WalletTopup';

export const DashboardWallet: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('recent');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTopup, setShowTopup] = useState(false);

  const ads = [
    {
      title: "Special Offer!",
      subtitle: "Get 20% cashback on wallet top-up",
      bgColor: "linear-gradient(135deg, #F28C00 0%, #e6741d 100%)"
    },
    {
      title: "Premium Benefits",
      subtitle: "Upgrade to premium for exclusive rewards",
      bgColor: "linear-gradient(135deg, #003B71 0%, #0056a3 100%)"
    },
    {
      title: "Refer & Earn",
      subtitle: "Invite friends and earn ₹100 bonus",
      bgColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    }
  ];

  useEffect(() => {
    // TODO: Fetch wallet balance from API
    setTimeout(() => {
      setWalletBalance(1250.50);
      setTransactions([
        { id: 1, type: 'Booking Payment', date: 'Dec 15, 2024', amount: -450.00 },
        { id: 2, type: 'Wallet Top-up', date: 'Dec 10, 2024', amount: 1000.00 },
        { id: 3, type: 'Refund', date: 'Dec 8, 2024', amount: 200.50 },
        { id: 4, type: 'Service Fee', date: 'Dec 5, 2024', amount: -50.00 },
        { id: 5, type: 'Cashback', date: 'Dec 3, 2024', amount: 25.00 }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ads.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPaused, ads.length]);

  const loadTransactionsByPeriod = (period: string) => {
    setSelectedPeriod(period);
    // TODO: Fetch transactions based on period from API
    console.log(`Loading transactions for period: ${period}`);
  };

  if (showTopup) {
    return <WalletTopup onBack={() => setShowTopup(false)} />;
  }

  return (
    <div className="dashboard-wallet">
      <div className="wallet-header">
        <h2>💳 My Wallet</h2>
        <p>Manage your wallet balance and transactions</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="balance-card">
        <div className="balance-header">
          <h3>Current Balance</h3>
          <button className="refresh-btn">🔄</button>
        </div>
        <div className="balance-amount">
          {isLoading ? (
            <div className="loading-balance">Loading...</div>
          ) : (
            <span>₹{walletBalance.toFixed(2)}</span>
          )}
        </div>
        <div className="balance-actions">
          <button className="action-btn primary" onClick={() => setShowTopup(true)}>Add Money</button>
        </div>
      </div>

      {/* Ads Section */}
      <div className="ads-section">
        <div 
          className="slideshow-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {ads.map((ad, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: ad.bgColor }}
            >
              <div className="slide-content">
                <h3>{ad.title}</h3>
                <p>{ad.subtitle}</p>
              </div>
            </div>
          ))}
          
          <div className="slide-indicators">
            {ads.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>
          <div className="period-filters">
            <button 
              className={`filter-btn ${selectedPeriod === 'recent' ? 'active' : ''}`}
              onClick={() => loadTransactionsByPeriod('recent')}
            >
              Last 5
            </button>
            <button 
              className={`filter-btn ${selectedPeriod === '3months' ? 'active' : ''}`}
              onClick={() => loadTransactionsByPeriod('3months')}
            >
              3 Months
            </button>
            <button 
              className={`filter-btn ${selectedPeriod === '6months' ? 'active' : ''}`}
              onClick={() => loadTransactionsByPeriod('6months')}
            >
              6 Months
            </button>
            <button 
              className={`filter-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
              onClick={() => loadTransactionsByPeriod('all')}
            >
              All
            </button>
          </div>
        </div>
        
        <div className="transaction-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <span className="transaction-type">{transaction.type}</span>
                <span className="transaction-date">{transaction.date}</span>
              </div>
              <span className={`transaction-amount ${transaction.amount > 0 ? 'credit' : 'debit'}`}>
                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-wallet {
          max-width: 600px;
          margin: 0 auto;
        }

        .wallet-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .wallet-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .wallet-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .balance-card {
          background: linear-gradient(135deg, #003B71 0%, #0056a3 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 24px rgba(0, 59, 113, 0.2);
        }

        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .balance-header h3 {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .balance-amount {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .loading-balance {
          font-size: 1.2rem;
          opacity: 0.7;
        }

        .balance-actions {
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
          color: #003B71;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .ads-section {
          margin-bottom: 2rem;
        }

        .slideshow-container {
          position: relative;
          height: 120px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .slide.active {
          opacity: 1;
        }

        .slide-content {
          text-align: center;
          padding: 1rem;
        }

        .slide-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .slide-content p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .slide-indicators {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .recent-transactions {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .transactions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .recent-transactions h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .period-filters {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          color: #6b7280;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: #F28C00;
          border-color: #F28C00;
          color: white;
        }

        .filter-btn:hover:not(.active) {
          background: rgba(242, 140, 0, 0.1);
          border-color: #F28C00;
          color: #F28C00;
        }

        .transaction-list {
          margin-bottom: 1rem;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .transaction-type {
          font-weight: 600;
          color: #1f2937;
        }

        .transaction-date {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .transaction-amount {
          font-weight: 600;
        }

        .transaction-amount.credit {
          color: #10b981;
        }

        .transaction-amount.debit {
          color: #ef4444;
        }

        .view-all-btn {
          width: 100%;
          padding: 0.75rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background: rgba(245, 130, 32, 0.08);
          border-color: #F58220;
          color: #F58220;
        }

        @media (max-width: 480px) {
          .balance-card {
            padding: 1.5rem;
          }
          
          .balance-amount {
            font-size: 2rem;
          }
          
          .balance-actions {
            flex-direction: column;
          }
          
          .transactions-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .period-filters {
            width: 100%;
            justify-content: space-between;
          }
          
          .filter-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};