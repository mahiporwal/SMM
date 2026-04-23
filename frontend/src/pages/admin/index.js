import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { adminAPI } from '@/services/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await adminAPI.getSystemStats();
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Admin access required');
          router.push('/');
        } else {
          setError(err.response?.data?.error || 'Failed to load admin data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <Layout title="Admin Dashboard - SMM Panel">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading admin dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard - SMM Panel">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard - SMM Panel">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your SMM panel system</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.totalUsers || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.totalOrders || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Completed Orders</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.completedOrders || 0}
          </div>
          <div className="text-green-600 text-sm mt-2">
            {stats?.completionRate || 0}% success rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            ₹{stats?.totalRevenue?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <a href="/admin/users" className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition text-center block">
          <div className="text-2xl font-bold mb-2">👥</div>
          <div className="font-semibold">Manage Users</div>
          <div className="text-sm opacity-90">View and edit user accounts</div>
        </a>

        <a href="/admin/orders" className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition text-center block">
          <div className="text-2xl font-bold mb-2">📋</div>
          <div className="font-semibold">All Orders</div>
          <div className="text-sm opacity-90">Monitor all system orders</div>
        </a>

        <a href="/admin/settings" className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition text-center block">
          <div className="text-2xl font-bold mb-2">⚙️</div>
          <div className="font-semibold">System Settings</div>
          <div className="text-sm opacity-90">Configure panel settings</div>
        </a>

        <a href="/admin/analytics" className="bg-orange-600 text-white rounded-lg p-6 hover:bg-orange-700 transition text-center block">
          <div className="text-2xl font-bold mb-2">📊</div>
          <div className="font-semibold">Analytics</div>
          <div className="text-sm opacity-90">View detailed reports</div>
        </a>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.userId?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {order.platform}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
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
        {recentOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders yet
          </div>
        )}
      </div>
    </Layout>
  );
}