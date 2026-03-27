import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear the cart after successful order
    dispatch(clearCart());
    
    // If there's an order ID, fetch order details
    if (id) {
      fetchOrderDetails(id);
    } else {
      setLoading(false);
    }
  }, [id, dispatch]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A676]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#00A676] p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white mb-4">
            <svg
              className="h-10 w-10 text-[#00A676]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
          <p className="text-white/80 mt-2">Thank you for your purchase</p>
        </div>
        
        <div className="p-6">
          {orderDetails && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">{orderDetails.orderId || orderDetails._id}</p>
            </div>
          )}
          
          {id && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">Confirmation Number</p>
              <p className="text-lg font-semibold text-gray-900">{id}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm mb-4">
              A confirmation email has been sent to your registered email address.
              You can track your order status in your account.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => navigate('/my-orders')}
              className="w-full bg-[#00A676] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#008F5D] transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
