
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { soundEffects } from '@/utils/soundEffects';
import { useWebRTC } from './useWebRTC';

interface DownloadFile {
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'connecting' | 'downloading' | 'complete' | 'error';
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const useFileReceive = () => {
  const [downloadFile, setDownloadFile] = useState<DownloadFile | null>(null);
  const { connectionState, isDataChannelOpen, initializeAsReceiver } = useWebRTC();

  // Map WebRTC connection state to our connection status with proper typing
  const connectionStatus: ConnectionStatus = (() => {
    switch (connectionState) {
      case 'connected':
        return 'connected';
      case 'connecting':
        return 'connecting';
      case 'new':
      case 'disconnected':
      case 'failed':
      case 'closed':
      default:
        return 'disconnected';
    }
  })();

  const handleConnect = useCallback((connectionCode: string) => {
    console.log('Connecting to room:', connectionCode);
    
    // Initialize WebRTC connection as receiver
    initializeAsReceiver(connectionCode);
    
    toast({
      title: "🔄 Connecting...",
      description: `Attempting to connect to room: ${connectionCode}`,
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
      toast({
        title: "✅ Ready to Receive",
        description: "Waiting for files...",
      });
      
      // Simulate receiving file info when data channel opens (for demo)
      setTimeout(() => {
        setDownloadFile({
          name: 'presentation.pdf',
          size: 2547200, // 2.4 MB
          progress: 0,
          speed: '0 MB/s',
          eta: 'Calculating...',
          status: 'connecting'
        });
        startDownload();
      }, 2000);
    }
  }, [isDataChannelOpen, connectionState]);

  const startDownload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2; // Random progress between 2-10%
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadFile(prev => prev ? {
          ...prev,
          progress: 100,
          speed: '0 MB/s',
          eta: 'Complete',
          status: 'complete'
        } : null);
        soundEffects.playCompleteSound();
        toast({
          title: "🎉 Download Complete",
          description: "File received successfully",
        });
        return;
      }

      const speed = (Math.random() * 3 + 1).toFixed(1); // 1-4 MB/s
      const remainingMB = downloadFile ? (downloadFile.size * (100 - progress) / 100) / (1024 * 1024) : 0;
      const etaSeconds = remainingMB / parseFloat(speed);
      const eta = etaSeconds < 60 ? `${Math.round(etaSeconds)}s` : `${Math.round(etaSeconds / 60)}m`;

      setDownloadFile(prev => prev ? {
        ...prev,
        progress: Math.min(progress, 99),
        speed: `${speed} MB/s`,
        eta,
        status: 'downloading'
      } : null);
    }, 300);
  };

  return {
    connectionStatus,
    connectionState,
    downloadFile,
    handleConnect
  };
};
