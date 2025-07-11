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
    fileInfoMap,
    initializeAsReceiver 
  } = useWebRTC();

  // Fix connection status mapping - use isDataChannelOpen for true connected state
  const connectionStatus: ConnectionStatus = (() => {
    if (isDataChannelOpen && connectionState === 'connected') {
      return 'connected';
    } else if (isWebSocketConnected && (connectionState === 'connecting' || connectionState === 'new')) {
      return 'connecting';
    } else {
      return 'disconnected';
    }
  })();

  const handleConnect = useCallback((connectionCode: string) => {
    console.log('Receiver connecting to room:', connectionCode);
    
    // Initialize WebRTC connection as receiver with enhanced file info handling
    initializeAsReceiver(connectionCode);
    
    toast({
      title: "🔄 Connecting...",
      description: `Joining room: ${connectionCode}`,
    });
  }, [initializeAsReceiver]);

  // Monitor connection state changes
  useEffect(() => {
    if (connectionState === 'connected' && isDataChannelOpen) {
      soundEffects.playConnectSound();
      toast({
        title: "✅ Ready to Receive",
        description: "Connected and ready for file transfers",
      });
    } else if (connectionState === 'failed' || connectionState === 'closed') {
      toast({
        title: "❌ Connection Failed",
        description: "Could not connect to sender",
        variant: "destructive"
      });
    }
  }, [connectionState, isDataChannelOpen]);

  // Handle file transfer progress updates from WebRTC with debounced updates
  useEffect(() => {
    if (fileTransferProgress.size > 0) {
      // Batch updates to prevent excessive re-renders
      setDownloadFiles(prev => {
        const newFiles = [...prev];
        let hasChanges = false;
        
        fileTransferProgress.forEach((progress, fileId) => {
          const existingIndex = newFiles.findIndex(f => f.id === fileId);
          const fileInfo = fileInfoMap.get(fileId);
          const roundedProgress = Math.round(progress);
          
          if (existingIndex === -1) {
            // Create new download file entry
            const newFile: DownloadFile = {
              id: fileId,
              name: fileInfo?.name || `Receiving file...`,
              size: fileInfo?.size || 0,
              progress: roundedProgress,
              speed: calculateSpeed(progress),
              eta: calculateETA(progress),
              status: progress >= 100 ? 'complete' : progress > 0 ? 'downloading' : 'connecting'
            };
            
            newFiles.push(newFile);
            hasChanges = true;
            
            // Show toast for new file transfer (only once)
            if (progress > 0 && progress < 100) {
              toast({
                title: "📥 Receiving File",
                description: fileInfo?.name ? `Receiving ${fileInfo.name}` : "File transfer started",
              });
            }
          } else {
            // Update existing file only if there's a significant change (>= 5% or status change)
            const currentFile = newFiles[existingIndex];
            const shouldUpdate = 
              Math.abs(currentFile.progress - roundedProgress) >= 5 || 
              (progress >= 100 && currentFile.status !== 'complete') ||
              (fileInfo?.name && currentFile.name !== fileInfo.name);
            
            if (shouldUpdate) {
              newFiles[existingIndex] = {
                ...currentFile,
                name: fileInfo?.name || currentFile.name,
                size: fileInfo?.size || currentFile.size,
                progress: roundedProgress,
                speed: calculateSpeed(progress),
                eta: calculateETA(progress),
                status: progress >= 100 ? 'complete' : progress > 0 ? 'downloading' : 'connecting'
              };
              hasChanges = true;
              
              // Show completion toast (only once)
              if (progress >= 100 && currentFile.progress < 100) {
                toast({
                  title: "✅ File Received",
                  description: `${fileInfo?.name || currentFile.name} downloaded successfully`,
                });
              }
            }
          }
        });
        
        return hasChanges ? newFiles : prev;
      });
    }
  }, [fileTransferProgress, fileInfoMap]);

  const calculateSpeed = (progress: number): string => {
    // More stable speed calculation to reduce flicker
    if (progress === 0) return '0 MB/s';
    if (progress >= 100) return '0 MB/s';
    
    // Use a more stable base speed calculation
    const baseSpeed = 2.5; // Fixed base speed
    const variation = (Math.sin(Date.now() / 5000) * 0.5); // Slower variation
    return `${Math.max(0.5, baseSpeed + variation).toFixed(1)} MB/s`;
  };

  const calculateETA = (progress: number): string => {
    if (progress >= 100) return 'Complete';
    if (progress === 0) return 'Starting...';
    
    const remainingPercent = 100 - progress;
    const estimatedSeconds = Math.max(1, (remainingPercent / Math.max(progress, 1)) * 15); // More realistic ETA
    
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
