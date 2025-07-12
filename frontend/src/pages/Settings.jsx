import { useState } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { updateUserAttributes, loading } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      matches: true,
      messages: true,
      reminders: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      onlineStatus: true,
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      theme: 'light',
      units: 'metric',
    },
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, this would save to the backend
      console.log('Settings saved:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.');
      return;
    }
    
    try {
      // In a real app, this would delete the user account
      console.log('Account deletion requested');
      alert('Account deletion initiated. You will receive a confirmation email.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: BellIcon,
      settings: [
        {
          key: 'email',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle',
          value: settings.notifications.email,
          onChange: (value) => handleSettingChange('notifications', 'email', value)
        },
        {
          key: 'push',
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
          type: 'toggle',
          value: settings.notifications.push,
          onChange: (value) => handleSettingChange('notifications', 'push', value)
        },
        {
          key: 'matches',
          label: 'New Matches',
          description: 'Get notified when you have new matches',
          type: 'toggle',
          value: settings.notifications.matches,
          onChange: (value) => handleSettingChange('notifications', 'matches', value)
        },
        {
          key: 'messages',
          label: 'Messages',
          description: 'Get notified when you receive messages',
          type: 'toggle',
          value: settings.notifications.messages,
          onChange: (value) => handleSettingChange('notifications', 'messages', value)
        },
        {
          key: 'reminders',
          label: 'Learning Reminders',
          description: 'Get reminded about your learning goals',
          type: 'toggle',
          value: settings.notifications.reminders,
          onChange: (value) => handleSettingChange('notifications', 'reminders', value)
        },
      ]
    },
    {
      title: 'Privacy',
      icon: ShieldCheckIcon,
      settings: [
        {
          key: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Control who can see your profile',
          type: 'select',
          value: settings.privacy.profileVisibility,
          options: [
            { value: 'public', label: 'Public' },
            { value: 'members', label: 'Members Only' },
            { value: 'private', label: 'Private' }
          ],
          onChange: (value) => handleSettingChange('privacy', 'profileVisibility', value)
        },
        {
          key: 'showEmail',
          label: 'Show Email',
          description: 'Display your email address on your profile',
          type: 'toggle',
          value: settings.privacy.showEmail,
          onChange: (value) => handleSettingChange('privacy', 'showEmail', value)
        },
        {
          key: 'showLocation',
          label: 'Show Location',
          description: 'Display your location on your profile',
          type: 'toggle',
          value: settings.privacy.showLocation,
          onChange: (value) => handleSettingChange('privacy', 'showLocation', value)
        },
        {
          key: 'onlineStatus',
          label: 'Online Status',
          description: 'Show when you\'re online',
          type: 'toggle',
          value: settings.privacy.onlineStatus,
          onChange: (value) => handleSettingChange('privacy', 'onlineStatus', value)
        },
      ]
    },
    {
      title: 'Preferences',
      icon: GlobeAltIcon,
      settings: [
        {
          key: 'language',
          label: 'Language',
          description: 'Choose your preferred language',
          type: 'select',
          value: settings.preferences.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ],
          onChange: (value) => handleSettingChange('preferences', 'language', value)
        },
        {
          key: 'timezone',
          label: 'Timezone',
          description: 'Set your timezone for scheduling',
          type: 'select',
          value: settings.preferences.timezone,
          options: [
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Chicago', label: 'Central Time' },
            { value: 'America/Denver', label: 'Mountain Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'GMT' },
            { value: 'Europe/Paris', label: 'Central European Time' }
          ],
          onChange: (value) => handleSettingChange('preferences', 'timezone', value)
        },
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: settings.preferences.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ],
          onChange: (value) => handleSettingChange('preferences', 'theme', value)
        },
      ]
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {settingSections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <section.icon className="h-5 w-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1 pr-4">
                        <div className="font-medium text-gray-900">{setting.label}</div>
                        <div className="text-sm text-gray-500">{setting.description}</div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {setting.type === 'toggle' ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.value}
                              onChange={(e) => setting.onChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        ) : (
                          <select
                            value={setting.value}
                            onChange={(e) => setting.onChange(e.target.value)}
                            className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {setting.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Save Changes</h3>
                <p className="text-sm text-gray-500">Make sure to save your settings before leaving this page.</p>
              </div>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Save Settings
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-red-900">Delete Account</div>
                    <div className="text-sm text-red-600">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-2 inline" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data, matches, and messages will be permanently deleted.
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              To confirm, type <strong>DELETE</strong> in the box below:
            </p>
            
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 