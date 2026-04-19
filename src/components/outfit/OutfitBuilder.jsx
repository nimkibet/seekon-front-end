import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'tops', label: 'Tops', filter: { category: 'apparel' } },
  { id: 'bottoms', label: 'Bottoms', filter: { category: 'apparel' } },
  { id: 'shoes', label: 'Shoes', filter: { category: 'sneakers' } },
  { id: 'accessories', label: 'Accessories', filter: { category: 'accessories' } },
];

const OUTFIT_SLOTS = [
  { key: 'selectedTop', label: 'Top', icon: '👕', emptyMessage: 'Select a top to get started' },
  { key: 'selectedBottom', label: 'Bottom', icon: '👖', emptyMessage: 'Select bottoms to complete your look' },
  { key: 'selectedShoes', label: 'Shoes', icon: '👟', emptyMessage: 'Pick your perfect shoes' },
  { key: 'selectedAccessory', label: 'Accessory', icon: '👜', emptyMessage: 'Add an accessory to finish' },
];

const OutfitBuilder = () => {
  const dispatch = useDispatch();
  const { filteredProducts, isLoading, products } = useSelector((state) => state.products);
  
  const [activeTab, setActiveTab] = useState('tops');
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedShoes, setSelectedShoes] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getFilteredItems = () => {
    const tabConfig = CATEGORIES.find((c) => c.id === activeTab);
    if (!tabConfig) return [];

    return filteredProducts.filter((product) => {
      if (activeTab === 'tops') {
        return product.category === 'apparel' && 
          (product.name.toLowerCase().includes('t-shirt') || 
           product.name.toLowerCase().includes('shirt') ||
           product.name.toLowerCase().includes('hoodie') ||
           product.name.toLowerCase().includes('jacket'));
      }
      if (activeTab === 'bottoms') {
        return product.category === 'apparel' && 
          (product.name.toLowerCase().includes('pants') || 
           product.name.toLowerCase().includes('shorts') ||
           product.name.toLowerCase().includes('jeans'));
      }
      if (activeTab === 'shoes') {
        return product.category === 'sneakers';
      }
      if (activeTab === 'accessories') {
        return product.category === 'accessories';
      }
      return true;
    });
  };

  const handleSelectItem = (product) => {
    const productData = {
      id: product.id || product._id,
      _id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || product.images?.[0],
      category: product.category,
    };

    switch (activeTab) {
      case 'tops':
        setSelectedTop(productData);
        toast.success(`${product.name} added as top`);
        break;
      case 'bottoms':
        setSelectedBottom(productData);
        toast.success(`${product.name} added as bottom`);
        break;
      case 'shoes':
        setSelectedShoes(productData);
        toast.success(`${product.name} added as shoes`);
        break;
      case 'accessories':
        setSelectedAccessory(productData);
        toast.success(`${product.name} added as accessory`);
        break;
    }
  };

  const handleRemoveItem = (slotKey) => {
    switch (slotKey) {
      case 'selectedTop':
        setSelectedTop(null);
        break;
      case 'selectedBottom':
        setSelectedBottom(null);
        break;
      case 'selectedShoes':
        setSelectedShoes(null);
        break;
      case 'selectedAccessory':
        setSelectedAccessory(null);
        break;
    }
    toast.success('Item removed from outfit');
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedTop) total += selectedTop.price;
    if (selectedBottom) total += selectedBottom.price;
    if (selectedShoes) total += selectedShoes.price;
    if (selectedAccessory) total += selectedAccessory.price;
    return total;
  };

  const getSelectedItem = (slotKey) => {
    switch (slotKey) {
      case 'selectedTop':
        return selectedTop;
      case 'selectedBottom':
        return selectedBottom;
      case 'selectedShoes':
        return selectedShoes;
      case 'selectedAccessory':
        return selectedAccessory;
      default:
        return null;
    }
  };

  const handleAddEntireOutfitToCart = async () => {
    const items = [selectedTop, selectedBottom, selectedShoes, selectedAccessory].filter(Boolean);
    
    if (items.length === 0) {
      toast.error('Please select at least one item for your outfit');
      return;
    }

    for (const item of items) {
      dispatch(addToCart({
        product: item,
        size: item.sizes?.[0] || null,
        color: item.colors?.[0] || null,
        quantity: 1,
      }));
    }

    toast.success(`${items.length} items added to cart!`);
  };

  const isSelected = (productId) => {
    return (
      selectedTop?.id === productId ||
      selectedBottom?.id === productId ||
      selectedShoes?.id === productId ||
      selectedAccessory?.id === productId
    );
  };

  const selectedCount = [selectedTop, selectedBottom, selectedShoes, selectedAccessory].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Build Your Outfit</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create the perfect look by mixing and matching items from our collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === category.id
                        ? 'border-[#00A676] text-[#00A676]'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 mb-3"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {getFilteredItems().map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectItem(product)}
                        className={`group relative bg-white dark:bg-gray-700 rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                          isSelected(product.id)
                            ? 'border-[#00A676] ring-2 ring-[#00A676] ring-opacity-50'
                            : 'border-gray-200 dark:border-gray-600 hover:border-[#00A676]'
                        }`}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {isSelected(product.id) && (
                          <div className="absolute top-2 right-2 bg-[#00A676] text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="p-3 text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-[#00A676] mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {getFilteredItems().length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No items available in this category</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Outfit</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCount}/4 items
                </span>
              </div>

              <div className="space-y-4">
                {OUTFIT_SLOTS.map((slot) => {
                  const selectedItem = getSelectedItem(slot.key);
                  return (
                    <div
                      key={slot.key}
                      className={`relative rounded-xl border-2 transition-all ${
                        selectedItem
                          ? 'border-[#00A676] bg-[#00A676]/5'
                          : 'border-dashed border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedItem ? (
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={selectedItem.image}
                                alt={selectedItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#00A676] font-medium">{slot.label}</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {selectedItem.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatPrice(selectedItem.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(slot.key)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <span className="text-3xl">{slot.icon}</span>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {slot.emptyMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-[#00A676]">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
                <button
                  onClick={handleAddEntireOutfitToCart}
                  disabled={selectedCount === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    selectedCount === 0
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-[#00A676] hover:bg-[#008f5f] active:scale-98 hover:shadow-lg'
                  }`}
                >
                  Add Entire Outfit to Cart
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#00A676] to-[#008f5f] rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Style Tip</h3>
              <p className="text-sm text-white/90">
                {selectedCount === 0
                  ? 'Start by selecting a top to build your perfect outfit combination.'
                  : selectedCount < 4
                  ? 'Complete your look with all four pieces for a cohesive style.'
                  : 'Great outfit combination! You look ready to take on the day.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitBuilder;