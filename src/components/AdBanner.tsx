import { useEffect, useRef } from 'react';
import { monetizationService } from '@/services/monetizationService';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Google AdSense Banner Component
 * Only displays ads for free tier users
 */
export const AdBanner = ({ 
  slot = '1234567890', // Replace with your AdSense ad slot ID
  format = 'auto',
  style,
  className = ''
}: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const shouldShowAds = monetizationService.shouldShowAds();

  useEffect(() => {
    if (!shouldShowAds || !adRef.current) return;

    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX'; // Replace with your AdSense client ID
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ad
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle.loaded = window.adsbygoogle.loaded || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [shouldShowAds]);

  if (!shouldShowAds) {
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={`ad-container ${className}`}
      style={{
        minHeight: format === 'vertical' ? '250px' : format === 'horizontal' ? '90px' : 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1rem 0',
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: format === 'vertical' ? '300px' : '100%'
        }}
        data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your AdSense client ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// TypeScript declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdBanner;




