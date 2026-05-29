import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Seekon Apparel | Premium Global Streetwear', 
  description = 'Shop the latest premium streetwear at Seekon Apparel. Global shipping, exclusive drops, and high-quality apparel for the modern world.', 
  image = 'https://www.seek-on.app/og-image.jpg', // Default OG image
  url = typeof window !== 'undefined' ? window.location.href : 'https://www.seek-on.app',
  type = 'website'
}) => {
  const siteName = 'Seekon Apparel';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* WhatsApp / Telegram (uses OG tags usually, but sometimes explicit image tags help) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
};

export default SEO;
