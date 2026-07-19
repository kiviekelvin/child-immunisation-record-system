import React, { useState } from 'react';
import { User, Shield, Bell, Database, Save } from 'lucide-react';
import { authService } from '../../lib/authService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertModal } from '../ui/Modal';

export function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [profileData, setProfileData] = useState({
    full_name: user.full_name,
    email: user.email,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    vaccination_reminders: true,
    overdue_alerts: true,
    weekly_reports: false,
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.updateProfile({ full_name: profileData.full_name });

      setModalMessage('Profile updated successfully. Refresh the page to see the change reflected everywhere.');
      setShowSuccessModal(true);
    } catch (err) {
      setModalMessage(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);

    try {
      await authService.sendPasswordReset(user.email);
      setModalMessage('Password reset email sent');
      setShowSuccessModal(true);
    } catch (err) {
      setModalMessage(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                disabled
                className="form-input bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact your administrator if needed.
              </p>
            </div>

            <div>
              <label className="form-label">Role</label>
              <div className="mt-1 text-sm text-gray-900 capitalize">
                {user.role.replace('_', ' ')}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-4 py-2"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </button>
          </form>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to be notified about important events.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label htmlFor={key} className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <p className="text-sm text-gray-500">
                      {key === 'email_notifications' && 'Receive general email notifications'}
                      {key === 'vaccination_reminders' && 'Get reminders for upcoming vaccinations'}
                      {key === 'overdue_alerts' && 'Receive alerts for overdue vaccinations'}
                      {key === 'weekly_reports' && 'Get weekly summary reports'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          [key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary px-4 py-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account security and password.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-500">
                    Reset your password to maintain account security
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="btn btn-outline px-4 py-2"
                >
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Reset Password
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Account Created</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Application details and system status.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Version</h4>
                <p className="text-sm text-gray-500">CIRS v1.0.0</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Database Status</h4>
                <p className="text-sm text-green-600">Connected</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Last Backup</h4>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Storage Used</h4>
                <p className="text-sm text-gray-500">2.1 MB</p>
              </div>
            </div>

            {user.role === 'admin' && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h4>
                <div className="space-y-3">
                  <button className="btn btn-outline px-4 py-2 w-full sm:w-auto">
                    Export All Data
                  </button>
                  <button className="btn btn-outline px-4 py-2 w-full sm:w-auto">
                    System Backup
                  </button>
                  <button className="btn btn-outline px-4 py-2 w-full sm:w-auto">
                    View Audit Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={modalMessage}
        type="success"
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={modalMessage}
        type="error"
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences and system settings
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="sm:flex">
          {/* Sidebar */}
          <div className="sm:w-1/4 border-r border-gray-200">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary-50 border-r-2 border-primary-500 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="sm:w-3/4 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}