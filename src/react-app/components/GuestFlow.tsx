import React, { useState, useRef, useEffect } from 'react';
import { useGuestStore } from '../stores/guestStore';
import { GuestLeadForm } from './GuestLeadForm';

interface GuestFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export const GuestFlow: React.FC<GuestFlowProps> = ({ onBack, onComplete }) => {
  const { currentStep, isLoading, error, initiateGuestSession, verifyGuestOTP, initGuestSession } = useGuestStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const canProceed = formData.firstName.trim() && 
                    formData.lastName.trim() && 
                    /^[6-9]\d{9}$/.test(formData.mobile);

  const maskedMobile = formData.mobile ? 
                      formData.mobile.slice(0, 6) + 'XXXX' : '';

  const isValidOTP = otpDigits.every(digit => digit !== '') &&
                     otpDigits.join('').length === 6;

  useEffect(() => {
    initGuestSession();
  }, [initGuestSession]);

  useEffect(() => {
    if (currentStep === 2) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const proceedToVerification = async () => {
    if (!validateForm()) return;
    
    try {
      await initiateGuestSession({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile
      });
    } catch (error) {
      console.error('Guest flow error:', error);
    }
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
    
    try {
      const otp = otpDigits.join('');
      await verifyGuestOTP(formData.mobile, otp);
      stopTimer();
    } catch (error) {
      // Clear OTP on error
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 0);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goBackToOTP = () => {
    // Reset OTP and go back to step 2
    setOtpDigits(['', '', '', '', '', '']);
    useGuestStore.setState({ currentStep: 2 });
    startTimer();
  };

  return (
    <div className="guest-flow">
      <div className="flow-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>🚗 Guest Booking</h2>
        <p>Quick booking without account creation</p>
      </div>

      {/* Step 1: Mobile & Name Input */}
      {currentStep === 1 && (
        <div className="step-card">
          <h3>📱 Enter Your Details</h3>
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
            onClick={proceedToVerification}
            disabled={!canProceed || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '📤 Processing...' : '📱 Continue'}
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

          <div className="otp-timer">Valid for {formatTime(timeLeft)}</div>

          <button 
            onClick={verifyOTPHandler}
            disabled={!isValidOTP || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '🔄 Verifying...' : '✅ Verify OTP'}
          </button>
        </div>
      )}

      {/* Step 3: Lead Form */}
      {currentStep === 3 && (
        <GuestLeadForm onBack={goBackToOTP} onComplete={onComplete} />
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
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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