
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Wifi, WifiOff, Globe, Shield, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ConnectionPulse from './ConnectionPulse';
import { soundEffects } from '@/utils/soundEffects';
import { trackButtonClick, trackCodeGenerated } from '@/utils/gtm';

interface ConnectionFormProps {
  onConnect: (code: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  connectionState?: string;
  isWebSocketConnected?: boolean;
}

const ConnectionForm = ({ onConnect, connectionStatus }: ConnectionFormProps) => {
  const [connectionCode, setConnectionCode] = useState('');

  const handleConnect = () => {
    if (!connectionCode.trim()) {
      toast({
        title: "Enter Connection Code",
        description: "Please enter a valid connection code",
      });
      return;
    }
    
    // Track connection attempt
    trackButtonClick('connect_receiver', 'ConnectionForm');
    trackCodeGenerated('receiver');
    
    onConnect(connectionCode);
  };

  return (
    <CardContent className="p-0 space-y-4">
      <div className="relative">
        <Input
          placeholder="Enter connection code (e.g., ABC123)"
          value={connectionCode}
          onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
          disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
          className="text-center font-mono text-lg sm:text-xl tracking-widest h-12 sm:h-14 text-foreground placeholder:text-muted-foreground border-2 focus:border-primary transition-all duration-200"
          maxLength={15}
          autoCapitalize="characters"
          autoCorrect="off"
          inputMode="text"
        />
      </div>

      <Button
        onClick={handleConnect}
        disabled={!connectionCode.trim() || connectionStatus === 'connecting' || connectionStatus === 'connected'}
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold transform transition-all duration-200 hover:scale-105 disabled:transform-none disabled:opacity-70 touch-manipulation"
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
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            Connect to Sender
          </div>
        )}
      </Button>
    </CardContent>
  );
};

export default ConnectionForm;
