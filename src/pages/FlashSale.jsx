import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FlashSale = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [endTime, setEndTime] = useState(null);

  // USE THE MAIN PRODUCT ENDPOINT (Safety Net)
  const SETTINGS_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/flash-sale';
  const ALL_PRODUCTS_URL = 'https://seekoon-backend-production.up.railway.app/api/products';

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

        // 2. FETCH ALL PRODUCTS & FILTER MANUALLY
        // This guarantees we see what the Admin sees
        const productsRes = await axios.get(ALL_PRODUCTS_URL);
        const allProducts = productsRes.data.products || productsRes.data || [];
        
        console.log("All Products Fetched:", allProducts.length);
        
        // FILTER LOGIC: Look for any sign of a flash sale
        const saleProducts = allProducts.filter(p => 
          p.onFlashSale === true || 
          (p.flashSalePrice && p.flashSalePrice > 0) ||
          p.isFlashSale === true
        );
        
        console.log("Filtered Sale Products:", saleProducts.length);
        setProducts(saleProducts);
      } catch (error) {
        console.error("Error loading flash sale data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer Logic (Preserved)
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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Event...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">🔥 Flash Sale</h1>
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm">Time Left:</span>
              <span className="font-bold ml-2">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Exclusive Deals ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">No products found with Flash Sale active.</p>
            <Link to="/products" className="inline-block mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800">
              Shop All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="relative aspect-square bg-gray-100">
                  <img 
                    src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/400'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(((product.price - (product.flashSalePrice || product.price)) / product.price) * 100)}% OFF
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-red-600 font-bold text-lg">KSh {product.flashSalePrice || product.price}</span>
                    {product.price > (product.flashSalePrice || 0) && (
                      <span className="text-gray-400 line-through text-sm">KSh {product.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSale;
