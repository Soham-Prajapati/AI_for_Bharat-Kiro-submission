/**
 * Marketplace UI Test Suite
 * Tests browse, search, filter, and purchase functionality
 * Task 4.1b: Build marketplace UI (Srushti)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketplacePage from '@/app/marketplace/page';
import ListingCard from '@/components/marketplace/ListingCard';
import SearchBar from '@/components/marketplace/SearchBar';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import { Listing, ListingType } from '@/types/api';
import apiClient from '@/services/api';

// Mock API client
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    marketplace: {
      getListings: jest.fn(),
      purchase: jest.fn(),
    },
  },
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Helper function to generate mock listings
function generateMockListings(count: number): Listing[] {
  const types: ListingType[] = ['template', 'script', 'thumbnail', 'music', 'effect'];
  const listings: Listing[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    listings.push({
      id: `listing_${i}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      description: `High-quality ${type} for content creators`,
      price: Math.random() * 100 + 10,
      type,
      userId: `user_${Math.floor(Math.random() * 10)}`,
      status: 'active',
      rating: Math.random() * 2 + 3,
      sales: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
    });
  }

  return listings;
}

describe('Marketplace UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Browse Functionality', () => {
    it('should render marketplace page with header', async () => {
      const mockListings = generateMockListings(10);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText('Marketplace')).toBeInTheDocument();
        expect(screen.getByText('Buy and sell content templates, scripts, and assets')).toBeInTheDocument();
      });
    });

    it('should load and display 100 listings', async () => {
      const mockListings = generateMockListings(100);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 100 of 100 items/i)).toBeInTheDocument();
      });

      // Verify API was called
      expect(apiClient.marketplace.getListings).toHaveBeenCalledTimes(1);
    });

    it('should display loading state while fetching listings', () => {
      (apiClient.marketplace.getListings as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<MarketplacePage />);

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should display empty state when no listings found', async () => {
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: [],
        total: 0,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText('No listings found')).toBeInTheDocument();
      });
    });

    it('should render view mode tabs (Browse, My Purchases, Sell)', async () => {
      const mockListings = generateMockListings(10);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /my purchases/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sell/i })).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter listings by search query', async () => {
      const mockListings = generateMockListings(50);
      mockListings[0].title = 'Unique Template Title';
      
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 50 of 50 items/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: 'Unique' } });

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 50 items/i)).toBeInTheDocument();
        expect(screen.getByText('Search: "Unique"')).toBeInTheDocument();
      });
    });

    it('should clear search query when X button is clicked', async () => {
      const mockListings = generateMockListings(20);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 20 of 20 items/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: '' });
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('should filter by listing type', async () => {
      const mockListings = generateMockListings(50);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 50 of 50 items/i)).toBeInTheDocument();
      });

      // Click on "Templates" filter
      const templateButton = screen.getByRole('button', { name: /📄 templates/i });
      fireEvent.click(templateButton);

      await waitFor(() => {
        // Should show only template listings (1/5 of total)
        const templateCount = mockListings.filter(l => l.type === 'template').length;
        expect(screen.getByText(new RegExp(`Showing ${templateCount} of 50 items`, 'i'))).toBeInTheDocument();
      });
    });

    it('should filter by price range', async () => {
      const mockListings = generateMockListings(50);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 50 of 50 items/i)).toBeInTheDocument();
      });

      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      // Set price range
      const minPriceInput = screen.getByLabelText(/min price/i);
      const maxPriceInput = screen.getByLabelText(/max price/i);

      fireEvent.change(minPriceInput, { target: { value: '20' } });
      fireEvent.change(maxPriceInput, { target: { value: '50' } });

      await waitFor(() => {
        const filteredCount = mockListings.filter(l => l.price >= 20 && l.price <= 50).length;
        expect(screen.getByText(new RegExp(`Showing ${filteredCount} of 50 items`, 'i'))).toBeInTheDocument();
      });
    });

    it('should reset all filters', async () => {
      const mockListings = generateMockListings(30);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 30 of 30 items/i)).toBeInTheDocument();
      });

      // Apply filters
      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      const resetButton = screen.getByRole('button', { name: /reset filters/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText(/Showing 30 of 30 items/i)).toBeInTheDocument();
      });
    });
  });

  describe('ListingCard Component', () => {
    it('should render listing card with all details', () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Premium Template Pack',
        description: 'High-quality templates',
        price: 49.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        rating: 4.8,
        sales: 45,
        createdAt: new Date().toISOString(),
      };

      const mockOnPurchase = jest.fn();

      render(
        <ListingCard listing={mockListing} index={0} onPurchase={mockOnPurchase} />
      );

      expect(screen.getByText('Premium Template Pack')).toBeInTheDocument();
      expect(screen.getByText('High-quality templates')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should call onPurchase when Buy Now button is clicked', () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Listing',
        price: 29.99,
        type: 'script',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const mockOnPurchase = jest.fn();

      render(
        <ListingCard listing={mockListing} index={0} onPurchase={mockOnPurchase} />
      );

      const buyButton = screen.getByRole('button', { name: /buy now/i });
      fireEvent.click(buyButton);

      expect(mockOnPurchase).toHaveBeenCalledWith(mockListing);
    });

    it('should disable Buy Now button for sold listings', () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Sold Listing',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'sold',
        createdAt: new Date().toISOString(),
      };

      const mockOnPurchase = jest.fn();

      render(
        <ListingCard listing={mockListing} index={0} onPurchase={mockOnPurchase} />
      );

      const buyButton = screen.getByRole('button', { name: /unavailable/i });
      expect(buyButton).toBeDisabled();
    });
  });

  describe('Purchase Flow', () => {
    it('should open checkout modal when purchase is initiated', async () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Product',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const mockOnClose = jest.fn();
      const mockOnComplete = jest.fn();

      render(
        <CheckoutModal
          listing={mockListing}
          userId="user_123"
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    it('should validate payment details before purchase', async () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Product',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const mockOnClose = jest.fn();
      const mockOnComplete = jest.fn();

      render(
        <CheckoutModal
          listing={mockListing}
          userId="user_123"
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const purchaseButton = screen.getByRole('button', { name: /complete purchase/i });
      fireEvent.click(purchaseButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all payment details/i)).toBeInTheDocument();
      });
    });

    it('should complete purchase successfully', async () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Product',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      (apiClient.marketplace.purchase as jest.Mock).mockResolvedValue({
        success: true,
        transaction: {
          id: 'txn_1',
          listingId: 'listing_1',
          userId: 'user_123',
          amount: 29.99,
          status: 'completed',
          paymentMethod: 'stripe',
          purchasedAt: new Date().toISOString(),
        },
        downloadUrl: 'https://example.com/download',
      });

      const mockOnClose = jest.fn();
      const mockOnComplete = jest.fn();

      render(
        <CheckoutModal
          listing={mockListing}
          userId="user_123"
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Fill in payment details
      const cardNumberInput = screen.getByPlaceholderText(/1234 5678 9012 3456/i);
      const expiryInput = screen.getByPlaceholderText(/mm\/yy/i);
      const cvvInput = screen.getByPlaceholderText(/123/i);

      fireEvent.change(cardNumberInput, { target: { value: '4242424242424242' } });
      fireEvent.change(expiryInput, { target: { value: '12/25' } });
      fireEvent.change(cvvInput, { target: { value: '123' } });

      const purchaseButton = screen.getByRole('button', { name: /complete purchase/i });
      fireEvent.click(purchaseButton);

      await waitFor(() => {
        expect(screen.getByText('Purchase Successful!')).toBeInTheDocument();
      });

      // Wait for auto-close
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle purchase failure', async () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Product',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      (apiClient.marketplace.purchase as jest.Mock).mockRejectedValue(
        new Error('Payment failed')
      );

      const mockOnClose = jest.fn();
      const mockOnComplete = jest.fn();

      render(
        <CheckoutModal
          listing={mockListing}
          userId="user_123"
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Fill in payment details
      const cardNumberInput = screen.getByPlaceholderText(/1234 5678 9012 3456/i);
      const expiryInput = screen.getByPlaceholderText(/mm\/yy/i);
      const cvvInput = screen.getByPlaceholderText(/123/i);

      fireEvent.change(cardNumberInput, { target: { value: '4242424242424242' } });
      fireEvent.change(expiryInput, { target: { value: '12/25' } });
      fireEvent.change(cvvInput, { target: { value: '123' } });

      const purchaseButton = screen.getByRole('button', { name: /complete purchase/i });
      fireEvent.click(purchaseButton);

      await waitFor(() => {
        expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
      });
    });

    it('should support multiple payment methods', () => {
      const mockListing: Listing = {
        id: 'listing_1',
        title: 'Test Product',
        price: 29.99,
        type: 'template',
        userId: 'user_1',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const mockOnClose = jest.fn();
      const mockOnComplete = jest.fn();

      render(
        <CheckoutModal
          listing={mockListing}
          userId="user_123"
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Stripe')).toBeInTheDocument();
      expect(screen.getByText('Razorpay')).toBeInTheDocument();
      expect(screen.getByText('PayPal')).toBeInTheDocument();
    });
  });

  describe('SearchBar Component', () => {
    it('should render search input and filter button', () => {
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedType: 'all' as const,
        onTypeChange: jest.fn(),
        priceRange: [0, 1000] as [number, number],
        onPriceRangeChange: jest.fn(),
      };

      render(<SearchBar {...mockProps} />);

      expect(screen.getByPlaceholderText(/search templates/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should render all listing type filters', () => {
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedType: 'all' as const,
        onTypeChange: jest.fn(),
        priceRange: [0, 1000] as [number, number],
        onPriceRangeChange: jest.fn(),
      };

      render(<SearchBar {...mockProps} />);

      expect(screen.getByRole('button', { name: /🌟 all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📄 templates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📝 scripts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🖼️ thumbnails/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🎵 music/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✨ effects/i })).toBeInTheDocument();
    });

    it('should toggle advanced filters', () => {
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedType: 'all' as const,
        onTypeChange: jest.fn(),
        priceRange: [0, 1000] as [number, number],
        onPriceRangeChange: jest.fn(),
      };

      render(<SearchBar {...mockProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      expect(screen.getByText('Price Range')).toBeInTheDocument();
      expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle 100+ listings without performance issues', async () => {
      const mockListings = generateMockListings(150);
      (apiClient.marketplace.getListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        total: mockListings.length,
      });

      const startTime = performance.now();
      render(<MarketplacePage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 150 of 150 items/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });
  });
});
