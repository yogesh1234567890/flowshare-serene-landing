
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { QrCode, Wifi, WifiOff, Download, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRScanner from './QRScanner';

interface DownloadFile {
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'connecting' | 'downloading' | 'complete' | 'error';
}

const FileReceive = () => {
  const [connectionCode, setConnectionCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [downloadFile, setDownloadFile] = useState<DownloadFile | null>(null);

  const handleConnect = useCallback(() => {
    if (!connectionCode.trim()) {
      toast({
        title: "Enter Connection Code",
        description: "Please enter a valid connection code",
      });
      return;
    }

    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      toast({
        title: "Connected!",
        description: "Successfully connected to sender",
      });
      
      // Simulate receiving file info
      setTimeout(() => {
        setDownloadFile({
          name: 'presentation.pdf',
          size: 2547200, // 2.4 MB
          progress: 0,
          speed: '0 MB/s',
          eta: 'Calculating...',
          status: 'connecting'
        });
        startDownload();
      }, 1000);
    }, 2000);
  }, [connectionCode]);

  const startDownload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2; // Random progress between 2-10%
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadFile(prev => prev ? {
          ...prev,
          progress: 100,
          speed: '0 MB/s',
          eta: 'Complete',
          status: 'complete'
        } : null);
        toast({
          title: "Download Complete",
          description: "File received successfully",
        });
        return;
      }

      const speed = (Math.random() * 3 + 1).toFixed(1); // 1-4 MB/s
      const remainingMB = downloadFile ? (downloadFile.size * (100 - progress) / 100) / (1024 * 1024) : 0;
      const etaSeconds = remainingMB / parseFloat(speed);
      const eta = etaSeconds < 60 ? `${Math.round(etaSeconds)}s` : `${Math.round(etaSeconds / 60)}m`;

      setDownloadFile(prev => prev ? {
        ...prev,
        progress: Math.min(progress, 99),
        speed: `${speed} MB/s`,
        eta,
        status: 'downloading'
      } : null);
    }, 300);
  };

  const handleQRScan = (result: string) => {
    setConnectionCode(result);
    setShowQRScanner(false);
    toast({
      title: "QR Code Scanned",
      description: "Connection code captured",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-500" />;
      case 'connecting': return <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default: return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Not Connected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Receive Files
          </h1>
          <p className="text-lg text-gray-600">
            Enter the connection code or scan QR to receive files
          </p>
        </div>

        <div className="space-y-6">
          {/* Connection Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Connection</h3>
                <div className="flex items-center gap-2">
                  {getConnectionIcon()}
                  <span className={`text-sm font-medium ${
                    connectionStatus === 'connected' ? 'text-green-600' : 
                    connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {getConnectionText()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter connection code (e.g., ABC123)"
                    value={connectionCode}
                    onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                    disabled={connectionStatus === 'connecting'}
                    className="flex-1 text-center font-mono text-lg tracking-wider"
                    maxLength={6}
                  />
                  <Button
                    onClick={() => setShowQRScanner(!showQRScanner)}
                    variant="outline"
                    disabled={connectionStatus === 'connecting'}
                    className="px-4"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>

                {showQRScanner && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <QRScanner onScan={handleQRScan} />
                  </div>
                )}

                <Button
                  onClick={handleConnect}
                  disabled={!connectionCode.trim() || connectionStatus === 'connecting'}
                  className="w-full"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Download Progress Section */}
          {downloadFile && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Progress
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {downloadFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(downloadFile.size)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(downloadFile.progress)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {downloadFile.speed}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ETA: {downloadFile.eta}
                      </span>
                      <span>
                        {downloadFile.status === 'complete' ? '✅ Complete' : 
                         downloadFile.status === 'downloading' ? '📥 Downloading' : 
                         '🔄 Preparing'}
                      </span>
                    </div>
                    <Progress 
                      value={downloadFile.progress} 
                      className={`h-3 ${
                        downloadFile.status === 'complete' ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'
                      }`}
                    />
                  </div>

                  {downloadFile.status === 'complete' && (
                    <Button className="w-full mt-4">
                      Open File
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {connectionStatus === 'disconnected' && !downloadFile && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-6 text-center">
                <div className="text-gray-500 space-y-3">
                  <QrCode className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-lg font-medium">Ready to Receive</p>
                  <p className="text-sm">
                    Ask the sender for their connection code or scan their QR code to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileReceive;
