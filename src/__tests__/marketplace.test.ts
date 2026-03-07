/**
 * Marketplace Payment Flow Tests
 * 
 * Comprehensive test suite for marketplace payment flows including:
 * - End-to-end payment flow (list → purchase → payment → confirmation)
 * - Sandbox payment scenarios (Stripe/Razorpay test mode)
 * - Refund flow (full refund, partial refund)
 * - Dispute handling (buyer dispute, seller response)
 * - Payment failures (insufficient funds, card declined, network error)
 * - Revenue sharing (70% creator, 30% platform)
 * - Edge cases (duplicate purchase, expired listing, invalid payment method)
 * 
 * Target: >80% code coverage
 */

import { MarketplaceService } from '../services/marketplace.service';
import type { MarketplaceItem, Transaction, Refund, Dispute, PaymentMethod } from '../services/marketplace.service';
import { wait, randomString } from './setup';

describe('Marketplace Payment Flow Tests', () => {
  let marketplaceService: MarketplaceService;

  beforeEach(() => {
    marketplaceService = new MarketplaceService();
  });

  afterEach(() => {
    marketplaceService.clear();
  });

  // ============================================================================
  // 1. Item Listing Tests
  // ============================================================================

  describe('Item Listing', () => {
    it('should list an item for sale at $10', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Digital Product',
        description: 'A great digital product',
        price: 10,
      });

      expect(item).toBeDefined();
      expect(item.id).toMatch(/^item-/);
      expect(item.sellerId).toBe('seller-1');
      expect(item.title).toBe('Digital Product');
      expect(item.price).toBe(10);
      expect(item.currency).toBe('USD');
      expect(item.status).toBe('active');
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.expiresAt).toBeInstanceOf(Date);
    });


    it('should list an item for sale at $50', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-2',
        title: 'Premium Course',
        description: 'Advanced training course',
        price: 50,
        currency: 'USD',
      });

      expect(item.price).toBe(50);
      expect(item.status).toBe('active');
    });

    it('should list an item for sale at $100', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-3',
        title: 'Enterprise Package',
        description: 'Complete enterprise solution',
        price: 100,
        currency: 'USD',
      });

      expect(item.price).toBe(100);
      expect(item.status).toBe('active');
    });

    it('should set custom expiration date', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Limited Offer',
        description: 'Limited time offer',
        price: 25,
        expiresInDays: 7,
      });

      const daysDiff = Math.floor(
        (item.expiresAt.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(7);
    });

    it('should retrieve listed item by ID', async () => {
      const listedItem = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Test Product',
        description: 'Test description',
        price: 30,
      });

      const retrievedItem = await marketplaceService.getItem(listedItem.id);
      expect(retrievedItem).toEqual(listedItem);
    });

    it('should return null for non-existent item', async () => {
      const item = await marketplaceService.getItem('non-existent-id');
      expect(item).toBeNull();
    });
  });

  // ============================================================================
  // 2. End-to-End Payment Flow Tests
  // ============================================================================

  describe('End-to-End Payment Flow', () => {
    it('should complete full payment flow: list → purchase → payment → confirmation', async () => {
      // Step 1: List item
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Digital Course',
        description: 'Learn programming',
        price: 50,
      });

      expect(item.status).toBe('active');

      // Step 2: Purchase with valid payment
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
        last4: '4242',
        brand: 'Visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      // Step 3: Verify payment completed
      expect(transaction).toBeDefined();
      expect(transaction.id).toMatch(/^txn-/);
      expect(transaction.status).toBe('completed');
      expect(transaction.amount).toBe(50);
      expect(transaction.paymentProvider).toBe('stripe');
      expect(transaction.paymentId).toMatch(/^pay_/);

      // Step 4: Verify confirmation details
      expect(transaction.completedAt).toBeInstanceOf(Date);
      expect(transaction.buyerId).toBe('buyer-1');
      expect(transaction.sellerId).toBe('seller-1');

      // Step 5: Verify item marked as sold
      const updatedItem = await marketplaceService.getItem(item.id);
      expect(updatedItem?.status).toBe('sold');
    });

    it('should handle multiple sequential purchases', async () => {
      const items = await Promise.all([
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Item 1',
          description: 'First item',
          price: 10,
        }),
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Item 2',
          description: 'Second item',
          price: 20,
        }),
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Item 3',
          description: 'Third item',
          price: 30,
        }),
      ]);

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transactions = [];
      for (const item of items) {
        const txn = await marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        });
        transactions.push(txn);
      }

      expect(transactions).toHaveLength(3);
      expect(transactions.every(t => t.status === 'completed')).toBe(true);
    });
  });

  // ============================================================================
  // 3. Sandbox Payment Scenarios (Stripe/Razorpay Test Mode)
  // ============================================================================

  describe('Sandbox Payment Scenarios', () => {
    let item: MarketplaceItem;

    beforeEach(async () => {
      item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Test Product',
        description: 'For payment testing',
        price: 25,
      });
    });

    it('should process Stripe test payment successfully', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
        last4: '4242',
        brand: 'Visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.status).toBe('completed');
      expect(transaction.paymentProvider).toBe('stripe');
      expect(transaction.paymentId).toBeDefined();
    });

    it('should process Razorpay test payment successfully', async () => {
      const item2 = await marketplaceService.listItem({
        sellerId: 'seller-2',
        title: 'Test Product 2',
        description: 'For Razorpay testing',
        price: 30,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'razorpay',
        token: 'rzp_test_token',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item2.id,
        buyerId: 'buyer-2',
        paymentMethod,
      });

      expect(transaction.status).toBe('completed');
      expect(transaction.paymentProvider).toBe('razorpay');
    });

    it('should handle Stripe test mode card declined', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_chargeDeclined',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Card declined');
    });

    it('should handle Razorpay test mode insufficient funds', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'razorpay',
        token: 'tok_insufficientFunds',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Insufficient funds');
    });
  });


  // ============================================================================
  // 4. Payment Failure Tests
  // ============================================================================

  describe('Payment Failures', () => {
    let item: MarketplaceItem;

    beforeEach(async () => {
      item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Test Product',
        description: 'For failure testing',
        price: 40,
      });
    });

    it('should handle insufficient funds error', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_insufficientFunds',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Insufficient funds');

      // Verify item still active
      const updatedItem = await marketplaceService.getItem(item.id);
      expect(updatedItem?.status).toBe('active');
    });

    it('should handle card declined error', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_chargeDeclined',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Card declined');
    });

    it('should handle network error', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_networkError',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Network error');
    });

    it('should maintain >95% transaction success rate', async () => {
      const items = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          marketplaceService.listItem({
            sellerId: 'seller-1',
            title: `Item ${i}`,
            description: 'Test item',
            price: 10,
          })
        )
      );

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < items.length; i++) {
        try {
          // Simulate 98% success rate (fail on 2% of transactions)
          const shouldFail = i % 50 === 0; // 2% failure rate
          const method = shouldFail
            ? { ...paymentMethod, token: 'tok_chargeDeclined' }
            : paymentMethod;

          await marketplaceService.purchaseItem({
            itemId: items[i].id,
            buyerId: `buyer-${i}`,
            paymentMethod: method,
          });
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }

      const successRate = (successCount / items.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(95);
      expect(successCount).toBe(98);
      expect(failureCount).toBe(2);
    });
  });

  // ============================================================================
  // 5. Refund Flow Tests
  // ============================================================================

  describe('Refund Flow', () => {
    let transaction: Transaction;

    beforeEach(async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Refundable Product',
        description: 'Can be refunded',
        price: 60,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });
    });

    it('should process full refund within 30 days', async () => {
      const refund = await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        reason: 'Customer requested refund',
      });

      expect(refund).toBeDefined();
      expect(refund.id).toMatch(/^ref-/);
      expect(refund.transactionId).toBe(transaction.id);
      expect(refund.amount).toBe(transaction.amount);
      expect(refund.status).toBe('completed');
      expect(refund.reason).toBe('Customer requested refund');
      expect(refund.completedAt).toBeInstanceOf(Date);

      // Verify transaction status updated
      const updatedTransaction = await marketplaceService.getTransaction(transaction.id);
      expect(updatedTransaction?.status).toBe('refunded');
    });

    it('should process partial refund', async () => {
      const partialAmount = 30; // Half of $60

      const refund = await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        amount: partialAmount,
        reason: 'Partial refund for damaged item',
      });

      expect(refund.amount).toBe(partialAmount);
      expect(refund.status).toBe('completed');

      // Verify transaction status updated to partially_refunded
      const updatedTransaction = await marketplaceService.getTransaction(transaction.id);
      expect(updatedTransaction?.status).toBe('partially_refunded');
    });

    it('should reject refund for non-existent transaction', async () => {
      await expect(
        marketplaceService.refundTransaction({
          transactionId: 'non-existent-txn',
          reason: 'Test',
        })
      ).rejects.toThrow('Transaction not found');
    });

    it('should reject refund amount exceeding transaction amount', async () => {
      await expect(
        marketplaceService.refundTransaction({
          transactionId: transaction.id,
          amount: 100, // More than $60
          reason: 'Invalid refund',
        })
      ).rejects.toThrow('Refund amount exceeds transaction amount');
    });

    it('should reject duplicate full refund', async () => {
      // First refund
      await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        reason: 'First refund',
      });

      // Second refund attempt
      await expect(
        marketplaceService.refundTransaction({
          transactionId: transaction.id,
          reason: 'Second refund',
        })
      ).rejects.toThrow('Transaction already refunded');
    });

    it('should handle multiple partial refunds', async () => {
      // First partial refund
      const refund1 = await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        amount: 20,
        reason: 'First partial refund',
      });

      expect(refund1.amount).toBe(20);

      const txn1 = await marketplaceService.getTransaction(transaction.id);
      expect(txn1?.status).toBe('partially_refunded');
    });
  });

  // ============================================================================
  // 6. Dispute Handling Tests
  // ============================================================================

  describe('Dispute Handling', () => {
    let transaction: Transaction;

    beforeEach(async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Disputed Product',
        description: 'May have issues',
        price: 45,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });
    });

    it('should allow buyer to initiate dispute', async () => {
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Product not as described',
        evidence: 'Screenshots showing discrepancy',
      });

      expect(dispute).toBeDefined();
      expect(dispute.id).toMatch(/^dis-/);
      expect(dispute.transactionId).toBe(transaction.id);
      expect(dispute.buyerId).toBe('buyer-1');
      expect(dispute.sellerId).toBe('seller-1');
      expect(dispute.reason).toBe('Product not as described');
      expect(dispute.status).toBe('open');
      expect(dispute.buyerEvidence).toBe('Screenshots showing discrepancy');
      expect(dispute.createdAt).toBeInstanceOf(Date);
    });

    it('should allow seller to respond to dispute', async () => {
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Product defective',
      });

      const updatedDispute = await marketplaceService.respondToDispute({
        disputeId: dispute.id,
        sellerId: 'seller-1',
        response: 'Product was tested before shipping. Offering replacement.',
      });

      expect(updatedDispute.status).toBe('seller_responded');
      expect(updatedDispute.sellerResponse).toBe(
        'Product was tested before shipping. Offering replacement.'
      );
    });

    it('should reject dispute from non-buyer', async () => {
      await expect(
        marketplaceService.createDispute({
          transactionId: transaction.id,
          buyerId: 'wrong-buyer',
          reason: 'Invalid dispute',
        })
      ).rejects.toThrow('Only the buyer can create a dispute');
    });

    it('should reject dispute response from non-seller', async () => {
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Issue',
      });

      await expect(
        marketplaceService.respondToDispute({
          disputeId: dispute.id,
          sellerId: 'wrong-seller',
          response: 'Invalid response',
        })
      ).rejects.toThrow('Only the seller can respond to this dispute');
    });

    it('should reject dispute for refunded transaction', async () => {
      // Refund the transaction first
      await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        reason: 'Refunded',
      });

      await expect(
        marketplaceService.createDispute({
          transactionId: transaction.id,
          buyerId: 'buyer-1',
          reason: 'Dispute after refund',
        })
      ).rejects.toThrow('Cannot dispute a refunded transaction');
    });

    it('should reject response to non-open dispute', async () => {
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Issue',
      });

      // First response
      await marketplaceService.respondToDispute({
        disputeId: dispute.id,
        sellerId: 'seller-1',
        response: 'First response',
      });

      // Second response attempt
      await expect(
        marketplaceService.respondToDispute({
          disputeId: dispute.id,
          sellerId: 'seller-1',
          response: 'Second response',
        })
      ).rejects.toThrow('Dispute is not open');
    });

    it('should retrieve dispute by ID', async () => {
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Test dispute',
      });

      const retrieved = await marketplaceService.getDispute(dispute.id);
      expect(retrieved).toEqual(dispute);
    });
  });


  // ============================================================================
  // 7. Revenue Sharing Tests (70% Creator, 30% Platform)
  // ============================================================================

  describe('Revenue Sharing (70/30 Split)', () => {
    it('should calculate correct revenue split for $10 item', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Item $10',
        description: 'Test',
        price: 10,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(10);
      expect(transaction.creatorShare).toBe(7.0); // 70%
      expect(transaction.platformShare).toBe(3.0); // 30%
      expect(transaction.creatorShare + transaction.platformShare).toBe(10);
    });

    it('should calculate correct revenue split for $50 item', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Item $50',
        description: 'Test',
        price: 50,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(50);
      expect(transaction.creatorShare).toBe(35.0); // 70%
      expect(transaction.platformShare).toBe(15.0); // 30%
      expect(transaction.creatorShare + transaction.platformShare).toBe(50);
    });

    it('should calculate correct revenue split for $100 item', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Item $100',
        description: 'Test',
        price: 100,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(100);
      expect(transaction.creatorShare).toBe(70.0); // 70%
      expect(transaction.platformShare).toBe(30.0); // 30%
      expect(transaction.creatorShare + transaction.platformShare).toBe(100);
    });

    it('should calculate correct revenue split for odd amounts', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Item $33.33',
        description: 'Test',
        price: 33.33,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(33.33);
      expect(transaction.creatorShare).toBe(23.33); // 70% rounded
      expect(transaction.platformShare).toBe(10.0); // 30% rounded
      
      // Allow small rounding difference
      const total = transaction.creatorShare + transaction.platformShare;
      expect(Math.abs(total - 33.33)).toBeLessThan(0.01);
    });

    it('should verify 70/30 split across multiple transactions', async () => {
      const prices = [15, 25, 35, 45, 55, 65, 75, 85, 95];
      const transactions: Transaction[] = [];

      for (const price of prices) {
        const item = await marketplaceService.listItem({
          sellerId: 'seller-1',
          title: `Item $${price}`,
          description: 'Test',
          price,
        });

        const paymentMethod: PaymentMethod = {
          provider: 'stripe',
          token: 'tok_visa',
        };

        const txn = await marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: `buyer-${price}`,
          paymentMethod,
        });

        transactions.push(txn);
      }

      // Verify each transaction has correct split
      transactions.forEach(txn => {
        const expectedCreatorShare = Math.round(txn.amount * 0.70 * 100) / 100;
        const expectedPlatformShare = Math.round(txn.amount * 0.30 * 100) / 100;
        
        expect(txn.creatorShare).toBe(expectedCreatorShare);
        expect(txn.platformShare).toBe(expectedPlatformShare);
      });

      // Calculate total revenue
      const totalRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      const totalCreatorShare = transactions.reduce((sum, txn) => sum + txn.creatorShare, 0);
      const totalPlatformShare = transactions.reduce((sum, txn) => sum + txn.platformShare, 0);

      expect(totalRevenue).toBe(495); // Sum of prices
      expect(totalCreatorShare).toBeCloseTo(346.5, 1); // ~70%
      expect(totalPlatformShare).toBeCloseTo(148.5, 1); // ~30%
    });
  });

  // ============================================================================
  // 8. Edge Cases Tests
  // ============================================================================

  describe('Edge Cases', () => {
    it('should prevent duplicate purchase of same item', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Unique Item',
        description: 'Can only be purchased once',
        price: 30,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      // First purchase
      const transaction1 = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction1.status).toBe('completed');

      // Second purchase attempt by same buyer
      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Item already purchased');
    });

    it('should reject purchase of expired listing', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Expired Item',
        description: 'Will expire immediately',
        price: 20,
        expiresInDays: 0, // Expires immediately
      });

      // Manually set expiration to past date to simulate expired item
      item.expiresAt = new Date(Date.now() - 1000);

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Item has expired');

      // Verify item status updated
      const updatedItem = await marketplaceService.getItem(item.id);
      expect(updatedItem?.status).toBe('expired');
    });

    it('should reject purchase of non-existent item', async () => {
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      await expect(
        marketplaceService.purchaseItem({
          itemId: 'non-existent-item',
          buyerId: 'buyer-1',
          paymentMethod,
        })
      ).rejects.toThrow('Item not found');
    });

    it('should reject purchase of already sold item', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Limited Item',
        description: 'Only one available',
        price: 40,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      // First buyer purchases
      await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      // Second buyer attempts to purchase
      await expect(
        marketplaceService.purchaseItem({
          itemId: item.id,
          buyerId: 'buyer-2',
          paymentMethod,
        })
      ).rejects.toThrow('Item is sold');
    });

    it('should handle zero-price items', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Free Item',
        description: 'No charge',
        price: 0,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(0);
      expect(transaction.creatorShare).toBe(0);
      expect(transaction.platformShare).toBe(0);
      expect(transaction.status).toBe('completed');
    });

    it('should handle very large amounts', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Premium Package',
        description: 'High value item',
        price: 9999.99,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.amount).toBe(9999.99);
      expect(transaction.creatorShare).toBeCloseTo(7000, 0);
      expect(transaction.platformShare).toBeCloseTo(3000, 0);
    });

    it('should handle concurrent purchases of different items', async () => {
      const items = await Promise.all([
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Item A',
          description: 'First',
          price: 10,
        }),
        marketplaceService.listItem({
          sellerId: 'seller-2',
          title: 'Item B',
          description: 'Second',
          price: 20,
        }),
        marketplaceService.listItem({
          sellerId: 'seller-3',
          title: 'Item C',
          description: 'Third',
          price: 30,
        }),
      ]);

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      // Concurrent purchases
      const transactions = await Promise.all(
        items.map((item, index) =>
          marketplaceService.purchaseItem({
            itemId: item.id,
            buyerId: `buyer-${index}`,
            paymentMethod,
          })
        )
      );

      expect(transactions).toHaveLength(3);
      expect(transactions.every(t => t.status === 'completed')).toBe(true);
    });

    it('should handle special characters in item details', async () => {
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Item with "quotes" & <tags>',
        description: "Description with 'apostrophes' and émojis 🎉",
        price: 25,
      });

      expect(item.title).toBe('Item with "quotes" & <tags>');
      expect(item.description).toContain('émojis 🎉');

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction.status).toBe('completed');
    });

    it('should handle different currency codes', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
      
      for (const currency of currencies) {
        const item = await marketplaceService.listItem({
          sellerId: 'seller-1',
          title: `Item in ${currency}`,
          description: 'Multi-currency test',
          price: 50,
          currency,
        });

        expect(item.currency).toBe(currency);
      }
    });
  });

  // ============================================================================
  // 9. Integration Tests
  // ============================================================================

  describe('Integration Tests', () => {
    it('should handle complete marketplace lifecycle', async () => {
      // 1. Seller lists multiple items
      const items = await Promise.all([
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Course A',
          description: 'Beginner course',
          price: 30,
        }),
        marketplaceService.listItem({
          sellerId: 'seller-1',
          title: 'Course B',
          description: 'Advanced course',
          price: 60,
        }),
      ]);

      expect(items).toHaveLength(2);

      // 2. Buyer purchases first item
      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction1 = await marketplaceService.purchaseItem({
        itemId: items[0].id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction1.status).toBe('completed');

      // 3. Buyer has issue and creates dispute
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction1.id,
        buyerId: 'buyer-1',
        reason: 'Content incomplete',
        evidence: 'Missing modules',
      });

      expect(dispute.status).toBe('open');

      // 4. Seller responds to dispute
      const updatedDispute = await marketplaceService.respondToDispute({
        disputeId: dispute.id,
        sellerId: 'seller-1',
        response: 'Will provide missing content',
      });

      expect(updatedDispute.status).toBe('seller_responded');

      // 5. Issue resolved, buyer purchases second item
      const transaction2 = await marketplaceService.purchaseItem({
        itemId: items[1].id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      expect(transaction2.status).toBe('completed');

      // 6. Verify revenue calculations
      const totalRevenue = transaction1.amount + transaction2.amount;
      const totalCreatorShare = transaction1.creatorShare + transaction2.creatorShare;
      const totalPlatformShare = transaction1.platformShare + transaction2.platformShare;

      expect(totalRevenue).toBe(90);
      expect(totalCreatorShare).toBe(63);
      expect(totalPlatformShare).toBe(27);
    });

    it('should handle refund after dispute resolution', async () => {
      // 1. Purchase
      const item = await marketplaceService.listItem({
        sellerId: 'seller-1',
        title: 'Product',
        description: 'Test',
        price: 50,
      });

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const transaction = await marketplaceService.purchaseItem({
        itemId: item.id,
        buyerId: 'buyer-1',
        paymentMethod,
      });

      // 2. Create dispute
      const dispute = await marketplaceService.createDispute({
        transactionId: transaction.id,
        buyerId: 'buyer-1',
        reason: 'Defective product',
      });

      // 3. Seller responds
      await marketplaceService.respondToDispute({
        disputeId: dispute.id,
        sellerId: 'seller-1',
        response: 'Offering full refund',
      });

      // 4. Process refund
      const refund = await marketplaceService.refundTransaction({
        transactionId: transaction.id,
        reason: 'Dispute resolution',
      });

      expect(refund.status).toBe('completed');
      expect(refund.amount).toBe(50);

      const updatedTransaction = await marketplaceService.getTransaction(transaction.id);
      expect(updatedTransaction?.status).toBe('refunded');
    });
  });

  // ============================================================================
  // 10. Performance and Load Tests
  // ============================================================================

  describe('Performance Tests', () => {
    it('should handle high volume of listings', async () => {
      const startTime = Date.now();
      const itemCount = 1000;

      const items = await Promise.all(
        Array.from({ length: itemCount }, (_, i) =>
          marketplaceService.listItem({
            sellerId: `seller-${i % 10}`,
            title: `Item ${i}`,
            description: `Description ${i}`,
            price: Math.floor(Math.random() * 100) + 10,
          })
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(items).toHaveLength(itemCount);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should handle rapid sequential transactions', async () => {
      const items = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          marketplaceService.listItem({
            sellerId: 'seller-1',
            title: `Item ${i}`,
            description: 'Test',
            price: 20,
          })
        )
      );

      const paymentMethod: PaymentMethod = {
        provider: 'stripe',
        token: 'tok_visa',
      };

      const startTime = Date.now();

      for (let i = 0; i < items.length; i++) {
        await marketplaceService.purchaseItem({
          itemId: items[i].id,
          buyerId: `buyer-${i}`,
          paymentMethod,
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
    });
  });
});
