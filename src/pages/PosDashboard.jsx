import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiCamera,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiPrinter,
  FiRefreshCw,
  FiLogOut,
  FiGrid,
  FiArrowRight,
  FiPause,
  FiPlay,
  FiPhone,
  FiCheck,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { posApi } from '../utils/posApi';
import BarcodeScannerModal from '../components/pos/BarcodeScannerModal';

// Hardware-Accelerated Animation & Micro-Interactions
// Imported from @formkit/auto-animate/react and @number-flow/react
import { useAutoAnimate } from '@formkit/auto-animate/react';
import NumberFlow from '@number-flow/react';

// Brand Fallback Asset URL
const FALLBACK_LOGO_URL = 'https://www.seekonapparelglobal.com/seekon_bg-removebg-preview.png';

const PosDashboard = () => {
  const { user, logout } = useAuth();

  // Navigation tab: 'pos' (50/50 Terminal) | 'queue' (WhatsApp Pool) | 'barcodes' (Sticker Sheets)
  const [activeTab, setActiveTab] = useState('pos');

  // Master product catalog state (loaded once from DB display pool, then client-side filtered & sorted)
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Search & Filtering state
  const [topSearch, setTopSearch] = useState('');
  const [quickBarcodeQuery, setQuickBarcodeQuery] = useState('');
  const [quickBarcodeQty, setQuickBarcodeQty] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in-stock' | 'low-stock'
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'price-low' | 'price-high' | 'stock-high' | 'stock-low' | 'newest'
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Hardware-Accelerated Auto-Animate list refs
  const [catalogListRef] = useAutoAnimate({ duration: 180, easing: 'ease-out' });
  const [cartListRef] = useAutoAnimate({ duration: 180, easing: 'ease-out' });

  // Input Focus Management (continuous blinking cursor for USB hardware scanners)
  const topSearchInputRef = useRef(null);
  const quickBarcodeInputRef = useRef(null);

  // Active Cart state
  const [cart, setCart] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0);

  // Held Carts (Vegas POS / Litaj Hardware style)
  const [heldCarts, setHeldCarts] = useState([]);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);

  // Checkout Modal & Dynamic Payment Breakdown
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState('Cash'); // 'Cash' | 'M-Pesa' | 'Split'
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [linkedUser, setLinkedUser] = useState(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [mpesaTendered, setMpesaTendered] = useState('');
  const [mpesaRef, setMpesaRef] = useState('');
  const [notes, setNotes] = useState('');
  const [sendWhatsAppReceipt, setSendWhatsAppReceipt] = useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Sale Complete Receipt Modal
  const [completedOrderData, setCompletedOrderData] = useState(null);

  // WhatsApp Headless Order Pool state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. FOCUS WATCHDOG (Continuous Auto-Focus on Barcode/Search Input)
  // ─────────────────────────────────────────────────────────────────────────
  const refocusBarcodeInput = () => {
    // Never steal focus if an interactive modal is currently active
    if (isCheckoutModalOpen || isHeldCartsModalOpen || isCameraOpen || completedOrderData) {
      return;
    }
    setTimeout(() => {
      if (quickBarcodeInputRef.current && document.activeElement !== quickBarcodeInputRef.current) {
        quickBarcodeInputRef.current.focus();
      }
    }, 60);
  };

  useEffect(() => {
    refocusBarcodeInput();
  }, [activeTab, isCheckoutModalOpen, isHeldCartsModalOpen, isCameraOpen, completedOrderData]);

  // 30-second Inactivity Watchdog (re-snaps focus to barcode scanner input)
  useEffect(() => {
    let timer = null;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refocusBarcodeInput();
      }, 30000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isCheckoutModalOpen, isHeldCartsModalOpen]);

  // Keyboard Shortcuts (F2: Checkout, F3: Top Search, Esc: Reset / Cancel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0 && !isCheckoutModalOpen) {
          handleOpenCheckout();
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        topSearchInputRef.current?.focus();
        topSearchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        if (isCheckoutModalOpen) setIsCheckoutModalOpen(false);
        if (isHeldCartsModalOpen) setIsHeldCartsModalOpen(false);
        if (isCameraOpen) setIsCameraOpen(false);
        refocusBarcodeInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isCheckoutModalOpen, isHeldCartsModalOpen, isCameraOpen]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LOAD PRODUCT CATALOG (Connects to full display pool + offline cache)
  // ─────────────────────────────────────────────────────────────────────────
  const loadFullCatalog = async () => {
    try {
      setIsLoadingProducts(true);

      // Attempt 1: Fetch from dedicated POS endpoint with high limit (1000 items)
      const posRes = await posApi.searchProducts('', 1000).catch(() => null);

      let loaded = [];
      if (posRes?.success && Array.isArray(posRes.products) && posRes.products.length > 0) {
        loaded = posRes.products;
      } else {
        // Fallback: Fetch directly from the main store display pool (/api/products)
        const storeProducts = await posApi.fetchAllStoreProducts();
        if (storeProducts && storeProducts.length > 0) {
          loaded = storeProducts.map(p => ({
            ...p,
            _id: p._id || p.id,
            stock: typeof p.stock === 'number' ? p.stock : 0,
            inStock: (typeof p.stock === 'number' ? p.stock > 0 : true) && p.inStock !== false,
            image: p.image || p.images?.[0] || '',
            barcode: p.barcode || (p._id ? `7${String(p._id).slice(-11)}` : '700000000001')
          }));
        }
      }

      if (loaded.length > 0) {
        setAllProducts(loaded);
        localStorage.setItem('seekon_pos_inventory_cache', JSON.stringify(loaded));
      } else {
        // Restore from offline cache if network failed
        const cached = localStorage.getItem('seekon_pos_inventory_cache');
        if (cached) {
          setAllProducts(JSON.parse(cached));
          toast('Loaded products from local cache (offline mode)');
        }
      }
    } catch (err) {
      console.error('Failed to load POS catalog:', err);
      const cached = localStorage.getItem('seekon_pos_inventory_cache');
      if (cached) {
        setAllProducts(JSON.parse(cached));
      }
    } finally {
      setIsLoadingProducts(false);
      refocusBarcodeInput();
    }
  };

  useEffect(() => {
    loadFullCatalog();

    // Load held carts from local storage
    const savedHeld = localStorage.getItem('seekon_held_carts');
    if (savedHeld) {
      try {
        setHeldCarts(JSON.parse(savedHeld));
      } catch (e) {
        console.warn('Failed to parse held carts:', e);
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. CATEGORY DEDUPLICATION & DYNAMIC SORTING
  // ─────────────────────────────────────────────────────────────────────────
  // Deduplicate categories using .trim().toLowerCase() and display in clean Title Case
  const categories = useMemo(() => {
    const categoryMap = new Map(); // lowercase -> Title Case display
    allProducts.forEach(p => {
      const raw = (p.category || '').trim();
      if (!raw) return;
      const lower = raw.toLowerCase();
      if (!categoryMap.has(lower)) {
        // Clean Title Case
        const titleCase = lower.charAt(0).toUpperCase() + lower.slice(1);
        categoryMap.set(lower, titleCase);
      }
    });
    const sorted = Array.from(categoryMap.values()).sort((a, b) => a.localeCompare(b));
    return ['ALL', ...sorted];
  }, [allProducts]);

  // Reactive filtering and sorting (Instant zero-latency execution)
  const filteredAndSortedProducts = useMemo(() => {
    const query = (quickBarcodeQuery || topSearch || '').trim().toLowerCase();

    // 1. Filter
    let list = allProducts.filter(item => {
      // Category Filter (Case-insensitive match)
      const itemCat = (item.category || '').trim().toLowerCase();
      const matchCat = selectedCategory === 'ALL' || itemCat === selectedCategory.toLowerCase();

      // Stock Filter
      let matchStock = true;
      if (stockFilter === 'in-stock') {
        matchStock = item.stock > 0;
      } else if (stockFilter === 'low-stock') {
        matchStock = item.stock > 0 && item.stock <= 5;
      }

      // Search Filter (Search in name, category, brand, barcode, SKU, tags)
      let matchQuery = true;
      if (query) {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const catMatch = itemCat.includes(query);
        const brandMatch = (item.brand || '').toLowerCase().includes(query);
        const barcodeMatch = String(item.barcode || '').toLowerCase().includes(query);
        const skuMatch = String(item.sku || '').toLowerCase().includes(query);
        matchQuery = nameMatch || catMatch || brandMatch || barcodeMatch || skuMatch;
      }

      return matchCat && matchStock && matchQuery;
    });

    // 2. Sort
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-low':
          return Number(a.price || 0) - Number(b.price || 0);
        case 'price-high':
          return Number(b.price || 0) - Number(a.price || 0);
        case 'stock-high':
          return Number(b.stock || 0) - Number(a.stock || 0);
        case 'stock-low':
          return Number(a.stock || 0) - Number(b.stock || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [allProducts, topSearch, quickBarcodeQuery, selectedCategory, stockFilter, sortBy]);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. INSTANT BARCODE / NAME QUICK ADD (Bottom Bar like Litaj Hardware)
  // ─────────────────────────────────────────────────────────────────────────
  const handleQuickBarcodeAdd = (e) => {
    if (e) e.preventDefault();
    const query = quickBarcodeQuery.trim().toLowerCase();
    const qty = Math.max(1, parseFloat(quickBarcodeQty) || 1);

    if (!query) return;

    // Multi-level exact hierarchy matching
    const match =
      allProducts.find(p => String(p.barcode || '').toLowerCase() === query) ||
      allProducts.find(p => String(p.sku || '').toLowerCase() === query) ||
      allProducts.find(p => (p.name || '').toLowerCase() === query) ||
      allProducts.find(p => (p.name || '').toLowerCase().startsWith(query)) ||
      allProducts.find(p => (p.name || '').toLowerCase().includes(query));

    if (match) {
      addToCart(match, qty);
      setQuickBarcodeQuery('');
      setQuickBarcodeQty(1);
      toast.success(`Added ${qty}x ${match.name}`);
    } else {
      toast.error(`No item found matching "${query}"`);
    }

    refocusBarcodeInput();
  };

  const handleCameraScan = (decodedBarcode) => {
    if (!decodedBarcode) return;
    const clean = String(decodedBarcode).trim();
    setQuickBarcodeQuery(clean);

    const match = allProducts.find(
      p => String(p.barcode) === clean || String(p.sku).toLowerCase() === clean.toLowerCase()
    );

    if (match) {
      addToCart(match, 1);
      setQuickBarcodeQuery('');
      toast.success(`Camera scanned: ${match.name}`);
    } else {
      toast(`Scanned: ${clean}. Search filtered.`);
    }

    setIsCameraOpen(false);
    refocusBarcodeInput();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CART OPERATIONS & VALIDATIONS
  // ─────────────────────────────────────────────────────────────────────────
  const addToCart = (product, qtyToAdd = 1) => {
    const validQty = Math.max(1, Number(qtyToAdd) || 1);

    if (product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock!`);
      refocusBarcodeInput();
      return;
    }

    setCart(prevCart => {
      const idx = prevCart.findIndex(item => item.productId === product._id);
      if (idx > -1) {
        const existing = prevCart[idx];
        const newQty = existing.quantity + validQty;
        if (newQty > product.stock) {
          toast.error(`Stock limit reached! Available: ${product.stock}`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[idx] = {
          ...existing,
          quantity: newQty,
          total: newQty * existing.price
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            category: product.category || 'Apparel',
            price: Number(product.price || 0),
            stock: product.stock,
            image: product.image || product.images?.[0] || '',
            size: product.sizes?.[0] || 'Standard',
            color: product.colors?.[0] || 'Standard',
            quantity: validQty,
            total: validQty * Number(product.price || 0)
          }
        ];
      }
    });

    refocusBarcodeInput();
  };

  const updateCartQty = (productId, newQty) => {
    const parsedQty = parseFloat(newQty);
    setCart(prevCart => {
      const idx = prevCart.findIndex(c => c.productId === productId);
      if (idx === -1) return prevCart;

      const item = prevCart[idx];
      if (isNaN(parsedQty) || parsedQty <= 0) {
        return prevCart.filter(c => c.productId !== productId);
      }

      if (parsedQty > item.stock) {
        toast.error(`Cannot exceed stock count (${item.stock})`);
        return prevCart;
      }

      const updated = [...prevCart];
      updated[idx] = {
        ...item,
        quantity: parsedQty,
        total: parsedQty * item.price
      };
      return updated;
    });
  };

  const removeCartItem = (productId) => {
    setCart(prevCart => prevCart.filter(c => c.productId !== productId));
    refocusBarcodeInput();
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from active cart?')) {
      setCart([]);
      setCartDiscount(0);
      refocusBarcodeInput();
      toast('Cart cleared');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 6. TOTALS & DISCOUNT (Capped at 50% max)
  // ─────────────────────────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  }, [cart]);

  const maxDiscountAllowed = subtotal * 0.5;

  const validDiscount = useMemo(() => {
    const num = Math.max(0, parseFloat(cartDiscount) || 0);
    return Math.min(num, maxDiscountAllowed);
  }, [cartDiscount, maxDiscountAllowed]);

  const grandTotal = Math.max(0, subtotal - validDiscount);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CART HOLD & RECALL (Vegas POS / Litaj Hardware Feature)
  // ─────────────────────────────────────────────────────────────────────────
  const handleHoldCart = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const newHeld = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-KE'),
      cashier: user?.name || user?.email || 'Cashier',
      items: [...cart],
      discount: validDiscount,
      total: grandTotal
    };

    const updated = [newHeld, ...heldCarts];
    setHeldCarts(updated);
    localStorage.setItem('seekon_held_carts', JSON.stringify(updated));

    setCart([]);
    setCartDiscount(0);
    refocusBarcodeInput();
    toast.success('Cart saved on HOLD ⏸️');
  };

  const handleRestoreHeldCart = (heldId) => {
    const target = heldCarts.find(h => h.id === heldId);
    if (!target) return;

    if (cart.length > 0) {
      if (!window.confirm('Overwriting current active cart with held cart. Proceed?')) {
        return;
      }
    }

    setCart(target.items);
    setCartDiscount(target.discount || 0);

    const remaining = heldCarts.filter(h => h.id !== heldId);
    setHeldCarts(remaining);
    localStorage.setItem('seekon_held_carts', JSON.stringify(remaining));

    setIsHeldCartsModalOpen(false);
    refocusBarcodeInput();
    toast.success('Cart restored ▶️');
  };

  const handleDiscardHeldCart = (heldId) => {
    const remaining = heldCarts.filter(h => h.id !== heldId);
    setHeldCarts(remaining);
    localStorage.setItem('seekon_held_carts', JSON.stringify(remaining));
    toast('Held cart discarded');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 8. DYNAMIC CHECKOUT MODAL & CUSTOMER LOOKUP
  // ─────────────────────────────────────────────────────────────────────────
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Add items first.');
      return;
    }

    if (grandTotal <= 0) {
      toast.error('Grand total must be greater than zero.');
      return;
    }

    // Default payment method and initial tender amounts
    setActivePaymentMethod('Cash');
    setCashTendered(String(grandTotal));
    setMpesaTendered('0');
    setMpesaRef('');
    setIsCheckoutModalOpen(true);
  };

  // Debounced customer lookup by phone number
  useEffect(() => {
    if (!customerPhone || customerPhone.trim().length < 8) {
      setLinkedUser(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingUser(true);
        const res = await posApi.lookupCustomer(customerPhone);
        if (res.success && res.found && res.user) {
          setLinkedUser(res.user);
          if (!customerName || customerName === 'Walk-in Customer') {
            setCustomerName(res.user.name);
          }
        } else {
          setLinkedUser(null);
        }
      } catch (e) {
        setLinkedUser(null);
      } finally {
        setIsSearchingUser(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customerPhone]);

  // Payment Breakdown Calculations
  const numCash = Math.max(0, parseFloat(cashTendered) || 0);
  const numMpesa = Math.max(0, parseFloat(mpesaTendered) || 0);

  const totalTendered = useMemo(() => {
    if (activePaymentMethod === 'Cash') return numCash;
    if (activePaymentMethod === 'M-Pesa') return numMpesa;
    return numCash + numMpesa; // Split
  }, [activePaymentMethod, numCash, numMpesa]);

  const changeToReturn = Math.max(0, totalTendered - grandTotal);
  const remainingBalance = Math.max(0, grandTotal - totalTendered);

  // Submit Final Sale
  const handleSubmitCheckout = async () => {
    if (remainingBalance > 0) {
      toast.error(`Payment incomplete! Remaining balance: KES ${remainingBalance.toLocaleString()}`);
      return;
    }

    try {
      setIsSubmittingCheckout(true);

      const payload = {
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim() || linkedUser?.name || 'Walk-in Customer',
        payments: {
          cash: activePaymentMethod === 'M-Pesa' ? 0 : numCash,
          mpesa: activePaymentMethod === 'Cash' ? 0 : numMpesa
        },
        paymentMethod: activePaymentMethod,
        notes: notes.trim(),
        sendWhatsAppReceipt
      };

      const res = await posApi.checkout(payload);

      if (res.success) {
        toast.success('Sale completed successfully! 🎉');

        // Optimistically deduct stock in local inventory state
        setAllProducts(prev => {
          const map = new Map(cart.map(c => [c.productId, c.quantity]));
          return prev.map(p => {
            const deducted = map.get(p._id);
            if (deducted) {
              const updatedStock = Math.max(0, (p.stock || 0) - deducted);
              return { ...p, stock: updatedStock, inStock: updatedStock > 0 };
            }
            return p;
          });
        });

        // Set Completed Order Data for Receipt Preview Modal
        setCompletedOrderData({
          order: res.order,
          receiptBase64: res.receiptBase64,
          whatsappDispatched: res.whatsappDispatched,
          whatsappError: res.whatsappError,
          phone: customerPhone.trim()
        });

        // Reset Cart and Checkout states
        setCart([]);
        setCartDiscount(0);
        setCustomerPhone('');
        setCustomerName('');
        setNotes('');
        setCashTendered('');
        setMpesaTendered('');
        setIsCheckoutModalOpen(false);
      } else {
        toast.error(res.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Checkout failed');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 9. WHATSAPP QUEUE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────
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

  const handleLoadQueueOrder = (order) => {
    // Fill customer info
    if (order.customerPhone) setCustomerPhone(order.customerPhone);
    if (order.customerName) setCustomerName(order.customerName);

    // Convert items into active cart format
    const convertedItems = (order.items || []).map(item => {
      const matched = allProducts.find(
        p => (p.name || '').toLowerCase() === (item.productName || '').toLowerCase()
      );
      return {
        productId: matched ? matched._id : (item.product || `manual-${Date.now()}`),
        name: item.productName || item.name || 'WhatsApp Order Item',
        category: matched?.category || 'Apparel',
        price: Number(item.price || matched?.price || 0),
        stock: matched?.stock || 99,
        image: matched?.image || matched?.images?.[0] || '',
        size: item.size || 'Standard',
        color: item.color || 'Standard',
        quantity: Number(item.quantity || 1),
        total: Number(item.price || matched?.price || 0) * Number(item.quantity || 1)
      };
    });

    setCart(convertedItems);
    setActiveTab('pos');
    toast.success(`Loaded order #${order._id.slice(-6)} into POS cart!`);
    refocusBarcodeInput();
  };

  const handleDismissQueueOrder = async (orderId) => {
    if (!window.confirm('Dismiss this order from WhatsApp queue?')) return;
    try {
      await posApi.dismissPendingOrder(orderId);
      setPendingOrders(prev => prev.filter(o => o._id !== orderId));
      toast('Order dismissed from queue');
    } catch (e) {
      toast.error('Failed to dismiss order');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: STOREFRONT-ALIGNED THEME (FROSTED GLASS, ZINC-900 & EMERALD)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 select-none">

      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR (Frosted Glass with Mint Tint)      */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/40 via-white/80 to-white/80 shadow-2xs">
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/seekon_bg-removebg-preview.png"
                  alt="Seekon Apparel"
                  className="h-8 md:h-9 w-auto object-contain transition-transform hover:scale-105"
                  onError={(e) => { e.target.src = FALLBACK_LOGO_URL; }}
                />
                <div className="flex items-center space-x-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tighter text-zinc-950">
                    SEEKON
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white shadow-xs">
                    POS
                  </span>
                </div>
              </div>

              {/* Status Pill with Pulsing Emerald Dot */}
              <div className="hidden md:flex items-center space-x-2 text-xs font-semibold bg-white/90 px-3 py-1 rounded-xl border border-zinc-200/80 text-zinc-700 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-zinc-900">Terminal Online</span>
                <span className="text-zinc-300">•</span>
                <span className="capitalize text-zinc-600 font-medium truncate max-w-[120px]">
                  {user?.name || user?.email || 'Cashier'}
                </span>
              </div>
            </div>

            {/* Desktop Keyboard Shortcuts (Hidden on mobile) */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-zinc-500 bg-white/70 px-3 py-1 rounded-xl border border-zinc-200/70 shadow-2xs">
              <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-800 border border-zinc-200">F2</kbd> Checkout</span>
              <span className="text-zinc-300">•</span>
              <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-800 border border-zinc-200">F3</kbd> Search</span>
              <span className="text-zinc-300">•</span>
              <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-800 border border-zinc-200">Esc</kbd> Cancel</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => { setActiveTab('pos'); refocusBarcodeInput(); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 ${
                  activeTab === 'pos'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>💻</span>
                <span>POS Terminal</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 relative ${
                  activeTab === 'queue'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>📱</span>
                <span>WhatsApp Queue</span>
                {pendingOrders.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('barcodes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 ${
                  activeTab === 'barcodes'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>🏷️</span>
                <span>Barcode Labels</span>
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-95 ml-1"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE                             */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-0 p-2 sm:p-3 overflow-hidden">

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 1: 50/50 SPLIT POS WORKSPACE                         */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'pos' && (
          <div className="h-[calc(100vh-4.75rem)] flex flex-col lg:flex-row gap-3 overflow-hidden">

            {/* ═════════════════════════════════════════════════════ */}
            {/* LEFT SIDE: CATALOG, LIVE SEARCH, DYNAMIC SORTING    */}
            {/* ═════════════════════════════════════════════════════ */}
            <section className="w-full lg:w-7/12 flex flex-col gap-2.5 h-full overflow-hidden">

              {/* Search & Filter Controls Card (Glassmorphic) */}
              <div className="bg-white/75 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-3 flex flex-col gap-2.5 flex-shrink-0">
                
                {/* Search Bar Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <FiSearch className="w-5 h-5" />
                    </div>
                    <input
                      ref={topSearchInputRef}
                      type="text"
                      value={topSearch}
                      onChange={(e) => setTopSearch(e.target.value)}
                      placeholder="Search apparel by name, brand, SKU, or barcode (F3)..."
                      className="w-full pl-11 pr-9 py-2.5 bg-zinc-50/80 border border-zinc-200 rounded-xl font-bold text-sm sm:text-base text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 focus:bg-white transition"
                    />
                    {topSearch && (
                      <button
                        onClick={() => { setTopSearch(''); topSearchInputRef.current?.focus(); }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 text-xl font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* Camera Scanner Trigger */}
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    title="Scan with Camera"
                    className="h-11 px-3.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 border border-zinc-200/80 rounded-xl font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs"
                  >
                    <FiCamera className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Scan</span>
                  </button>

                  {/* Refresh Full Inventory */}
                  <button
                    onClick={loadFullCatalog}
                    title="Reload Full Catalog from Server"
                    disabled={isLoadingProducts}
                    className="h-11 px-3 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 rounded-xl font-bold transition-all duration-150 flex items-center justify-center disabled:opacity-50"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin text-zinc-900' : ''}`} />
                  </button>
                </div>

                {/* Dynamic Deduplicated Category Chips Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                  {categories.map(cat => {
                    const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'bg-zinc-900 text-white shadow-sm font-black'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Items' : cat}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Sorting & Stock Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
                  
                  {/* Sorting Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2.5 py-1 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="name-asc">Name (A → Z)</option>
                      <option value="name-desc">Name (Z → A)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="stock-high">Stock: High to Low</option>
                      <option value="stock-low">Low Stock First</option>
                      <option value="newest">Newest Added</option>
                    </select>
                  </div>

                  {/* Stock Status Filter Chips */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 font-bold">
                    <button
                      onClick={() => setStockFilter('all')}
                      className={`px-2 py-0.5 rounded-md transition-all duration-150 ${
                        stockFilter === 'all' ? 'bg-white text-zinc-950 shadow-2xs font-black' : 'text-zinc-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStockFilter('in-stock')}
                      className={`px-2 py-0.5 rounded-md transition-all duration-150 ${
                        stockFilter === 'in-stock' ? 'bg-white text-emerald-700 shadow-2xs font-black' : 'text-zinc-600'
                      }`}
                    >
                      In Stock
                    </button>
                    <button
                      onClick={() => setStockFilter('low-stock')}
                      className={`px-2 py-0.5 rounded-md transition-all duration-150 ${
                        stockFilter === 'low-stock' ? 'bg-white text-amber-700 shadow-2xs font-black' : 'text-zinc-600'
                      }`}
                    >
                      Low Stock (≤5)
                    </button>
                  </div>

                  {/* Active Count Pill */}
                  <span className="text-[11px] font-bold text-zinc-500">
                    Showing <span className="text-zinc-900 font-black">{filteredAndSortedProducts.length}</span> of {allProducts.length}
                  </span>
                </div>
              </div>

              {/* Product List Container (Layered Glassmorphic Card List) */}
              <div className="bg-white/75 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex-1 flex flex-col overflow-hidden">
                <div className="px-3.5 py-2.5 bg-zinc-50/70 border-b border-zinc-200/80 flex justify-between items-center flex-shrink-0">
                  <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                    Store Catalog ({selectedCategory})
                  </span>
                  {isLoadingProducts && (
                    <span className="text-xs font-bold text-emerald-600 animate-pulse">Syncing catalog...</span>
                  )}
                </div>

                {/* Auto-Animated Products List */}
                <div ref={catalogListRef} className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-1">
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400 font-medium">
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="text-sm font-bold text-zinc-700">No matching products found</div>
                      <p className="text-xs text-zinc-400 mt-1">Try clearing search filters or refreshing catalog</p>
                    </div>
                  ) : (
                    filteredAndSortedProducts.map(product => {
                      const isOutOfStock = product.stock <= 0;
                      const isLowStock = product.stock > 0 && product.stock <= 5;

                      return (
                        <div
                          key={product._id}
                          onClick={() => addToCart(product, 1)}
                          className="p-2.5 sm:p-3 hover:bg-zinc-50 active:bg-zinc-100 transition-colors flex items-center justify-between gap-3 cursor-pointer select-none rounded-xl"
                        >
                          {/* Image Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200/70 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-xs text-zinc-400 font-bold">SK</span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 pr-1">
                            <h4 className="font-bold text-zinc-900 text-sm sm:text-base leading-snug truncate">
                              {product.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold text-[11px]">
                                {product.category || 'Apparel'}
                              </span>

                              {/* Stock status badge */}
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 font-semibold text-[11px]">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold text-[11px]">
                                  {product.stock} left
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-[11px]">
                                  {product.stock} in stock
                                </span>
                              )}

                              {product.barcode && (
                                <span className="hidden sm:inline font-mono text-[11px] text-zinc-400 font-medium">
                                  #{product.barcode}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Tactile Add Action */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-bold text-zinc-400">Price</div>
                              <div className="text-sm sm:text-base font-black text-zinc-950">
                                KES {Number(product.price || 0).toLocaleString()}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              disabled={isOutOfStock}
                              title="Add to cart"
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 hover:bg-black active:scale-95 disabled:bg-zinc-200 disabled:active:scale-100 text-white font-black text-lg flex items-center justify-center shadow-xs transition-all duration-150 flex-shrink-0"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Barcode / Instant Add Bar (Frosted Glass Bottom Bar) */}
                <form
                  onSubmit={handleQuickBarcodeAdd}
                  className="p-2.5 bg-white/90 backdrop-blur-xl border-t border-zinc-200/80 flex items-center gap-2 flex-shrink-0"
                >
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <FiSearch className="w-4 h-4" />
                    </div>
                    <input
                      ref={quickBarcodeInputRef}
                      type="text"
                      value={quickBarcodeQuery}
                      onChange={(e) => setQuickBarcodeQuery(e.target.value)}
                      placeholder="Instant barcode scan / Type product name & Enter to add..."
                      className="w-full pl-9 pr-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold text-xs sm:text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 shadow-2xs"
                      autoComplete="off"
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={quickBarcodeQty}
                    onChange={(e) => setQuickBarcodeQty(e.target.value)}
                    className="w-16 border border-zinc-300 rounded-xl px-1.5 py-2.5 font-black text-center text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
                    placeholder="Qty"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center gap-1 shadow-xs"
                  >
                    + Add
                  </button>
                </form>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════ */}
            {/* RIGHT SIDE: CART & DYNAMIC CHECKOUT PANEL          */}
            {/* ═════════════════════════════════════════════════════ */}
            <section className="w-full lg:w-5/12 flex flex-col gap-2.5 h-full overflow-hidden">
              <div className="bg-white/75 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex-1 flex flex-col overflow-hidden">
                
                {/* Cart Header */}
                <div className="p-3 sm:p-3.5 border-b border-zinc-200/80 flex justify-between items-center bg-zinc-50/70 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-zinc-900 tracking-tight">Active Cart</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white shadow-2xs">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </div>

                  {/* Cart Action Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={handleHoldCart}
                      title="Hold Cart"
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 transition-all duration-150 flex items-center space-x-1 border border-zinc-200/80"
                    >
                      <FiPause className="w-3 h-3" />
                      <span>Hold</span>
                    </button>

                    <button
                      onClick={() => setIsHeldCartsModalOpen(true)}
                      title="Recall Held Cart"
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 transition-all duration-150 flex items-center space-x-1 border border-zinc-200/80 relative"
                    >
                      <FiPlay className="w-3 h-3" />
                      <span>Recall</span>
                      {heldCarts.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                          {heldCarts.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={clearCart}
                      title="Clear Cart"
                      className="text-xs font-bold px-2 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 transition-all duration-150 border border-red-200/60"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cart Items Auto-Animated List Area */}
                <div ref={cartListRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center select-none">
                      {/* Subtle, low-opacity Seekon watermark */}
                      <img
                        src="/seekon_bg-removebg-preview.png"
                        alt="Seekon Watermark"
                        className="w-28 h-auto opacity-15 grayscale mb-3 pointer-events-none transition-opacity"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="font-bold text-zinc-700 text-base">Cart is empty</div>
                      <p className="text-xs text-zinc-400 mt-1">Tap catalog items or scan barcode to add</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div
                        key={item.productId}
                        className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-2xs flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-zinc-900 text-sm leading-snug truncate">{item.name}</h4>
                            <div className="text-xs text-zinc-500 font-medium mt-0.5">
                              KES {item.price.toLocaleString()} each • {item.size} / {item.color}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCartItem(item.productId)}
                            className="text-zinc-400 hover:text-red-600 active:scale-90 p-1 transition-all duration-150"
                            title="Remove"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stepper & Line Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
                            <button
                              onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white active:scale-90 text-zinc-900 font-black text-sm shadow-2xs flex items-center justify-center transition-all duration-150"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartQty(item.productId, e.target.value)}
                              className="w-12 h-7 text-center bg-transparent font-black text-sm text-zinc-900 focus:outline-none"
                            />
                            <button
                              onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white active:scale-90 text-zinc-900 font-black text-sm shadow-2xs flex items-center justify-center transition-all duration-150"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-zinc-400 font-bold uppercase">Total</div>
                            <div className="text-sm sm:text-base font-black text-zinc-900">
                              KES {item.total.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Totals & Checkout Trigger (Obsidian-Glass Dark Finish) */}
                <div className="p-3.5 sm:p-4 bg-zinc-950/95 backdrop-blur-md text-white rounded-b-2xl border-t border-zinc-800 flex flex-col gap-2.5 flex-shrink-0 shadow-xl">
                  
                  {/* Subtotal with NumberFlow Odometer */}
                  <div className="flex justify-between items-center text-xs text-zinc-300">
                    <span className="font-bold tracking-wide">SUBTOTAL</span>
                    <span className="font-black text-white text-sm sm:text-base">
                      <NumberFlow
                        value={subtotal}
                        prefix="KES "
                        format={{ maximumFractionDigits: 0 }}
                      />
                    </span>
                  </div>

                  {/* Discount with NumberFlow Odometer */}
                  <div className="flex justify-between items-center text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wide">DISCOUNT (KES)</span>
                      <input
                        type="number"
                        min="0"
                        value={cartDiscount}
                        onChange={(e) => setCartDiscount(e.target.value)}
                        className="w-20 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-right text-xs font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="0"
                      />
                    </div>
                    <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                      <NumberFlow
                        value={validDiscount}
                        prefix="- KES "
                        format={{ maximumFractionDigits: 0 }}
                      />
                    </span>
                  </div>

                  {cartDiscount > maxDiscountAllowed && (
                    <div className="text-[10px] text-amber-300 font-bold bg-amber-950/60 border border-amber-800/80 rounded px-2 py-0.5">
                      Discount capped at 50% max (KES {maxDiscountAllowed.toLocaleString()})
                    </div>
                  )}

                  <div className="h-px bg-zinc-800 my-0.5"></div>

                  {/* Grand Total with NumberFlow Rolling Odometer */}
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">TOTAL DUE</span>
                      <div className="text-[11px] text-zinc-400">Tax inclusive</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                      <NumberFlow
                        value={grandTotal}
                        prefix="KES "
                        format={{ maximumFractionDigits: 0 }}
                      />
                    </div>
                  </div>

                  {/* Tactile Complete Sale Button */}
                  <button
                    onClick={handleOpenCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:bg-zinc-800 disabled:opacity-50 text-zinc-950 font-black text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>⚡</span>
                    <span>COMPLETE SALE (F2)</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 2: WHATSAPP HEADLESS ORDER POOL                      */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'queue' && (
          <div className="h-[calc(100vh-4.75rem)] p-3 sm:p-6 bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-200/80">
                <div>
                  <h2 className="text-lg font-black text-zinc-950">WhatsApp Command Center Queue</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Orders dropped in WhatsApp command groups queued for cashier confirmation.
                  </p>
                </div>
                <button
                  onClick={fetchQueue}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all duration-150 shadow-xs"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
                  <div className="text-4xl mb-2">💬</div>
                  <h3 className="text-base font-bold text-zinc-800">Queue is Clear</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    No pending orders in WhatsApp Command Center. Drop manual order messages into the group to queue them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map(order => (
                    <div
                      key={order._id}
                      className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-black text-zinc-950 text-sm">{order.customerName}</h4>
                            <p className="text-xs text-zinc-500 font-mono">+{order.customerPhone}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            KES {order.totalAmount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Line Items */}
                        <div className="my-3 space-y-1 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-xs">
                          {(order.items || []).map((itm, i) => (
                            <div key={i} className="flex justify-between text-zinc-700">
                              <span>{itm.quantity}x {itm.productName} ({itm.size})</span>
                              <span className="font-bold">KES {((itm.price || 0) * (itm.quantity || 1)).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Raw Message */}
                        <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg font-mono line-clamp-2 mb-3">
                          {order.rawMessage}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                        <button
                          onClick={() => handleLoadQueueOrder(order)}
                          className="flex-1 py-2 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs"
                        >
                          <span>Load into POS Cart</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDismissQueueOrder(order._id)}
                          className="px-3 py-2 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 active:scale-95 text-xs font-bold rounded-xl transition-all duration-150"
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

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 3: A4 BARCODE STICKER SHEET GENERATOR                */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'barcodes' && (
          <div className="h-[calc(100vh-4.75rem)] p-3 sm:p-6 bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 pb-3 border-b border-zinc-200/80">
                <h2 className="text-lg font-black text-zinc-950">A4 Barcode Label Sheet Generator</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Generates standardized Code 128 sticker sheets (21 stickers per A4 page) with official Seekon Apparel header.
                </p>
              </div>

              {/* Product Sheet Grid */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs mb-6">
                <h3 className="font-black text-sm text-zinc-900 mb-3">Print Stickers by Product</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allProducts.slice(0, 30).map(prod => (
                    <div
                      key={prod._id}
                      className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <h4 className="font-bold text-xs text-zinc-900 truncate">{prod.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-500">#{prod.barcode}</p>
                      </div>
                      <a
                        href={posApi.getProductBarcodePdfUrl(prod._id, 21)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-lg transition-all duration-150 shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <FiPrinter className="w-3 h-3" />
                        <span>Print A4</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Bulk Sheets */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
                <h3 className="font-black text-sm text-zinc-900 mb-3">Print Bulk Sheets by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c !== 'ALL').map(cat => (
                    <a
                      key={cat}
                      href={posApi.getCategoryBarcodePdfUrl(cat)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-xl text-xs font-bold text-zinc-800 transition-all duration-150 active:scale-95"
                    >
                      <FiGrid className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cat} Collection</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. DYNAMIC INTERACTIVE CHECKOUT MODAL                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-zinc-950 text-white flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="/seekon_bg-removebg-preview.png"
                    alt="Seekon"
                    className="h-6 w-auto object-contain brightness-0 invert"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <h3 className="text-base font-black tracking-tight">Walk-in Checkout & Payment</h3>
                    <p className="text-xs text-zinc-400">Atomic stock deduction & WhatsApp receipt dispatch</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                
                {/* Total Due Banner */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                  <span className="font-bold text-zinc-700">Total Amount Due:</span>
                  <span className="text-2xl font-black text-zinc-950">
                    KES {grandTotal.toLocaleString()}
                  </span>
                </div>

                {/* Customer Phone & Live User Linking */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800 flex justify-between items-center">
                    <span>Customer Phone (WhatsApp & Account Link):</span>
                    {isSearchingUser && (
                      <span className="text-[11px] text-emerald-600 animate-pulse font-normal">Checking user...</span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0712345678 or 254712345678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                    />
                  </div>

                  {/* Customer Linked Badge */}
                  {linkedUser ? (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Linked Account: {linkedUser.name} ({linkedUser.email})</span>
                    </div>
                  ) : customerPhone.length >= 9 ? (
                    <div className="text-[11px] text-zinc-500 font-medium">
                      👤 Walk-in customer. Branded E-receipt will be sent to WhatsApp.
                    </div>
                  ) : null}
                </div>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800">Customer Name:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800">Payment Method:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'M-Pesa', 'Split'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setActivePaymentMethod(method);
                          if (method === 'Cash') {
                            setCashTendered(String(grandTotal));
                            setMpesaTendered('0');
                          } else if (method === 'M-Pesa') {
                            setCashTendered('0');
                            setMpesaTendered(String(grandTotal));
                          } else {
                            // Split: 50/50 default
                            const half = Math.floor(grandTotal / 2);
                            setCashTendered(String(half));
                            setMpesaTendered(String(grandTotal - half));
                          }
                        }}
                        className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-150 active:scale-95 ${
                          activePaymentMethod === method
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {method === 'Cash' && '💵 Cash'}
                        {method === 'M-Pesa' && '📱 M-Pesa'}
                        {method === 'Split' && '⚖️ Split (Both)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Cash Panel ── */}
                {activePaymentMethod === 'Cash' && (
                  <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <label className="font-bold text-zinc-800">Cash Amount Tendered (KES):</label>
                    <input
                      type="number"
                      min="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl font-black text-base text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />

                    {/* Quick Tender Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setCashTendered(String(grandTotal))}
                        className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 rounded-lg text-xs font-bold text-zinc-700 transition-all duration-150"
                      >
                        Exact
                      </button>
                      {[500, 1000, 2000, 5000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(String(amt))}
                          className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 rounded-lg text-xs font-bold text-zinc-700 transition-all duration-150"
                        >
                          KES {amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── M-Pesa Panel ── */}
                {activePaymentMethod === 'M-Pesa' && (
                  <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <label className="font-bold text-zinc-800">M-Pesa Amount (KES):</label>
                    <input
                      type="number"
                      min="0"
                      value={mpesaTendered}
                      onChange={(e) => setMpesaTendered(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl font-black text-base text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <input
                      type="text"
                      value={mpesaRef}
                      onChange={(e) => setMpesaRef(e.target.value)}
                      placeholder="M-Pesa Reference / Code (Optional, e.g. QKB712345)"
                      className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 bg-white uppercase"
                    />
                  </div>
                )}

                {/* ── Split Panel ── */}
                {activePaymentMethod === 'Split' && (
                  <div className="space-y-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-zinc-800 block mb-1">Cash (KES):</label>
                        <input
                          type="number"
                          min="0"
                          value={cashTendered}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCashTendered(val);
                            const rem = Math.max(0, grandTotal - (parseFloat(val) || 0));
                            setMpesaTendered(String(rem));
                          }}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-800 block mb-1">M-Pesa (KES):</label>
                        <input
                          type="number"
                          min="0"
                          value={mpesaTendered}
                          onChange={(e) => setMpesaTendered(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const half = Math.floor(grandTotal / 2);
                          setCashTendered(String(half));
                          setMpesaTendered(String(grandTotal - half));
                        }}
                        className="flex-1 py-1 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-100 active:scale-95 transition-all duration-150"
                      >
                        50/50 Split
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const rem = Math.max(0, grandTotal - (parseFloat(cashTendered) || 0));
                          setMpesaTendered(String(rem));
                        }}
                        className="flex-1 py-1 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-100 active:scale-95 transition-all duration-150"
                      >
                        Auto-Balance M-Pesa
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Change & Balance Feedback Box */}
                <div className="p-3 rounded-xl border border-zinc-200 flex justify-between items-center bg-zinc-50">
                  <div>
                    <span className="text-xs text-zinc-500 font-semibold">Total Paid:</span>
                    <div className="font-black text-zinc-900 text-sm">
                      KES {totalTendered.toLocaleString()}
                    </div>
                  </div>

                  {remainingBalance > 0 ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600">Remaining Due:</span>
                      <div className="text-base font-black text-red-600">
                        KES {remainingBalance.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600">Change to Return:</span>
                      <div className="text-base font-black text-emerald-700">
                        KES {changeToReturn.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Receipt Toggle */}
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppReceipt}
                    onChange={(e) => setSendWhatsAppReceipt(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-700">
                    Send official branded PDF E-receipt to WhatsApp (+{customerPhone || 'phone'})
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 active:scale-95 text-zinc-700 font-bold text-xs transition-all duration-150"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCheckout}
                  disabled={isSubmittingCheckout || remainingBalance > 0}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black active:scale-95 disabled:bg-zinc-300 text-white font-black text-sm shadow-md transition-all duration-150 flex items-center gap-1.5"
                >
                  {isSubmittingCheckout ? (
                    <span>Processing Sale...</span>
                  ) : (
                    <>
                      <span>Complete & Print Receipt</span>
                      <FiCheck className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. HELD CARTS MODAL (Vegas POS / Litaj Hardware Style)    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isHeldCartsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
            >
              <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <h3 className="font-black text-zinc-900 text-base">Held Carts List</h3>
                <button
                  onClick={() => setIsHeldCartsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                {heldCarts.length === 0 ? (
                  <div className="py-8 text-center text-zinc-400 text-xs">
                    No held carts currently saved
                  </div>
                ) : (
                  heldCarts.map(held => (
                    <div
                      key={held.id}
                      className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between items-center hover:bg-zinc-100 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900">
                          {held.timestamp} • {held.date} ({held.cashier})
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {held.items.length} item(s) • Total: KES {held.total.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleRestoreHeldCart(held.id)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold rounded-lg text-xs shadow-xs transition-all duration-150"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDiscardHeldCart(held.id)}
                          className="px-2 py-1.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-bold rounded-lg text-xs transition-all duration-150"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. SALE COMPLETED / RECEIPT PREVIEW MODAL                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {completedOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 text-center overflow-hidden"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200/60">
                <FiCheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-zinc-950">Sale Completed!</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Inventory decremented instantly from main store pool.
              </p>

              {/* Order Meta Box */}
              <div className="my-4 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order Ref:</span>
                  <span className="font-mono font-bold text-zinc-900">
                    #SKN-{String(completedOrderData.order.id || completedOrderData.order._id).slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Paid:</span>
                  <span className="font-black text-emerald-600">
                    KES {Number(completedOrderData.order.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment:</span>
                  <span className="font-bold text-zinc-700">
                    {completedOrderData.order.paymentMethod}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-zinc-500">WhatsApp Receipt:</span>
                  {completedOrderData.whatsappDispatched ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Sent (+{completedOrderData.phone})</span>
                    </span>
                  ) : completedOrderData.phone ? (
                    <span className="text-amber-700 text-[11px] font-semibold">
                      {completedOrderData.whatsappError || 'Bot offline (Saved on server)'}
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-[11px]">No phone supplied</span>
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
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 border border-zinc-200"
                  >
                    <FiPrinter className="w-4 h-4" />
                    <span>View / Print PDF E-Receipt</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCompletedOrderData(null);
                    refocusBarcodeInput();
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-black active:scale-95 text-white font-black text-xs rounded-xl transition-all duration-150 shadow-md"
                >
                  Start Next Sale (Refocus Scanner)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. CAMERA SCANNER MODAL                                   */}
      {/* ========================================================= */}
      <BarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          refocusBarcodeInput();
        }}
        onDetected={handleCameraScan}
      />
    </div>
  );
};

export default PosDashboard;
