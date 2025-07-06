
import { useState, useCallback, useRef } from 'react';
import { WebRTCService } from '@/services/webrtcService';
import { toast } from '@/hooks/use-toast';

export const useWebRTC = () => {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isDataChannelOpen, setIsDataChannelOpen] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const webrtcService = useRef<WebRTCService | null>(null);

  const initializeAsSender = useCallback((roomId: string) => {
    webrtcService.current = new WebRTCService();
    
    webrtcService.current.connectAsSender(roomId, {
      onConnectionStateChange: (state) => {
        setConnectionState(state);
        if (state === 'connected') {
          toast({
            title: "🔗 Peer Connected",
            description: "Ready to send files",
          });
        }
      },
      onDataChannelOpen: () => {
        setIsDataChannelOpen(true);
        toast({
          title: "✅ Channel Ready", 
          description: "You can now send files",
        });
      },
      onProgressUpdate: (progress) => {
        console.log('File transfer progress:', progress);
      },
      onWebSocketConnected: () => {
        setIsWebSocketConnected(true);
        toast({
          title: "🌐 WebSocket Connected",
          description: "Protocol switched successfully (101)",
        });
      }
    });

    setTimeout(() => {
      webrtcService.current?.createOffer();
    }, 1000);
  }, []);

  const initializeAsReceiver = useCallback((connectionCode: string) => {
    webrtcService.current = new WebRTCService();
    
    webrtcService.current.connectAsReceiver(connectionCode, {
      onConnectionStateChange: (state) => {
        setConnectionState(state);
        if (state === 'connected') {
          toast({
            title: "🔗 Connected to Sender",
            description: "Ready to receive files",
          });
        }
      },
      onDataChannelOpen: () => {
        setIsDataChannelOpen(true);
        toast({
          title: "✅ Ready to Receive",
          description: "Waiting for files...",
        });
      },
      onFileReceived: (file) => {
        console.log('File received:', file);
        toast({
          title: "📁 File Received",
          description: file.name,
        });
      },
      onWebSocketConnected: () => {
        setIsWebSocketConnected(true);
        toast({
          title: "🌐 WebSocket Connected",
          description: "Protocol switched successfully (101)",
        });
      }
    });
  }, []);

  const sendFile = useCallback((file: File) => {
    if (webrtcService.current && isDataChannelOpen) {
      webrtcService.current.sendFile(file);
    }
  }, [isDataChannelOpen]);

  const disconnect = useCallback(() => {
    if (webrtcService.current) {
      webrtcService.current.disconnect();
      webrtcService.current = null;
    }
    setConnectionState('disconnected');
    setIsDataChannelOpen(false);
    setIsWebSocketConnected(false);
  }, []);

  return {
    connectionState,
    isDataChannelOpen,
    isWebSocketConnected,
    initializeAsSender,
    initializeAsReceiver,
    sendFile,
    disconnect
  };
};
