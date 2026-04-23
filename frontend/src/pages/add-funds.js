import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { walletAPI } from '@/services/api';

export default function AddFundsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await walletAPI.deposit({
        amount: parseFloat(amount),
        method,
        reference: `deposit_${Date.now()}`
      });

      setSuccess(`Successfully added ₹${amount} to your wallet!`);
      setAmount('');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Funds - SMM Panel">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Add Funds to Wallet</h1>

        {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded">{success}</div>}
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="10"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="100.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Payment Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Minimum deposit: ₹10</li>
            <li>• Instant processing for cards</li>
            <li>• Bank transfers may take 1-2 hours</li>
            <li>• All payments are secure and encrypted</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
