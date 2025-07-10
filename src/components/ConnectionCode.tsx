
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
interface ConnectionCodeProps {
  code: string;
  onRefresh?: () => void;
}

const ConnectionCode = ({ code, onRefresh }: ConnectionCodeProps) => {
  return (
    <Card className="relative bg-gradient-to-r from-blue-500 to-teal-500 text-white">
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="absolute top-2 right-2 text-black hover:text-gray-500"
          title="Refresh Code"
        >
          🔄 Refresh
        </Button>
      )}
      <CardContent className="p-6 text-center">
        <h3 className="text-sm font-medium mb-2 opacity-90">Connection Code</h3>
        <div className="text-3xl font-bold tracking-wider mb-2 font-mono">
          {code}
        </div>
        <p className="text-sm opacity-75">
          Share this code with the recipient
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Active Connection</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCode;
