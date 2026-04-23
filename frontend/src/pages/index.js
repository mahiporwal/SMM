/**
 * DASHBOARD PAGE
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { orderAPI, walletAPI } from '@/services/api';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }
    }

    const fetchData = async () => {
      try {
        const [statsRes, walletRes] = await Promise.all([
          orderAPI.getStats(),
          walletAPI.getSummary(),
        ]);
        
        setStats(statsRes.data.stats);
        setWallet(walletRes.data.summary);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard - SMM Panel">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card: Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-green-600 text-sm mt-2">
            {stats?.completedOrders || 0} completed
          </div>
        </div>

        {/* Card: Wallet Balance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Wallet Balance</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            ₹{wallet?.balance?.toFixed(2) || '0.00'}
          </div>
          <div className="text-blue-600 text-sm mt-2">
            Total spent: ₹{wallet?.totalSpent?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Card: Total Views */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Views Delivered</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.totalViewsDelivered?.toLocaleString() || 0}
          </div>
          <div className="text-purple-600 text-sm mt-2">
            Total engagement delivered
          </div>
        </div>

        {/* Card: Safety Score */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Safety Score</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.averageSafetyScore || 0}/100
          </div>
          <div className="text-orange-600 text-sm mt-2">
            Average delivery safety
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/create-order" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center block">
            Create New Order
          </Link>
          <Link href="/add-funds" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center block">
            Add Funds
          </Link>
          <Link href="/orders" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center block">
            View Orders
          </Link>
        </div>
      </div>
    </Layout>
  );
}
