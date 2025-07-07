
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { soundEffects } from '@/utils/soundEffects';
import { useWebRTC } from './useWebRTC';

interface DownloadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'connecting' | 'downloading' | 'complete' | 'error';
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const useFileReceive = () => {
  const [downloadFiles, setDownloadFiles] = useState<DownloadFile[]>([]);
  const { 
    connectionState, 
    isDataChannelOpen, 
    isWebSocketConnected, 
    fileTransferProgress, 
    initializeAsReceiver 
  } = useWebRTC();

  // Map WebRTC connection state to our connection status
  const connectionStatus: ConnectionStatus = (() => {
    switch (connectionState) {
      case 'connected':
        return 'connected';
      case 'connecting':
      case 'new':
        return 'connecting';
      case 'disconnected':
      case 'failed':
      case 'closed':
      default:
        return 'disconnected';
    }
  })();

  const handleConnect = useCallback((connectionCode: string) => {
    console.log('Receiver connecting to room:', connectionCode);
    
    // Initialize WebRTC connection as receiver
    initializeAsReceiver(connectionCode);
    
    toast({
      title: "🔄 Connecting...",
      description: `Joining room: ${connectionCode}`,
    });
  }, [initializeAsReceiver]);

  // Monitor connection state changes
  useEffect(() => {
    if (connectionState === 'connected') {
      soundEffects.playConnectSound();
      toast({
        title: "✨ Connected!",
        description: "Successfully connected to sender",
      });
    } else if (connectionState === 'failed' || connectionState === 'closed') {
      toast({
        title: "❌ Connection Failed",
        description: "Could not connect to sender",
        variant: "destructive"
      });
    }
  }, [connectionState]);

  // Monitor data channel state for file transfers
  useEffect(() => {
    if (isDataChannelOpen && connectionState === 'connected') {
      console.log('Receiver ready for file transfer');
      toast({
        title: "✅ Ready to Receive",
        description: "Secure channel established - waiting for files...",
      });
    }
  }, [isDataChannelOpen, connectionState]);

  // Handle real-time file transfer progress updates
  useEffect(() => {
    fileTransferProgress.forEach((progress, fileId) => {
      setDownloadFiles(prev => {
        const existingFileIndex = prev.findIndex(f => f.id === fileId);
        
        if (existingFileIndex === -1) {
          // Create new download file entry
          const newFile: DownloadFile = {
            id: fileId,
            name: `incoming-file-${fileId.slice(-6)}`,
            size: 0, // Will be updated when we get file info
            progress: progress,
            speed: calculateSpeed(progress),
            eta: calculateETA(progress),
            status: progress >= 100 ? 'complete' : 'downloading'
          };
          return [...prev, newFile];
        } else {
          // Update existing file
          const updatedFiles = [...prev];
          updatedFiles[existingFileIndex] = {
            ...updatedFiles[existingFileIndex],
            progress: progress,
            speed: calculateSpeed(progress),
            eta: calculateETA(progress),
            status: progress >= 100 ? 'complete' : 'downloading'
          };
          return updatedFiles;
        }
      });
    });
  }, [fileTransferProgress]);

  const calculateSpeed = (progress: number): string => {
    // Simulate realistic transfer speeds based on progress
    const baseSpeed = 1.5 + Math.random() * 2; // 1.5-3.5 MB/s
    const speedVariation = Math.sin(progress / 10) * 0.5; // Add some variation
    return `${(baseSpeed + speedVariation).toFixed(1)} MB/s`;
  };

  const calculateETA = (progress: number): string => {
    if (progress >= 100) return 'Complete';
    if (progress === 0) return 'Calculating...';
    
    const remainingPercent = 100 - progress;
    const estimatedSeconds = (remainingPercent / progress) * 30; // Rough estimate
    
    if (estimatedSeconds < 60) {
      return `${Math.round(estimatedSeconds)}s`;
    } else {
      return `${Math.round(estimatedSeconds / 60)}m`;
    }
  };

  return {
    connectionStatus,
    connectionState,
    downloadFiles: downloadFiles.length > 0 ? downloadFiles : null,
    handleConnect,
    isWebSocketConnected
  };
};
