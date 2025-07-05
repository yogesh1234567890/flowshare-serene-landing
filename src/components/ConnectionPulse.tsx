
import React from 'react';
import { Wifi } from 'lucide-react';

interface ConnectionPulseProps {
  isConnected: boolean;
  isConnecting: boolean;
}

const ConnectionPulse = ({ isConnected, isConnecting }: ConnectionPulseProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings */}
      {(isConnected || isConnecting) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute w-8 h-8 rounded-full border-2 ${
            isConnected ? 'border-green-400' : 'border-yellow-400'
          } animate-ping opacity-75`}></div>
          <div className={`absolute w-12 h-12 rounded-full border-2 ${
            isConnected ? 'border-green-300' : 'border-yellow-300'
          } animate-ping opacity-50`} style={{ animationDelay: '0.5s' }}></div>
          <div className={`absolute w-16 h-16 rounded-full border-2 ${
            isConnected ? 'border-green-200' : 'border-yellow-200'
          } animate-ping opacity-25`} style={{ animationDelay: '1s' }}></div>
        </div>
      )}
      
      {/* Icon */}
      <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full ${
        isConnected ? 'bg-green-500 text-white' : 
        isConnecting ? 'bg-yellow-500 text-white animate-pulse' : 
        'bg-gray-300 text-gray-600'
      } transition-all duration-300`}>
        <Wifi className="w-4 h-4" />
      </div>
    </div>
  );
};

export default ConnectionPulse;
