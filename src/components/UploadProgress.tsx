
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { File, RotateCw, X, Send } from 'lucide-react';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'ready' | 'uploading' | 'encrypting' | 'sent' | 'error';
  id: string;
}

interface UploadProgressProps {
  fileItem: FileWithProgress;
  onRemove?: () => void;
}

const UploadProgress = ({ fileItem, onRemove }: UploadProgressProps) => {
  const { file, progress, status } = fileItem;

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'text-gray-600';
      case 'uploading': return 'text-blue-600';
      case 'encrypting': return 'text-yellow-600';
      case 'sent': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready': return 'Ready to send';
      case 'uploading': return 'Sending...';
      case 'encrypting': return 'Encrypting...';
      case 'sent': return 'Sent';
      case 'error': return 'Transfer failed';
      default: return 'Preparing...';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <File className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'encrypting' && (
            <RotateCw className="w-4 h-4 text-yellow-500 animate-spin" />
          )}
          {status === 'uploading' && (
            <Send className="w-4 h-4 text-blue-500 animate-pulse" />
          )}
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {onRemove && status === 'ready' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{Math.round(progress)}%</span>
          <span>
            {status === 'encrypting' ? '🔒 Encrypting' : 
             status === 'sent' ? '✅ Sent' : 
             status === 'uploading' ? '📤 Sending' : '📁 Ready'}
          </span>
        </div>
        <Progress 
          value={progress} 
          className={`h-2 ${
            status === 'encrypting' ? '[&>div]:bg-yellow-500' :
            status === 'sent' ? '[&>div]:bg-green-500' : 
            status === 'uploading' ? '[&>div]:bg-blue-500' : '[&>div]:bg-gray-400'
          }`}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
