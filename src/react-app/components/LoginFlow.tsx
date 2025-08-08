import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LoginFlow: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithPIN, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    mobile: '',
    pin: ''
  });

  const handleLogin = async () => {
    if (!/^[6-9]\d{9}$/.test(formData.mobile) || formData.pin.length !== 4) return;
    
    try {
      await loginWithPIN(formData.mobile, formData.pin);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-flow">
      <div className="auth-header">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" />
        </div>
        <h2>Welcome Back</h2>
        <p>Login to your MyCallDriver account</p>
      </div>

      <div className="auth-card">
        <h3>🔐 Login with PIN</h3>
        
        <div className="form-group">
          <input
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            type="tel"
            className="form-input"
            placeholder="Mobile Number"
            maxLength={10}
          />
        </div>

        <div className="form-group">
          <input
            value={formData.pin}
            onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
            type="password"
            className="form-input"
            placeholder="4-digit PIN"
            maxLength={4}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={!/^[6-9]\d{9}$/.test(formData.mobile) || formData.pin.length !== 4 || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx="true">{`
        .login-flow {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-top: 2rem;
        }

        .logo-container {
          margin-bottom: 1rem;
        }

        .brand-logo {
          height: 80px;
          max-width: 200px;
          object-fit: contain;
        }

        .auth-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .auth-card h3 {
          color: #1f2937;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #F28C00;
          box-shadow: 0 0 0 3px rgba(242, 140, 0, 0.1);
        }

        .btn {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.3);
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};