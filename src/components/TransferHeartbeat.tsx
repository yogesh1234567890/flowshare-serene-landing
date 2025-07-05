
import React from 'react';

interface TransferHeartbeatProps {
  isActive: boolean;
  children: React.ReactNode;
}

const TransferHeartbeat = ({ isActive, children }: TransferHeartbeatProps) => {
  return (
    <div className={`transition-all duration-300 ${
      isActive ? 'animate-pulse' : ''
    }`}>
      <div className={`relative ${
        isActive ? 'before:absolute before:inset-0 before:bg-blue-100 before:rounded-lg before:animate-ping before:opacity-20' : ''
      }`}>
        {children}
      </div>
    </div>
  );
};

export default TransferHeartbeat;
