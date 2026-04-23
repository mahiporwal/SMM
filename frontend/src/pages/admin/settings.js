import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { adminAPI } from '@/services/admin';

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    systemName: 'SMM Panel',
    maintenanceMode: false,
    maxOrdersPerUser: 10,
    defaultCurrency: 'INR',
    supportEmail: 'support@smm-panel.com',
    telegramBotToken: '',
    telegramChatId: '',
    emailNotifications: true,
    smsNotifications: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSystemSettings();
      setSettings({ ...settings, ...response.data.settings });
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Admin access required');
        router.push('/');
      } else {
        setError(err.response?.data?.error || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSystemSettings(settings);
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Layout title="System Settings - Admin">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="System Settings - Admin">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Settings - Admin">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and preferences</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleInputChange('systemName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Orders Per User
              </label>
              <input
                type="number"
                value={settings.maxOrdersPerUser}
                onChange={(e) => handleInputChange('maxOrdersPerUser', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Maintenance Mode */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Enable Maintenance Mode
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                When enabled, users will see a maintenance message and cannot place new orders
              </p>
            </div>

            {/* Notification Settings */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                  SMS Notifications
                </label>
              </div>
            </div>

            {/* Telegram Bot Settings */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Telegram Bot Settings</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token
              </label>
              <input
                type="password"
                value={settings.telegramBotToken}
                onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Telegram bot token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chat ID
              </label>
              <input
                type="text"
                value={settings.telegramChatId}
                onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Telegram chat ID"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}