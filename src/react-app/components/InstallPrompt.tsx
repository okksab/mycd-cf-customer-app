import React from 'react';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h4>Install MyCallDriver</h4>
          <p>Get quick access from your home screen</p>
        </div>
        <button onClick={installApp} className="install-btn">
          Install
        </button>
      </div>

      <style jsx="true">{`
        .install-prompt {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideUp 0.3s ease;
        }

        .install-content {
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
        }

        .install-icon {
          font-size: 2rem;
        }

        .install-text {
          flex: 1;
        }

        .install-text h4 {
          margin: 0 0 0.25rem 0;
          color: #003B71;
          font-size: 1rem;
        }

        .install-text p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
        }

        .install-btn {
          background: #F58220;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .install-btn:hover {
          background: #e6741d;
          transform: translateY(-1px);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .install-prompt {
            left: 10px;
            right: 10px;
            bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};