
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, QrCode, FileUp, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRGenerator from './QRGenerator';
import ConnectionCode from './ConnectionCode';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'encrypting' | 'complete' | 'error';
  id: string;
}

const FileShare = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [connectionCode, setConnectionCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generate a random connection code
  const generateConnectionCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setConnectionCode(code);
    setIsConnected(true);
    toast({
      title: "Connection Ready",
      description: `Share code: ${code}`,
    });
  }, []);

  // Handle file drop/selection
  const handleFiles = useCallback((newFiles: File[]) => {
    const filesWithProgress: FileWithProgress[] = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substring(2)
    }));

    setFiles(prev => [...prev, ...filesWithProgress]);

    // Generate connection code if not already connected
    if (!isConnected) {
      generateConnectionCode();
    }

    // Simulate upload progress for each file
    filesWithProgress.forEach(fileItem => {
      simulateUpload(fileItem.id);
    });
  }, [isConnected, generateConnectionCode]);

  // Simulate upload progress with encryption phases
  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          if (progress >= 60 && progress < 80 && f.status === 'uploading') {
            return { ...f, progress: Math.min(progress, 75), status: 'encrypting' };
          } else if (progress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'complete' };
          }
          return { ...f, progress: Math.min(progress, 99) };
        }
        return f;
      }));

      if (progress >= 100) {
        toast({
          title: "File Ready",
          description: "File encrypted and ready to share",
        });
      }
    }, 200);
  };

  const toggleQR = () => setShowQR(!showQR);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Files Instantly
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Drag, drop, and share. Your files are encrypted and ready in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="space-y-6">
            <FileDropZone onFilesAdded={handleFiles} />
            
            {files.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    Files ({files.length})
                  </h3>
                  <div className="space-y-4">
                    {files.map((fileItem) => (
                      <UploadProgress key={fileItem.id} fileItem={fileItem} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Connection Section */}
          <div className="space-y-6">
            {isConnected ? (
              <>
                <ConnectionCode code={connectionCode} />
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-4">Share Options</h3>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={toggleQR}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        {showQR ? 'Hide QR' : 'Show QR'}
                      </Button>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(connectionCode);
                          toast({ title: "Copied!", description: "Connection code copied to clipboard" });
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Copy Code
                      </Button>
                    </div>
                    
                    {showQR && (
                      <div className="mt-6">
                        <QRGenerator value={connectionCode} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-4">
                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Drop files to generate connection code</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileShare;
