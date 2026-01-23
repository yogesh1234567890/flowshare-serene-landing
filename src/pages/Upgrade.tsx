import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Building2, Zap, Shield, Infinity, Users, HeadphonesIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackButtonClick } from '@/utils/gtm';
import { monetizationService } from '@/services/monetizationService';
import { toast } from '@/hooks/use-toast';

const Upgrade = () => {
  useSEO({
    title: "Upgrade to Premium | PeerShare - Unlimited File Sharing",
    description: "Upgrade to PeerShare Premium for unlimited file transfers, advanced encryption, no ads, and priority support.",
    keywords: "premium file sharing, upgrade, subscription, unlimited transfers",
    canonicalUrl: "https://peershare.tech/upgrade"
  });

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<'premium' | 'enterprise'>('premium');
  const [loading] = useState(false);
  
  // For now, just use local tier
  useEffect(() => {
    monetizationService.getUserTier();
  }, []);

  const plans = {
    premium: {
      monthly: { price: 4.99, period: 'month' },
      yearly: { price: 49.99, period: 'year', savings: '17%' }
    },
    enterprise: {
      monthly: { price: 99, period: 'month' },
      yearly: { price: 990, period: 'year', savings: '17%' }
    }
  };

  const premiumFeatures = [
    { icon: Infinity, text: 'Unlimited file size' },
    { icon: Infinity, text: 'Unlimited files per transfer' },
    { icon: Zap, text: 'Unlimited daily transfers' },
    { icon: Shield, text: 'Advanced encryption' },
    { icon: Infinity, text: 'No ads' },
    { icon: Crown, text: 'Priority support' },
    { icon: Shield, text: 'Extended storage (7 days)' },
    { icon: Zap, text: 'Transfer analytics' }
  ];

  const enterpriseFeatures = [
    ...premiumFeatures,
    { icon: Users, text: 'Team collaboration' },
    { icon: Building2, text: 'Admin dashboard' },
    { icon: Shield, text: 'Custom domain' },
    { icon: Zap, text: 'SLA guarantees (99.9%)' },
    { icon: HeadphonesIcon, text: 'Dedicated support' },
    { icon: Zap, text: 'API access' },
    { icon: Building2, text: 'White-label option' }
  ];

  const handleCheckout = async (tier: 'premium' | 'enterprise') => {
    trackButtonClick(`checkout_${tier}`, 'Upgrade');
    toast({
      title: "💳 Payment Integration Coming Soon",
      description: `The ${tier} ${selectedPlan}ly plan will be available soon. Stay tuned!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock unlimited transfers, advanced features, and premium support
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
              onClick={() => setSelectedPlan('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
              onClick={() => setSelectedPlan('yearly')}
            >
              Yearly
              {plans.premium.yearly.savings && (
                <Badge variant="secondary" className="ml-2">
                  Save {plans.premium.yearly.savings}
                </Badge>
              )}
            </Button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Premium Plan */}
            <Card className={`relative ${selectedTier === 'premium' ? 'border-2 border-amber-500 shadow-lg' : ''}`}>
              {selectedTier === 'premium' && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-600" />
                  Premium
                </CardTitle>
                <CardDescription>
                  Perfect for individuals and small teams
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${plans.premium[selectedPlan].price}
                  </div>
                  <div className="text-sm text-gray-600">
                    per {plans.premium[selectedPlan].period}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selectedTier === 'premium' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedTier('premium');
                    handleCheckout('premium');
                  }}
                  size="lg"
                  disabled={loading}
                >
                  {loading && selectedTier === 'premium' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Choose Premium'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className={`relative ${selectedTier === 'enterprise' ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
              {selectedTier === 'enterprise' && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                  Best Value
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Enterprise
                </CardTitle>
                <CardDescription>
                  For businesses and large teams
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${plans.enterprise[selectedPlan].price}
                  </div>
                  <div className="text-sm text-gray-600">
                    per {plans.enterprise[selectedPlan].period}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {enterpriseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selectedTier === 'enterprise' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedTier('enterprise');
                    handleCheckout('enterprise');
                  }}
                  size="lg"
                  disabled={loading}
                >
                  {loading && selectedTier === 'enterprise' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Choose Enterprise'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-sm text-gray-600">
                  We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;

