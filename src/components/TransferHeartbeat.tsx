
import React from 'react';

interface TransferHeartbeatProps {
  isActive: boolean;
  children: React.ReactNode;
}

const TransferHeartbeat = ({ isActive, children }: TransferHeartbeatProps) => {
  return (
    <div className={`transition-all duration-500 ${
      isActive ? 'shadow-lg scale-[1.01]' : ''
    }`}>
      <div className={`relative ${
        isActive ? 'border-l-4 border-blue-500' : ''
      }`}>
        {children}
      </div>
    </div>
  );
};

export default TransferHeartbeat;
