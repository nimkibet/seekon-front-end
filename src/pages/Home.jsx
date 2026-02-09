import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowRight, FiClock, FiShoppingBag } from 'react-icons/fi';

const Home = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [flashProducts, setFlashProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endTime, setEndTime] = useState(null);

  // HARDCODED URLs (The ones that work)
  const SETTINGS_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/flash-sale';
  const PRODUCTS_URL = 'https://seekoon-backend-production.up.railway.app/api/products';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Timer Settings
        const settingsRes = await axios.get(SETTINGS_URL);
        const settingsData = settingsRes.data.value || settingsRes.data;
        
        if (settingsData && settingsData.endTime) {
          setEndTime(new Date(settingsData.endTime).getTime());
        }

        // 2. Fetch Products
        const productsRes = await axios.get(PRODUCTS_URL);
        const allProducts = productsRes.data.products || productsRes.data || [];
        
        // Filter for Flash Sale (Client Side)
        const saleItems = allProducts.filter(p => 
          p.onFlashSale === true || 
          (p.flashSalePrice && p.flashSalePrice > 0)
        );
        setFlashProducts(saleItems.slice(0, 4)); // Show top 4
        
        // Trending (Just take the first 4 regular items for now)
        setTrendingProducts(allProducts.slice(0, 4));
      } catch (error) {
        console.error("Home fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const ProductCard = ({ product, badgeColor = "bg-red-500" }) => (
    <Link to={`/product/${product._id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.flashSalePrice && (
          <div className={`absolute top-3 right-3 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded shadow-md`}>
            {Math.round(((product.price - product.flashSalePrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-gray-900">
            KSh {product.flashSalePrice || product.price}
          </span>
          {product.flashSalePrice && (
            <span className="text-sm text-gray-400 line-through">
              KSh {product.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <ShoppingBag size={16} /> New Collection 2025
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                STEP INTO
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  THE FUTURE
                </span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg">
                Discover the latest drops from Nike, Adidas, Jordan, and more. 
                Premium footwear for those who lead the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  to="/collection" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-white/10"
                >
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/flash-sale" 
                  className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-xl shadow-red-600/20"
                >
                  🔥 Flash Sale
                </Link>
              </div>
            </div>
            
            {/* TIMER CARD */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest opacity-80">
                <Clock size={16} /> Ending In
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'Days', val: timeLeft.days },
                  { label: 'Hours', val: timeLeft.hours },
                  { label: 'Mins', val: timeLeft.minutes },
                  { label: 'Secs', val: timeLeft.seconds }
                ].map((item) => (
                  <div key={item.label} className="bg-white text-red-600 rounded-lg p-3 min-w-[70px] text-center">
                    <div className="text-2xl md:text-3xl font-black">{String(item.val).padStart(2, '0')}</div>
                    <div className="text-[10px] font-bold uppercase text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: FLASH SALE PREVIEW */}
      {flashProducts.length > 0 && (
        <div className="container mx-auto px-4 mt-16 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              🔥 Flash Sale Deals
            </h2>
            <Link to="/flash-sale" className="text-red-600 font-semibold hover:underline">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {flashProducts.map(product => (
              <ProductCard key={product._id} product={product} badgeColor="bg-red-600" />
            ))}
          </div>
        </div>
      )}

      {/* TRENDING SECTION */}
      <div className="container mx-auto px-4 mt-20 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Trending Now
          </h2>
          <Link to="/products" className="text-gray-600 hover:text-black font-semibold">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {trendingProducts.map(product => (
            <ProductCard key={product._id} product={product} badgeColor="bg-blue-600" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
