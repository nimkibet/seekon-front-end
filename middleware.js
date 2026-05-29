export const config = {
  matcher: '/product/:path*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Regex to match social bots (WhatsApp, Facebook, Twitter, Telegram, etc.)
  const isBot = /bot|facebook|whatsapp|telegram|twitter|linkedin|pinterest|discord/i.test(userAgent);
  
  if (isBot) {
    // Extract product ID from the URL (e.g., /product/12345)
    const pathParts = url.pathname.split('/');
    const productId = pathParts[pathParts.length - 1];
    
    if (productId) {
      try {
        // Fetch product data from the live backend
        // We use the production backend URL to ensure we get real data
        const backendUrl = 'https://seekonbackend-production-da47.up.railway.app';
        const response = await fetch(`${backendUrl}/api/products/${productId}`);
        
        if (response.ok) {
          const data = await response.json();
          const product = data.product || data;
          
          if (product && product.name) {
            const title = `${product.name} | Seekon Apparel`;
            const description = product.description ? product.description.substring(0, 160) : 'Premium Global Streetwear';
            
            // Handle different image formats from the backend
            let image = 'https://seekonapparelglobal.com/og-image.jpg';
            if (product.images && product.images.length > 0) {
              image = typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
            } else if (product.image) {
              image = product.image;
            }
            
            // Return a minimal HTML page perfectly formatted for bots
            // We use explicit image dimensions to prevent WhatsApp timeouts
            const html = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <meta name="description" content="${description}">
                
                <!-- Open Graph / Facebook / WhatsApp -->
                <meta property="og:type" content="product">
                <meta property="og:url" content="${url.href}">
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${image}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:site_name" content="Seekon Apparel">
                
                <!-- Twitter -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:url" content="${url.href}">
                <meta name="twitter:title" content="${title}">
                <meta name="twitter:description" content="${description}">
                <meta name="twitter:image" content="${image}">
              </head>
              <body>
                <h1>${title}</h1>
                <img src="${image}" alt="${title}" />
                <p>${description}</p>
              </body>
              </html>
            `;
            
            return new Response(html, {
              status: 200,
              headers: { 
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 's-maxage=86400' // Cache at the edge for 1 day
              },
            });
          }
        }
      } catch (err) {
        console.error('Bot Interceptor Error:', err);
        // On error, let it fall through to the default index.html
      }
    }
  }
  
  // If not a bot or an error occurred, continue normally to the SPA
  return new Response(null, {
    headers: {
      'x-middleware-next': '1' // Tell Vercel to continue to the normal route
    }
  });
}
