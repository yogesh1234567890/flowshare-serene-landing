
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

const WaitingState = () => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="p-6 text-center">
        <div className="text-gray-500 space-y-3 animate-fade-in">
          <QrCode className="w-12 h-12 mx-auto opacity-50" />
          <p className="text-lg font-medium">Ready to Receive</p>
          <p className="text-sm">
            Ask the sender for their connection code to get started
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitingState;
