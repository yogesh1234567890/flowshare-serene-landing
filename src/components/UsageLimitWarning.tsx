import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { monetizationService } from '@/services/monetizationService';
import { Link } from 'react-router-dom';

interface UsageLimitWarningProps {
  reason: string;
  showUpgrade?: boolean;
}

export const UsageLimitWarning = ({ reason, showUpgrade = true }: UsageLimitWarningProps) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Transfer Limit Reached</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{reason}</p>
        {showUpgrade && (
          <Link to="/upgrade">
            <Button variant="outline" size="sm" className="mt-2">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default UsageLimitWarning;




