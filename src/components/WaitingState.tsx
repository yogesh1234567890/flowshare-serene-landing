
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

const WaitingState = () => {
  return (
    <Card className="border-2 border-dashed border-muted bg-muted/20">
      <CardContent className="p-8 text-center">
        <div className="text-muted-foreground space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Ready to Receive</h3>
            <p className="text-sm max-w-md mx-auto">
              Ask the sender for their connection code, then enter it above to establish a secure connection
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Waiting for connection...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitingState;
