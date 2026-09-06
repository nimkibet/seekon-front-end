import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Seekon Apparel | Premium Global Streetwear', 
  description = 'Shop the latest premium streetwear at Seekon Apparel. Global shipping, exclusive drops, and high-quality apparel for the modern world.', 
  image = 'https://seekonapparelglobal.com/og-image.jpg', // Default OG image
  url = typeof window !== 'undefined' ? window.location.href : 'https://seekonapparelglobal.com',
  type = 'website'
}) => {
  const siteName = 'Seekon Apparel';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  // Structured Data (JSON-LD) for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Seekon Apparel",
        "url": "https://seekonapparelglobal.com",
        "logo": "https://seekonapparelglobal.com/logo.png",
        "sameAs": [
          "https://www.instagram.com/seekon_apparel/"
        ]
      },
      {
        "@type": "WebSite",
        "url": "https://seekonapparelglobal.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://seekonapparelglobal.com/collection?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

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
      
      {/* WhatsApp / Telegram */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
