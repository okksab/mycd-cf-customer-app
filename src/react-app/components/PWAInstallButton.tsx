import React, { useState } from 'react';

export const PWAInstallButton: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  const handleInstallClick = () => {
    setShowInstructions(true);
  };

  if (isStandalone) {
    return (
      <div className="pwa-status">
        <span className="installed-badge">📱 App Installed</span>
        <style jsx="true">{`
          .installed-badge {
            background: #28a745;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            text-align: center;
            display: block;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pwa-install">
      <button onClick={handleInstallClick} className="install-btn">
        📱 Install App
      </button>
      
      {showInstructions && (
        <div className="install-instructions">
          <div className="instructions-header">
            <h4>Install MyCallDriver App</h4>
            <button onClick={() => setShowInstructions(false)} className="close-btn">×</button>
          </div>
          <div className="instructions-content">
            <p><strong>Chrome/Edge:</strong> Menu → Install MyCallDriver</p>
            <p><strong>Safari:</strong> Share → Add to Home Screen</p>
            <p><strong>Firefox:</strong> Menu → Install</p>
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        .pwa-install {
          margin: 1rem 0;
          position: relative;
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
          font-size: 0.9rem;
          width: 100%;
        }

        .install-btn:hover {
          background: #e6741d;
          transform: translateY(-1px);
        }

        .install-instructions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          margin-top: 0.5rem;
        }

        .instructions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .instructions-header h4 {
          margin: 0;
          color: #003B71;
          font-size: 1rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
        }

        .instructions-content {
          padding: 1rem;
        }

        .instructions-content p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
        }

        .instructions-content strong {
          color: #003B71;
        }
      `}</style>
    </div>
  );
};