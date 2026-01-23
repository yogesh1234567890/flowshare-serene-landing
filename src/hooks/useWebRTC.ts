import { useState, useCallback, useRef } from 'react';
import { WebRTCService, FileTransferInfo } from '@/services/webrtcService';
import { toast } from '@/hooks/use-toast';

export const useWebRTC = () => {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isDataChannelOpen, setIsDataChannelOpen] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [fileTransferProgress, setFileTransferProgress] = useState<Map<string, number>>(new Map());
  const [fileInfoMap, setFileInfoMap] = useState<Map<string, { name: string; size: number }>>(new Map());
  const [peerConnected, setPeerConnected] = useState(false);
  const [receiverConnected, setReceiverConnected] = useState(false);
  const [incomingFile, setIncomingFile] = useState<FileTransferInfo | null>(null);
  const webrtcService = useRef<WebRTCService | null>(null);

  const initializeAsSender = useCallback((roomId: string) => {
    webrtcService.current = new WebRTCService();
    
    webrtcService.current.connectAsSender(roomId, {
      onConnectionStateChange: (state) => {
        setConnectionState(state);
        setPeerConnected(state === 'connected');
        // Connection status is shown in ConnectionStatusDisplay component
        // Only show toast for critical failures
        if (state === 'failed') {
          toast({
            title: "Connection Failed",
            description: "Unable to establish peer connection. Please try again.",
            variant: "destructive"
          });
        }
      },
      onDataChannelOpen: () => {
        setIsDataChannelOpen(true);
      },
      onProgressUpdate: (progress, fileId) => {
        if (fileId) {
          setFileTransferProgress(prev => new Map(prev.set(fileId, progress)));
        }
        console.log('File transfer progress:', progress, fileId);
      },
      onTransferError: (fileId, error) => {
          console.error(`Transfer error for ${fileId}: ${error}`);
          if (fileId) {
              setFileInfoMap(prev => {
                  const info = prev.get(fileId);
                  if (info) {
                      return new Map(prev.set(fileId, { ...info, status: 'error' } as any));
                  }
                  return prev;
              });
              setFileTransferProgress(prev => new Map(prev.set(fileId, 0))); // Reset or signal error via progress?
          }
          toast({
              title: "❌ Transfer Error",
              description: error,
              variant: "destructive"
          });
      },
      onWebSocketConnected: () => {
        setIsWebSocketConnected(true);
      },
      onWebSocketError: () => {
        setIsWebSocketConnected(false);
        // WebSocket status is shown in ConnectionStatusDisplay
        // Only show toast for persistent failures
      },
      onReceiverJoined: () => {
        console.log('Receiver joined and ready');
        setReceiverConnected(true);
        // Receiver status is shown in ConnectionStatusDisplay
        // No toast needed - UI already shows connection status
        webrtcService.current?.createOffer();
      }
    });

    // Create offer after a short delay to ensure WebSocket is ready
    setTimeout(() => {
      webrtcService.current?.createOffer();
    }, 1500);
  }, []);

  const initializeAsReceiver = useCallback((connectionCode: string) => {
    webrtcService.current = new WebRTCService();
    
    webrtcService.current.connectAsReceiver(connectionCode, {
      onConnectionStateChange: (state) => {
        setConnectionState(state);
        // Connection status is shown in ConnectionStatusDisplay component
        // Only show toast for critical failures
        if (state === 'failed') {
          toast({
            title: "Connection Failed",
            description: "Unable to connect to sender. Please check the connection code.",
            variant: "destructive"
          });
        }
      },
      onDataChannelOpen: () => {
        setIsDataChannelOpen(true);
      },
      onIncomingFile: (fileInfo) => {
        console.log('Incoming file offer:', fileInfo);
        setIncomingFile(fileInfo);
        // Incoming file notification is handled by AlertDialog
        // No toast needed - dialog provides better UX
      },
      onFileReceived: (file) => {
        console.log('File received:', file);
        setIncomingFile(null); // Clear incoming state
        
        // If data is null/empty blob (streamed to disk), we just notify
        // If data is populated (memory), we trigger download
        
        if ((file.data instanceof ArrayBuffer && file.data.byteLength === 0) || (file.data instanceof Blob && file.data.size === 0)) {
             // File saved - shown in download progress UI
            // Only show toast for errors
            return;
        }

        // Create download link for received file (Fallback mode)
        const blob = file.data instanceof Blob ? file.data : new Blob([file.data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // File received - shown in download progress UI
        // Success is indicated by progress bar completion
      },
      onProgressUpdate: (progress, fileId) => {
        if (fileId) {
          setFileTransferProgress(prev => new Map(prev.set(fileId, progress)));
        }
      },
      onWebSocketConnected: () => {
        setIsWebSocketConnected(true);
      },
      onWebSocketError: () => {
        setIsWebSocketConnected(false);
        toast({
          title: "🔌 Connection Error",
          description: "WebSocket connection failed",
          variant: "destructive"
        });
      }
    });
  }, []);

  const acceptIncomingFile = useCallback(async () => {
    if (!incomingFile || !webrtcService.current) return;

    let fileStream: any = undefined;

    // Try File System Access API
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: incomingFile.name,
        });
        fileStream = await handle.createWritable();
        // Saving status shown in download progress UI
      } catch (err) {
        console.warn('File picker cancelled or failed:', err);
        if ((err as Error).name === 'AbortError') {
             return;
        }
      }
    } else {
       toast({
          title: "Large File Warning",
          description: "Files over 1GB may cause performance issues. Consider using smaller files.",
          variant: "destructive",
          duration: 5000
        });
    }

    webrtcService.current.acceptFileTransfer(incomingFile.id, fileStream);
    setIncomingFile(null); // Clear prompt
  }, [incomingFile]);

  // Helper for formatting bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const sendFile = useCallback(async (file: File): Promise<string> => {
    if (webrtcService.current && isDataChannelOpen) {
      const webrtcFileId = await webrtcService.current.sendFile(file);
      // Sending status shown in file list progress bars
      return webrtcFileId;
    } else {
      toast({
        title: "Cannot Send File",
        description: "Connection not ready. Please wait for receiver to connect.",
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
    
    // Disconnection status shown in ConnectionStatusDisplay
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
    disconnect,
    incomingFile,
    acceptIncomingFile
  };
};
