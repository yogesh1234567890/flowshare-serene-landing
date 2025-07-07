export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'connection-code' | 'file-info' | 'file-chunk' | 'file-complete' | 'receiver-joined' | 'receiver-ready';
  data: any;
  roomId: string;
}

export interface FileTransferInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  chunks: number;
}

export interface FileChunk {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  data: ArrayBuffer;
}

export class WebRTCService {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private roomId: string = '';
  private isSender: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  // File transfer state
  private receivedChunks: Map<string, ArrayBuffer[]> = new Map();
  private fileTransfers: Map<string, FileTransferInfo> = new Map();
  
  private onConnectionStateChange?: (state: string) => void;
  private onDataChannelOpen?: () => void;
  private onFileReceived?: (file: { name: string; size: number; data: ArrayBuffer }) => void;
  private onProgressUpdate?: (progress: number, fileId?: string) => void;
  private onWebSocketConnected?: () => void;
  private onWebSocketError?: (error: Event) => void;
  private onReceiverJoined?: () => void;

  constructor() {
    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    // Enhanced ICE server configuration with public STUN/TURN servers
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Public TURN servers (you might want to replace with your own)
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    };

    this.pc = new RTCPeerConnection(configuration);

    // Enhanced ICE candidate handling
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        console.log('Sending ICE candidate:', event.candidate.type);
        this.sendMessage({
          type: 'ice-candidate',
          data: event.candidate,
          roomId: this.roomId
        });
      }
    };

    // Connection state monitoring
    this.pc.onconnectionstatechange = () => {
      if (this.pc && this.onConnectionStateChange) {
        console.log('WebRTC connection state:', this.pc.connectionState);
        this.onConnectionStateChange(this.pc.connectionState);
        
        // Handle connection failures
        if (this.pc.connectionState === 'failed') {
          console.log('WebRTC connection failed, attempting to restart ICE');
          this.pc.restartIce();
        }
      }
    };

    // ICE connection state monitoring
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc) {
        console.log('ICE connection state:', this.pc.iceConnectionState);
      }
    };

    // Data channel handling for receiver
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      console.log('Received data channel:', channel.label);
      this.setupDataChannel(channel);
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('Data channel opened:', channel.label);
      if (this.onDataChannelOpen) {
        this.onDataChannelOpen();
      }
      
      // Send receiver ready confirmation
      if (!this.isSender) {
        console.log('Receiver data channel ready, sending confirmation');
        this.sendMessage({
          type: 'receiver-ready',
          data: { ready: true, timestamp: Date.now() },
          roomId: this.roomId
        });
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleDataChannelMessage(message);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }

  private handleDataChannelMessage(message: any) {
    console.log('Data channel message received:', message.type);
    switch (message.type) {
      case 'file-info':
        this.handleFileInfo(message.data);
        break;
      case 'file-chunk':
        this.handleFileChunk(message.data);
        break;
      case 'file-complete':
        this.handleFileComplete(message.data);
        break;
    }
  }

  private handleFileInfo(fileInfo: FileTransferInfo) {
    console.log('Receiving file info:', fileInfo);
    this.fileTransfers.set(fileInfo.id, fileInfo);
    this.receivedChunks.set(fileInfo.id, new Array(fileInfo.chunks));
    
    // Immediately trigger progress update to show file transfer started
    if (this.onProgressUpdate) {
      this.onProgressUpdate(1, fileInfo.id); // Start with 1% to indicate transfer began
    }
  }

  private handleFileChunk(chunk: { fileId: string; chunkIndex: number; totalChunks: number; data: number[] }) {
    const fileId = chunk.fileId;
    const chunks = this.receivedChunks.get(fileId);
    
    if (!chunks) {
      console.error('Received chunk for unknown file:', fileId);
      return;
    }

    // Convert number array back to ArrayBuffer
    const arrayBuffer = new Uint8Array(chunk.data).buffer;
    chunks[chunk.chunkIndex] = arrayBuffer;

    // Calculate progress
    const receivedChunks = chunks.filter(c => c !== undefined).length;
    const progress = Math.max(1, (receivedChunks / chunk.totalChunks) * 100);
    
    console.log(`File ${fileId} progress: ${progress.toFixed(1)}% (${receivedChunks}/${chunk.totalChunks})`);
    
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress, fileId);
    }

    // Check if all chunks received
    if (receivedChunks === chunk.totalChunks) {
      this.assembleFile(fileId);
    }
  }

  private handleFileComplete(data: { fileId: string }) {
    console.log('File transfer complete:', data.fileId);
  }

  private assembleFile(fileId: string) {
    const chunks = this.receivedChunks.get(fileId);
    const fileInfo = this.fileTransfers.get(fileId);
    
    if (!chunks || !fileInfo) {
      console.error('Cannot assemble file, missing data');
      return;
    }

    // Combine all chunks
    const totalSize = chunks.reduce((size, chunk) => size + chunk.byteLength, 0);
    const combinedBuffer = new ArrayBuffer(totalSize);
    const combinedView = new Uint8Array(combinedBuffer);
    
    let offset = 0;
    for (const chunk of chunks) {
      if (chunk) {
        combinedView.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
    }

    console.log('File assembled successfully:', fileInfo.name);
    
    if (this.onFileReceived) {
      this.onFileReceived({
        name: fileInfo.name,
        size: fileInfo.size,
        data: combinedBuffer
      });
    }

    // Cleanup
    this.receivedChunks.delete(fileId);
    this.fileTransfers.delete(fileId);
  }

  connectAsReceiver(connectionCode: string, callbacks: {
    onConnectionStateChange: (state: string) => void;
    onDataChannelOpen: () => void;
    onFileReceived: (file: { name: string; size: number; data: ArrayBuffer }) => void;
    onProgressUpdate?: (progress: number, fileId?: string) => void;
    onWebSocketConnected?: () => void;
    onWebSocketError?: (error: Event) => void;
  }) {
    this.roomId = connectionCode;
    this.isSender = false;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onDataChannelOpen = callbacks.onDataChannelOpen;
    this.onFileReceived = callbacks.onFileReceived;
    this.onProgressUpdate = callbacks.onProgressUpdate;
    this.onWebSocketConnected = callbacks.onWebSocketConnected;
    this.onWebSocketError = callbacks.onWebSocketError;

    this.connectWebSocket();
  }

  connectAsSender(connectionCode: string, callbacks: {
    onConnectionStateChange: (state: string) => void;
    onDataChannelOpen: () => void;
    onProgressUpdate: (progress: number, fileId?: string) => void;
    onWebSocketConnected?: () => void;
    onWebSocketError?: (error: Event) => void;
    onReceiverJoined?: () => void;
  }) {
    this.roomId = connectionCode;
    this.isSender = true;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onDataChannelOpen = callbacks.onDataChannelOpen;
    this.onProgressUpdate = callbacks.onProgressUpdate;
    this.onWebSocketConnected = callbacks.onWebSocketConnected;
    this.onWebSocketError = callbacks.onWebSocketError;
    this.onReceiverJoined = callbacks.onReceiverJoined;

    // Create data channel for sender with enhanced configuration
    if (this.pc) {
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 3
      });
      this.setupDataChannel(this.dataChannel);
    }

    this.connectWebSocket();
  }

  private connectWebSocket() {
    try {
      this.ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/${this.roomId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected to room:', this.roomId);
        console.log('Protocol switch successful (101 Switching Protocols)');
        this.reconnectAttempts = 0;
        
        if (this.onWebSocketConnected) {
          this.onWebSocketConnected();
        }

        // Send receiver joined notification if this is a receiver
        if (!this.isSender) {
          console.log('Receiver joined room, sending notification');
          this.sendMessage({
            type: 'receiver-joined',
            data: { joined: true, timestamp: Date.now() },
            roomId: this.roomId
          });
        }
      };

      this.ws.onmessage = async (event) => {
        try {
          const message: WebRTCMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message.type);
          await this.handleMessage(message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnection();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onWebSocketError) {
          this.onWebSocketError(error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (this.onWebSocketError) {
        this.onWebSocketError(error as Event);
      }
    }
  }

  private attemptReconnection() {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  private async handleMessage(message: WebRTCMessage) {
    if (!this.pc) return;

    try {
      switch (message.type) {
        case 'offer':
          console.log('Received offer, creating answer...');
          await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          this.sendMessage({
            type: 'answer',
            data: answer,
            roomId: this.roomId
          });
          break;

        case 'answer':
          console.log('Received answer, setting remote description...');
          await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
          break;

        case 'ice-candidate':
          console.log('Received ICE candidate...');
          await this.pc.addIceCandidate(new RTCIceCandidate(message.data));
          break;

        case 'receiver-joined':
          if (this.isSender) {
            console.log('Receiver joined the room');
            if (this.onReceiverJoined) {
              this.onReceiverJoined();
            }
          }
          break;

        case 'receiver-ready':
          if (this.isSender) {
            console.log('Receiver is ready for file transfer');
            if (this.onReceiverJoined) {
              this.onReceiverJoined();
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebRTC message:', error);
    }
  }

  async createOffer() {
    if (!this.pc) return;

    try {
      console.log('Creating offer...');
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      console.log('Offer created and local description set');
      this.sendMessage({
        type: 'offer',
        data: offer,
        roomId: this.roomId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  sendFile(file: File) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not ready for file transfer');
      return;
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chunkSize = 16384; // 16KB chunks for better reliability
    const totalChunks = Math.ceil(file.size / chunkSize);

    console.log(`Starting file transfer: ${file.name} (${file.size} bytes, ${totalChunks} chunks)`);

    // Send file info first
    const fileInfo: FileTransferInfo = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      chunks: totalChunks
    };

    console.log('Sending file info:', fileInfo);
    this.dataChannel.send(JSON.stringify({
      type: 'file-info',
      data: fileInfo
    }));

    // Small delay to ensure file info is processed before chunks
    setTimeout(() => {
      this.sendFileChunks(file, fileId, chunkSize, totalChunks);
    }, 100);
  }

  private sendFileChunks(file: File, fileId: string, chunkSize: number, totalChunks: number) {
    let chunkIndex = 0;
    
    const sendNextChunk = () => {
      if (chunkIndex >= totalChunks) {
        // File transfer complete
        console.log('All chunks sent, sending completion signal');
        this.dataChannel!.send(JSON.stringify({
          type: 'file-complete',
          data: { fileId }
        }));
        console.log('File transfer completed:', file.name);
        return;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const reader = new FileReader();
      reader.onload = () => {
        if (this.dataChannel && reader.result) {
          const chunkData = {
            type: 'file-chunk',
            data: {
              fileId,
              chunkIndex,
              totalChunks,
              data: Array.from(new Uint8Array(reader.result as ArrayBuffer))
            }
          };

          console.log(`Sending chunk ${chunkIndex + 1}/${totalChunks} for ${file.name}`);
          this.dataChannel.send(JSON.stringify(chunkData));
          
          // Update progress
          const progress = ((chunkIndex + 1) / totalChunks) * 100;
          if (this.onProgressUpdate) {
            this.onProgressUpdate(progress, fileId);
          }

          chunkIndex++;
          
          // Use setTimeout to prevent blocking the main thread
          setTimeout(sendNextChunk, 50); // Slightly longer delay for stability
        }
      };

      reader.onerror = () => {
        console.error('Error reading file chunk');
      };

      reader.readAsArrayBuffer(chunk);
    };

    sendNextChunk();
  }

  private sendMessage(message: WebRTCMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message.type);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message.type);
    }
  }

  disconnect() {
    console.log('Disconnecting WebRTC service');
    
    // Clear reconnection timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }

    // Clear file transfer state
    this.receivedChunks.clear();
    this.fileTransfers.clear();
    
    this.reconnectAttempts = 0;
  }
}
