import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, X, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type SubscriptionStatus = {
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  is_active: boolean;
  current_period_end?: string;
  cancel_at_period_end: boolean;
};

export const SubscriptionStatusCard = () => {
  const [status] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleCancel = async () => {
    toast({
      title: "Coming Soon",
      description: "Subscription management will be available soon.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status || !status.is_active || status.tier === 'free') {
    return null;
  }

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600" />
          Active Subscription
        </CardTitle>
        <CardDescription>
          You're currently on the {status.tier} plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {status.status === 'active' ? 'Active' : status.status}
            </Badge>
          </div>
          {status.current_period_end && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {status.cancel_at_period_end ? (
                <span>Expires {new Date(status.current_period_end).toLocaleDateString()}</span>
              ) : (
                <span>Renews {new Date(status.current_period_end).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>

        {status.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the billing period.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!status.cancel_at_period_end && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          )}
          <Link to="/upgrade" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
