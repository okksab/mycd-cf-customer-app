import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuthStore } from '../stores/authStore';

export const DashboardMore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'notifications' | 'profile'>('subscription');
  const [isLoading, setIsLoading] = useState(false);
  
  // Subscription data
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  // Notifications data
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Profile data
  const [profileData, setProfileData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: ''
  });
  const [pinFormData, setPinFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'subscription') {
        try {
          const currentUserResponse = await apiService.getCurrentUser();
          console.log('Current user response:', currentUserResponse);
          console.log('Current subscription plan ID:', currentUserResponse.data?.currentSubscriptionPlanId);
          
          if (currentUserResponse.success && currentUserResponse.data.currentSubscriptionPlanId) {
            console.log('Fetching plan ID:', currentUserResponse.data.currentSubscriptionPlanId);
            const subscriptionResponse = await apiService.getSubscriptionPlan(currentUserResponse.data.currentSubscriptionPlanId);
            console.log('Subscription response:', subscriptionResponse);
            
            if (subscriptionResponse.success) {
              const features = [
                `Free cancellations: ${subscriptionResponse.data.freeCancellationsPerMonth}/month`,
                subscriptionResponse.data.chatAccess ? 'Chat access' : 'No chat access',
                subscriptionResponse.data.voiceAccess ? 'Voice access' : 'No voice access',
                subscriptionResponse.data.manualDriverSelection ? 'Manual driver selection' : 'Auto driver assignment'
              ];
              
              // For Pay-As-You-Go plan (ID: 1), add service fee from plan price
              if (currentUserResponse.data.currentSubscriptionPlanId === 1) {
                features.push(`Service Fee: ₹${subscriptionResponse.data.price}`);
              }
              
              setCurrentPlan({
                name: subscriptionResponse.data.planName,
                price: subscriptionResponse.data.price,
                validTill: currentUserResponse.data.subscriptionValidTill,
                features: features,
                isPayAsYouGo: currentUserResponse.data.currentSubscriptionPlanId === 1
              });
            } else {
              console.log('Failed to fetch subscription plan');
              setCurrentPlan(null);
            }
          } else {
            console.log('No current subscription plan ID found. User data:', currentUserResponse.data);
            setCurrentPlan(null);
          }
        } catch (error) {
          console.error('Error loading subscription:', error);
          setCurrentPlan(null);
        }
        setIsLoading(false);
      } else if (activeTab === 'notifications') {
        // Mock notifications data
        setTimeout(() => {
          setNotifications([
            { id: 1, title: 'Booking Confirmed', message: 'Your driver is on the way', time: '2 hours ago', read: false },
            { id: 2, title: 'Payment Successful', message: 'Payment of ₹450 completed', time: '1 day ago', read: true },
            { id: 3, title: 'New Offer Available', message: 'Get 20% off on your next ride', time: '2 days ago', read: true }
          ]);
          setIsLoading(false);
        }, 500);
      } else if (activeTab === 'profile') {
        // Get current user data
        const currentUserResponse = await apiService.getCurrentUser();
        if (currentUserResponse.success) {
          setProfileData(currentUserResponse.data);
          // Initialize edit form with current data
          setEditFormData({
            firstName: currentUserResponse.data.firstName || '',
            lastName: currentUserResponse.data.lastName || '',
            gender: currentUserResponse.data.gender || '',
            dateOfBirth: currentUserResponse.data.dateOfBirth || '',
            email: currentUserResponse.data.email || ''
          });
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load tab data:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const validTill = new Date(dateString);
    const diffTime = validTill.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const { logout } = useAuthStore();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiService.updateProfile({
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        gender: editFormData.gender,
        dateOfBirth: editFormData.dateOfBirth,
        email: editFormData.email
      });
      
      if (response.success) {
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          gender: editFormData.gender,
          dateOfBirth: editFormData.dateOfBirth,
          email: editFormData.email
        }));
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAvailableSubscriptionPlans();
      if (response.success) {
        // Handle Flux response - convert to array
        const plansArray = Array.isArray(response.data) ? response.data : [];
        setAvailablePlans(plansArray);
        setShowPlansModal(true);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPlan = async (plan: any) => {
    console.log('Selected plan:', plan);
    alert(`You selected ${plan.planName} for ₹${plan.price}/month`);
    setShowPlansModal(false);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    
    // Validate PIN format
    if (pinFormData.currentPin.length !== 4 || !/^\d{4}$/.test(pinFormData.currentPin)) {
      setPinError('Current PIN must be 4 digits');
      return;
    }
    
    if (pinFormData.newPin.length !== 4 || !/^\d{4}$/.test(pinFormData.newPin)) {
      setPinError('New PIN must be 4 digits');
      return;
    }
    
    if (pinFormData.newPin !== pinFormData.confirmPin) {
      setPinError('New PIN and Confirm PIN do not match');
      return;
    }
    
    if (pinFormData.currentPin === pinFormData.newPin) {
      setPinError('New PIN must be different from current PIN');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiService.changePin({
        currentPin: pinFormData.currentPin,
        newPin: pinFormData.newPin
      });
      
      if (response.success) {
        setShowChangePinModal(false);
        setPinFormData({ currentPin: '', newPin: '', confirmPin: '' });
        alert('PIN changed successfully!');
      } else {
        setPinError(response.message || 'Failed to change PIN');
      }
    } catch (error: any) {
      setPinError(error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Calling logout...');
      await logout();
      console.log('Logout successful, redirecting...');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      window.location.href = '/';
    }
  };

  const renderSubscriptionTab = () => (
    <div className="tab-content">
      {currentPlan ? (
        <>
          <div className="current-plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h3>{currentPlan.name}</h3>
                <div className="plan-price">
                  {currentPlan.isPayAsYouGo 
                    ? `₹${currentPlan.price} - Service Fee`
                    : `₹${currentPlan.price}/month`
                  }
                </div>
              </div>
              <div className="plan-status active">Active</div>
            </div>
            
            <div className="plan-validity">
              <div className="validity-info">
                <span className="validity-label">Valid till:</span>
                <span className="validity-date">
                  {currentPlan.isPayAsYouGo ? 'Unlimited' : formatDate(currentPlan.validTill)}
                </span>
              </div>
              {!currentPlan.isPayAsYouGo && (
                <div className="days-remaining">
                  {getDaysRemaining(currentPlan.validTill)} days left
                </div>
              )}
            </div>

            <div className="plan-features">
              <h4>Your Benefits:</h4>
              <ul>
                {currentPlan.features.map((feature: string, index: number) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="action-btn primary" onClick={() => loadAvailablePlans()}>Change Plan</button>
            </div>
          </div>


        </>
      ) : (
        <div className="no-subscription">
          <div className="no-sub-icon">⭐</div>
          <h3>No Active Subscription</h3>
          <p>Subscribe to enjoy premium features</p>
          <button className="action-btn primary" onClick={() => loadAvailablePlans()}>View Plans</button>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-content">
      <div className="notifications-header">
        <h3>Recent Notifications</h3>
        <button className="mark-all-read">Mark All Read</button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <div className="notification-settings">
        <h4>Notification Settings</h4>
        <div className="setting-item">
          <span>Booking Updates</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>Promotional Offers</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>Payment Alerts</span>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="tab-content">
      {profileData ? (
        <>
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profileData.firstName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="profile-info">
              <h3>{profileData.firstName} {profileData.lastName}</h3>
              <p>{profileData.mobile}</p>
              <div className="profile-status">
                <span className="status-badge verified">Verified</span>
              </div>
            </div>
          </div>

          <div className="profile-sections">
            <div className="profile-section">
              <h4>Account Information</h4>
              {(profileData.customerIdCode || profileData.customerId) && (
                <div className="info-item">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">{profileData.customerIdCode || profileData.customerId}</span>
                </div>
              )}
              {profileData.firstName && (
                <div className="info-item">
                  <span className="info-label">First Name:</span>
                  <span className="info-value">{profileData.firstName}</span>
                </div>
              )}
              {profileData.lastName && (
                <div className="info-item">
                  <span className="info-label">Last Name:</span>
                  <span className="info-value">{profileData.lastName}</span>
                </div>
              )}
              {profileData.cityPincode && (
                <div className="info-item">
                  <span className="info-label">City:</span>
                  <span className="info-value">{profileData.cityPincode}</span>
                </div>
              )}
              {profileData.dateOfBirth && (
                <div className="info-item">
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">{formatDate(profileData.dateOfBirth)}</span>
                </div>
              )}
              {profileData.email && (
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{profileData.email}</span>
                </div>
              )}
              {profileData.gender && (
                <div className="info-item">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">{profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}</span>
                </div>
              )}
              {profileData.customerType && (
                <div className="info-item">
                  <span className="info-label">Account Type:</span>
                  <span className="info-value">{profileData.customerType}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">{profileData.createdAt ? formatDate(profileData.createdAt) : 'Dec 2024'}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-action-btn" onClick={() => setShowEditModal(true)}>
                <span className="action-icon">✏️</span>
                <span>Edit Profile</span>
              </button>
              <button className="profile-action-btn" onClick={() => setShowChangePinModal(true)}>
                <span className="action-icon">🔒</span>
                <span>Change PIN</span>
              </button>
              <button className="profile-action-btn logout" onClick={handleLogout}>
                <span className="action-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="profile-loading">
          <div className="loading-spinner">🔄</div>
          <p>Loading profile...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-more">
      <div className="more-header">
        <h2>⚙️ More Options</h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          ⭐ Subscription
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner">🔄</div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'subscription' && renderSubscriptionTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'profile' && renderProfileTab()}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Profile</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({...prev, firstName: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({...prev, lastName: e.target.value}))}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData(prev => ({...prev, gender: e.target.value}))}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData(prev => ({...prev, dateOfBirth: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Available Plans Modal */}
      {showPlansModal && (
        <div className="modal-overlay" onClick={() => setShowPlansModal(false)}>
          <div className="modal-content plans-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⭐ Choose Your Plan</h3>
              <button className="close-btn" onClick={() => setShowPlansModal(false)}>×</button>
            </div>
            
            <div className="plans-grid">
              {Array.isArray(availablePlans) && availablePlans.map(plan => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <h4>{plan.planName}</h4>
                    <div className="plan-price">₹{plan.price}<span>/month</span></div>
                  </div>
                  
                  <div className="plan-features">
                    <div className="feature">✅ {plan.freeCancellationsPerMonth} free cancellations/month</div>
                    <div className="feature">{plan.chatAccess ? '✅' : '❌'} Chat access</div>
                    <div className="feature">{plan.voiceAccess ? '✅' : '❌'} Voice access</div>
                    <div className="feature">{plan.manualDriverSelection ? '✅' : '❌'} Manual driver selection</div>
                    {plan.earlyFeatureAccess && <div className="feature">✅ Early feature access</div>}
                    {plan.personalizedSupport && <div className="feature">✅ Personalized support</div>}
                  </div>
                  
                  <button className="select-plan-btn" onClick={() => selectPlan(plan)}>
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="modal-overlay" onClick={() => setShowChangePinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Change PIN</h3>
              <button className="close-btn" onClick={() => {
                setShowChangePinModal(false);
                setPinFormData({ currentPin: '', newPin: '', confirmPin: '' });
                setPinError('');
              }}>×</button>
            </div>
            
            <form onSubmit={handleChangePin} className="edit-form">
              {pinError && (
                <div className="error-message">
                  {pinError}
                </div>
              )}
              
              <div className="form-group">
                <label>Current PIN *</label>
                <input
                  type="password"
                  value={pinFormData.currentPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinFormData(prev => ({...prev, currentPin: value}));
                    setPinError('');
                  }}
                  placeholder="Enter current 4-digit PIN"
                  maxLength={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New PIN *</label>
                <input
                  type="password"
                  value={pinFormData.newPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinFormData(prev => ({...prev, newPin: value}));
                    setPinError('');
                  }}
                  placeholder="Enter new 4-digit PIN"
                  maxLength={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New PIN *</label>
                <input
                  type="password"
                  value={pinFormData.confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinFormData(prev => ({...prev, confirmPin: value}));
                    setPinError('');
                  }}
                  placeholder="Confirm new 4-digit PIN"
                  maxLength={4}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowChangePinModal(false);
                  setPinFormData({ currentPin: '', newPin: '', confirmPin: '' });
                  setPinError('');
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isLoading}>
                  {isLoading ? 'Changing...' : 'Change PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .dashboard-more {
          max-width: 800px;
          margin: 0 auto;
        }

        .more-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .more-header h2 {
          color: #003B71;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .more-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .tab-btn.active {
          background: #F28C00;
          color: white;
          box-shadow: 0 2px 8px rgba(242, 140, 0, 0.2);
        }

        .tab-btn:not(.active):hover {
          color: #003B71;
          background: rgba(0, 59, 113, 0.05);
        }

        .tab-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          min-height: 500px;
          border: 1px solid #f1f5f9;
        }

        .tab-content {
          padding: 2rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Subscription Tab Styles */
        .current-plan-card {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 24px rgba(242, 140, 0, 0.2);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .plan-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
        }

        .plan-price {
          font-size: 1rem;
          color: white;
          font-weight: 600;
        }

        .plan-status {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .plan-validity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .validity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .validity-label {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .validity-date {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .days-remaining {
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
        }

        .plan-features {
          margin-bottom: 1rem;
        }

        .plan-features h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-features li {
          padding: 0.25rem 0;
          font-size: 0.8rem;
        }

        .plan-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .action-btn.primary {
          background: white;
          color: #F28C00;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .subscription-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .subscription-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .subscription-action-btn:hover {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          border-color: #F28C00;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.25);
        }

        .subscription-action-btn .action-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .subscription-action-btn:hover .action-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .no-subscription {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border-radius: 16px;
          border: 2px solid #F28C00;
        }

        .no-sub-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #F28C00;
        }

        .no-subscription h3 {
          color: #F28C00;
          margin-bottom: 0.5rem;
        }

        .no-subscription p {
          color: #ea580c;
        }

        /* Notifications Tab Styles */
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .notifications-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: #F58220;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .notifications-list {
          margin-bottom: 2rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }

        .notification-item.unread {
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .notification-content p {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .notification-settings {
          border-top: 1px solid #f3f4f6;
          padding-top: 1.5rem;
        }

        .notification-settings h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          font-size: 0.9rem;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #F58220;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        /* Profile Tab Styles */
        .profile-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: #F28C00;
          color: white;
          border-radius: 20px;
          margin-bottom: 2rem;
          box-shadow: 0 12px 32px rgba(242, 140, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .profile-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          50% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }

        .profile-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 90px;
          height: 90px;
          background: white;
          border: 4px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 700;
          color: #F28C00;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          position: relative;
          z-index: 2;
        }

        .profile-info {
          position: relative;
          z-index: 2;
        }

        .profile-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.4rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .profile-info p {
          margin: 0 0 0.75rem 0;
          opacity: 0.9;
          font-size: 1rem;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-badge.verified {
          background: white;
          color: #10b981;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .profile-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #6b7280;
        }

        .info-value {
          color: #1f2937;
          font-weight: 500;
        }

        .profile-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .profile-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .profile-action-btn:hover {
          background: linear-gradient(135deg, #F28C00 0%, #e6741d 100%);
          border-color: #F28C00;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 140, 0, 0.25);
        }

        .profile-action-btn.logout {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-color: #fca5a5;
          color: #dc2626;
        }

        .profile-action-btn.logout:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          border-color: #dc2626;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
        }

        .action-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .profile-action-btn:hover .action-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .empty-notifications {
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .profile-loading {
          text-align: center;
          padding: 2rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.2rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f1f5f9;
        }

        .edit-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #F28C00;
          box-shadow: 0 0 0 3px rgba(242, 140, 0, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .btn-save {
          padding: 0.75rem 1.5rem;
          background: #F28C00;
          border: 2px solid #F28C00;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-save:hover:not(:disabled) {
          background: #e6741d;
          border-color: #e6741d;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .plans-modal {
          max-width: 900px;
          max-height: 80vh;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .plan-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: #F28C00;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(242, 140, 0, 0.15);
        }

        .plan-header h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.2rem;
        }

        .plan-price {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .plan-price span {
          font-size: 0.9rem;
          color: white;
        }

        .plan-features {
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .feature {
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .feature:last-child {
          border-bottom: none;
        }

        .select-plan-btn {
          width: 100%;
          padding: 0.75rem;
          background: #F28C00;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-plan-btn:hover {
          background: #e6741d;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .tab-navigation {
            padding: 0.125rem;
          }
          
          .tab-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          
          .tab-content {
            padding: 1rem;
          }
          
          .plan-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .plan-validity {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
          
          .plan-actions {
            flex-direction: column;
          }
          
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          
          .subscription-actions,
          .profile-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};