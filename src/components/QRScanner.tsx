import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { soundEffects } from '@/utils/soundEffects';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      soundEffects.playQRScanSound();
      onScan(manualCode.toUpperCase());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground mb-2">Or enter code manually:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            className="flex-1 text-center font-mono transition-all duration-200 focus:scale-105"
            maxLength={6}
          />
          <Button 
            onClick={handleManualEntry} 
            size="sm"
            className="transform transition-all duration-200 hover:scale-105"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
