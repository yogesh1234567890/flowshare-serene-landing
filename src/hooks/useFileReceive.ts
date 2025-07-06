
import { useState, useCallback } from 'react';
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

export const useFileReceive = () => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [downloadFile, setDownloadFile] = useState<DownloadFile | null>(null);
  const { initializeAsReceiver, connectionState, isDataChannelOpen } = useWebRTC();

  const handleConnect = useCallback((connectionCode: string) => {
    setConnectionStatus('connecting');
    
    // Initialize WebRTC connection as receiver
    initializeAsReceiver(connectionCode);
    
    // Monitor connection state
    const checkConnection = () => {
      if (connectionState === 'connected') {
        setConnectionStatus('connected');
        soundEffects.playConnectSound();
        toast({
          title: "✨ Connected!",
          description: "Successfully connected to sender",
        });
        
        // Simulate receiving file info when data channel opens
        if (isDataChannelOpen) {
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
          }, 1000);
        }
      } else if (connectionState === 'failed') {
        setConnectionStatus('disconnected');
        toast({
          title: "❌ Connection Failed",
          description: "Could not connect to sender",
          variant: "destructive"
        });
      }
    };

    // Check connection state periodically
    const interval = setInterval(checkConnection, 1000);
    
    // Cleanup after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      if (connectionStatus === 'connecting') {
        setConnectionStatus('disconnected');
        toast({
          title: "⏱️ Connection Timeout",
          description: "Please check the connection code and try again",
          variant: "destructive"
        });
      }
    }, 30000);
  }, [connectionState, isDataChannelOpen, initializeAsReceiver, connectionStatus]);

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
    downloadFile,
    handleConnect
  };
};
