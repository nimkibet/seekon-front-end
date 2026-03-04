// Simplified middleware - just return the action
export const persistenceMiddleware = (store) => (next) => (action) => {
  return next(action);
};