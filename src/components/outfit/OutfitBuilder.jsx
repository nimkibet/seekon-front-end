import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
];

const OUTFIT_SLOTS = [
  { key: 'selectedTop', label: 'Top', icon: '👕', emptyMessage: 'Select a top to get started' },
  { key: 'selectedBottom', label: 'Bottom', icon: '👖', emptyMessage: 'Select bottoms to complete your look' },
  { key: 'selectedShoes', label: 'Shoes', icon: '👟', emptyMessage: 'Pick your perfect shoes' },
  { key: 'selectedAccessory', label: 'Accessory', icon: '👜', emptyMessage: 'Add an accessory to finish' },
];

const OutfitBuilder = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const listRef = useRef(null);
  const canvasRef = useRef(null);
  const { filteredProducts, isLoading, products } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('tops');
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedShoes, setSelectedShoes] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  useEffect(() => {
    const preselectedItem = location.state?.preselectedItem;
    if (!preselectedItem) return;

    const cat = (preselectedItem.category || '').toLowerCase();
    const name = (preselectedItem.name || '').toLowerCase();
    const productData = {
      id: preselectedItem.id || preselectedItem._id,
      _id: preselectedItem._id,
      name: preselectedItem.name,
      brand: preselectedItem.brand,
      price: preselectedItem.price,
      image: preselectedItem.image || preselectedItem.images?.[0],
      category: preselectedItem.category,
    };

    if (cat === 'apparel') {
      if (name.includes('pant') || name.includes('short') || name.includes('jean') ||
          name.includes('trouser') || name.includes('jogger') || name.includes('bottom')) {
        setSelectedBottom(productData);
        toast.success(`${preselectedItem.name} pre-selected as bottom`);
      } else {
        setSelectedTop(productData);
        toast.success(`${preselectedItem.name} pre-selected as top`);
      }
    } else if (cat === 'footwear' || cat === 'sneakers') {
      setSelectedShoes(productData);
      toast.success(`${preselectedItem.name} pre-selected as shoes`);
    } else if (cat === 'accessories') {
      setSelectedAccessory(productData);
      toast.success(`${preselectedItem.name} pre-selected as accessory`);
    }
  }, [location.state]);

  const getFilteredItems = () => {
    const tabConfig = CATEGORIES.find((c) => c.id === activeTab);
    if (!tabConfig) return [];

     const sourceProducts = products || [];

     return sourceProducts.filter((product) => {
       // Safely handle both string and object category structures depending on population
       const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
       const cat = (categoryName || '').toLowerCase();
       
       // Extract subCategory safely (Note the camelCase 'C' to match backend schema)
       const subCategoryName = typeof product.subCategory === 'object' ? product.subCategory?.name : product.subCategory;
       const subCat = (subCategoryName || '').toLowerCase();
      
      // Fallback: use name matching if subcategory is not available
      const name = (product.name || '').toLowerCase();
      const hasSubcategory = subCat !== '';

      if (activeTab === 'tops') {
        // Match Apparel category AND any of these top-related subcategories
        return cat === 'apparel' && (
          subCat === 'tops' || 
          subCat === 'outerwear' || 
          subCat === 't shirts' || 
          subCat === 't-shirts' || 
          subCat === 'shirts' ||
          subCat === 'hoodies' ||
          subCat === 'sweaters'
        );
      }
      
      if (activeTab === 'bottoms') {
        // Match Apparel category AND any of these bottom-related subcategories
        return cat === 'apparel' && (
          subCat === 'bottoms' || 
          subCat === 'pants' || 
          subCat === 'shorts' || 
          subCat === 'jeans' || 
          subCat === 'joggers' ||
          subCat === 'trousers' ||
          subCat === 'sweatpants' ||
          subCat === 'cargos'
        );
      }
      
      if (activeTab === 'shoes') {
        // Match Footwear category (subcategory not needed for shoes)
        return cat === 'footwear' || cat === 'sneakers';
      }
      
      if (activeTab === 'accessories') {
        // Match Accessories category
        return cat === 'accessories';
      }
      
      return false;
    });
  };

  const handleSlotClick = (tabId) => {
    setActiveTab(tabId);
    
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div ref={listRef} className="order-2 lg:order-1 flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
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

          <div className="order-1 lg:order-2 w-full lg:w-[420px] shrink-0 space-y-6">
            <div ref={canvasRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Outfit</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCount}/4 items
                </span>
              </div>

              <div className="relative w-full h-[500px] md:h-[600px] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex justify-center items-center">
                <div
                    className="absolute top-[5%] w-3/4 h-2/5 z-30 cursor-pointer flex justify-center items-center group"
                    onClick={() => handleSlotClick('tops')}
                  >
                  {selectedTop ? (
                    <img
                      src={selectedTop.image}
                      alt={selectedTop.name}
                      className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-900 group-hover:bg-gray-200/50 group-hover:text-gray-600 group-hover:border-gray-600 transition-all">
                      <svg className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8c-2.5 0-4-1-4-1l-3-3a3 3 0 00-4 0l-3 3s-1.5 1-4 1v4h3v8c0 .5.5 1 1 1h10c.5 0 1-.5 1-1v-8h3V8z" />
                      </svg>
                      <span className="text-sm font-medium">+ Add Top</span>
                    </div>
                  )}
                </div>

                <div
                    className="absolute top-[40%] w-3/4 h-2/5 z-20 cursor-pointer flex justify-center items-center group"
                    onClick={() => handleSlotClick('bottoms')}
                  >
                  {selectedBottom ? (
                    <img
                      src={selectedBottom.image}
                      alt={selectedBottom.name}
                      className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                   ) : (
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-900 group-hover:bg-gray-200/50 group-hover:text-gray-600 group-hover:border-gray-600 transition-all">
                      <svg className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l1.5 18H15l-3-9-3 9H4.5L6 3z" />
                      </svg>
                      <span className="text-sm font-medium">+ Add Bottom</span>
                    </div>
                  )}
                </div>

                <div
                    className="absolute bottom-[2%] w-3/4 h-1/5 z-10 cursor-pointer flex justify-center items-center group"
                    onClick={() => handleSlotClick('shoes')}
                  >
                  {selectedShoes ? (
                    <img
                      src={selectedShoes.image}
                      alt={selectedShoes.name}
                      className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                   ) : (
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-900 group-hover:bg-gray-200/50 group-hover:text-gray-600 group-hover:border-gray-600 transition-all">
                      <svg className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16c0-1.1.9-2 2-2h1.5l3-4.5H16c1.5 0 3 .5 3 2.5 0 1-.5 2-1 2H6v2c0 1.1-.9 2-2 2H3v-2z" />
                      </svg>
                      <span className="text-sm font-medium">+ Add Shoes</span>
                    </div>
                  )}
                </div>

                <div
                    className="absolute top-[5%] right-[5%] w-1/4 h-1/4 z-40 cursor-pointer flex justify-center items-center group"
                    onClick={() => handleSlotClick('accessories')}
                  >
                  {selectedAccessory ? (
                    <img
                      src={selectedAccessory.image}
                      alt={selectedAccessory.name}
                      className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform"
                    />
                   ) : (
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-900 group-hover:bg-gray-200/50 group-hover:text-gray-600 group-hover:border-gray-600 transition-all">
                      <svg className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 14h14M7 14v-2a5 5 0 0 1 10 0v2M3 14h18" />
                      </svg>
                      <span className="text-sm font-medium">+ Add Accs.</span>
                    </div>
                  )}
                </div>

                {selectedCount === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                      Select items from the left to build your outfit
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
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
