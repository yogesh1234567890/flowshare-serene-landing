
import React from 'react';

interface QRGeneratorProps {
  value: string;
  size?: number;
}

const QRGenerator = ({ value, size = 200 }: QRGeneratorProps) => {
  // Simple QR code placeholder - in a real app you'd use a QR library
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <img 
          src={qrUrl} 
          alt="QR Code" 
          width={size} 
          height={size}
          className="rounded"
        />
      </div>
      <p className="text-sm text-gray-600">
        Scan to connect instantly
      </p>
    </div>
  );
};

export default QRGenerator;
