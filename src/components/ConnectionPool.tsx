
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, CheckCircle, Clock } from 'lucide-react';

interface ConnectionPoolProps {
  connectionState: string;
  isDataChannelOpen: boolean;
  receiverConnected: boolean;
  isWebSocketConnected: boolean;
}

const ConnectionPool = ({ 
  connectionState, 
  isDataChannelOpen, 
  receiverConnected, 
  isWebSocketConnected 
}: ConnectionPoolProps) => {
  const getConnectionIcon = () => {
    if (receiverConnected && isDataChannelOpen) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (receiverConnected) {
      return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
    } else {
      return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (receiverConnected && isDataChannelOpen) {
      return 'Ready for transfer';
    } else if (receiverConnected) {
      return 'Establishing secure channel...';
    } else {
      return 'Waiting for receiver...';
    }
  };

  const getStatusColor = () => {
    if (receiverConnected && isDataChannelOpen) {
      return 'text-green-700 bg-green-50 border-green-200';
    } else if (receiverConnected) {
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    } else {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="font-medium text-sm">Connection Pool</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
        </div>

        <div className="space-y-3">
          {/* Connected Users Display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-white/80">
            <div className="relative">
              {getConnectionIcon()}
              {receiverConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {receiverConnected ? 'Receiver Connected' : 'No connections'}
              </div>
              <div className="text-xs opacity-75">
                {getStatusText()}
              </div>
            </div>
            <div className="text-xs font-mono bg-black/10 px-2 py-1 rounded">
              {receiverConnected ? '1/1' : '0/1'}
            </div>
          </div>

          {/* Connection Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span>WebRTC: {connectionState}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                isDataChannelOpen ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span>Channel: {isDataChannelOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionPool;
