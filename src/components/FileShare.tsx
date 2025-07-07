
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Send, Users, CheckCircle } from 'lucide-react';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import ConnectionCode from './ConnectionCode';
import QRGenerator from './QRGenerator';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from '@/hooks/use-toast';

interface FileData {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'uploading' | 'complete' | 'error';
  file: File;
}

const FileShare = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [connectionCode] = useState(`ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const [isConnected, setIsConnected] = useState(false);
  const [receiverConnected, setReceiverConnected] = useState(false);
  const { connectionState, isDataChannelOpen, initializeAsSender, sendFile, peerConnected } = useWebRTC();

  useEffect(() => {
    // Initialize WebRTC as sender when component mounts
    initializeAsSender(connectionCode);
  }, [connectionCode, initializeAsSender]);

  useEffect(() => {
    setIsConnected(connectionState === 'connected');
    setReceiverConnected(connectionState === 'connected' && isDataChannelOpen);
  }, [connectionState, isDataChannelOpen]);

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles: FileData[] = uploadedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 100, // Files are immediately ready to send
      speed: '0 MB/s',
      eta: 'Ready to send',
      status: 'complete' as const,
      file: file
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "📁 Files Ready",
      description: `${uploadedFiles.length} file(s) ready to send`,
    });
  };

  const handleSendFiles = () => {
    if (!isDataChannelOpen || files.length === 0) {
      toast({
        title: "❌ Cannot Send Files",
        description: "Data channel not ready or no files selected",
        variant: "destructive"
      });
      return;
    }

    // Send all files
    files.forEach((fileData, index) => {
      setTimeout(() => {
        sendFile(fileData.file);
        
        // Update file status to show it's being sent
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'uploading' as const, progress: 0, eta: 'Sending...' }
            : f
        ));
        
        // Simulate sending progress
        simulateFileTransfer(fileData.id);
      }, index * 100);
    });

    toast({
      title: "📤 Sending Files",
      description: `Transferring ${files.length} file(s) via secure connection`,
    });
  };

  const simulateFileTransfer = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: 100, speed: '0 MB/s', eta: 'Sent', status: 'complete' }
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
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
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
          
          <div className="grid md:grid-cols-2 gap-6">
            <ConnectionCode code={connectionCode} />
            <QRGenerator value={connectionCode} />
          </div>
          
          {/* Connection Status Card */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WebSocket Status:</span>
                  <span className={`text-sm font-semibold ${
                    connectionState === 'connected' ? 'text-green-600' : 
                    connectionState === 'connecting' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {connectionState === 'connected' ? '🟢 Connected' :
                     connectionState === 'connecting' ? '🟡 Connecting...' : '⚪ Waiting'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Receiver Status:</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    receiverConnected ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <Users className="w-4 h-4" />
                    {receiverConnected ? 'Connected & Ready' : 'Waiting for receiver...'}
                  </span>
                </div>

                {receiverConnected && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Secure connection established</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      End-to-end encrypted • Ready for file transfer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Files Section */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Files Ready ({files.length})
                </h3>
                {receiverConnected && files.some(f => f.status === 'complete') && (
                  <Button 
                    onClick={handleSendFiles}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 animate-pulse"
                  >
                    <Send className="w-4 h-4" />
                    Send All Files
                  </Button>
                )}
              </div>
              
              {files.map((file) => (
                <UploadProgress 
                  key={file.id} 
                  fileItem={{
                    file: file.file,
                    progress: file.progress,
                    status: file.status,
                    id: file.id
                  }}
                  onRemove={() => removeFile(file.id)}
                />
              ))}

              {!receiverConnected && files.length > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Waiting for Receiver</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      Share the connection code or QR code with the receiver to start the transfer
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileShare;
