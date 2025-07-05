
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Simulate QR scanning with visual feedback
  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay with visual feedback
    setTimeout(() => {
      const mockCode = 'ABC123';
      setIsScanning(false);
      soundEffects.playQRScanSound();
      onScan(mockCode);
    }, 2000);
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      soundEffects.playQRScanSound();
      onScan(manualCode.toUpperCase());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
          {/* Scanning overlay */}
          <div className="absolute inset-4 border-2 border-blue-500 rounded-lg transition-all duration-300">
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-blue-500"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-blue-500"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-blue-500"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-blue-500"></div>
          </div>
          
          {/* Inner guide */}
          <div className="absolute inset-8 border border-blue-300 rounded transition-all duration-300"></div>
          
          {/* Camera icon */}
          <Camera className={`w-12 h-12 text-gray-400 transition-all duration-300 ${
            isScanning ? 'animate-pulse text-blue-500' : ''
          }`} />
          
          {/* Scanning line */}
          <div className={`absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transition-all duration-300 ${
            isScanning ? 'animate-pulse opacity-100' : 'animate-pulse opacity-75'
          }`}></div>
          
          {/* Scanning effect */}
          {isScanning && (
            <div className="absolute inset-0 bg-blue-500 opacity-10 animate-pulse"></div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {isScanning ? 'Scanning QR code...' : 'Position QR code within the frame'}
        </p>
        
        <Button 
          onClick={simulateScan} 
          className="mb-4 transform transition-all duration-200 hover:scale-105"
          disabled={isScanning}
        >
          {isScanning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Scanning...
            </div>
          ) : (
            'Simulate QR Scan (Demo)'
          )}
        </Button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Or enter code manually:</p>
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
