import { useEffect } from 'react';
import { trackPageView } from '@/utils/gtm';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: object;
  noindex?: boolean;
  author?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://peershare.tech/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false,
  author = 'PeerShare Team'
}: SEOProps) => {
  useEffect(() => {
    const currentUrl = canonicalUrl || window.location.href;
    const siteUrl = 'https://peershare.tech';
    
    // Update title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta('author', author);
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('bingbot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Language and locale
    updateMeta('language', 'English');
    updateMeta('geo.region', 'US');
    
    // Open Graph tags (comprehensive)
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('og:image:alt', title, true);
    updateMeta('og:url', currentUrl, true);
    updateMeta('og:site_name', 'PeerShare', true);
    updateMeta('og:locale', 'en_US', true);
    updateMeta('og:locale:alternate', 'en_GB', true);

    // Twitter Card tags (comprehensive)
    updateMeta('twitter:card', twitterCard);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    updateMeta('twitter:image:alt', title);
    updateMeta('twitter:site', '@peershare_tech');
    updateMeta('twitter:creator', '@peershare_tech');

    // Additional SEO meta tags
    updateMeta('application-name', 'PeerShare');
    updateMeta('apple-mobile-web-app-title', 'PeerShare');
    updateMeta('msapplication-TileColor', '#3b82f6');
    updateMeta('msapplication-config', '/browserconfig.xml');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Alternate languages (if needed in future)
    let alternate = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement;
    if (!alternate) {
      alternate = document.createElement('link');
      alternate.setAttribute('rel', 'alternate');
      alternate.setAttribute('hreflang', 'en');
      document.head.appendChild(alternate);
    }
    alternate.setAttribute('href', currentUrl);

    // Structured Data
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());
      
      // Add new structured data
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredData, null, 0);
      document.head.appendChild(script);
    }

    // Track page view in GTM
    trackPageView(window.location.pathname, title);

    // Update HTML lang attribute
    document.documentElement.lang = 'en';

    // Cleanup function
    return () => {
      // Clean up any dynamically added meta tags if needed
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, structuredData, noindex, author]);
};