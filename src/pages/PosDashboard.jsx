import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiCamera,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiAlertCircle,
  FiPrinter,
  FiDownload,
  FiRefreshCw,
  FiSend,
  FiUser,
  FiLogOut,
  FiDollarSign,
  FiSmartphone,
  FiLayers,
  FiGrid,
  FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { posApi } from '../utils/posApi';
import BarcodeScannerModal from '../components/pos/BarcodeScannerModal';

const PosDashboard = () => {
  const { user, logout } = useAuth();

  // Active Tab: 'pos' (50/50 Terminal) | 'queue' (WhatsApp Pool) | 'barcodes' (Sticker Sheets)
  const [activeTab, setActiveTab] = useState('pos');

  // Search & Barcode state
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // CRITICAL REQUIREMENT: autoFocus and useRef to ensure cursor is ALWAYS blinking here by default
  const barcodeInputRef = useRef(null);

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Breakdown
  const [paymentMode, setPaymentMode] = useState('split'); // 'split' | 'cash' | 'mpesa'
  const [cashTendered, setCashTendered] = useState('');
  const [mpesaTendered, setMpesaTendered] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Receipt Modal
  const [completedOrderData, setCompletedOrderData] = useState(null);

  // WhatsApp Queue state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [activePendingOrderId, setActivePendingOrderId] = useState(null);

  // 1. Always keep focus on the barcode search input
  const refocusBarcodeInput = () => {
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
        barcodeInputRef.current.select();
      }
    }, 50);
  };

  useEffect(() => {
    refocusBarcodeInput();
  }, [activeTab]);

  // 2. Initial Products Load & Search Query Debounce
  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  const fetchProducts = async (query = '') => {
    try {
      setIsSearching(true);
      const res = await posApi.searchProducts(query);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Error fetching POS products:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Fetch WhatsApp Queue
  const fetchQueue = async () => {
    try {
      setIsLoadingQueue(true);
      const res = await posApi.getPendingOrders();
      if (res.success) {
        setPendingOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueue();
    }
  }, [activeTab]);

  // 4. Barcode Enter Scanner Handler (USB Scanners send Enter key)
  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchQuery.trim();
      if (!code) return;

      // Find exact match by barcode or SKU
      const exactMatch = products.find(
        p => String(p.barcode) === code || String(p.sku).toLowerCase() === code.toLowerCase()
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
        toast.success(`Scanned: ${exactMatch.name}`);
      } else if (products.length === 1) {
        addToCart(products[0]);
        setSearchQuery('');
        toast.success(`Added: ${products[0].name}`);
      } else {
        toast.error(`No product found with barcode: ${code}`);
      }
      refocusBarcodeInput();
    }
  };

  // 5. Camera Scan Detection
  const handleCameraScan = (decodedBarcode) => {
    if (!decodedBarcode) return;
    setSearchQuery(decodedBarcode);

    const match = products.find(
      p => String(p.barcode) === decodedBarcode || String(p.sku) === decodedBarcode
    );

    if (match) {
      addToCart(match);
      toast.success(`Camera scanned: ${match.name}`);
    } else {
      fetchProducts(decodedBarcode);
      toast(`Scanned ${decodedBarcode}. Filter applied.`);
    }
    refocusBarcodeInput();
  };

  // 6. Cart Operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      refocusBarcodeInput();
      return;
    }

    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.productId === product._id);
      if (existingIdx > -1) {
        const existing = prevCart[existingIdx];
        if (existing.quantity >= product.stock) {
          toast.error(`Cannot exceed stock count (${product.stock})`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...existing,
          quantity: existing.quantity + 1
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image || product.images?.[0] || '',
            size: product.sizes?.[0] || 'Standard',
            color: product.colors?.[0] || 'Standard',
            quantity: 1
          }
        ];
      }
    });

    // Auto update cash or mpesa tendered if single mode selected
    refocusBarcodeInput();
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.error(`Only ${item.stock} in stock`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
    refocusBarcodeInput();
  };

  const removeItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    refocusBarcodeInput();
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered('');
    setMpesaTendered('');
    setCustomerPhone('');
    setCustomerName('');
    setActivePendingOrderId(null);
    refocusBarcodeInput();
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = cartSubtotal;

  const cashVal = parseFloat(cashTendered) || 0;
  const mpesaVal = parseFloat(mpesaTendered) || 0;
  const totalTendered = cashVal + mpesaVal;
  const balanceChange = Math.max(0, totalTendered - totalAmount);
  const remainingDue = Math.max(0, totalAmount - totalTendered);

  // Sync quick payment modes
  const handlePaymentModeSelect = (mode) => {
    setPaymentMode(mode);
    if (mode === 'cash') {
      setCashTendered(String(totalAmount));
      setMpesaTendered('0');
    } else if (mode === 'mpesa') {
      setMpesaTendered(String(totalAmount));
      setCashTendered('0');
    } else {
      // Split mode: split 50/50 by default
      const half = Math.round(totalAmount / 2);
      setCashTendered(String(half));
      setMpesaTendered(String(totalAmount - half));
    }
  };

  // 7. Complete Sale Checkout (Phase 4)
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      refocusBarcodeInput();
      return;
    }

    if (totalTendered < totalAmount) {
      toast.error(`Payment incomplete! Remaining due: KES ${remainingDue.toLocaleString()}`);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        items: cart.map(it => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          size: it.size,
          color: it.color
        })),
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim() || 'Walk-in Customer',
        payments: {
          cash: cashVal,
          mpesa: mpesaVal
        },
        paymentMethod: (cashVal > 0 && mpesaVal > 0) ? 'Split' : (cashVal > 0 ? 'Cash' : 'M-Pesa'),
        notes,
        pendingOrderId: activePendingOrderId
      };

      const res = await posApi.checkout(payload);

      if (res.success) {
        toast.success('Sale completed & stock deducted!');
        setCompletedOrderData({
          order: res.order,
          whatsappDispatched: res.whatsappDispatched,
          whatsappError: res.whatsappError,
          receiptBase64: res.receiptBase64,
          phone: customerPhone.trim()
        });

        clearCart();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Load WhatsApp Queue Order into POS Cart (Phase 5)
  const handleLoadQueueOrder = (order) => {
    setCart([]);
    setCustomerPhone(order.customerPhone || '');
    setCustomerName(order.customerName || '');
    setActivePendingOrderId(order._id);

    // Map items
    const loadedItems = order.items.map(it => ({
      productId: it.product?._id || it.product || it._id,
      name: it.name,
      price: it.price,
      stock: it.product?.stock || 99,
      image: it.product?.image || '',
      size: it.size || 'Standard',
      color: it.color || 'Standard',
      quantity: it.quantity || 1
    }));

    setCart(loadedItems);

    if (order.paymentMethod === 'Cash') {
      setPaymentMode('cash');
      setCashTendered(String(order.totalAmount));
      setMpesaTendered('0');
    } else if (order.paymentMethod === 'M-Pesa') {
      setPaymentMode('mpesa');
      setMpesaTendered(String(order.totalAmount));
      setCashTendered('0');
    } else if (order.payments?.cash || order.payments?.mpesa) {
      setPaymentMode('split');
      setCashTendered(String(order.payments.cash || 0));
      setMpesaTendered(String(order.payments.mpesa || 0));
    }

    setActiveTab('pos');
    toast.success(`Loaded WhatsApp order for ${order.customerPhone}`);
    refocusBarcodeInput();
  };

  const handleDismissQueueOrder = async (orderId) => {
    try {
      await posApi.dismissPendingOrder(orderId);
      toast.success('Order removed from queue');
      fetchQueue();
    } catch (err) {
      toast.error(err.message || 'Failed to dismiss');
    }
  };

  // Filter products by category
  const categories = ['All', 'Footwear', 'Apparel', 'Accessories', 'Headwear'];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none">
      {/* Top Bar Header */}
      <header className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-widest text-lg text-white">SEEKON</span>
            <span className="text-xs uppercase px-2 py-0.5 rounded-full font-bold bg-neutral-800 text-emerald-400 border border-emerald-500/30">
              POS Terminal
            </span>
          </div>

          {/* Tab Switcher */}
          <nav className="hidden sm:flex items-center space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              POS Register
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'queue'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>WhatsApp Queue</span>
              {pendingOrders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-black">
                  {pendingOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('barcodes')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'barcodes'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              A4 Barcode Labels
            </button>
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <FiUser className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-200 leading-none">{user?.name || user?.email || 'Cashier'}</p>
              <p className="text-[10px] text-emerald-400 uppercase font-semibold">{user?.role || 'cashier'}</p>
            </div>
          </div>

          {user?.role === 'admin' && (
            <a
              href="/admin/dashboard"
              className="text-xs text-gray-400 hover:text-white bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg transition-colors"
            >
              Admin Panel
            </a>
          )}

          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors"
            title="Logout cashier session"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* ========================================================= */}
        {/* TAB 1: THE 50/50 FRONTEND POS REGISTER VIEW */}
        {/* ========================================================= */}
        {activeTab === 'pos' && (
          <div className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
            {/* -------------------------------------------------------- */}
            {/* LEFT SIDE: SEARCH & SCAN */}
            {/* -------------------------------------------------------- */}
            <div className="flex flex-col h-full bg-neutral-950/60 p-4 sm:p-5 overflow-hidden">
              {/* Barcode Search Header */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={barcodeInputRef}
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleBarcodeKeyDown}
                      placeholder="Search by Name or Barcode (Scanner Auto-Focused)..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900 border-2 border-neutral-700 focus:border-emerald-500 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all shadow-inner"
                    />
                    {isSearching && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 rounded-xl font-medium text-xs transition-colors shrink-0"
                    title="Open Camera Scanner"
                  >
                    <FiCamera className="w-4 h-4" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        refocusBarcodeInput();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-neutral-200 text-black'
                          : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Catalog Grid */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {filteredProducts.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                    <FiAlertCircle className="w-10 h-10 mb-2 stroke-1" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs text-gray-600 mt-1">Try scanning a different barcode or typing a name</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredProducts.map(product => {
                      const isOutOfStock = product.stock <= 0;
                      return (
                        <div
                          key={product._id}
                          onClick={() => addToCart(product)}
                          className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isOutOfStock
                              ? 'bg-neutral-950 border-neutral-900 opacity-50 cursor-not-allowed'
                              : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-emerald-500/60 shadow-md hover:shadow-emerald-950/20'
                          }`}
                        >
                          <div>
                            {/* Product Thumbnail */}
                            <div className="w-full h-24 bg-neutral-950 rounded-lg overflow-hidden mb-2 flex items-center justify-center border border-neutral-800/60">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <span className="text-xs text-gray-600">No Image</span>
                              )}
                            </div>

                            {/* Details */}
                            <h4 className="font-semibold text-xs text-gray-200 line-clamp-1 mb-1">
                              {product.name}
                            </h4>

                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-white">
                                KES {product.price?.toLocaleString()}
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                product.stock > 5
                                  ? 'text-gray-400 bg-neutral-800'
                                  : product.stock > 0
                                  ? 'text-amber-400 bg-amber-950/40'
                                  : 'text-red-400 bg-red-950/40'
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>

                          {/* Barcode Tag */}
                          <div className="pt-1.5 border-t border-neutral-800/60 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                            <span>#{product.barcode}</span>
                            <span className="text-emerald-400 font-sans group-hover:translate-x-0.5 transition-transform">+ Add</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* RIGHT SIDE: CART & CHECKOUT */}
            {/* -------------------------------------------------------- */}
            <div className="flex flex-col h-full bg-black p-4 sm:p-5 overflow-hidden">
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-white">Current Sale</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-900 border border-neutral-800 text-gray-300">
                    {cart.reduce((sum, it) => sum + it.quantity, 0)} Items
                  </span>
                  {activePendingOrderId && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      WhatsApp Linked
                    </span>
                  )}
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-500 hover:text-red-400 flex items-center space-x-1 transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800 pr-1">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-600">
                    <FiLayers className="w-12 h-12 mb-3 stroke-1 text-neutral-800" />
                    <p className="text-sm font-medium text-gray-400">Cart is empty</p>
                    <p className="text-xs text-gray-600 mt-1 max-w-xs">
                      Scan product barcodes on the left or select items from catalog to start the walk-in checkout.
                    </p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.productId}
                      className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-3 shadow-sm"
                    >
                      {/* Left: Thumbnail & Name */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-neutral-800 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-600">SKN</span>
                          )}
                        </div>
                        <div className="truncate">
                          <h5 className="font-semibold text-xs text-white truncate">{item.name}</h5>
                          <p className="text-[11px] text-gray-400">
                            KES {item.price?.toLocaleString()} each
                          </p>
                        </div>
                      </div>

                      {/* Middle: Qty Stepper */}
                      <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-800 rounded-lg px-1.5 py-1 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Right: Subtotal & Delete */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-white">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-[10px] text-gray-500 hover:text-red-400 transition-colors mt-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Controls Panel */}
              <div className="pt-3 border-t border-neutral-800 space-y-3 shrink-0">
                {/* Customer Phone for WhatsApp Receipt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Customer WhatsApp Phone *
                    </label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="07XXXXXXXX or +254..."
                        className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Dennis"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400">
                      Payment Mode
                    </label>
                    <div className="flex items-center space-x-1">
                      {['split', 'cash', 'mpesa'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => handlePaymentModeSelect(mode)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                            paymentMode === mode
                              ? 'bg-emerald-500 text-black shadow-sm'
                              : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1">Cash (KES)</span>
                      <input
                        type="number"
                        min="0"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1">M-Pesa (KES)</span>
                      <input
                        type="number"
                        min="0"
                        value={mpesaTendered}
                        onChange={(e) => setMpesaTendered(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Financial Totals */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Total Amount:</span>
                    <span className="text-base font-extrabold text-white">
                      KES {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-400 text-[11px]">
                    <span>Total Tendered:</span>
                    <span className="font-semibold text-gray-200">
                      KES {totalTendered.toLocaleString()}
                    </span>
                  </div>

                  {remainingDue > 0 ? (
                    <div className="flex justify-between items-center text-red-400 font-bold text-[11px] pt-1 border-t border-neutral-900">
                      <span>Remaining Due:</span>
                      <span>KES {remainingDue.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-emerald-400 font-bold text-[11px] pt-1 border-t border-neutral-900">
                      <span>Balance / Change:</span>
                      <span>KES {balanceChange.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Complete Sale Checkout Button */}
                <button
                  disabled={cart.length === 0 || isSubmitting || totalTendered < totalAmount}
                  onClick={handleCompleteSale}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    cart.length === 0 || totalTendered < totalAmount || isSubmitting
                      ? 'bg-neutral-800 text-gray-500 cursor-not-allowed border border-neutral-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-950/40 hover:scale-[1.01]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Processing Sale & Stock Decrement...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Complete Sale & Send WhatsApp Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WHATSAPP ORDER POOL QUEUE (PHASE 5) */}
        {/* ========================================================= */}
        {activeTab === 'queue' && (
          <div className="h-[calc(100vh-3.5rem)] p-4 sm:p-6 bg-neutral-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold text-white">WhatsApp Headless Order Queue</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manual order drop messages detected in the WhatsApp Command Center group.
                  </p>
                </div>
                <button
                  onClick={fetchQueue}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-semibold text-gray-300 transition-colors"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-12 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">Queue is clear!</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Any manual order message typed in the WhatsApp group will instantly appear here for one-click checkout.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map(order => (
                    <div
                      key={order._id}
                      className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">
                              QUEUE #{String(order._id).slice(-6)}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {order.customerName}
                            </h4>
                            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                              +{order.customerPhone}
                            </p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 bg-neutral-800 text-gray-300 rounded-lg">
                            KES {order.totalAmount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="p-3 bg-black/60 rounded-xl mb-3 space-y-1.5 border border-neutral-800/60">
                          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Order Items</p>
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-300">
                              <span>{it.quantity}x {it.name} {it.size ? `(${it.size})` : ''}</span>
                              <span className="font-medium text-white">KES {(it.price * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Original WhatsApp message snippet */}
                        <div className="mb-4">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Raw Message</p>
                          <p className="text-[11px] text-gray-400 bg-neutral-950 p-2 rounded-lg font-mono line-clamp-3">
                            {order.rawMessage}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-neutral-800">
                        <button
                          onClick={() => handleLoadQueueOrder(order)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <span>Load into POS Cart</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDismissQueueOrder(order._id)}
                          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-red-400 text-xs rounded-xl transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: A4 BARCODE LABEL GENERATOR (PHASE 2) */}
        {/* ========================================================= */}
        {activeTab === 'barcodes' && (
          <div className="h-[calc(100vh-3.5rem)] p-4 sm:p-6 bg-neutral-950 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 pb-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">A4 Barcode Label Sheet Generator</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Generates standardized Code 128 sticker sheets (21 stickers per A4 page) for physical inventory tagging.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-sm text-white mb-3">Print Stickers by Product</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map(prod => (
                    <div
                      key={prod._id}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <h4 className="font-semibold text-xs text-white truncate">{prod.name}</h4>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">#{prod.barcode}</p>
                      </div>
                      <a
                        href={posApi.getProductBarcodePdfUrl(prod._id, 21)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-black text-gray-300 font-semibold text-xs rounded-lg transition-colors shrink-0 flex items-center space-x-1"
                      >
                        <FiPrinter className="w-3 h-3" />
                        <span>Print A4</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Bulk Sheets */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-white mb-3">Print Bulk Sheets by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <a
                      key={cat}
                      href={posApi.getCategoryBarcodePdfUrl(cat)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-gray-200 transition-colors"
                    >
                      <FiGrid className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cat} Collection</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewfinder Modal */}
      <BarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          refocusBarcodeInput();
        }}
        onDetected={handleCameraScan}
      />

      {/* Sale Success & Receipt Preview Modal */}
      <AnimatePresence>
        {completedOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <FiCheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white">Sale Completed!</h3>
              <p className="text-xs text-gray-400 mt-1">
                Stock decremented instantly from main inventory.
              </p>

              {/* Order Meta Box */}
              <div className="my-5 p-4 bg-black rounded-xl border border-neutral-800/80 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Ref:</span>
                  <span className="font-mono font-bold text-white">
                    #SKN-{String(completedOrderData.order.id).slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="font-bold text-emerald-400">
                    KES {completedOrderData.order.totalAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment:</span>
                  <span className="font-semibold text-gray-200">
                    {completedOrderData.order.paymentMethod}
                  </span>
                </div>

                {/* WhatsApp Status Indicator */}
                <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                  <span className="text-gray-400">WhatsApp Receipt:</span>
                  {completedOrderData.whatsappDispatched ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <FiCheckCircle className="w-3 h-3" />
                      <span>Sent to +{completedOrderData.phone}</span>
                    </span>
                  ) : completedOrderData.phone ? (
                    <span className="text-amber-400 text-[11px]">
                      {completedOrderData.whatsappError || 'Bot offline (Saved on server)'}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-[11px]">No phone supplied</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {completedOrderData.receiptBase64 && (
                  <button
                    onClick={() => {
                      const win = window.open();
                      win.document.write(
                        `<iframe src="data:application/pdf;base64,${completedOrderData.receiptBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                      );
                    }}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-neutral-700"
                  >
                    <FiPrinter className="w-4 h-4" />
                    <span>View / Print PDF Receipt</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCompletedOrderData(null);
                    refocusBarcodeInput();
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/40"
                >
                  Start Next Sale (Refocus Scanner)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PosDashboard;
