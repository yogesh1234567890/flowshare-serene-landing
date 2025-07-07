
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import TransferHeartbeat from './TransferHeartbeat';

interface DownloadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'connecting' | 'downloading' | 'complete' | 'error';
}

interface DownloadProgressProps {
  downloadFile: DownloadFile;
}

const DownloadProgress = ({ downloadFile }: DownloadProgressProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (downloadFile.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-blue-600 animate-bounce" />;
      default:
        return <Download className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (downloadFile.status) {
      case 'complete':
        return '✅ Complete';
      case 'error':
        return '❌ Error';
      case 'downloading':
        return '📥 Downloading';
      case 'connecting':
        return '🔄 Connecting';
      default:
        return '⚪ Preparing';
    }
  };

  const isActiveTransfer = downloadFile.status === 'downloading';

  return (
    <TransferHeartbeat isActive={isActiveTransfer}>
      <Card className="transform transition-all duration-500 animate-scale-in hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold flex-1">
              File Transfer
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(downloadFile.progress)}%
            </span>
          </div>

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
                  {downloadFile.size > 0 ? formatFileSize(downloadFile.size) : 'Calculating size...'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {downloadFile.speed}
                </p>
                <p className="text-xs text-gray-500">
                  Transfer speed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ETA: {downloadFile.eta}
                </span>
                <span className="font-medium">
                  {getStatusText()}
                </span>
              </div>
              <Progress 
                value={downloadFile.progress} 
                className={`h-3 transition-all duration-300 ${
                  downloadFile.status === 'complete' ? '[&>div]:bg-green-500' : 
                  downloadFile.status === 'error' ? '[&>div]:bg-red-500' :
                  '[&>div]:bg-blue-500'
                }`}
              />
            </div>

            {/* Real-time transfer details */}
            {isActiveTransfer && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-700 font-medium">Live Transfer</span>
                  <span className="text-blue-600 text-xs animate-pulse">●</span>
                </div>
                <div className="text-blue-600 text-xs">
                  Secure peer-to-peer connection • End-to-end encrypted
                </div>
              </div>
            )}

            {downloadFile.status === 'complete' && (
              <Button className="w-full mt-4 transform transition-all duration-200 hover:scale-105 animate-fade-in bg-green-600 hover:bg-green-700">
                🎉 File Downloaded Successfully
              </Button>
            )}

            {downloadFile.status === 'error' && (
              <Button 
                variant="destructive" 
                className="w-full mt-4 transform transition-all duration-200 hover:scale-105 animate-fade-in"
              >
                ❌ Transfer Failed - Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TransferHeartbeat>
  );
};

export default DownloadProgress;
