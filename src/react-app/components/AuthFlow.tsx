import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const AuthFlow: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOTP, saveUserDetails, setupPIN, isLoading, error } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    mobile: '',
    firstName: '',
    lastName: '',
    city: '',
    pin: '',
    confirmPin: ''
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [pinError, setPinError] = useState('');
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMobileSubmit = async () => {
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) return;
    
    try {
      await register(formData.mobile);
      setCurrentStep(2);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleOTPVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) return;
    
    try {
      await verifyOTP(formData.mobile, otp);
      setCurrentStep(3);
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  const handleUserDetails = async () => {
    if (!formData.firstName || !formData.lastName || !formData.city) return;
    
    try {
      await saveUserDetails({
        mobile: formData.mobile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city
      });
      setCurrentStep(4);
    } catch (error) {
      console.error('Save user details failed:', error);
    }
  };

  const handlePINSetup = async () => {
    setPinError('');
    
    if (formData.pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    
    if (formData.pin !== formData.confirmPin) {
      setPinError('PIN and Confirm PIN do not match');
      return;
    }
    
    try {
      await setupPIN(formData.mobile, formData.pin);
      navigate('/dashboard');
    } catch (error) {
      console.error('PIN setup failed:', error);
    }
  };

  const onOtpInput = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    
    if (value && index < 5) {
      setTimeout(() => otpInputs.current[index + 1]?.focus(), 0);
    }
  };

  return (
    <div className="auth-flow">
      <div className="auth-header">
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" />
        </div>
        <h2>Welcome to MyCallDriver</h2>
        <p>Professional driver booking made easy</p>
      </div>

      {/* Step 1: Mobile Number */}
      {currentStep === 1 && (
        <div className="auth-card">
          <h3>📱 Enter Mobile Number</h3>
          <div className="form-group">
            <input
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              type="tel"
              className="form-input"
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </div>
          <button
            onClick={handleMobileSubmit}
            disabled={!/^[6-9]\d{9}$/.test(formData.mobile) || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Processing...' : 'Register'}
          </button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 2 && (
        <div className="auth-card">
          <h3>📱 Verify OTP</h3>
          <p>Enter the 6-digit OTP sent to {formData.mobile}</p>
          
          <div className="otp-input-group">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={el => otpInputs.current[index] = el}
                value={digit}
                type="text"
                className="otp-digit"
                maxLength={1}
                onChange={(e) => onOtpInput(index, e.target.value)}
              />
            ))}
          </div>

          <button
            onClick={handleOTPVerify}
            disabled={otpDigits.join('').length !== 6 || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}

      {/* Step 3: User Details */}
      {currentStep === 3 && (
        <div className="auth-card">
          <h3>👤 Personal Details</h3>
          <div className="form-row">
            <div className="form-group">
              <input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                type="text"
                className="form-input"
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                type="text"
                className="form-input"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div className="form-group">
            <input
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              type="text"
              className="form-input"
              placeholder="City"
            />
          </div>
          <button
            onClick={handleUserDetails}
            disabled={!formData.firstName || !formData.lastName || !formData.city || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving...' : 'Next'}
          </button>
        </div>
      )}

      {/* Step 4: PIN Setup */}
      {currentStep === 4 && (
        <div className="auth-card">
          <h3>🔐 Setup Login PIN</h3>
          <p>Create a 4-digit PIN for quick login</p>
          <div className="form-group">
            <input
              value={formData.pin}
              onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
              type="password"
              className="form-input"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
            />
          </div>
          <div className="form-group">
            <input
              value={formData.confirmPin}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPin: e.target.value }))}
              type="password"
              className="form-input"
              placeholder="Confirm PIN"
              maxLength={4}
            />
          </div>
          {pinError && <div className="pin-error-message">{pinError}</div>}
          <button
            onClick={handlePINSetup}
            disabled={formData.pin !== formData.confirmPin || formData.pin.length !== 4 || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Setting up...' : 'Complete Registration'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <style jsx="true">{`
        .auth-flow {
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
          margin-bottom: 1rem;
        }

        .auth-card h3 {
          color: #1f2937;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
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

        .otp-input-group {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 1.5rem 0;
        }

        .otp-digit {
          width: 50px;
          height: 60px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .otp-digit:focus {
          outline: none;
          border-color: #F28C00;
          box-shadow: 0 0 0 3px rgba(242, 140, 0, 0.1);
        }

        .otp-display {
          background: #fef3c7;
          color: #92400e;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1rem;
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

        .pin-error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .auth-flow {
            padding: 0.5rem;
          }
          
          .auth-card {
            padding: 1.5rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .otp-digit {
            width: 45px;
            height: 55px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};