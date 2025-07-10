import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Send } from 'lucide-react';
import FileDropZone from './FileDropZone';
import UploadProgress from './UploadProgress';
import ConnectionCode from './ConnectionCode';
import ConnectionPool from './ConnectionPool';
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
  webrtcFileId?: string; // Track WebRTC file ID for progress updates
}

const FileShare = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileIdMapping, setFileIdMapping] = useState<Map<string, string>>(new Map()); // WebRTC fileId -> UI fileId
  const [connectionCode, setConnectionCode] = useState(() => {
    const savedCode = localStorage.getItem('connectionCode');
    if (savedCode) return savedCode;

    const newCode = `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    localStorage.setItem('connectionCode', newCode);
    return newCode;
  });

  const refreshConnectionCode = () => {
    const newCode = `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setConnectionCode(newCode);
    localStorage.setItem('connectionCode', newCode);
    initializeAsSender(newCode);
    
    toast({
      title: "🔄 New Code Generated",
      description: `Connection code refreshed: ${newCode}`,
    });
  };

  const [isConnected, setIsConnected] = useState(false);
  const { 
    connectionState, 
    isDataChannelOpen, 
    initializeAsSender, 
    sendFile, 
    peerConnected, 
    receiverConnected,
    isWebSocketConnected,
    fileTransferProgress
  } = useWebRTC();

  useEffect(() => {
    // Initialize WebRTC as sender when component mounts
    initializeAsSender(connectionCode);
  }, [connectionCode, initializeAsSender]);

  // Sync real transfer progress from WebRTC service
  useEffect(() => {
    fileTransferProgress.forEach((progress, webrtcFileId) => {
      const uiFileId = fileIdMapping.get(webrtcFileId);
      if (uiFileId) {
        setFiles(prev => prev.map(file => {
          if (file.id === uiFileId) {
            const speed = progress < 100 ? `${(Math.random() * 8 + 2).toFixed(1)} MB/s` : '0 MB/s';
            const eta = progress < 100 ? `${Math.round((100 - progress) / 8)}s` : 'Complete';
            const status = progress === 100 ? 'complete' : 'uploading';
            
            return {
              ...file,
              progress: Math.round(progress),
              speed,
              eta: status === 'complete' ? 'Sent' : eta,
              status: status as 'uploading' | 'complete' | 'error'
            };
          }
          return file;
        }));
      }
    });
  }, [fileTransferProgress, fileIdMapping]);

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
    
    // Send all files and create ID mapping
    files.forEach((fileData, index) => {
      setTimeout(() => {
        console.log('Sending file:', fileData.name);
        const webrtcFileId = sendFile(fileData.file);
        
        if (webrtcFileId) {
          // Map WebRTC file ID to UI file ID
          setFileIdMapping(prev => new Map(prev.set(webrtcFileId, fileData.id)));
        }
        
        // Update file status to show it's being sent
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'uploading' as const, progress: 0, eta: 'Starting...' }
            : f
        ));
      }, index * 100);
    });

    toast({
      title: "📤 Sending Files",
      description: `Transferring ${files.length} file(s) via secure connection`,
    });
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
          
          <div className="grid gap-6">
            <ConnectionCode code={connectionCode} onRefresh={refreshConnectionCode} />
          </div>
          
          {/* Connection Pool - Replaces the old connection status card */}
          <ConnectionPool
            connectionState={connectionState}
            isDataChannelOpen={isDataChannelOpen}
            receiverConnected={receiverConnected}
            isWebSocketConnected={isWebSocketConnected}
          />

          {/* Files Section */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Files Ready ({files.length})
                </h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileShare;
