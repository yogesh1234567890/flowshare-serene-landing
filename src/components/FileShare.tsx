
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import ConnectionCode from './ConnectionCode';
import QRGenerator from './QRGenerator';

interface FileData {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'uploading' | 'complete' | 'error';
}

const FileShare = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [connectionCode] = useState('ABC123');
  const [isConnected, setIsConnected] = useState(false);

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles: FileData[] = uploadedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 0,
      speed: '0 MB/s',
      eta: 'Calculating...',
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsConnected(true);
    
    // Simulate upload progress
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        simulateUpload(file.id);
      }, index * 500);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: 100, speed: '0 MB/s', eta: 'Complete', status: 'complete' }
            : file
        ));
        return;
      }

      const speed = (Math.random() * 3 + 1).toFixed(1);
      const eta = Math.round((100 - progress) / 10);
      
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress: Math.min(progress, 99), speed: `${speed} MB/s`, eta: `${eta}s` }
          : file
      ));
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link 
            to="/receive"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Receive Files
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            Send Files
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in">
            Share your files securely with anyone, anywhere
          </p>
        </div>

        <div className="space-y-6">
          <FileDropZone onFilesAdded={handleFileUpload} />
          
          {isConnected && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <ConnectionCode code={connectionCode} />
                <QRGenerator value={connectionCode} />
              </div>
              
              {files.length > 0 && (
                <div className="space-y-4">
                  {files.map((file) => (
                    <UploadProgress 
                      key={file.id} 
                      fileItem={{
                        file: new File([], file.name),
                        progress: file.progress,
                        status: file.status,
                        id: file.id
                      }} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileShare;
