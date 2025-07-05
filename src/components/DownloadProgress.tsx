
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Clock } from 'lucide-react';
import TransferHeartbeat from './TransferHeartbeat';

interface DownloadFile {
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

  const isActiveTransfer = downloadFile.status === 'downloading';

  return (
    <TransferHeartbeat isActive={isActiveTransfer}>
      <Card className="transform transition-all duration-500 animate-scale-in hover:shadow-lg">
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
                className={`h-3 transition-all duration-300 ${
                  downloadFile.status === 'complete' ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'
                }`}
              />
            </div>

            {downloadFile.status === 'complete' && (
              <Button className="w-full mt-4 transform transition-all duration-200 hover:scale-105 animate-fade-in">
                🎉 Open File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TransferHeartbeat>
  );
};

export default DownloadProgress;
