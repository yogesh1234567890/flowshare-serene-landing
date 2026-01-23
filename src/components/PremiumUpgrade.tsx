import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Shield, Infinity, X, Loader2 } from 'lucide-react';
import { monetizationService, UserTier } from '@/services/monetizationService';
import { trackButtonClick } from '@/utils/gtm';
import { toast } from '@/hooks/use-toast';

interface PremiumUpgradeProps {
  showClose?: boolean;
  onClose?: () => void;
}

export const PremiumUpgrade = ({ showClose = false, onClose }: PremiumUpgradeProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading] = useState(false);
  const currentTier = monetizationService.getUserTier();
  const usage = monetizationService.getUsage();
  const limits = monetizationService.getLimits();

  const plans = {
    monthly: {
      price: 4.99,
      period: 'month',
      savings: null
    },
    yearly: {
      price: 49.99,
      period: 'year',
      savings: '17%'
    }
  };

  const features = [
    { icon: Infinity, text: 'Unlimited file size' },
    { icon: Infinity, text: 'Unlimited files per transfer' },
    { icon: Zap, text: 'Unlimited daily transfers' },
    { icon: Shield, text: 'Advanced encryption' },
    { icon: X, text: 'No ads' },
    { icon: Crown, text: 'Priority support' },
    { icon: Shield, text: 'Extended storage (7 days)' },
    { icon: Zap, text: 'Transfer analytics' }
  ];

  const handleUpgrade = async () => {
    trackButtonClick('premium_upgrade', 'PremiumUpgrade');
    toast({
      title: "Coming Soon",
      description: "Checkout will be available soon.",
    });
    window.location.href = '/upgrade';
  };

  if (currentTier !== UserTier.FREE) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-amber-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription className="mt-2">
              Unlock unlimited transfers, advanced features, and remove ads
            </CardDescription>
          </div>
          {showClose && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <h4 className="font-semibold mb-3">Your Usage Today</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transfers:</span>
              <span className="font-medium">
                {usage.transfersToday} / {limits.maxTransfersPerDay === Infinity ? '∞' : limits.maxTransfersPerDay}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{
                  width: `${limits.maxTransfersPerDay === Infinity 
                    ? 0 
                    : Math.min((usage.transfersToday / limits.maxTransfersPerDay) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
            onClick={() => setSelectedPlan('monthly')}
            size="sm"
          >
            Monthly
          </Button>
          <Button
            variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
            onClick={() => setSelectedPlan('yearly')}
            size="sm"
          >
            Yearly
            {plans.yearly.savings && (
              <Badge variant="secondary" className="ml-2">
                Save {plans.yearly.savings}
              </Badge>
            )}
          </Button>
        </div>

        {/* Price Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-600">
            ${plans[selectedPlan].price}
          </div>
          <div className="text-sm text-gray-600">
            per {plans[selectedPlan].period}
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Premium
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Cancel anytime. 30-day money-back guarantee.
        </p>
      </CardContent>
    </Card>
  );
};

export default PremiumUpgrade;

