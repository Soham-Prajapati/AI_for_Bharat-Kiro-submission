'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { Transaction } from '@/types/api';

interface PurchaseHistoryProps {
  userId: string;
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    listingId: 'listing_001',
    userId: 'user_123',
    amount: 29.99,
    status: 'completed',
    paymentMethod: 'stripe',
    purchasedAt: '2026-02-28T10:30:00Z',
  },
  {
    id: 'txn_002',
    listingId: 'listing_002',
    userId: 'user_123',
    amount: 19.99,
    status: 'completed',
    paymentMethod: 'razorpay',
    purchasedAt: '2026-02-25T14:15:00Z',
  },
  {
    id: 'txn_003',
    listingId: 'listing_003',
    userId: 'user_123',
    amount: 39.99,
    status: 'completed',
    paymentMethod: 'paypal',
    purchasedAt: '2026-02-20T09:45:00Z',
  },
];

export default function PurchaseHistory({ userId }: PurchaseHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, [userId]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.marketplace.getPurchases(userId);
      // setTransactions(response.transactions);
      
      // Mock data for now
      setTimeout(() => {
        setTransactions(mockTransactions);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      setLoading(false);
    }
  };

  const handleDownload = (transactionId: string) => {
    // TODO: Implement download logic
    console.log('Downloading transaction:', transactionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const totalSpent = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30"
        >
          <p className="text-purple-300 text-sm mb-1">Total Purchases</p>
          <p className="text-3xl font-bold text-white">{transactions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30"
        >
          <p className="text-green-300 text-sm mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-white">${totalSpent.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30"
        >
          <p className="text-blue-300 text-sm mb-1">This Month</p>
          <p className="text-3xl font-bold text-white">
            {transactions.filter((t) => {
              const date = new Date(t.purchasedAt);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </motion.div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No purchases yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Browse the marketplace to find templates, scripts, and more
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      Transaction #{transaction.id.slice(-8)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(transaction.purchasedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="capitalize">{transaction.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-2">
                    ${transaction.amount.toFixed(2)}
                  </div>
                  {transaction.status === 'completed' && (
                    <button
                      onClick={() => handleDownload(transaction.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {transaction.status === 'failed' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">
                    Payment failed. Please try again or contact support.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
