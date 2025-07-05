
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');

  // Simulate QR scanning - in a real app you'd use a camera library
  const simulateScan = () => {
    // Simulate scanning a QR code that contains "ABC123"
    const mockCode = 'ABC123';
    onScan(mockCode);
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      onScan(manualCode.toUpperCase());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute inset-4 border-2 border-blue-500 rounded-lg"></div>
          <div className="absolute inset-8 border border-blue-300 rounded"></div>
          <Camera className="w-12 h-12 text-gray-400" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Position QR code within the frame
        </p>
        <Button onClick={simulateScan} className="mb-4">
          Simulate QR Scan (Demo)
        </Button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Or enter code manually:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            className="flex-1 text-center font-mono"
            maxLength={6}
          />
          <Button onClick={handleManualEntry} size="sm">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
