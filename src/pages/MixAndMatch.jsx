import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCartAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

// Category tabs configuration
const CATEGORIES = [
  { id: 'tops', label: 'Tops', filter: (p) => 
    p.category?.toLowerCase() === 'apparel' || 
    p.subCategory?.toLowerCase().includes('shirt') ||
    p.subCategory?.toLowerCase().includes('top') ||
    p.name?.toLowerCase().includes('t-shirt') ||
    p.name?.toLowerCase().includes('shirt') ||
    p.name?.toLowerCase().includes('blouse') ||
    p.name?.toLowerCase().includes('hoodie') ||
    p.name?.toLowerCase().includes('jacket')
  },
  { id: 'bottoms', label: 'Bottoms', filter: (p) => 
    p.subCategory?.toLowerCase().includes('pant') ||
    p.subCategory?.toLowerCase().includes('jean') ||
    p.subCategory?.toLowerCase().includes('short') ||
    p.subCategory?.toLowerCase().includes('skirt') ||
    p.subCategory?.toLowerCase().includes('trouser') ||
    p.name?.toLowerCase().includes('pant') ||
    p.name?.toLowerCase().includes('jean') ||
    p.name?.toLowerCase().includes('short') ||
    p.name?.toLowerCase().includes('skirt') ||
    p.name?.toLowerCase().includes('trouser')
  },
  { id: 'footwear', label: 'Footwear', filter: (p) => 
    p.category?.toLowerCase() === 'sneakers' ||
    p.category?.toLowerCase() === 'boots' ||
    p.category?.toLowerCase().includes('shoe') ||
    p.subCategory?.toLowerCase().includes('shoe') ||
    p.subCategory?.toLowerCase().includes('sneaker') ||
    p.subCategory?.toLowerCase().includes('boot') ||
    p.name?.toLowerCase().includes('shoe') ||
    p.name?.toLowerCase().includes('sneaker') ||
    p.name?.toLowerCase().includes('boot') ||
    p.name?.toLowerCase().includes('flip flop') ||
    p.name?.toLowerCase().includes('sandal')
  },
  { id: 'accessories', label: 'Accessories', filter: (p) => 
    p.category?.toLowerCase() === 'accessories' ||
    p.subCategory?.toLowerCase().includes('accessory') ||
    p.name?.toLowerCase().includes('hat') ||
    p.name?.toLowerCase().includes('cap') ||
    p.name?.toLowerCase().includes('watch') ||
    p.name?.toLowerCase().includes('bag') ||
    p.name?.toLowerCase().includes('belt') ||
    p.name?.toLowerCase().includes('sunglass') ||
    p.name?.toLowerCase().includes('scarf') ||
    p.name?.toLowerCase().includes('jewelry') ||
    p.name?.toLowerCase().includes('necklace') ||
    p.name?.toLowerCase().includes('bracelet')
  }
];

// Placeholder silhouettes for each category
const PlaceholderCard = ({ label, selected, onClick, onClear }) => (
  <div 
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:border-[#00A676]' : ''} flex-shrink-0 w-full max-w-[250px] h-40 md:h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 transition-all duration-300 p-4`}
  >
    <div className="text-gray-400 dark:text-gray-500 text-center">
      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-lg opacity-50"></div>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-[10px] text-gray-400 mt-1">Click to select</p>
    </div>
  </div>
);

// Selected item display in the mannequin area
const SelectedItemDisplay = ({ item, category, onClear }) => {
  if (!item) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center w-full"
    >
      {/* Image Container with fixed height */}
      <div className="relative group w-full max-w-[250px] h-40 md:h-48 flex justify-center items-center bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="max-h-full max-w-full object-contain drop-shadow-md"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
        >
          <FiX size={16} />
        </button>
      </div>
      {/* Text - cleanly below image */}
      <div className="mt-3 text-center w-full max-w-[250px]">
        <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {item.name}
        </p>
        <p className="text-[#00A676] font-semibold text-sm mt-1">
          KSh {item.price?.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

// Product card for the wardrobe list
const ProductCard = ({ product, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(product)}
    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
      isSelected 
        ? 'border-[#00A676] shadow-lg ring-2 ring-[#00A676] ring-opacity-50' 
        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-md hover:shadow-lg'
    }`}
  >
    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
        }}
      />
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#00A676] text-white p-1.5 rounded-full">
          <FiCheck size={16} />
        </div>
      )}
    </div>
    <div className="p-3 bg-white dark:bg-gray-900">
      <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
        {product.name}
      </h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[#00A676] font-bold text-sm">
          KSh {product.price?.toLocaleString()}
        </span>
        {product.originalPrice > product.price && (
          <span className="text-gray-400 text-xs line-through">
            KSh {product.originalPrice?.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const MixAndMatch = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector(state => state.products);
  
  // State for selected items
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  
  // UI State
  const [activeCategory, setActiveCategory] = useState('tops');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    const categoryConfig = CATEGORIES.find(c => c.id === activeCategory);
    if (!categoryConfig) return [];
    return products.filter(categoryConfig.filter);
  }, [products, activeCategory]);

  // Handler for selecting a product
  const handleSelectProduct = (product) => {
    switch (activeCategory) {
      case 'tops':
        setSelectedTop(product);
        break;
      case 'bottoms':
        setSelectedBottom(product);
        break;
      case 'footwear':
        setSelectedShoe(product);
        break;
      case 'accessories':
        setSelectedAccessory(product);
        break;
      default:
        break;
    }
    toast.success(`Added ${product.name} to your outfit!`, {
      icon: '👔'
    });
  };

  // Clear selected item
  const handleClearItem = (category) => {
    switch (category) {
      case 'tops':
        setSelectedTop(null);
        break;
      case 'bottoms':
        setSelectedBottom(null);
        break;
      case 'footwear':
        setSelectedShoe(null);
        break;
      case 'accessories':
        setSelectedAccessory(null);
        break;
      default:
        break;
    }
  };

  // Check if a product is currently selected
  const isProductSelected = (product) => {
    return [selectedTop, selectedBottom, selectedShoe, selectedAccessory].some(
      selected => selected?.id === product.id
    );
  };

  // Add entire outfit to cart
  const handleAddToCart = async () => {
    const itemsToAdd = [
      { item: selectedTop, label: 'Top' },
      { item: selectedBottom, label: 'Bottom' },
      { item: selectedShoe, label: 'Shoe' },
      { item: selectedAccessory, label: 'Accessory' }
    ].filter(({ item }) => item !== null);

    if (itemsToAdd.length === 0) {
      toast.error('Please select at least one item for your outfit!');
      return;
    }

    setIsAddingToCart(true);
    let successCount = 0;
    let failCount = 0;

    for (const { item, label } of itemsToAdd) {
      try {
        await dispatch(addToCartAPI({
          product: item,
          size: item.sizes?.[0] || 'M',
          color: item.colors?.[0] || 'Default',
          quantity: 1
        })).unwrap();
        successCount++;
      } catch (error) {
        console.error(`Failed to add ${label}:`, error);
        failCount++;
      }
    }

    setIsAddingToCart(false);

    if (failCount === 0) {
      toast.success(`🎉 Added ${successCount} item${successCount > 1 ? 's' : ''} to your cart!`, {
        icon: '🛍️'
      });
    } else {
      toast.error(`Added ${successCount} items. ${failCount} failed.`);
    }
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return [selectedTop, selectedBottom, selectedShoe, selectedAccessory]
      .filter(Boolean)
      .reduce((sum, item) => sum + (item.price || 0), 0);
  }, [selectedTop, selectedBottom, selectedShoe, selectedAccessory]);

  // Count selected items
  const selectedCount = useMemo(() => {
    return [selectedTop, selectedBottom, selectedShoe, selectedAccessory]
      .filter(Boolean).length;
  }, [selectedTop, selectedBottom, selectedShoe, selectedAccessory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00A676] to-[#008559] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FiShoppingBag className="text-3xl" />
            Mix & Match
          </h1>
          <p className="mt-1 text-white/80">
            Create your perfect outfit by mixing and matching pieces
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop: Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDE: Mannequin / Canvas */}
          <div className="lg:w-5/12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                👗 Your Outfit
              </h2>
              
              {/* The Mannequin - Flexbox Column Layout */}
              <div className="flex flex-col items-center justify-start gap-6 py-4 overflow-y-auto max-h-[500px] md:max-h-none">
                {/* Accessory Row */}
                <div className="w-full">
                  {selectedAccessory ? (
                    <SelectedItemDisplay 
                      item={selectedAccessory} 
                      category="accessories"
                      onClear={() => handleClearItem('accessories')}
                    />
                  ) : (
                    <PlaceholderCard 
                      label="Select Accessory" 
                      selected={false}
                      onClick={() => setActiveCategory('accessories')}
                      onClear={() => {}}
                    />
                  )}
                </div>

                {/* Top Row */}
                <div className="w-full">
                  {selectedTop ? (
                    <SelectedItemDisplay 
                      item={selectedTop} 
                      category="tops"
                      onClear={() => handleClearItem('tops')}
                    />
                  ) : (
                    <PlaceholderCard 
                      label="Select a Top" 
                      selected={false}
                      onClick={() => setActiveCategory('tops')}
                      onClear={() => {}}
                    />
                  )}
                </div>

                {/* Bottom Row */}
                <div className="w-full">
                  {selectedBottom ? (
                    <SelectedItemDisplay 
                      item={selectedBottom} 
                      category="bottoms"
                      onClear={() => handleClearItem('bottoms')}
                    />
                  ) : (
                    <PlaceholderCard 
                      label="Select Bottoms" 
                      selected={false}
                      onClick={() => setActiveCategory('bottoms')}
                      onClear={() => {}}
                    />
                  )}
                </div>

                {/* Footwear Row */}
                <div className="w-full">
                  {selectedShoe ? (
                    <SelectedItemDisplay 
                      item={selectedShoe} 
                      category="footwear"
                      onClear={() => handleClearItem('footwear')}
                    />
                  ) : (
                    <PlaceholderCard 
                      label="Select Shoes" 
                      selected={false}
                      onClick={() => setActiveCategory('footwear')}
                      onClear={() => {}}
                    />
                  )}
                </div>
              </div>

              {/* Outfit Summary & Add to Cart */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Outfit Total ({selectedCount} items)
                  </span>
                  <span className="text-2xl font-bold text-[#00A676]">
                    KSh {totalPrice.toLocaleString()}
                  </span>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || selectedCount === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    selectedCount === 0
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-[#00A676] hover:bg-[#008559] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={20} />
                      Add Full Outfit to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Wardrobe */}
          <div className="lg:w-7/12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                👚 The Wardrobe
              </h2>
              
              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-[#00A676] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👔</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No {activeCategory} found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try selecting a different category or check back later for new arrivals.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={isProductSelected(product)}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixAndMatch;
