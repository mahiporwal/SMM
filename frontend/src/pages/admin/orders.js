import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { adminAPI } from '@/services/admin';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data.orders);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Admin access required');
        router.push('/');
      } else {
        setError(err.response?.data?.error || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <Layout title="Order Management - Admin">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Order Management - Admin">
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
    <Layout title="Order Management - Admin">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Monitor and manage all system orders</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'delivering', 'completed', 'failed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({orders.filter(o => status === 'all' || o.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            All Orders ({filteredOrders.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order._id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.userId?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {order.platform}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.engagement.views?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivering' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'failed' ? 'bg-red-100 text-red-800' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${order.deliveryProgress || 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ₹{order.totalPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found for filter: {filter}
          </div>
        )}
      </div>
    </Layout>
  );
}