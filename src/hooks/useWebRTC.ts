import { useState, useCallback, useRef } from 'react';
import { WebRTCService } from '@/services/webrtcService';
import { toast } from '@/hooks/use-toast';

export const useWebRTC = () => {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isDataChannelOpen, setIsDataChannelOpen] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [fileTransferProgress, setFileTransferProgress] = useState<Map<string, number>>(new Map());
  const [fileInfoMap, setFileInfoMap] = useState<Map<string, { name: string; size: number }>>(new Map());
  const [peerConnected, setPeerConnected] = useState(false);
  const [receiverConnected, setReceiverConnected] = useState(false);
  const webrtcService = useRef<WebRTCService | null>(null);

  const initializeAsSender = useCallback(async (roomId: string) => {
    webrtcService.current = new WebRTCService();
    
    try {
      await webrtcService.current.connectAsSender(roomId, {
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          setPeerConnected(state === 'connected');
          if (state === 'connected') {
            toast({
              title: "🔗 Peer Connected",
              description: "Ready to send files securely",
            });
          } else if (state === 'failed') {
            toast({
              title: "❌ Connection Failed",
              description: "Unable to establish peer connection",
              variant: "destructive"
            });
          }
        },
        onDataChannelOpen: () => {
          setIsDataChannelOpen(true);
          toast({
            title: "✅ Channel Ready", 
            description: "Secure data channel established",
          });
        },
        onProgressUpdate: (progress, fileId) => {
          if (fileId) {
            setFileTransferProgress(prev => new Map(prev.set(fileId, progress)));
          }
          console.log('File transfer progress:', progress, fileId);
        },
        onWebSocketConnected: () => {
          setIsWebSocketConnected(true);
          toast({
            title: "🌐 WebSocket Connected",
            description: "Protocol switched successfully (101)",
          });
        },
        onWebSocketError: (error) => {
          setIsWebSocketConnected(false);
          toast({
            title: "🔌 Connection Error",
            description: "WebSocket connection failed",
            variant: "destructive"
          });
        },
        onReceiverJoined: () => {
          console.log('Receiver joined and ready');
          setReceiverConnected(true);
          toast({
            title: "👥 Receiver Joined",
            description: "Another device connected to your room",
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize sender:', error);
      toast({
        title: "❌ Initialization Failed",
        description: "Could not initialize WebRTC connection",
        variant: "destructive"
      });
    }
  }, []);

  const initializeAsReceiver = useCallback(async (connectionCode: string) => {
    webrtcService.current = new WebRTCService();
    
    try {
      await webrtcService.current.connectAsReceiver(connectionCode, {
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          if (state === 'connected') {
            toast({
              title: "🔗 Connected to Sender",
              description: "Ready to receive files securely",
            });
          } else if (state === 'failed') {
            toast({
              title: "❌ Connection Failed",
              description: "Unable to connect to sender",
              variant: "destructive"
            });
          }
        },
        onDataChannelOpen: () => {
          setIsDataChannelOpen(true);
          toast({
            title: "✅ Ready to Receive",
            description: "Secure channel established",
          });
        },
        onFileReceived: (file) => {
          console.log('File received:', file);
          
          // Create download link for received file
          const blob = new Blob([file.data], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "📁 File Received",
            description: `${file.name} downloaded successfully`,
          });
        },
        onProgressUpdate: (progress, fileId) => {
          if (fileId) {
            setFileTransferProgress(prev => new Map(prev.set(fileId, progress)));
            
            // Try to get file info from the service if available (first time)
            if (progress === 1 && webrtcService.current) {
              // Access the file transfer info from the service
              const fileTransfers = (webrtcService.current as any).fileTransfers;
              if (fileTransfers && fileTransfers.has(fileId)) {
                const fileInfo = fileTransfers.get(fileId);
                setFileInfoMap(prev => new Map(prev.set(fileId, { 
                  name: fileInfo.name, 
                  size: fileInfo.size 
                })));
              }
            }
          }
          console.log('File receive progress:', progress, fileId);
        },
        onWebSocketConnected: () => {
          setIsWebSocketConnected(true);
          toast({
            title: "🌐 WebSocket Connected",
            description: "Protocol switched successfully (101)",
          });
        },
        onWebSocketError: (error) => {
          setIsWebSocketConnected(false);
          toast({
            title: "🔌 Connection Error",
            description: "WebSocket connection failed",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize receiver:', error);
      toast({
        title: "❌ Initialization Failed",
        description: "Could not initialize WebRTC connection",
        variant: "destructive"
      });
    }
  }, []);

  const sendFile = useCallback((file: File): string => {
    if (webrtcService.current && isDataChannelOpen) {
      const webrtcFileId = webrtcService.current.sendFile(file);
      toast({
        title: "📤 Sending File",
        description: `Starting transfer of ${file.name}`,
      });
      return webrtcFileId;
    } else {
      toast({
        title: "❌ Cannot Send File",
        description: "Data channel not ready",
        variant: "destructive"
      });
      return '';
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
    setFileTransferProgress(new Map());
    
    toast({
      title: "🔌 Disconnected",
      description: "Connection closed",
    });
  }, []);

  return {
    connectionState,
    isDataChannelOpen,
    isWebSocketConnected,
    fileTransferProgress,
    fileInfoMap,
    peerConnected,
    receiverConnected,
    initializeAsSender,
    initializeAsReceiver,
    sendFile,
    disconnect
  };
};
