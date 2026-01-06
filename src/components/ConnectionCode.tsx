
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
interface ConnectionCodeProps {
  code: string;
  onRefresh?: () => void;
}

const ConnectionCode = ({ code, onRefresh }: ConnectionCodeProps) => {
  return (
    <Card className="relative bg-gradient-to-r from-blue-500 to-teal-500 text-white">
      {onRefresh && (
        <Button
          size="sm"
          onClick={onRefresh}
          className="absolute top-2 right-2 flex items-center gap-1 sm:gap-2 bg-white text-blue-600 rounded-lg px-2 sm:px-3 py-1.5 hover:scale-105 hover:bg-blue-50 transition-all touch-manipulation"
          title="Refresh Code"
          aria-label="Refresh Code"
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>

      )}
      <CardContent className="p-4 sm:p-6 text-center">
        <h3 className="text-xs sm:text-sm font-medium mb-2 opacity-90">Connection Code</h3>
        <div className="text-2xl sm:text-3xl font-bold tracking-wider mb-2 font-mono break-all">
          {code}
        </div>
        <p className="text-xs sm:text-sm opacity-75 px-2">
          Share this code with the recipient
        </p>
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm">Active Connection</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCode;
