import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import productSlice from './slices/productSlice';
import cartSlice from './slices/cartSlice';
import wishlistSlice from './slices/wishlistSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

console.log('🏪 Initializing Redux store...');
console.log('👤 User slice:', userSlice);
console.log('📦 Product slice:', productSlice);
console.log('🛒 Cart slice:', cartSlice);
console.log('❤️ Wishlist slice:', wishlistSlice);

export const store = configureStore({
  reducer: {
    user: userSlice,
    products: productSlice,
    cart: cartSlice,
    wishlist: wishlistSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(persistenceMiddleware),
});

console.log('✅ Redux store configured successfully');
console.log('🏪 Store state:', store.getState());

