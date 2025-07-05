
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { File, RotateCw } from 'lucide-react';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'encrypting' | 'complete' | 'error';
  id: string;
}

interface UploadProgressProps {
  fileItem: FileWithProgress;
}

const UploadProgress = ({ fileItem }: UploadProgressProps) => {
  const { file, progress, status } = fileItem;

  const getStatusColor = () => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'encrypting': return 'text-yellow-600';
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'encrypting': return 'Encrypting...';
      case 'complete': return 'Ready to share';
      case 'error': return 'Upload failed';
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
    <div className="border rounded-lg p-4 bg-white">
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
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{Math.round(progress)}%</span>
          <span>
            {status === 'encrypting' ? '🔒 Encrypting' : 
             status === 'complete' ? '✅ Encrypted' : '📤 Uploading'}
          </span>
        </div>
        <Progress 
          value={progress} 
          className={`h-2 ${
            status === 'encrypting' ? '[&>div]:bg-yellow-500' :
            status === 'complete' ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'
          }`}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
