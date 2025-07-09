
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Wifi, WifiOff, Globe, Shield, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRScanner from './QRScanner';
import ConnectionPulse from './ConnectionPulse';
import { soundEffects } from '@/utils/soundEffects';

interface ConnectionFormProps {
  onConnect: (code: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  connectionState?: string;
  isWebSocketConnected?: boolean;
}

const ConnectionForm = ({ onConnect, connectionStatus, connectionState, isWebSocketConnected }: ConnectionFormProps) => {
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

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return { icon: <Wifi className="w-4 h-4" />, text: 'Connected', color: 'text-green-600' };
      case 'connecting':
        return { icon: <Wifi className="w-4 h-4 animate-pulse" />, text: 'Connecting...', color: 'text-yellow-600' };
      default:
        return { icon: <WifiOff className="w-4 h-4" />, text: 'Disconnected', color: 'text-gray-600' };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="space-y-6">
      <CardContent className="p-0">
        {/* Connection Status */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
            connectionStatus === 'connected' 
              ? 'border-green-200 bg-green-50 text-green-700' 
              : connectionStatus === 'connecting'
              ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}>
            {statusDisplay.icon}
            <span className="font-semibold">{statusDisplay.text}</span>
            <ConnectionPulse 
              isConnected={connectionStatus === 'connected'} 
              isConnecting={connectionStatus === 'connecting'} 
            />
          </div>
        </div>

        {/* Single Connection Status Display */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">WebSocket</span>
            </div>
            <div className={`flex items-center gap-2 ${
              isWebSocketConnected ? 'text-green-600' : 'text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isWebSocketConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs font-medium">
                {isWebSocketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {connectionState === 'connected' && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Channel</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium">Ready for Transfer</span>
              </div>
            </div>
          )}

          {connectionCode && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Room Code</span>
              <span className="text-sm font-mono font-bold text-blue-600">{connectionCode}</span>
            </div>
          )}
        </div>

        {/* Connection Code Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Enter connection code (e.g., ABC123)"
              value={connectionCode}
              onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
              disabled={connectionStatus === 'connecting'}
              className="text-center font-mono text-xl tracking-widest h-14 text-foreground placeholder:text-muted-foreground border-2 focus:border-primary transition-all duration-200"
              maxLength={15}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRScanner(!showQRScanner)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showQRScanner && (
            <div className="border rounded-lg p-4 bg-gray-50 animate-fade-in">
              <QRScanner onScan={handleQRScan} />
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={!connectionCode.trim() || connectionStatus === 'connecting'}
            className="w-full h-12 text-lg font-semibold transform transition-all duration-200 hover:scale-105 disabled:transform-none"
            size="lg"
          >
            {connectionStatus === 'connecting' ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : connectionStatus === 'connected' ? (
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Connected & Ready
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Connect to Sender
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default ConnectionForm;
