/**
 * Product Recommendation Service
 * AI-powered product matching and recommendations
 */

import axios from 'axios';

class ProductRecommendationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Get AI-powered product recommendations based on user preferences
   * @param {Object} preferences - User preferences and context
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendations(preferences = {}) {
    try {
      const response = await this.client.post('/recommendations', {
        userId: preferences.userId,
        preferences: {
          brands: preferences.brands || [],
          categories: preferences.categories || [],
          priceRange: preferences.priceRange || { min: 0, max: 1000 },
          sizes: preferences.sizes || [],
          colors: preferences.colors || [],
          styles: preferences.styles || []
        },
        context: {
          cartItems: preferences.cartItems || [],
          recentViews: preferences.recentViews || [],
          purchaseHistory: preferences.purchaseHistory || []
        }
      });

      return response.data.recommendations;

    } catch (error) {
      console.error('Recommendation API Error:', error);
      return this.getFallbackRecommendations(preferences);
    }
  }

  /**
   * Get visual similarity recommendations based on image analysis
   * @param {Object} imageAnalysis - Results from image analysis
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Visually similar products
   */
  async getVisualRecommendations(imageAnalysis, filters = {}) {
    try {
      const response = await this.client.post('/visual-search', {
        analysis: imageAnalysis,
        filters: {
          brands: filters.brands || [],
          categories: filters.categories || [],
          priceRange: filters.priceRange || { min: 0, max: 1000 },
          inStock: filters.inStock !== false
        }
      });

      return response.data.products;

    } catch (error) {
      console.error('Visual Search API Error:', error);
      return this.getFallbackVisualRecommendations(imageAnalysis);
    }
  }

  /**
   * Get personalized outfit recommendations
   * @param {Object} outfitRequest - Outfit requirements
   * @returns {Promise<Object>} Complete outfit recommendations
   */
  async getOutfitRecommendations(outfitRequest) {
    try {
      const response = await this.client.post('/outfit-recommendations', {
        occasion: outfitRequest.occasion,
        style: outfitRequest.style,
        budget: outfitRequest.budget,
        preferences: outfitRequest.preferences,
        existingItems: outfitRequest.existingItems || []
      });

      return response.data.outfits;

    } catch (error) {
      console.error('Outfit API Error:', error);
      return this.getFallbackOutfitRecommendations(outfitRequest);
    }
  }

  /**
   * Search products with AI-enhanced query understanding
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Search results with AI insights
   */
  async searchProducts(query, filters = {}) {
    try {
      const response = await this.client.post('/search', {
        query,
        filters: {
          category: filters.category,
          brand: filters.brand,
          priceRange: filters.priceRange,
          size: filters.size,
          color: filters.color,
          inStock: filters.inStock !== false
        },
        aiEnhancement: true
      });

      return {
        products: response.data.products,
        suggestions: response.data.suggestions,
        insights: response.data.insights
      };

    } catch (error) {
      console.error('Search API Error:', error);
      return this.getFallbackSearchResults(query, filters);
    }
  }

  /**
   * Get product details with AI-generated insights
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product details with AI insights
   */
  async getProductDetails(productId) {
    try {
      const response = await this.client.get(`/products/${productId}/ai-insights`);
      
      return {
        product: response.data.product,
        insights: response.data.insights,
        recommendations: response.data.recommendations,
        stylingTips: response.data.stylingTips
      };

    } catch (error) {
      console.error('Product Details API Error:', error);
      return this.getFallbackProductDetails(productId);
    }
  }

  /**
   * Get size recommendations using AI
   * @param {Object} sizeRequest - Size recommendation request
   * @returns {Promise<Object>} Size recommendations
   */
  async getSizeRecommendations(sizeRequest) {
    try {
      const response = await this.client.post('/size-recommendations', {
        productId: sizeRequest.productId,
        brand: sizeRequest.brand,
        category: sizeRequest.category,
        userMeasurements: sizeRequest.userMeasurements,
        fitPreference: sizeRequest.fitPreference,
        previousPurchases: sizeRequest.previousPurchases || []
      });

      return response.data.recommendations;

    } catch (error) {
      console.error('Size API Error:', error);
      return this.getFallbackSizeRecommendations(sizeRequest);
    }
  }

  /**
   * Fallback recommendations when API is unavailable
   */
  getFallbackRecommendations(preferences) {
    const mockProducts = [
      {
        id: 'nike-air-max-270',
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 150,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
        category: 'sneakers',
        colors: ['black', 'white'],
        sizes: ['8', '9', '10', '11'],
        inStock: true,
        rating: 4.5
      },
      {
        id: 'adidas-ultraboost-22',
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        price: 180,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
        category: 'sneakers',
        colors: ['white', 'black'],
        sizes: ['8', '9', '10', '11'],
        inStock: true,
        rating: 4.7
      }
    ];

    return mockProducts.filter(product => {
      if (preferences.brands?.length > 0) {
        return preferences.brands.includes(product.brand.toLowerCase());
      }
      if (preferences.categories?.length > 0) {
        return preferences.categories.includes(product.category);
      }
      return true;
    });
  }

  /**
   * Fallback visual recommendations
   */
  getFallbackVisualRecommendations(imageAnalysis) {
    return [
      {
        id: 'nike-air-force-1',
        name: 'Nike Air Force 1',
        brand: 'Nike',
        price: 90,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
        similarity: 0.85,
        reason: 'Similar white sneaker style'
      },
      {
        id: 'adidas-stan-smith',
        name: 'Adidas Stan Smith',
        brand: 'Adidas',
        price: 80,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
        similarity: 0.78,
        reason: 'Classic white tennis shoe'
      }
    ];
  }

  /**
   * Fallback outfit recommendations
   */
  getFallbackOutfitRecommendations(outfitRequest) {
    return {
      casual: [
        {
          id: 'nike-tech-fleece-hoodie',
          name: 'Nike Tech Fleece Hoodie',
          price: 80,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop'
        },
        {
          id: 'nike-air-max-270',
          name: 'Nike Air Max 270',
          price: 150,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'
        }
      ],
      formal: [
        {
          id: 'nike-blazer-mid',
          name: 'Nike Blazer Mid',
          price: 100,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'
        }
      ]
    };
  }

  /**
   * Fallback search results
   */
  getFallbackSearchResults(query, filters) {
    return {
      products: this.getFallbackRecommendations({}),
      suggestions: ['Nike shoes', 'Adidas apparel', 'Jordan collection'],
      insights: `Found products matching "${query}" with your preferences`
    };
  }

  /**
   * Fallback product details
   */
  getFallbackProductDetails(productId) {
    return {
      product: {
        id: productId,
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 150,
        description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
        sizes: ['8', '9', '10', '11'],
        colors: ['black', 'white'],
        inStock: true
      },
      insights: 'This shoe is perfect for daily wear and provides excellent comfort.',
      recommendations: ['Nike Air Max 90', 'Adidas Ultraboost 22'],
      stylingTips: 'Pair with casual jeans or athletic wear for a versatile look.'
    };
  }

  /**
   * Fallback size recommendations
   */
  getFallbackSizeRecommendations(sizeRequest) {
    return {
      recommendedSize: '10',
      confidence: 0.85,
      reasoning: 'Based on your previous purchases and brand sizing',
      alternatives: ['9.5', '10.5'],
      fitNotes: 'This brand typically runs true to size'
    };
  }
}

export default new ProductRecommendationService();
