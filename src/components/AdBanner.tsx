import { monetizationService } from '@/services/monetizationService';

interface AdBannerProps {
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Ad Banner Component
 * Placeholder for future ad integration - only shows for free tier users
 */
export const AdBanner = ({ 
  format = 'horizontal',
  className = ''
}: AdBannerProps) => {
  const shouldShowAds = monetizationService.shouldShowAds();

  if (!shouldShowAds) {
    return null;
  }

  // Placeholder ad banner - can be replaced with actual ad service later
  return (
    <div 
      className={`bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center ${className}`}
      style={{
        minHeight: format === 'vertical' ? '250px' : format === 'horizontal' ? '90px' : 'auto',
        width: '100%'
      }}
    >
      <p className="text-xs text-slate-400">Advertisement</p>
    </div>
  );
};

export default AdBanner;




