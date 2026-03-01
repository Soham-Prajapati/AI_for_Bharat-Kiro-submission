'use client';

import { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Listing } from '@/types/api';
import apiClient from '@/services/api';

interface CheckoutModalProps {
  listing: Listing;
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'stripe' | 'razorpay' | 'paypal';

export default function CheckoutModal({ listing, userId, onClose, onComplete }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePurchase = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Validate card details
      if (!cardNumber || !expiryDate || !cvv) {
        setError('Please fill in all payment details');
        setProcessing(false);
        return;
      }

      // Call purchase API
      const response = await apiClient.marketplace.purchase({
        listingId: listing.id,
        userId,
        paymentMethod,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div
          className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
                <p className="text-gray-400">
                  Your download will start shortly. Check your purchase history for details.
                </p>
              </div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
                      {listing.type === 'template' && '📄'}
                      {listing.type === 'script' && '📝'}
                      {listing.type === 'thumbnail' && '🖼️'}
                      {listing.type === 'music' && '🎵'}
                      {listing.type === 'effect' && '✨'}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{listing.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {listing.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Price</span>
                      <span>${listing.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Processing Fee</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                      <span>Total</span>
                      <span>${listing.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'stripe'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <div className="text-sm font-medium text-white">Stripe</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'razorpay'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <div className="text-sm font-medium text-white">Razorpay</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm font-medium text-white">PayPal</div>
                      </div>
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mb-6 p-4 bg-gray-800 rounded-lg flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    disabled={processing}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={processing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Complete Purchase
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    
  );
}
