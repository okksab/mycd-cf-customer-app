import React, { useState } from 'react';
import { AuthFlow } from './AuthFlow';
import { LoginFlow } from './LoginFlow';

export const AuthEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  return (
    <div className="auth-entry">
      <div className="auth-tabs">
        <button
          onClick={() => setActiveTab('register')}
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
        >
          Register
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
        >
          Login
        </button>
      </div>

      {activeTab === 'register' ? <AuthFlow /> : <LoginFlow />}

      <style jsx="true">{`
        .auth-entry {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .auth-tabs {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem 1rem 0;
          gap: 0.5rem;
        }

        .tab-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px 12px 0 0;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #e5e7eb;
          color: #6b7280;
        }

        .tab-btn.active {
          background: white;
          color: #F28C00;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        }

        .tab-btn:hover:not(.active) {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};