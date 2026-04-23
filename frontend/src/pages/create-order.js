import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { orderAPI } from '@/services/api';

export default function CreateOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    platform: 'instagram',
    contentType: 'post',
    url: '',
    views: 1000,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    followers: 0,
    duration: 24
  });
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [price, setPrice] = useState(null);
  const [safety, setSafety] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' }
  ];

  const contentTypes = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
    { value: 'story', label: 'Story' },
    { value: 'video', label: 'Video' },
    { value: 'carousel', label: 'Carousel' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAutoSuggestions = async () => {
    if (!formData.views) return;

    setCalculating(true);
    try {
      const response = await orderAPI.autoSuggest({
        views: formData.views,
        platform: formData.platform,
        contentType: formData.contentType
      });

      setSuggestions(response.data.suggestions);
      // Auto-fill suggested values
      setFormData(prev => ({
        ...prev,
        likes: response.data.suggestions.likes,
        comments: response.data.suggestions.comments,
        shares: response.data.suggestions.shares,
        saves: response.data.suggestions.saves
      }));
    } catch (err) {
      console.error('Error getting suggestions:', err);
    } finally {
      setCalculating(false);
    }
  };

  const calculatePrice = async () => {
    setCalculating(true);
    try {
      const response = await orderAPI.calculatePrice({
        platform: formData.platform,
        engagement: {
          views: formData.views,
          likes: formData.likes,
          comments: formData.comments,
          shares: formData.shares,
          saves: formData.saves,
          followers: formData.followers
        },
        duration: formData.duration
      });

      setPrice(response.data.price);
    } catch (err) {
      console.error('Error calculating price:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await orderAPI.createOrder({
        platform: formData.platform,
        contentType: formData.contentType,
        url: formData.url,
        engagement: {
          views: formData.views,
          likes: formData.likes,
          comments: formData.comments,
          shares: formData.shares,
          saves: formData.saves,
          followers: formData.followers
        },
        duration: formData.duration
      });

      alert('Order created successfully!');
      // Redirect to orders page
      router.push('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.views > 0) {
      getAutoSuggestions();
    }
  }, [formData.views, formData.platform, formData.contentType]);

  useEffect(() => {
    if (formData.views > 0 || formData.likes > 0 || formData.comments > 0) {
      calculatePrice();
    }
  }, [formData.views, formData.likes, formData.comments, formData.shares, formData.saves, formData.followers]);

  return (
    <Layout title="Create Order - SMM Panel">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Order</h1>

        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Platform & Content Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Platform & Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content Type</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Content URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://instagram.com/p/..."
                required
              />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Engagement Metrics</h2>
              <button
                type="button"
                onClick={getAutoSuggestions}
                disabled={calculating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {calculating ? 'Calculating...' : 'Auto Suggest'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Views</label>
                <input
                  type="number"
                  value={formData.views}
                  onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Likes</label>
                <input
                  type="number"
                  value={formData.likes}
                  onChange={(e) => handleInputChange('likes', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Comments</label>
                <input
                  type="number"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Shares</label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => handleInputChange('shares', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Saves</label>
                <input
                  type="number"
                  value={formData.saves}
                  onChange={(e) => handleInputChange('saves', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Followers</label>
                <input
                  type="number"
                  value={formData.followers}
                  onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Delivery Duration (hours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 24)}
                min="1"
                max="168"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price & Safety */}
          {price && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Pricing</h3>
                  <div className="space-y-1 text-sm">
                    <div>Base Price: ₹{price.basePrice?.toFixed(2)}</div>
                    <div>Discount: ₹{price.discountAmount?.toFixed(2)}</div>
                    <div className="font-semibold text-lg">Total: ₹{price.totalPrice?.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Safety Score</h3>
                  <div className="text-sm">
                    {safety ? (
                      <div>
                        Score: {safety.score}/100
                        <div className={`mt-1 px-2 py-1 rounded text-xs ${
                          safety.level === 'very-safe' ? 'bg-green-100 text-green-800' :
                          safety.level === 'safe' ? 'bg-blue-100 text-blue-800' :
                          safety.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {safety.level.replace('-', ' ').toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">Calculating...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !price}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Order...' : `Create Order - ₹${price?.totalPrice?.toFixed(2) || '0.00'}`}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
