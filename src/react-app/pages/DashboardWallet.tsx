import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const DashboardWallet: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch wallet balance from API
    setTimeout(() => {
      setWalletBalance(1250.50);
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <button className="action-btn primary">Add Money</button>
          <button className="action-btn secondary">Withdraw</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="quick-action-btn">
            <span className="action-icon">💰</span>
            <span>Add Money</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📊</span>
            <span>Transactions</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🎁</span>
            <span>Offers</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">❓</span>
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          <div className="transaction-item">
            <div className="transaction-info">
              <span className="transaction-type">Booking Payment</span>
              <span className="transaction-date">Dec 15, 2024</span>
            </div>
            <span className="transaction-amount debit">-₹450.00</span>
          </div>
          <div className="transaction-item">
            <div className="transaction-info">
              <span className="transaction-type">Wallet Top-up</span>
              <span className="transaction-date">Dec 10, 2024</span>
            </div>
            <span className="transaction-amount credit">+₹1000.00</span>
          </div>
          <div className="transaction-item">
            <div className="transaction-info">
              <span className="transaction-type">Refund</span>
              <span className="transaction-date">Dec 8, 2024</span>
            </div>
            <span className="transaction-amount credit">+₹200.50</span>
          </div>
        </div>
        <button className="view-all-btn">View All Transactions</button>
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

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .quick-actions h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
          background: rgba(245, 130, 32, 0.08);
          border-color: #F58220;
        }

        .action-icon {
          font-size: 1.5rem;
        }

        .recent-transactions {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .recent-transactions h3 {
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
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
          
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .quick-action-btn {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};