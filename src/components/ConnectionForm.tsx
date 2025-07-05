
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRScanner from './QRScanner';
import ConnectionPulse from './ConnectionPulse';
import { soundEffects } from '@/utils/soundEffects';

interface ConnectionFormProps {
  onConnect: (code: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

const ConnectionForm = ({ onConnect, connectionStatus }: ConnectionFormProps) => {
  const [connectionCode, setConnectionCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleConnect = () => {
    if (!connectionCode.trim()) {
      toast({
        title: "Enter Connection Code",
        description: "Please enter a valid connection code",
      });
      return;
    }
    onConnect(connectionCode);
  };

  const handleQRScan = (result: string) => {
    setConnectionCode(result);
    setShowQRScanner(false);
    soundEffects.playQRScanSound();
    toast({
      title: "📱 QR Code Scanned",
      description: "Connection code captured",
    });
  };

  return (
    <Card className="transform transition-all duration-500 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Connection</h3>
          <ConnectionPulse 
            isConnected={connectionStatus === 'connected'} 
            isConnecting={connectionStatus === 'connecting'} 
          />
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter connection code (e.g., ABC123)"
              value={connectionCode}
              onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
              disabled={connectionStatus === 'connecting'}
              className="flex-1 text-center font-mono text-lg tracking-wider transition-all duration-200 focus:scale-105"
              maxLength={6}
            />
            <Button
              onClick={() => setShowQRScanner(!showQRScanner)}
              variant="outline"
              disabled={connectionStatus === 'connecting'}
              className="px-4 transform transition-all duration-200 hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          {showQRScanner && (
            <div className="border rounded-lg p-4 bg-gray-50 animate-fade-in">
              <QRScanner onScan={handleQRScan} />
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={!connectionCode.trim() || connectionStatus === 'connecting'}
            className="w-full transform transition-all duration-200 hover:scale-105"
          >
            {connectionStatus === 'connecting' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionForm;
