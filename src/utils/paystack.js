let paystackLoadPromise = null;

/**
 * Loads the Paystack inline.js script and returns PaystackPop when ready.
 */
export function loadPaystackScript() {
  if (typeof window !== 'undefined' && window.PaystackPop) {
    return Promise.resolve(window.PaystackPop);
  }

  if (!paystackLoadPromise) {
    paystackLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          paystackLoadPromise = null;
          reject(new Error('Paystack script loaded but PaystackPop is unavailable'));
        }
      };
      script.onerror = () => {
        paystackLoadPromise = null;
        reject(new Error('Failed to load Paystack'));
      };
      document.body.appendChild(script);
    });
  }

  return paystackLoadPromise;
}
