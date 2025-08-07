import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuestLeadForm } from './GuestLeadForm';

interface GuestFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export const GuestFlow: React.FC<GuestFlowProps> = ({ onBack, onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    mobile: '',
    firstName: '',
    lastName: '',
    location: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']); // Prefilled for testing
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const canProceedMobile = /^[6-9]\d{9}$/.test(formData.mobile);
  const canProceedDetails = formData.firstName.trim() && 
                           formData.lastName.trim() && 
                           formData.location.trim();

  const maskedMobile = formData.mobile ? 
                      formData.mobile.slice(0, 6) + 'XXXX' : '';

  const isValidOTP = otpDigits.every(digit => digit !== '') &&
                     otpDigits.join('').length === 6;



  const validateMobile = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'City or pincode is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const proceedToOTP = async () => {
    if (!validateMobile()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(2);
    }, 1000);
  };

  const onOtpInput = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Move to next input
    if (value && index < 5) {
      setTimeout(() => {
        otpInputs.current[index + 1]?.focus();
      }, 0);
    }

    // Auto-verify when all digits entered
    const isComplete = newOtpDigits.every(digit => digit !== '');
    if (isComplete) {
      setTimeout(() => verifyOTPHandler(), 100);
    }
  };

  const onOtpKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      setTimeout(() => {
        otpInputs.current[index - 1]?.focus();
      }, 0);
    }
  };

  const verifyOTPHandler = async () => {
    if (!isValidOTP) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
    }, 1000);
  };

  const proceedToLeadForm = async () => {
    if (!validateDetails()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(4);
    }, 1000);
  };

  const completeLeadForm = () => {
    // Navigate to booking status
    navigate('/booking-status');
  };



  return (
    <div className="guest-flow">
      <div className="flow-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="logo-container">
          <img src="/logo.png" alt="MyCallDriver" className="brand-logo" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <h2>Guest Booking</h2>
        <p>Quick booking without account creation</p>
      </div>

      {/* Step 1: Mobile Number */}
      {currentStep === 1 && (
        <div className="step-card">
          <h3>📱 Enter Mobile Number</h3>
          <p>We'll send you an OTP to verify your number</p>
          
          <div className="form-group">
            <label>Mobile Number</label>
            <input 
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              type="tel" 
              className={`form-input ${errors.mobile ? 'error' : ''}`}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          <button 
            onClick={proceedToOTP}
            disabled={!canProceedMobile || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '📤 Sending OTP...' : '📱 Send OTP'}
          </button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 2 && (
        <div className="step-card">
          <h3>📱 Verify Mobile Number</h3>
          <p>We've sent a 6-digit OTP to <strong>{maskedMobile}</strong></p>
          
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
                onKeyDown={(e) => onOtpKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="otp-timer">OTP: 123456 (Pre-filled for testing)</div>

          <button 
            onClick={verifyOTPHandler}
            disabled={!isValidOTP || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '🔄 Verifying...' : '✅ Verify OTP'}
          </button>
        </div>
      )}

      {/* Step 3: Personal Details */}
      {currentStep === 3 && (
        <div className="step-card">
          <h3>👤 Personal Details</h3>
          <p>Please provide your details to continue</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                type="text" 
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                type="text" 
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>City or Pincode</label>
            <input 
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              type="text" 
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="Enter city name or pincode"
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <button 
            onClick={proceedToLeadForm}
            disabled={!canProceedDetails || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '📤 Processing...' : '🚗 Continue to Booking'}
          </button>
        </div>
      )}

      {/* Step 4: Lead Form */}
      {currentStep === 4 && (
        <GuestLeadForm onBack={() => setCurrentStep(3)} onComplete={completeLeadForm} />
      )}

      <style jsx="true">{`
        .guest-flow {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
        }

        .flow-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }

        .back-btn {
          position: absolute;
          left: 0;
          top: 0;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .back-btn:hover {
          color: #374151;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .brand-logo {
          height: 80px;
          max-width: 200px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }

        .flow-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .flow-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .step-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .step-card h3 {
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

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.05);
        }

        .error-text {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
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
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .otp-digit:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .otp-timer {
          text-align: center;
          color: #f59e0b;
          font-weight: 600;
          margin-bottom: 1.5rem;
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
          font-family: inherit;
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

        @media (max-width: 480px) {
          .guest-flow {
            padding: 0.5rem;
          }
          
          .step-card {
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
          
          .otp-input-group {
            gap: 0.375rem;
          }
        }
      `}</style>
    </div>
  );
};