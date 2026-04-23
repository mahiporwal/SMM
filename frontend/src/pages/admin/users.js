import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { adminAPI } from '@/services/admin';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Admin access required');
        router.push('/');
      } else {
        setError(err.response?.data?.error || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId) => {
    try {
      await adminAPI.updateUserRole({ userId, role: newRole });
      setEditingUser(null);
      setNewRole('');
      fetchUsers(); // Refresh the list
      alert('User role updated successfully');
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleAddCredits = async (userId, username) => {
    const amount = prompt(`Add credits to ${username}'s wallet:`);
    if (!amount || isNaN(amount) || amount <= 0) return;

    try {
      const reason = prompt('Reason for credit (optional):') || 'Admin credit';
      await adminAPI.addUserCredits({ userId, amount: parseFloat(amount), reason });
      alert(`Added ₹${amount} to ${username}'s wallet`);
    } catch (err) {
      alert('Failed to add credits');
    }
  };

  if (loading) {
    return (
      <Layout title="User Management - Admin">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading users...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="User Management - Admin">
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
    <Layout title="User Management - Admin">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {editingUser === user._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="provider">Provider</option>
                        </select>
                        <button
                          onClick={() => handleRoleUpdate(user._id)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'provider' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.totalOrdersCount || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user._id);
                          setNewRole(user.role);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleAddCredits(user._id, user.username)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Add Credits
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>
    </Layout>
  );
}