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
  FiX,
  FiDownload,
  FiTruck,
  FiPackage,
  FiMapPin,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { posApi } from '../utils/posApi';
import BarcodeScannerModal from '../components/pos/BarcodeScannerModal';

// Hardware-Accelerated Animation & Micro-Interactions
import { useAutoAnimate } from '@formkit/auto-animate/react';
import NumberFlow from '@number-flow/react';

// Brand Fallback Asset URL
const FALLBACK_LOGO_URL = 'https://www.seekonapparelglobal.com/seekon_bg-removebg-preview.png';

const PosDashboard = () => {
  const { user, logout } = useAuth();

  // Navigation tab: 'pos' (50/50 Terminal) | 'deliveries' (POD Orders) | 'queue' (WhatsApp Pool) | 'barcodes' (Sticker Sheets)
  const [activeTab, setActiveTab] = useState('pos');

  // Master product catalog state
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Search & Filtering state
  const [topSearch, setTopSearch] = useState('');
  const [quickBarcodeQuery, setQuickBarcodeQuery] = useState('');
  const [quickBarcodeQty, setQuickBarcodeQty] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in-stock' | 'low-stock'
  const [sortBy, setSortBy] = useState('name-asc');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Hardware-Accelerated Auto-Animate list refs
  const [catalogListRef] = useAutoAnimate({ duration: 180, easing: 'ease-out' });
  const [cartListRef] = useAutoAnimate({ duration: 180, easing: 'ease-out' });

  // Input Focus Management
  const topSearchInputRef = useRef(null);
  const quickBarcodeInputRef = useRef(null);

  // Active Cart state
  const [cart, setCart] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0);

  // Held Carts
  const [heldCarts, setHeldCarts] = useState([]);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState('walkin'); // 'walkin' | 'social'
  const [socialPlatform, setSocialPlatform] = useState('instagram'); // 'instagram' | 'whatsapp' | 'tiktok'
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [riderNotes, setRiderNotes] = useState('');
  const [linkedUser, setLinkedUser] = useState(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // Payment Breakdown for Walk-In
  const [activePaymentMethod, setActivePaymentMethod] = useState('Cash'); // 'Cash' | 'M-Pesa' | 'Split'
  const [cashTendered, setCashTendered] = useState('');
  const [mpesaTendered, setMpesaTendered] = useState('');
  const [mpesaRef, setMpesaRef] = useState('');

  // Payment Breakdown for Social POD Deposit
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('M-Pesa'); // 'M-Pesa' | 'Cash' | 'Split'
  const [depositCash, setDepositCash] = useState('');
  const [depositMpesa, setDepositMpesa] = useState('');

  const [notes, setNotes] = useState('');
  const [sendWhatsAppReceipt, setSendWhatsAppReceipt] = useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Sale Complete Receipt Modal
  const [completedOrderData, setCompletedOrderData] = useState(null);

  // WhatsApp Headless Order Pool state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Active Social Media / POD Deliveries state
  const [deliveries, setDeliveries] = useState([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Reconciliation Modal state
  const [reconcileModalOrder, setReconcileModalOrder] = useState(null);
  const [reconcileMethod, setReconcileMethod] = useState('M-Pesa'); // 'Cash' | 'M-Pesa' | 'Split'
  const [reconcileCash, setReconcileCash] = useState('');
  const [reconcileMpesa, setReconcileMpesa] = useState('');
  const [isSubmittingReconcile, setIsSubmittingReconcile] = useState(false);

  // Cancel & Restock Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer cancelled / returned delivery');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. FOCUS WATCHDOG (Continuous Auto-Focus on Barcode/Search Input)
  // ─────────────────────────────────────────────────────────────────────────
  const refocusBarcodeInput = () => {
    if (isCheckoutModalOpen || isHeldCartsModalOpen || isCameraOpen || completedOrderData || reconcileModalOrder || cancelModalOrder) {
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
  }, [activeTab, isCheckoutModalOpen, isHeldCartsModalOpen, isCameraOpen, completedOrderData, reconcileModalOrder, cancelModalOrder]);

  // 30-second Inactivity Watchdog
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
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  // Keyboard Shortcuts (F2: Checkout, F3: Focus Barcode, Esc: Close Modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0 && !isCheckoutModalOpen) {
          setIsCheckoutModalOpen(true);
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        refocusBarcodeInput();
      } else if (e.key === 'Escape') {
        if (isCheckoutModalOpen) setIsCheckoutModalOpen(false);
        else if (isHeldCartsModalOpen) setIsHeldCartsModalOpen(false);
        else if (isCameraOpen) setIsCameraOpen(false);
        else if (reconcileModalOrder) setReconcileModalOrder(null);
        else if (cancelModalOrder) setCancelModalOrder(null);
        else if (topSearch) setTopSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isCheckoutModalOpen, isHeldCartsModalOpen, isCameraOpen, reconcileModalOrder, cancelModalOrder, topSearch]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PRODUCT CATALOG LOADING
  // ─────────────────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      let productsList = [];
      try {
        const res = await posApi.searchProducts('', 1000);
        if (res.success && res.products?.length > 0) {
          productsList = res.products;
        }
      } catch (e) {
        console.warn('POS search endpoint fallback:', e.message);
      }

      if (productsList.length === 0) {
        productsList = await posApi.fetchAllStoreProducts();
      }

      const normalized = productsList.map(p => ({
        ...p,
        category: p.category ? p.category.trim() : 'Apparel',
        stock: typeof p.stock === 'number' ? p.stock : 10,
        inStock: (typeof p.stock === 'number' ? p.stock > 0 : true) && p.inStock !== false,
        barcode: p.barcode || (p._id ? String(parseInt(String(p._id).slice(-10), 16)).padStart(12, '0').slice(-12) : '100000000001'),
        price: Number(p.price || 0)
      }));

      setAllProducts(normalized);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load product catalog');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveries();
  }, []);

  // Categories extraction with deduplication & Title Case formatting
  const categories = useMemo(() => {
    const rawSet = new Set(allProducts.map(p => p.category).filter(Boolean));
    const titleCaseMap = new Map();
    rawSet.forEach(raw => {
      const lower = raw.trim().toLowerCase();
      if (!titleCaseMap.has(lower)) {
        const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
        titleCaseMap.set(lower, formatted);
      }
    });
    return ['ALL', ...Array.from(titleCaseMap.values())];
  }, [allProducts]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (topSearch.trim()) {
      const q = topSearch.trim().toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      const target = selectedCategory.toLowerCase();
      result = result.filter(p => p.category && p.category.toLowerCase() === target);
    }

    if (stockFilter === 'in-stock') {
      result = result.filter(p => p.stock > 0);
    } else if (stockFilter === 'low-stock') {
      result = result.filter(p => p.stock > 0 && p.stock <= 5);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'stock-high':
          return (b.stock || 0) - (a.stock || 0);
        case 'stock-low':
          return (a.stock || 0) - (b.stock || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [allProducts, topSearch, selectedCategory, stockFilter, sortBy]);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. CART OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────
  const addToCart = (product, qtyToAdd = 1) => {
    if (!product) return;

    if (product.stock !== undefined && product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock!`);
      return;
    }

    const requestedQty = Math.max(1, parseInt(qtyToAdd, 10) || 1);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.productId === product._id);
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = currentQty + requestedQty;

        if (product.stock !== undefined && newQty > product.stock) {
          toast.error(`Cannot add more than ${product.stock} units for "${product.name}"`);
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total: newQty * updated[existingIndex].price
        };
        return updated;
      } else {
        if (product.stock !== undefined && requestedQty > product.stock) {
          toast.error(`Only ${product.stock} units in stock for "${product.name}"`);
          return prevCart;
        }

        const newItem = {
          productId: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          image: product.image || product.images?.[0] || '',
          barcode: product.barcode,
          quantity: requestedQty,
          size: product.sizes?.[0] || 'Standard',
          color: product.colors?.[0] || 'Standard',
          total: requestedQty * product.price
        };
        return [newItem, ...prevCart];
      }
    });

    toast.success(`Added ${requestedQty}x ${product.name} to cart`, { id: `add-${product._id}` });
    refocusBarcodeInput();
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.productId === productId) {
          if (item.stock !== undefined && newQty > item.stock) {
            toast.error(`Maximum available stock is ${item.stock}`);
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price
          };
        }
        return item;
      });
    });
    refocusBarcodeInput();
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast('Item removed from cart', { icon: '🗑️' });
    refocusBarcodeInput();
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from the current cart?')) {
      setCart([]);
      setCartDiscount(0);
      toast('Cart cleared');
      refocusBarcodeInput();
    }
  };

  // Quick Barcode Scanning Form Submission
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const query = quickBarcodeQuery.trim();
    if (!query) return;

    const matchedProduct = allProducts.find(p =>
      p.barcode === query ||
      (p.sku && p.sku.toLowerCase() === query.toLowerCase()) ||
      (p.name && p.name.toLowerCase() === query.toLowerCase())
    );

    if (matchedProduct) {
      addToCart(matchedProduct, quickBarcodeQty);
      setQuickBarcodeQuery('');
      setQuickBarcodeQty(1);
    } else {
      toast.error(`No product found for barcode/SKU: "${query}"`);
    }

    refocusBarcodeInput();
  };

  const handleCameraScanSuccess = (decodedText) => {
    setIsCameraOpen(false);
    const matched = allProducts.find(p => p.barcode === decodedText || p.sku === decodedText);
    if (matched) {
      addToCart(matched, 1);
      toast.success(`Scanned: ${matched.name}`);
    } else {
      toast.error(`Unrecognized barcode: ${decodedText}`);
    }
    refocusBarcodeInput();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. HELD CARTS (Vegas POS / Litaj Hardware Style)
  // ─────────────────────────────────────────────────────────────────────────
  const handleHoldCart = () => {
    if (cart.length === 0) {
      toast.error('Cannot hold an empty cart');
      return;
    }
    const customerTag = customerName.trim() || customerPhone.trim() || `Customer #${heldCarts.length + 1}`;
    const newHeld = {
      id: `held-${Date.now()}`,
      customerTag,
      cart: [...cart],
      discount: cartDiscount,
      total: effectiveGrandTotal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHeldCarts(prev => [newHeld, ...prev]);
    setCart([]);
    setCartDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    toast.success(`Cart held for "${customerTag}"`);
    refocusBarcodeInput();
  };

  const handleRestoreHeldCart = (heldItem) => {
    if (cart.length > 0) {
      if (!window.confirm('Restore this cart? (Current cart items will be replaced)')) return;
    }
    setCart(heldItem.cart);
    setCartDiscount(heldItem.discount || 0);
    setHeldCarts(prev => prev.filter(h => h.id !== heldItem.id));
    setIsHeldCartsModalOpen(false);
    toast.success(`Restored cart for "${heldItem.customerTag}"`);
    refocusBarcodeInput();
  };

  const handleDeleteHeldCart = (heldId) => {
    setHeldCarts(prev => prev.filter(h => h.id !== heldId));
    toast('Held cart deleted');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. LIVE CUSTOMER PHONE LOOKUP & USER LINKING
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const clean = customerPhone.replace(/\D/g, '');
    if (clean.length < 9) {
      setLinkedUser(null);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        setIsSearchingUser(true);
        const res = await posApi.lookupCustomer(clean);
        if (res.success && res.found && res.user) {
          setLinkedUser(res.user);
          if (!customerName || customerName === 'Walk-in Customer') {
            setCustomerName(res.user.name);
          }
          toast.success(`Linked to member: ${res.user.name}`, { id: 'cust-link' });
        } else {
          setLinkedUser(null);
        }
      } catch (e) {
        console.warn('Customer lookup error:', e);
      } finally {
        setIsSearchingUser(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimer);
  }, [customerPhone]);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. TOTALS & SPLIT PAYMENT CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────
  const itemsSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total, 0);
  }, [cart]);

  const deliveryFeeNum = checkoutMode === 'social' ? (Math.max(0, parseFloat(deliveryFee) || 0)) : 0;
  const effectiveGrandTotal = Math.max(0, itemsSubtotal - cartDiscount) + deliveryFeeNum;

  // Walk-in payment inputs
  const numCash = Math.max(0, parseFloat(cashTendered) || 0);
  const numMpesa = Math.max(0, parseFloat(mpesaTendered) || 0);
  const totalTendered = useMemo(() => {
    if (activePaymentMethod === 'Cash') return numCash;
    if (activePaymentMethod === 'M-Pesa') return numMpesa;
    return numCash + numMpesa;
  }, [activePaymentMethod, numCash, numMpesa]);

  const changeToReturn = Math.max(0, totalTendered - effectiveGrandTotal);
  const remainingBalance = Math.max(0, effectiveGrandTotal - totalTendered);

  // Social POD Deposit inputs
  const numDepositCash = Math.max(0, parseFloat(depositCash) || 0);
  const numDepositMpesa = Math.max(0, parseFloat(depositMpesa) || 0);
  const totalDepositPaid = useMemo(() => {
    if (depositPaymentMethod === 'Cash') return numDepositCash;
    if (depositPaymentMethod === 'M-Pesa') return numDepositMpesa;
    return numDepositCash + numDepositMpesa;
  }, [depositPaymentMethod, numDepositCash, numDepositMpesa]);

  const balanceDueOnDelivery = Math.max(0, effectiveGrandTotal - totalDepositPaid);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CHECKOUT SUBMISSION (WALK-IN OR SOCIAL POD)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmitCheckout = async () => {
    if (checkoutMode === 'walkin' && remainingBalance > 0) {
      toast.error(`Payment incomplete! Remaining balance: KES ${remainingBalance.toLocaleString()}`);
      return;
    }

    if (checkoutMode === 'social') {
      if (!customerName.trim()) {
        toast.error('Customer Name is required for social delivery orders');
        return;
      }
      if (!customerPhone.trim()) {
        toast.error('WhatsApp Phone Number is required for dispatch confirmation');
        return;
      }
      if (!deliveryLocation.trim()) {
        toast.error('Delivery Location / Address is required');
        return;
      }
    }

    try {
      setIsSubmittingCheckout(true);

      const isSocial = checkoutMode === 'social';
      const payload = {
        orderType: isSocial ? 'social-delivery' : 'walk-in',
        socialPlatform: isSocial ? socialPlatform : 'none',
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim() || linkedUser?.name || (isSocial ? 'Social Customer' : 'Walk-in Customer'),
        payments: isSocial ? {
          cash: depositPaymentMethod === 'M-Pesa' ? 0 : numDepositCash,
          mpesa: depositPaymentMethod === 'Cash' ? 0 : numDepositMpesa
        } : {
          cash: activePaymentMethod === 'M-Pesa' ? 0 : numCash,
          mpesa: activePaymentMethod === 'Cash' ? 0 : numMpesa
        },
        paymentMethod: isSocial 
          ? (totalDepositPaid > 0 ? depositPaymentMethod : 'POD')
          : activePaymentMethod,
        deliveryDetails: isSocial ? {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          location: deliveryLocation.trim(),
          deliveryFee: deliveryFeeNum,
          riderNotes: riderNotes.trim()
        } : null,
        notes: notes.trim(),
        sendWhatsAppReceipt
      };

      const res = await posApi.checkout(payload);

      if (res.success) {
        toast.success(isSocial ? 'Delivery order logged & dispatch slip sent! 📦' : 'Sale completed successfully! 🎉');

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

        // Set Completed Order Data for Preview Modal
        setCompletedOrderData({
          order: res.order,
          receiptBase64: res.receiptBase64,
          whatsappDispatched: res.whatsappDispatched,
          whatsappError: res.whatsappError,
          phone: customerPhone.trim(),
          isDispatchSlip: isSocial && res.order.paymentStatus !== 'paid'
        });

        // Refresh deliveries list if social
        if (isSocial) {
          fetchDeliveries();
        }

        // Reset Cart and Checkout states
        setCart([]);
        setCartDiscount(0);
        setCustomerPhone('');
        setCustomerName('');
        setDeliveryLocation('');
        setDeliveryFee('');
        setRiderNotes('');
        setNotes('');
        setCashTendered('');
        setMpesaTendered('');
        setDepositPaidCash('');
        setDepositPaidMpesa('');
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
  // 8. ACTIVE DELIVERIES & POD RECONCILIATION
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDeliveries = async () => {
    try {
      setIsLoadingDeliveries(true);
      const res = await posApi.getDeliveries();
      if (res.success) {
        setDeliveries(res.deliveries || []);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const handleOpenReconcileModal = (deliveryOrder) => {
    setReconcileModalOrder(deliveryOrder);
    setReconcileMethod('M-Pesa');
    setReconcileMpesa(String(deliveryOrder.balanceDue || deliveryOrder.totalAmount));
    setReconcileCash('0');
  };

  const handleCompleteDeliveryPayment = async () => {
    if (!reconcileModalOrder) return;
    try {
      setIsSubmittingReconcile(true);
      const cashVal = parseFloat(reconcileCash) || 0;
      const mpesaVal = parseFloat(reconcileMpesa) || 0;
      const payload = {
        payments: {
          cash: reconcileMethod === 'M-Pesa' ? 0 : cashVal,
          mpesa: reconcileMethod === 'Cash' ? 0 : mpesaVal
        },
        paymentMethod: reconcileMethod,
        notes: `Reconciled at POS terminal by ${user?.name || 'Cashier'}`
      };

      const res = await posApi.completeDeliveryPayment(reconcileModalOrder._id, payload);
      if (res.success) {
        toast.success('Payment completed & official receipt sent to WhatsApp! 🎉');
        setDeliveries(prev => prev.filter(d => d._id !== reconcileModalOrder._id));
        setReconcileModalOrder(null);
        setReconcileCash('');
        setReconcileMpesa('');

        if (res.receiptBase64) {
          setCompletedOrderData({
            order: res.order,
            receiptBase64: res.receiptBase64,
            whatsappDispatched: res.whatsappDispatched,
            whatsappError: res.whatsappError,
            phone: reconcileModalOrder.deliveryDetails?.customerPhone,
            isDispatchSlip: false
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete delivery payment');
    } finally {
      setIsSubmittingReconcile(false);
    }
  };

  const handleCancelDeliveryAndRestock = async () => {
    if (!cancelModalOrder) return;
    try {
      setIsSubmittingCancel(true);
      const res = await posApi.cancelDelivery(cancelModalOrder._id, { reason: cancelReason });
      if (res.success) {
        toast.success('Order cancelled and inventory restocked! 🔄');
        // Restore stock in local state
        setAllProducts(prev => {
          const itemMap = new Map((cancelModalOrder.items || []).map(i => [i.product?._id || i.product, i.quantity]));
          return prev.map(p => {
            const returnedQty = itemMap.get(p._id);
            if (returnedQty) {
              const updatedStock = (p.stock || 0) + returnedQty;
              return { ...p, stock: updatedStock, inStock: true };
            }
            return p;
          });
        });
        setDeliveries(prev => prev.filter(d => d._id !== cancelModalOrder._id));
        setCancelModalOrder(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 9. A4 BARCODE DIRECT DOWNLOAD HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleDownloadProductBarcode = async (productId, name) => {
    try {
      toast.loading(`Downloading ${name} A4 sheet...`, { id: 'dl-sheet' });
      const blob = await posApi.downloadBarcodeSheetPdf(productId, 21);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Barcode-${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download complete', { id: 'dl-sheet' });
    } catch (err) {
      toast.error(err.message || 'Failed to download barcode sheet', { id: 'dl-sheet' });
    }
  };

  const handleDownloadCategoryBarcodes = async (cat) => {
    try {
      toast.loading(`Downloading ${cat} barcodes...`, { id: 'dl-cat' });
      const blob = await posApi.downloadCategoryBarcodeSheetPdf(cat);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Barcodes-${cat}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download complete', { id: 'dl-cat' });
    } catch (err) {
      toast.error(err.message || 'Failed to download category barcodes', { id: 'dl-cat' });
    }
  };

  const handleDownloadSlipPdf = async (orderId, ref) => {
    try {
      toast.loading('Downloading dispatch slip...', { id: 'dl-slip' });
      const blob = await posApi.downloadReceiptPdf(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Seekon-Dispatch-${ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download complete', { id: 'dl-slip' });
    } catch (err) {
      toast.error(err.message || 'Failed to download document', { id: 'dl-slip' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 10. WHATSAPP QUEUE OPERATIONS
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

  const handleLoadQueueOrder = (order) => {
    if (cart.length > 0) {
      if (!window.confirm('Replace current cart with WhatsApp order items?')) return;
    }

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
                <div className="p-1 rounded-xl bg-white/40 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center">
                  <img
                    src="/seekon_bg-removebg-preview.png"
                    alt="Seekon Apparel"
                    className="h-8 md:h-9 w-auto object-contain transition-transform hover:scale-105 dark:hidden"
                    onError={(e) => { e.target.src = FALLBACK_LOGO_URL; }}
                  />
                  <img
                    src="/seekon_logo_white.png"
                    alt="Seekon Apparel"
                    className="h-8 md:h-9 w-auto object-contain transition-transform hover:scale-105 hidden dark:block"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
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
                <span className="text-zinc-600 font-medium truncate max-w-[200px]">
                  Served by: <span className="font-bold text-zinc-950">{user?.name || user?.username || user?.email?.split('@')[0] || 'Cashier'}</span>
                </span>
              </div>
            </div>

            {/* Desktop Keyboard Shortcuts */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 ${
                  activeTab === 'pos'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>💻</span>
                <span>POS</span>
              </button>

              <button
                onClick={() => { setActiveTab('deliveries'); fetchDeliveries(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 relative ${
                  activeTab === 'deliveries'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>🚚</span>
                <span>Deliveries (POD)</span>
                {deliveries.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {deliveries.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('queue'); fetchQueue(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 relative ${
                  activeTab === 'queue'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>📱</span>
                <span>WA Queue</span>
                {pendingOrders.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('barcodes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 flex items-center space-x-1.5 ${
                  activeTab === 'barcodes'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <span>🏷️</span>
                <span>Barcodes</span>
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
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-2 sm:p-3 overflow-hidden">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-4.75rem)]">

            {/* ───────────────────────────────────────────────────────── */}
            {/* LEFT 50%: CATALOG, SEARCH & QUICK SCAN                    */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="lg:col-span-6 flex flex-col bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

              {/* Search Header & Category Filters */}
              <div className="p-3 border-b border-zinc-200/80 space-y-2.5 bg-white/50">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <FiSearch className="w-4 h-4" />
                    </div>
                    <input
                      ref={topSearchInputRef}
                      type="text"
                      value={topSearch}
                      onChange={(e) => setTopSearch(e.target.value)}
                      placeholder="Search inventory by Name, Barcode, SKU, Brand... (F3)"
                      className="w-full pl-9 pr-8 py-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                    />
                    {topSearch && (
                      <button
                        onClick={() => setTopSearch('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 text-xs"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-2 bg-zinc-50 hover:bg-zinc-100 active:scale-95 border border-zinc-200/80 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 shrink-0"
                    title="Open Camera Barcode Scanner"
                  >
                    <FiCamera className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                </div>

                {/* Horizontal Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 shrink-0 active:scale-95 ${
                        selectedCategory === cat
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Secondary Filter Bar */}
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-600">{filteredProducts.length} items</span>
                    <span className="text-zinc-300">•</span>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="bg-transparent font-semibold text-zinc-700 hover:text-zinc-900 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Stock Levels</option>
                      <option value="in-stock">In Stock Only</option>
                      <option value="low-stock">Low Stock (≤5)</option>
                    </select>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-semibold text-zinc-700 hover:text-zinc-900 focus:outline-none cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="stock-high">Stock: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Product Grid with Auto-Animate */}
              <div className="flex-1 overflow-y-auto p-3">
                {isLoadingProducts ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                    <FiRefreshCw className="w-5 h-5 animate-spin mr-2 text-zinc-500" />
                    Loading Seekon catalog...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs py-10">
                    <span className="text-3xl mb-2">🔍</span>
                    <p className="font-bold text-zinc-700">No matching items found</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Try adjusting your search terms or category filters</p>
                  </div>
                ) : (
                  <div
                    ref={catalogListRef}
                    className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5"
                  >
                    {filteredProducts.map(product => {
                      const outOfStock = product.stock <= 0;
                      return (
                        <div
                          key={product._id}
                          onClick={() => !outOfStock && addToCart(product, 1)}
                          className={`group relative p-2.5 bg-white border border-zinc-200/70 rounded-xl flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:border-zinc-300 ${
                            outOfStock ? 'opacity-50 cursor-not-allowed bg-zinc-50' : 'cursor-pointer active:scale-98'
                          }`}
                        >
                          <div className="aspect-square w-full rounded-lg bg-zinc-100 overflow-hidden mb-2 relative">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-bold">
                                SEEKON
                              </div>
                            )}

                            {/* Stock Pill Badge */}
                            <span
                              className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide ${
                                outOfStock
                                  ? 'bg-red-500 text-white'
                                  : product.stock <= 5
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
                            >
                              {outOfStock ? 'SOLD OUT' : `${product.stock} in stock`}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                              {product.category || 'Apparel'}
                            </span>
                            <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 group-hover:text-black">
                              {product.name}
                            </h4>
                          </div>

                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-zinc-100">
                            <span className="font-black text-xs text-zinc-950">
                              KES {product.price?.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              disabled={outOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-black active:scale-95 disabled:bg-zinc-200 text-white flex items-center justify-center transition-all duration-150"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Quick Barcode Scanner Bar */}
              <div className="p-2.5 bg-white/90 border-t border-zinc-200/80">
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      ref={quickBarcodeInputRef}
                      type="text"
                      value={quickBarcodeQuery}
                      onChange={(e) => setQuickBarcodeQuery(e.target.value)}
                      placeholder="Scan or type barcode / SKU then press Enter..."
                      className="w-full pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={quickBarcodeQty}
                    onChange={(e) => setQuickBarcodeQty(e.target.value)}
                    className="w-14 py-2 text-center bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    title="Scan Quantity"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl transition-all duration-150 shrink-0"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* RIGHT 50%: ACTIVE CART, TOTALS & CHECKOUT                 */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="lg:col-span-6 flex flex-col bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

              {/* Cart Header */}
              <div className="p-3 border-b border-zinc-200/80 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-zinc-950">Active Cart</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-zinc-900 text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {heldCarts.length > 0 && (
                    <button
                      onClick={() => setIsHeldCartsModalOpen(true)}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <FiPlay className="w-3 h-3 text-amber-600" />
                      <span>Held ({heldCarts.length})</span>
                    </button>
                  )}
                  {cart.length > 0 && (
                    <button
                      onClick={handleHoldCart}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <FiPause className="w-3 h-3" />
                      <span>Hold</span>
                    </button>
                  )}
                  <button
                    onClick={clearCart}
                    disabled={cart.length === 0}
                    className="p-1.5 text-zinc-400 hover:text-red-600 disabled:opacity-40 rounded-lg active:scale-95 transition-all"
                    title="Clear Cart"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cart Items List with Auto-Animate & Watermark */}
              <div className="flex-1 overflow-y-auto p-3 relative">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                    <img
                      src="/seekon_bg-removebg-preview.png"
                      alt="Seekon Watermark"
                      className="h-28 w-auto object-contain opacity-15 grayscale mb-3"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <h4 className="font-bold text-zinc-600 text-sm">Cart is empty</h4>
                    <p className="text-zinc-400 text-xs mt-1 max-w-[240px]">
                      Ready for scanning. Cursor is blinking in the scan input.
                    </p>
                  </div>
                ) : (
                  <div ref={cartListRef} className="space-y-2">
                    {cart.map(item => (
                      <div
                        key={item.productId}
                        className="p-2.5 bg-white border border-zinc-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300 transition-all"
                      >
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-300">
                              SKN
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-zinc-900 truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                            <span>KES {item.price?.toLocaleString()}</span>
                            {item.size && (
                              <>
                                <span>•</span>
                                <span className="bg-zinc-100 px-1.5 py-0.2 rounded text-[10px] font-semibold">{item.size}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-white hover:bg-zinc-200 active:scale-95 text-zinc-700 flex items-center justify-center transition-all shadow-2xs"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-white hover:bg-zinc-200 active:scale-95 text-zinc-700 flex items-center justify-center transition-all shadow-2xs"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right shrink-0 min-w-[70px]">
                          <span className="font-black text-xs text-zinc-950">
                            KES {item.total?.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-zinc-300 hover:text-red-600 active:scale-95 transition-all"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer: Obsidian Glass with Rolling Numbers */}
              <div className="bg-zinc-950/95 backdrop-blur-md text-white border-t border-zinc-800 p-4 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-zinc-200 font-mono">
                      KES <NumberFlow value={itemsSubtotal} />
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Discount</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      - KES <NumberFlow value={cartDiscount} />
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                    <span className="text-sm font-black tracking-wider text-zinc-300">TOTAL DUE</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono flex items-baseline">
                      <span>KES </span>
                      <NumberFlow value={effectiveGrandTotal} />
                    </div>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px] pt-1">
                    <span>Cashier Attendant</span>
                    <span className="font-bold text-zinc-300">
                      Served by: {user?.name || user?.username || user?.email?.split('@')[0] || 'Cashier'}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-100 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>COMPLETE SALE (F2)</span>
                  <FiArrowRight className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 2: ACTIVE DELIVERIES & POD RECONCILIATION             */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'deliveries' && (
          <div className="h-[calc(100vh-4.75rem)] p-3 sm:p-6 bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-200/80">
                <div>
                  <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                    <span>Social Deliveries & Pay on Delivery (POD)</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                      {deliveries.length} Active
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Orders queued for courier dispatch, balance collection on arrival, and inventory reconciliation.
                  </p>
                </div>
                <button
                  onClick={fetchDeliveries}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all duration-150 shadow-xs"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingDeliveries ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {deliveries.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
                  <div className="text-4xl mb-2">🚚</div>
                  <h3 className="text-base font-bold text-zinc-800">No Active Deliveries</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    All social media and POD orders have been reconciled and paid in full.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveries.map(del => {
                    const platform = del.socialPlatform || 'social';
                    const orderRef = String(del._id).slice(-6).toUpperCase();
                    return (
                      <div
                        key={del._id}
                        className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  platform === 'instagram'
                                    ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                    : platform === 'tiktok'
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {platform}
                                </span>
                                <span className="font-mono text-xs font-bold text-zinc-500">#{orderRef}</span>
                              </div>
                              <h4 className="font-black text-zinc-950 text-sm mt-1">
                                {del.deliveryDetails?.customerName || del.shippingAddress?.name || 'Customer'}
                              </h4>
                              <p className="text-xs text-zinc-500 font-mono">
                                +{del.deliveryDetails?.customerPhone || del.guestPhone}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                Served by: <span className="font-bold text-zinc-700">{del.cashier?.name || del.cashier?.email?.split('@')[0] || (del.notes?.includes('Interception') ? 'WhatsApp Bot' : 'Cashier')}</span>
                              </p>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                              {del.paymentStatus === 'partial_deposit' ? 'Partial Deposit' : 'Pending POD'}
                            </span>
                          </div>

                          {/* Destination */}
                          <div className="my-2.5 p-2 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1">
                            <div className="flex items-start gap-1.5 text-zinc-700">
                              <FiMapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span className="font-semibold">{del.deliveryDetails?.location || 'Store Pickup'}</span>
                            </div>
                            {del.deliveryDetails?.riderNotes && (
                              <div className="text-[11px] text-amber-800 bg-amber-50/60 p-1.5 rounded-lg font-medium">
                                🛵 Note: {del.deliveryDetails.riderNotes}
                              </div>
                            )}
                          </div>

                          {/* Line items */}
                          <div className="my-2 space-y-1 text-xs">
                            {(del.items || []).map((itm, i) => (
                              <div key={i} className="flex justify-between text-zinc-600">
                                <span>{itm.quantity}x {itm.name}</span>
                                <span className="font-semibold">KES {(itm.price * itm.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            {del.deliveryDetails?.deliveryFee > 0 && (
                              <div className="flex justify-between text-zinc-500 text-[11px]">
                                <span>Delivery Fee</span>
                                <span>KES {del.deliveryDetails.deliveryFee.toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Balance Due Box */}
                          <div className="mt-3 p-2.5 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Balance to Collect</span>
                              <span className="text-base font-black text-amber-400 font-mono">
                                KES {del.balanceDue?.toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDownloadSlipPdf(del._id, orderRef)}
                              className="p-1.5 text-zinc-300 hover:text-white rounded-lg active:scale-95 transition-all"
                              title="Download Dispatch Slip"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 mt-3">
                          <button
                            onClick={() => handleOpenReconcileModal(del)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all duration-150 shadow-xs"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>Complete Payment</span>
                          </button>
                          <button
                            onClick={() => setCancelModalOrder(del)}
                            className="px-2.5 py-2 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 active:scale-95 text-xs font-bold rounded-xl transition-all duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────── */}
        {/* TAB 3: WHATSAPP HEADLESS ORDER POOL                      */}
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
        {/* TAB 4: A4 BARCODE STICKER SHEET GENERATOR (DOWNLOAD ONLY) */}
        {/* ───────────────────────────────────────────────────────── */}
        {activeTab === 'barcodes' && (
          <div className="h-[calc(100vh-4.75rem)] p-3 sm:p-6 bg-white/75 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 pb-3 border-b border-zinc-200/80">
                <h2 className="text-lg font-black text-zinc-950">A4 Barcode Label Sheet Generator</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Generates standardized Code 128 sticker sheets (21 stickers per A4 page). Click below to download PDF directly.
                </p>
              </div>

              {/* Product Sheet Grid */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs mb-6">
                <h3 className="font-black text-sm text-zinc-900 mb-3">Download Stickers by Product</h3>
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
                      <button
                        onClick={() => handleDownloadProductBarcode(prod._id, prod.name)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-lg transition-all duration-150 shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <FiDownload className="w-3 h-3" />
                        <span>Download A4</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Bulk Sheets */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
                <h3 className="font-black text-sm text-zinc-900 mb-3">Download Bulk Sheets by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c !== 'ALL').map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleDownloadCategoryBarcodes(cat)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-xl text-xs font-bold text-zinc-800 transition-all duration-150 active:scale-95"
                    >
                      <FiDownload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cat} Collection A4</span>
                    </button>
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
                    src="/seekon_logo_white.png"
                    alt="Seekon"
                    className="h-6 w-auto object-contain"
                    onError={(e) => { e.target.src = '/seekon_bg-removebg-preview.png'; e.target.className += ' brightness-0 invert'; }}
                  />
                  <div>
                    <h3 className="text-base font-black tracking-tight">Checkout & Order Logging</h3>
                    <p className="text-xs text-zinc-400">
                      Served by: <span className="text-white font-bold">{user?.name || user?.username || user?.email?.split('@')[0] || 'Cashier'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Mode Toggle: Walk-in vs Social POD */}
              <div className="px-4 pt-3 bg-zinc-50 border-b border-zinc-200">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('walkin')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      checkoutMode === 'walkin'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span>🚶</span>
                    <span>Walk-In Sale (Paid Now)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('social')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      checkoutMode === 'social'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span>📦</span>
                    <span>Social / Pay on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">

                {/* ── WALK-IN MODE BODY ── */}
                {checkoutMode === 'walkin' && (
                  <>
                    {/* Total Due Banner */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                      <span className="font-bold text-zinc-700">Total Amount Due:</span>
                      <span className="text-2xl font-black text-zinc-950 font-mono">
                        KES {effectiveGrandTotal.toLocaleString()}
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

                      {linkedUser ? (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
                                setCashTendered(String(effectiveGrandTotal));
                                setMpesaTendered('0');
                              } else if (method === 'M-Pesa') {
                                setCashTendered('0');
                                setMpesaTendered(String(effectiveGrandTotal));
                              } else {
                                const half = Math.floor(effectiveGrandTotal / 2);
                                setCashTendered(String(half));
                                setMpesaTendered(String(effectiveGrandTotal - half));
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

                    {/* Cash Panel */}
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
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setCashTendered(String(effectiveGrandTotal))}
                            className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 rounded-lg text-xs font-bold text-zinc-700 transition-all"
                          >
                            Exact
                          </button>
                          {[500, 1000, 2000, 5000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashTendered(String(amt))}
                              className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 rounded-lg text-xs font-bold text-zinc-700 transition-all"
                            >
                              KES {amt.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* M-Pesa Panel */}
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
                          placeholder="M-Pesa Code (Optional, e.g. QKB712345)"
                          className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 bg-white uppercase"
                        />
                      </div>
                    )}

                    {/* Split Panel */}
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
                                const rem = Math.max(0, effectiveGrandTotal - (parseFloat(val) || 0));
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
                              const half = Math.floor(effectiveGrandTotal / 2);
                              setCashTendered(String(half));
                              setMpesaTendered(String(effectiveGrandTotal - half));
                            }}
                            className="flex-1 py-1 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-100 active:scale-95 transition-all"
                          >
                            50/50 Split
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const rem = Math.max(0, effectiveGrandTotal - (parseFloat(cashTendered) || 0));
                              setMpesaTendered(String(rem));
                            }}
                            className="flex-1 py-1 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-lg text-xs hover:bg-zinc-100 active:scale-95 transition-all"
                          >
                            Auto-Balance M-Pesa
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Change & Balance Box */}
                    <div className="p-3 rounded-xl border border-zinc-200 flex justify-between items-center bg-zinc-50">
                      <div>
                        <span className="text-xs text-zinc-500 font-semibold">Total Paid:</span>
                        <div className="font-black text-zinc-900 text-sm font-mono">
                          KES {totalTendered.toLocaleString()}
                        </div>
                      </div>

                      {remainingBalance > 0 ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-red-600">Remaining Due:</span>
                          <div className="text-base font-black text-red-600 font-mono">
                            KES {remainingBalance.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600">Change to Return:</span>
                          <div className="text-base font-black text-emerald-700 font-mono">
                            KES {changeToReturn.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── SOCIAL / POD MODE BODY ── */}
                {checkoutMode === 'social' && (
                  <>
                    {/* Platform Selector Pills */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-800">Social Channel Platform:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'instagram', label: 'Instagram', icon: '📸' },
                          { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                          { id: 'tiktok', label: 'TikTok', icon: '🎵' }
                        ].map(plat => (
                          <button
                            key={plat.id}
                            type="button"
                            onClick={() => setSocialPlatform(plat.id)}
                            className={`py-2.5 rounded-xl font-bold text-xs border transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${
                              socialPlatform === plat.id
                                ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <span>{plat.icon}</span>
                            <span>{plat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-bold text-zinc-800">
                          Customer Name <span className="text-red-500">*</span>:
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Amina Wangari"
                          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-zinc-800 flex justify-between items-center">
                          <span>WhatsApp Phone <span className="text-red-500">*</span>:</span>
                          {isSearchingUser && (
                            <span className="text-[11px] text-emerald-600 animate-pulse font-normal">Checking...</span>
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
                            placeholder="0712345678"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Location & Delivery Fee */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-bold text-zinc-800">
                          Delivery Location / Address <span className="text-red-500">*</span>:
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                            <FiMapPin className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={deliveryLocation}
                            onChange={(e) => setDeliveryLocation(e.target.value)}
                            placeholder="e.g. Kilimani, Wood Avenue Apt 4B"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-zinc-800">Delivery Fee (KES):</label>
                        <input
                          type="number"
                          min="0"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          placeholder="e.g. 300"
                          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Rider Notes */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-800">Rider / Dispatch Notes (Optional):</label>
                      <input
                        type="text"
                        value={riderNotes}
                        onChange={(e) => setRiderNotes(e.target.value)}
                        placeholder="e.g. Call before arrival, gate code 1234"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                      />
                    </div>

                    {/* Optional Deposit Paid Now */}
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-zinc-800">
                          Optional Deposit Paid Now:
                        </label>
                        <div className="flex gap-1">
                          {['M-Pesa', 'Cash'].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setDepositPaymentMethod(m)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                depositPaymentMethod === m
                                  ? 'bg-zinc-900 text-white'
                                  : 'bg-white text-zinc-600 border border-zinc-200'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {depositPaymentMethod === 'M-Pesa' ? (
                        <input
                          type="number"
                          min="0"
                          value={depositMpesa}
                          onChange={(e) => {
                            setDepositMpesa(e.target.value);
                            setDepositCash('');
                          }}
                          placeholder="KES Deposit via M-Pesa (e.g. delivery fee paid upfront)"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900 bg-white"
                        />
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={depositCash}
                          onChange={(e) => {
                            setDepositCash(e.target.value);
                            setDepositMpesa('');
                          }}
                          placeholder="KES Deposit in Cash"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900 bg-white"
                        />
                      )}
                    </div>

                    {/* Dynamic Breakdown & Balance Due on Delivery */}
                    <div className="p-3.5 bg-zinc-950 text-white rounded-xl space-y-2 border border-zinc-800">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Items Subtotal:</span>
                        <span className="font-mono text-zinc-200">KES {itemsSubtotal.toLocaleString()}</span>
                      </div>
                      {deliveryFeeNum > 0 && (
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Delivery Fee:</span>
                          <span className="font-mono text-zinc-200">+ KES {deliveryFeeNum.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Total Order Value:</span>
                        <span className="font-mono text-zinc-200 font-bold">KES {effectiveGrandTotal.toLocaleString()}</span>
                      </div>
                      {totalDepositPaid > 0 && (
                        <div className="flex justify-between text-xs text-emerald-400">
                          <span>Deposit Paid:</span>
                          <span className="font-mono font-bold">- KES {totalDepositPaid.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                          Balance to Pay on Delivery:
                        </span>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          KES {balanceDueOnDelivery.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* WhatsApp Receipt / Confirmation Slip Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppReceipt}
                    onChange={(e) => setSendWhatsAppReceipt(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-700">
                    {checkoutMode === 'social'
                      ? `Send Dispatch Confirmation Slip to customer WhatsApp (+ ${customerPhone || 'phone'})`
                      : `Send official branded PDF E-receipt to WhatsApp (+ ${customerPhone || 'phone'})`}
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
                  disabled={isSubmittingCheckout || (checkoutMode === 'walkin' && remainingBalance > 0)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black active:scale-95 disabled:bg-zinc-300 text-white font-black text-sm shadow-md transition-all duration-150 flex items-center gap-1.5"
                >
                  {isSubmittingCheckout ? (
                    <span>Processing Order...</span>
                  ) : checkoutMode === 'social' ? (
                    <>
                      <span>Log Order & Send Confirmation PDF</span>
                      <FiCheck className="w-4 h-4 text-emerald-400" />
                    </>
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
      {/* 4. RECONCILIATION MODAL (PAYMENT FOR POD DELIVERIES)      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {reconcileModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
            >
              <div className="p-4 bg-zinc-950 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base">Reconcile Delivery Payment</h3>
                  <p className="text-xs text-zinc-400">
                    Order #SKN-{String(reconcileModalOrder._id).slice(-6).toUpperCase()} • {reconcileModalOrder.deliveryDetails?.customerName}
                  </p>
                </div>
                <button onClick={() => setReconcileModalOrder(null)} className="text-zinc-400 hover:text-white text-xl">
                  &times;
                </button>
              </div>

              <div className="p-4 space-y-4 text-xs sm:text-sm">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-zinc-700">Balance to Collect:</span>
                  <span className="text-xl font-black text-amber-600 font-mono">
                    KES {reconcileModalOrder.balanceDue?.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800">Received Payment Method:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['M-Pesa', 'Cash', 'Split'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setReconcileMethod(m);
                          if (m === 'M-Pesa') {
                            setReconcileMpesa(String(reconcileModalOrder.balanceDue));
                            setReconcileCash('0');
                          } else if (m === 'Cash') {
                            setReconcileCash(String(reconcileModalOrder.balanceDue));
                            setReconcileMpesa('0');
                          }
                        }}
                        className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                          reconcileMethod === m
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {reconcileMethod === 'M-Pesa' && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800">M-Pesa Amount Received (KES):</label>
                    <input
                      type="number"
                      value={reconcileMpesa}
                      onChange={(e) => setReconcileMpesa(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900"
                    />
                  </div>
                )}

                {reconcileMethod === 'Cash' && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800">Cash Amount Received (KES):</label>
                    <input
                      type="number"
                      value={reconcileCash}
                      onChange={(e) => setReconcileCash(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900"
                    />
                  </div>
                )}

                {reconcileMethod === 'Split' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Cash (KES):</label>
                      <input
                        type="number"
                        value={reconcileCash}
                        onChange={(e) => setReconcileCash(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">M-Pesa (KES):</label>
                      <input
                        type="number"
                        value={reconcileMpesa}
                        onChange={(e) => setReconcileMpesa(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-black text-sm text-zinc-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  onClick={() => setReconcileModalOrder(null)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteDeliveryPayment}
                  disabled={isSubmittingReconcile}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition-all"
                >
                  {isSubmittingReconcile ? 'Reconciling...' : 'Confirm & Dispatch Official Receipt'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. CANCEL & RESTOCK MODAL                                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
            >
              <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5" />
                  <h3 className="font-black text-base">Cancel & Restock Order</h3>
                </div>
                <button onClick={() => setCancelModalOrder(null)} className="text-white text-xl">
                  &times;
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs sm:text-sm">
                <p className="text-zinc-600">
                  Are you sure you want to cancel order <strong>#SKN-{String(cancelModalOrder._id).slice(-6).toUpperCase()}</strong>?
                </p>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                  <span className="font-bold text-zinc-800 text-xs block mb-1">Items to be Restocked to Inventory:</span>
                  {(cancelModalOrder.items || []).map((itm, i) => (
                    <div key={i} className="flex justify-between text-zinc-600 text-xs">
                      <span>{itm.name}</span>
                      <span className="font-bold text-emerald-600">+{itm.quantity} units</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-800 text-xs">Cancellation Reason:</label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelDeliveryAndRestock}
                  disabled={isSubmittingCancel}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition-all"
                >
                  {isSubmittingCancel ? 'Restocking...' : 'Confirm Restock & Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. HELD CARTS MODAL                                       */}
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

              <div className="p-4 max-h-96 overflow-y-auto space-y-2.5">
                {heldCarts.length === 0 ? (
                  <p className="text-center text-xs text-zinc-400 py-6">No held carts currently.</p>
                ) : (
                  heldCarts.map(held => (
                    <div
                      key={held.id}
                      className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900">{held.customerTag}</h4>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {held.cart.length} items • KES {held.total?.toLocaleString()} • {held.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRestoreHeldCart(held)}
                          className="px-3 py-1.5 bg-zinc-900 text-white font-bold text-xs rounded-lg hover:bg-black active:scale-95 transition-all"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteHeldCart(held.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 active:scale-95 transition-all"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
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
      {/* 7. SALE COMPLETE / DISPATCH SLIP PREVIEW MODAL            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {completedOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden text-center p-6 space-y-4"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
                ✓
              </div>

              <div>
                <h3 className="text-lg font-black text-zinc-950">
                  {completedOrderData.isDispatchSlip ? 'Dispatch Slip Generated!' : 'Sale Completed!'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Order #SKN-{String(completedOrderData.order?.id || '').slice(-6).toUpperCase()}
                </p>
              </div>

              {completedOrderData.whatsappDispatched ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Document delivered to WhatsApp (+{completedOrderData.phone})</span>
                </div>
              ) : completedOrderData.phone ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                  WhatsApp delivery queued: {completedOrderData.whatsappError || 'Bot offline, PDF saved'}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={`data:application/pdf;base64,${completedOrderData.receiptBase64}`}
                  download={`Seekon-${completedOrderData.isDispatchSlip ? 'Dispatch' : 'Receipt'}-SKN-${String(completedOrderData.order?.id || '').slice(-6).toUpperCase()}.pdf`}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </a>

                <button
                  onClick={() => {
                    setCompletedOrderData(null);
                    refocusBarcodeInput();
                  }}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-all active:scale-95"
                >
                  Done (Next Customer)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 8. CAMERA BARCODE SCANNER MODAL                          */}
      {/* ========================================================= */}
      <BarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          refocusBarcodeInput();
        }}
        onScanSuccess={handleCameraScanSuccess}
      />
    </div>
  );
};

export default PosDashboard;
