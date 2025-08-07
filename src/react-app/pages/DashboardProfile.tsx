import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const DashboardProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    dateOfBirth: '',
    city: '',
    pincode: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      alert('Profile updated successfully!');
    }, 1500);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const displayName = user?.first_name || user?.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user?.name || 'User';

  return (
    <div className="dashboard-profile">
      <div className="profile-header">
        <div className="profile-avatar-section">
          {user?.profile_picture ? (
            <img src={user.profile_picture} className="profile-avatar" alt={displayName} />
          ) : (
            <div className="profile-avatar-placeholder">
              {displayName.charAt(0) || 'U'}
            </div>
          )}
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p>{user?.mobile || 'No mobile number'}</p>
            <div className="profile-badges">
              <span className="badge verified">✓ Verified</span>
              <span className="badge member">Premium Member</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="edit-profile-btn"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Form */}
      <div className="profile-form-section">
        <h3>Personal Information</h3>
        
        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter first name"
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter city"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              className="form-input"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter pincode"
              maxLength={6}
            />
          </div>

          {isEditing && (
            <div className="form-actions">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary save-btn"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="account-settings-section">
        <h3>Account Settings</h3>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>🔔 Notifications</h4>
              <p>Manage your notification preferences</p>
            </div>
            <button className="setting-action">Configure</button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>🔒 Privacy & Security</h4>
              <p>Update your privacy settings and change password</p>
            </div>
            <button className="setting-action">Manage</button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>💳 Payment Methods</h4>
              <p>Add or remove payment methods</p>
            </div>
            <button className="setting-action">View</button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>📋 Booking Preferences</h4>
              <p>Set your default booking preferences</p>
            </div>
            <button className="setting-action">Edit</button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="account-actions-section">
        <h3>Account Actions</h3>
        
        <div className="action-buttons">
          <button className="action-btn secondary">
            📱 Download App
          </button>
          
          <button className="action-btn secondary">
            📞 Contact Support
          </button>
          
          <button className="action-btn secondary">
            📄 Terms & Privacy
          </button>
          
          <button 
            onClick={handleLogout}
            className="action-btn danger logout-btn"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-profile {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .profile-avatar-section {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #F58220;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 2rem;
        }

        .profile-info h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .profile-info p {
          color: #6b7280;
          margin: 0 0 1rem 0;
        }

        .profile-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge.verified {
          background: #dcfce7;
          color: #166534;
        }

        .badge.member {
          background: #fef3c7;
          color: #92400e;
        }

        .edit-profile-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .edit-profile-btn:hover {
          background: #e5e7eb;
        }

        .profile-form-section,
        .account-settings-section,
        .account-actions-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .profile-form-section h3,
        .account-settings-section h3,
        .account-actions-section h3 {
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 0.75rem;
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

        .form-input:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .save-btn {
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .setting-item:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .setting-info h4 {
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .setting-info p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .setting-action {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .setting-action:hover {
          background: #e5e7eb;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-align: center;
        }

        .action-btn.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .action-btn.secondary:hover {
          background: #e5e7eb;
        }

        .action-btn.danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .action-btn.danger:hover {
          background: #fee2e2;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }
          
          .profile-avatar-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .setting-action {
            align-self: flex-end;
          }
          
          .action-buttons {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .profile-form-section,
          .account-settings-section,
          .account-actions-section {
            padding: 1.5rem;
          }
          
          .profile-header {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};