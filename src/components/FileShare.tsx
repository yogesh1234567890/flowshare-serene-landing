import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Send, Zap, Shield, Users } from 'lucide-react';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import ConnectionCode from './ConnectionCode';
import ConnectionPool from './ConnectionPool';
import Navbar from './Navbar';
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
  const { 
    connectionState, 
    isDataChannelOpen, 
    initializeAsSender, 
    sendFile, 
    peerConnected, 
    receiverConnected,
    isWebSocketConnected
  } = useWebRTC();

  useEffect(() => {
    // Initialize WebRTC as sender when component mounts
    initializeAsSender(connectionCode);
  }, [connectionCode, initializeAsSender]);

  useEffect(() => {
    setIsConnected(connectionState === 'connected');
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

    console.log('Starting file transfer for', files.length, 'files');
    
    // Send all files
    files.forEach((fileData, index) => {
      setTimeout(() => {
        console.log('Sending file:', fileData.name);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Send Files
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share your files securely with anyone, anywhere using peer-to-peer technology
            </p>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-semibold text-blue-600">Instant</span>
              </div>
              <p className="text-sm text-muted-foreground">Direct peer-to-peer transfer</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-semibold text-green-600">Secure</span>
              </div>
              <p className="text-sm text-muted-foreground">End-to-end encryption</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-purple-500 mr-2" />
                <span className="font-semibold text-purple-600">Private</span>
              </div>
              <p className="text-sm text-muted-foreground">No server storage</p>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Select Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileDropZone onFilesAdded={handleFileUpload} />
                </CardContent>
              </Card>

              {/* Files Section */}
              {files.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Files Ready ({files.length})</CardTitle>
                      {receiverConnected && isDataChannelOpen && files.some(f => f.status === 'complete') && (
                        <Button 
                          onClick={handleSendFiles}
                          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 animate-pulse shadow-lg"
                        >
                          <Send className="w-4 h-4" />
                          Send All Files
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Connection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Connection Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConnectionCode code={connectionCode} />
                </CardContent>
              </Card>

              {/* Connection Pool */}
              <ConnectionPool
                connectionState={connectionState}
                isDataChannelOpen={isDataChannelOpen}
                receiverConnected={receiverConnected}
                isWebSocketConnected={isWebSocketConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileShare;
