import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API URL - remove trailing slash to prevent /api/api issue
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Mock API call for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    console.log('🔄 fetchProducts thunk called with filters:', filters);
    
    try {
      // Try to fetch from backend first
      console.log('⏳ Attempting to fetch from backend API...');
      const backendResponse = await fetch(`${API_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        console.log('✅ Fetched products from backend:', data.products?.length || 0);
        // Transform backend products to frontend format
        const transformedProducts = (data.products || []).map(product => ({
          id: product._id || product.id,
          _id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          discount: product.discount || 0,
          image: product.image || product.images?.[0],
          images: product.images || [product.image],
          category: product.category,
          subCategory: product.subCategory || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          description: product.description || '',
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          inStock: product.stock > 0 || product.inStock,
          stock: product.stock || 0,
          newProduct: product.newProduct || product.isNew || false,
          isFeatured: product.isFeatured || false,
          tags: product.tags || []
        }));
        console.log('✅ Products transformed and ready:', transformedProducts.length);
        return transformedProducts;
      } else {
        throw new Error('Backend unavailable, using mock data');
      }
    } catch (error) {
      console.log('⚠️ Backend unavailable, using mock products...', error.message);
      
      // Simulate API call
      console.log('⏳ Simulating API call...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📦 Generating mock products...');
      // Mock product data
      const mockProducts = [
        {
          id: 1,
          name: 'Air Jordan 1 Retro High OG',
          brand: 'Nike',
          price: 22100,
          originalPrice: 26000,
          discount: 15,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop'
          ],
          category: 'sneakers',
          sizes: ['7', '8', '9', '10', '11', '12'],
          colors: ['Black', 'White', 'Red', 'Navy', 'Gray'],
          description: 'The Air Jordan 1 Retro High OG brings back the classic silhouette with premium materials and authentic details.',
          rating: 4.8,
          reviews: 1247,
          inStock: true,
          newProduct: true,
          isFeatured: true,
          tags: ['basketball', 'retro', 'og']
        },
        {
          id: 2,
          name: 'Ultraboost 22',
          brand: 'Adidas',
          price: 23400,
          originalPrice: 23400,
          discount: 0,
          image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'
          ],
          category: 'sneakers',
          sizes: ['7', '8', '9', '10', '11', '12'],
          colors: ['White', 'Black', 'Blue', 'Gray', 'Green'],
          description: 'The Ultraboost 22 delivers responsive energy return with every step, featuring our most advanced Boost technology.',
          rating: 4.6,
          reviews: 892,
          inStock: true,
          newProduct: false,
          isFeatured: true,
          tags: ['running', 'boost', 'energy']
        },
        {
          id: 3,
          name: 'Chuck Taylor All Star',
          brand: 'Converse',
          price: 8450,
          originalPrice: 9100,
          discount: 7,
          image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop'
          ],
          category: 'sneakers',
          sizes: ['6', '7', '8', '9', '10', '11'],
          colors: ['White', 'Black', 'Red', 'Navy', 'Brown'],
          description: 'The classic Chuck Taylor All Star canvas sneaker that never goes out of style.',
          rating: 4.4,
          reviews: 2156,
          inStock: true,
          newProduct: false,
          isFeatured: false,
          tags: ['canvas', 'classic', 'casual']
        },
        {
          id: 4,
          name: 'RS-X Reinvention',
          brand: 'Puma',
          price: 15600,
          originalPrice: 18200,
          discount: 14,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop'
          ],
          category: 'sneakers',
          sizes: ['7', '8', '9', '10', '11', '12'],
          colors: ['White', 'Black', 'Red', 'Gray', 'Navy'],
          description: 'The RS-X Reinvention combines retro styling with modern comfort and performance.',
          rating: 4.3,
          reviews: 543,
          inStock: true,
          newProduct: true,
          isFeatured: false,
          tags: ['retro', 'comfort', 'style']
        },
        {
          id: 5,
          name: 'Nike Dri-FIT T-Shirt',
          brand: 'Nike',
          price: 4550,
          originalPrice: 5200,
          discount: 12,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop'
          ],
          category: 'apparel',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Black', 'White', 'Navy', 'Red', 'Gray'],
          description: 'Lightweight, breathable Dri-FIT technology keeps you cool and dry during workouts.',
          rating: 4.5,
          reviews: 678,
          inStock: true,
          newProduct: false,
          isFeatured: true,
          tags: ['athletic', 'moisture-wicking', 'comfort']
        },
        {
          id: 6,
          name: 'Adidas Originals Hoodie',
          brand: 'Adidas',
          price: 11050,
          originalPrice: 13000,
          discount: 15,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
          ],
          category: 'apparel',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Gray', 'Navy', 'Charcoal'],
          description: 'Classic three-stripe design with premium cotton blend for ultimate comfort.',
          rating: 4.7,
          reviews: 432,
          inStock: true,
          newProduct: true,
          isFeatured: false,
          tags: ['casual', 'comfort', 'classic']
        },
        {
          id: 7,
          name: 'Nike Air Max 270',
          brand: 'Nike',
          price: 19500,
          originalPrice: 19500,
          discount: 0,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'
          ],
          category: 'sneakers',
          sizes: ['7', '8', '9', '10', '11', '12'],
          colors: ['White', 'Black', 'Blue', 'Gray', 'Red'],
          description: 'The Air Max 270 delivers all-day comfort with the largest Air Max unit ever.',
          rating: 4.6,
          reviews: 1567,
          inStock: false,
          newProduct: false,
          isFeatured: true,
          tags: ['air-max', 'comfort', 'lifestyle']
        },
        {
          id: 8,
          name: 'Nike Backpack',
          brand: 'Nike',
          price: 5850,
          originalPrice: 7150,
          discount: 18,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
          ],
          category: 'accessories',
          sizes: ['One Size'],
          colors: ['Black', 'Navy', 'Gray', 'Charcoal', 'Brown'],
          description: 'Durable backpack with multiple compartments for all your essentials.',
          rating: 4.4,
          reviews: 234,
          inStock: true,
          newProduct: false,
          isFeatured: false,
          tags: ['durable', 'storage', 'travel']
        },
        {
          id: 9,
          name: 'Jordan Brand Hoodie',
          brand: 'Jordan',
          price: 12500,
          originalPrice: 15000,
          discount: 16,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'
          ],
          category: 'apparel',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Black', 'Red', 'White', 'Navy', 'Gray'],
          description: 'Premium fleece hoodie with Jumpman branding and iconic Jordan design elements.',
          rating: 4.9,
          reviews: 892,
          inStock: true,
          newProduct: true,
          isFeatured: true,
          tags: ['jordan', 'premium', 'brand']
        },
      {
        id: 10,
        name: 'Nike Air Force 1',
        brand: 'Nike',
        price: 12700,
        originalPrice: 15000,
        discount: 15,
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc0379?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1600185365483-26d7a4cc0379?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'
        ],
        category: 'sneakers',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['White', 'Black', 'Triple White', 'All-Star', 'Gum'],
        description: 'The iconic Air Force 1 that started it all. Timeless design with premium materials.',
        rating: 4.7,
        reviews: 3456,
        inStock: true,
        newProduct: true,
        isFeatured: true,
        tags: ['classic', 'iconic', 'basketball']
      },
      {
        id: 11,
        name: 'Adidas Stan Smith',
        brand: 'Adidas',
        price: 8900,
        originalPrice: 9500,
        discount: 6,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
        ],
        category: 'sneakers',
        sizes: ['6', '7', '8', '9', '10', '11', '12'],
        colors: ['White', 'Green', 'Black', 'Gold', 'Pink'],
        description: 'The classic minimalist design that influenced tennis and lifestyle footwear.',
        rating: 4.5,
        reviews: 2134,
        inStock: true,
        newProduct: false,
        isFeatured: true,
        tags: ['tennis', 'minimalist', 'classic']
      },
      {
        id: 12,
        name: 'Puma Suede Classic',
        brand: 'Puma',
        price: 7800,
        originalPrice: 8500,
        discount: 8,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop'
        ],
        category: 'sneakers',
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Black', 'White', 'Red', 'Blue', 'Gray'],
        description: 'Authentic Puma Suede with Formstripe logo. Classic basketball heritage.',
        rating: 4.4,
        reviews: 876,
        inStock: true,
        newProduct: false,
        isFeatured: false,
        tags: ['basketball', 'classic', 'retro']
      },
      {
        id: 13,
        name: 'Nike Tech Fleece Pants',
        brand: 'Nike',
        price: 11500,
        originalPrice: 13000,
        discount: 11,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
        ],
        category: 'apparel',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'Navy', 'Charcoal'],
        description: 'Premium Tech Fleece fabric for ultimate comfort and style. Perfect for lounging or training.',
        rating: 4.8,
        reviews: 1234,
        inStock: true,
        newProduct: true,
        isFeatured: false,
        tags: ['comfort', 'tech', 'fleece']
      },
      {
        id: 14,
        name: 'Adidas Trefoil T-Shirt',
        brand: 'Adidas',
        price: 3900,
        originalPrice: 4500,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop'
        ],
        category: 'apparel',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Blue', 'Red', 'Gray'],
        description: 'Classic three-stripe T-shirt with iconic Trefoil logo. 100% cotton blend.',
        rating: 4.6,
        reviews: 567,
        inStock: true,
        newProduct: false,
        isFeatured: true,
        tags: ['casual', 'classic', 'cotton']
      },
      {
        id: 15,
        name: 'Jordan Bucket Hat',
        brand: 'Jordan',
        price: 3200,
        originalPrice: 3800,
        discount: 15,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
        ],
        category: 'accessories',
        sizes: ['One Size'],
        colors: ['Black', 'Red', 'White', 'Navy'],
        description: 'Elevated bucket hat with Jordan branding. Perfect for streetwear style.',
        rating: 4.3,
        reviews: 234,
        inStock: true,
        newProduct: true,
        isFeatured: false,
        tags: ['hat', 'streetwear', 'jordan']
      },
      {
        id: 16,
        name: 'Nike Dri-FIT Shorts',
        brand: 'Nike',
        price: 5200,
        originalPrice: 6000,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop'
        ],
        category: 'apparel',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'Navy', 'Red'],
        description: 'Performance shorts with Dri-FIT technology. Built for movement and comfort.',
        rating: 4.5,
        reviews: 890,
        inStock: true,
        newProduct: false,
        isFeatured: true,
        tags: ['athletic', 'performance', 'comfort']
      }
      ];

      // Apply filters
      let filteredProducts = mockProducts;
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.brand) {
        filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
      }
      
      if (filters.minPrice || filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => {
          if (filters.minPrice && p.price < filters.minPrice) return false;
          if (filters.maxPrice && p.price > filters.maxPrice) return false;
          return true;
        });
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }

      console.log('✅ Products fetched successfully:', filteredProducts.length);
      return filteredProducts;
    }
  }
);

const initialState = {
  products: [],
  filteredProducts: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  },
  sortBy: 'featured', // 'featured', 'price-low', 'price-high', 'newest', 'rating'
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        search: '',
      };
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    applyFilters: (state) => {
      let filtered = [...state.products];
      
      // Apply filters
      if (state.filters.category) {
        filtered = filtered.filter(p => p.category === state.filters.category);
      }
      
      if (state.filters.brand) {
        filtered = filtered.filter(p => p.brand.toLowerCase() === state.filters.brand.toLowerCase());
      }
      
      if (state.filters.minPrice) {
        filtered = filtered.filter(p => p.price >= state.filters.minPrice);
      }
      
      if (state.filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= state.filters.maxPrice);
      }
      
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      switch (state.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => (b.newProduct ? 1 : 0) - (a.newProduct ? 1 : 0));
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default: // 'featured'
          filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      }
      
      state.filteredProducts = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        console.log('⏳ fetchProducts pending...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('✅ fetchProducts fulfilled with:', action.payload?.length, 'products');
        state.isLoading = false;
        state.products = action.payload || [];
        state.filteredProducts = action.payload || [];
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('❌ fetchProducts rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setSortBy, applyFilters } = productSlice.actions;
export default productSlice.reducer;

