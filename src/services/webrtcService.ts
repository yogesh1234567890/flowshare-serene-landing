export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'connection-code' | 'file-info' | 'file-chunk' | 'file-complete' | 'receiver-joined' | 'receiver-ready' | 'file-chunk-ack' | 'file-transfer-cancel';
  data: any;
  roomId: string;
}

export interface FileTransferInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  chunks: number;
  hash?: string;
}

export interface FileChunk {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  data: ArrayBuffer;
}

export enum WebRTCConnectionState {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Failed = 'failed',
  Closed = 'closed'
}

export enum FileTransferStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

interface WebRTCServiceCallbacks {
  onConnectionStateChange?: (state: WebRTCConnectionState) => void;
  onDataChannelOpen?: () => void;
  onFileReceived?: (file: { name: string; size: number; data: ArrayBuffer }) => void;
  onProgressUpdate?: (progress: number, fileId?: string) => void;
  onWebSocketConnected?: () => void;
  onWebSocketError?: (error: Event) => void;
  onReceiverJoined?: () => void;
  onTransferError?: (fileId: string, error: string) => void;
}

// Configuration interface for better type safety
interface WebRTCConfig {
  wsUrl?: string;
  chunkSize?: number;
  maxReconnectAttempts?: number;
  chunkAckTimeout?: number;
  maxChunkRetries?: number;
}

export class WebRTCService {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private roomId: string = '';
  private isSender: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // File transfer state
  private receivedChunks: Map<string, (ArrayBuffer | undefined)[]> = new Map();
  private fileTransfers: Map<string, FileTransferInfo & { status: FileTransferStatus; receivedBytes: number }> = new Map();
  private callbacks: WebRTCServiceCallbacks = {};

  // Sender state
  private sentChunksQueue: Map<string, { data: ArrayBuffer, sentTime: number, retries: number, chunkIndex: number }[]> = new Map();
  private chunkMonitorIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  // Configuration
  private config: Required<WebRTCConfig>;

  // State management
  private isDisconnecting: boolean = false;
  private dataChannelReady: boolean = false;
  private pendingReceiverJoined: boolean = false;
  private receiverJoined: boolean = false; // Track if receiver has joined
  private webrtcInitiated: boolean = false; // Track if WebRTC connection process has started

  constructor(config: WebRTCConfig = {}) {
    this.config = {
      wsUrl: config.wsUrl || import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
      chunkSize: config.chunkSize || 64 * 1024, // 64KB
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      chunkAckTimeout: config.chunkAckTimeout || 5000, // 5 seconds
      maxChunkRetries: config.maxChunkRetries || 3
    };
    
    this.setupPeerConnection();
  }

  // Public Connection Methods
  connectAsReceiver(connectionCode: string, callbacks: WebRTCServiceCallbacks): void {
    this.initializeConnection(connectionCode, false, callbacks);
    this.connectWebSocket();
  }

  connectAsSender(connectionCode: string, callbacks: WebRTCServiceCallbacks): void {
    this.initializeConnection(connectionCode, true, callbacks);
    
    // Don't create data channel or start WebRTC connection yet
    // Wait for receiver to join first
    console.log('Sender initialized, waiting for receiver to join...');
    
    this.connectWebSocket();
  }

  private initializeConnection(roomId: string, isSender: boolean, callbacks: WebRTCServiceCallbacks): void {
    this.disconnect();
    this.roomId = roomId;
    this.isSender = isSender;
    this.callbacks = { ...callbacks }; // Create a copy to avoid external modifications
    this.isDisconnecting = false;
    this.dataChannelReady = false;
    this.pendingReceiverJoined = false;
    this.receiverJoined = false;
    this.webrtcInitiated = false;
    this.setupPeerConnection();
  }

  // WebRTC Peer Connection Setup
  private setupPeerConnection(): void {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
      ],
      iceCandidatePoolSize: 10
    };

    this.pc = new RTCPeerConnection(configuration);

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws && this.ws.readyState === WebSocket.OPEN && !this.isDisconnecting && this.webrtcInitiated) {
        console.log('Sending ICE candidate:', event.candidate.type);
        this.sendMessage({
          type: 'ice-candidate',
          data: event.candidate,
          roomId: this.roomId
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (!this.pc) return;
      
      console.log('WebRTC connection state:', this.pc.connectionState);
      const stateMap: { [key: string]: WebRTCConnectionState } = {
        'new': WebRTCConnectionState.Connecting,
        'checking': WebRTCConnectionState.Connecting,
        'connected': WebRTCConnectionState.Connected,
        'completed': WebRTCConnectionState.Connected,
        'disconnected': WebRTCConnectionState.Disconnected,
        'failed': WebRTCConnectionState.Failed,
        'closed': WebRTCConnectionState.Closed,
      };
      
      const mappedState = stateMap[this.pc.connectionState] || WebRTCConnectionState.Disconnected;
      this.safeCallback('onConnectionStateChange', mappedState);

      if (this.pc.connectionState === 'failed' && !this.isDisconnecting) {
        console.warn('WebRTC connection failed, attempting to restart ICE...');
        this.pc.restartIce();
      } else if (this.pc.connectionState === 'disconnected' && !this.isDisconnecting) {
        console.warn('WebRTC connection disconnected. File transfers may be interrupted.');
        this.cleanupFileTransfers(FileTransferStatus.Failed, 'WebRTC connection disconnected.');
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      if (this.pc) {
        console.log('ICE connection state:', this.pc.iceConnectionState);
        
        // Set connection timeout for ICE
        if (this.pc.iceConnectionState === 'checking' && this.webrtcInitiated) {
          this.setConnectionTimeout();
        } else if (this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed') {
          this.clearConnectionTimeout();
        }
      }
    };

    this.pc.onsignalingstatechange = () => {
      if (this.pc) {
        console.log('WebRTC signaling state changed:', this.pc.signalingState);
      }
    };

    this.pc.ondatachannel = (event) => {
      console.log('Received data channel:', event.channel.label);
      this.setupDataChannel(event.channel);
    };
  }

  private setConnectionTimeout(): void {
    this.clearConnectionTimeout();
    this.connectionTimeout = setTimeout(() => {
      if (this.pc && this.pc.iceConnectionState === 'checking') {
        console.error('Connection timeout: ICE checking took too long');
        this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
      }
    }, 30000); // 30 second timeout
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  // Initialize WebRTC connection process - only called when receiver joins
  private initializeWebRTCConnection(): void {
    if (this.webrtcInitiated || !this.receiverJoined) {
      console.log('WebRTC already initiated or receiver not joined yet');
      return;
    }

    console.log('Initializing WebRTC connection process...');
    this.webrtcInitiated = true;

    if (this.isSender && this.pc) {
      // Create data channel for sender
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 5
      });
      this.setupDataChannel(this.dataChannel);

      // Start the offer creation process
      setTimeout(() => {
        this.createOfferWithRetry();
      }, 100); // Small delay to ensure everything is ready
    }
  }

  // Data Channel Setup
  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('Data channel opened:', channel.label);
      this.dataChannelReady = true;
      this.safeCallback('onDataChannelOpen');
      
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
      this.dataChannelReady = false;
      if (!this.isDisconnecting) {
        this.cleanupFileTransfers(FileTransferStatus.Failed, 'Data channel closed unexpectedly.');
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.dataChannelReady = false;
      if (!this.isDisconnecting) {
        this.cleanupFileTransfers(FileTransferStatus.Failed, `Data channel error: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    };

    channel.binaryType = 'arraybuffer';

    channel.onmessage = (event) => {
      try {
        if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          this.handleDataChannelMessage(message);
        } else {
          this.handleBinaryChunk(event.data);
        }
      } catch (error) {
        console.error('Error processing data channel message:', error);
      }
    };
  }

  // WebSocket Connection Management
  private connectWebSocket(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connecting or open. Skipping new connection attempt.');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      const wsUrl = `${this.config.wsUrl}/ws/${this.roomId}`;
      this.ws = new WebSocket(wsUrl);
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected to room:', this.roomId);
        this.reconnectAttempts = 0;
        this.safeCallback('onWebSocketConnected');
        
        if (!this.isSender) {
          console.log('Receiver joined room via WebSocket, sending notification');
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
          await this.handleSignalingMessage(message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.safeCallback('onWebSocketError', new ErrorEvent('WebSocketMessageError', { error: error as Error }));
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        this.cleanupWebSocket();

        if (!this.isDisconnecting && event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.attemptReconnection();
        } else if (!this.isDisconnecting && event.code !== 1000) {
          console.error('Max WebSocket reconnection attempts reached.');
          this.safeCallback('onWebSocketError', new ErrorEvent('WebSocketMaxReconnectAttemptsReached'));
          this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.safeCallback('onWebSocketError', error);
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.safeCallback('onWebSocketError', error as Event);
      this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
    }
  }

  private attemptReconnection(): void {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);
    this.reconnectTimeout = setTimeout(() => this.connectWebSocket(), delay);
  }

  // Enhanced offer creation with retry mechanism
  private async waitForStableState(timeout: number = 5000): Promise<boolean> {
    if (!this.pc) return false;
    
    if (this.pc.signalingState === 'stable') {
      return true;
    }
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Timeout waiting for stable signaling state');
        resolve(false);
      }, timeout);
      
      const checkState = () => {
        if (this.pc && this.pc.signalingState === 'stable') {
          clearTimeout(timeoutId);
          resolve(true);
        } else if (this.pc && !this.isDisconnecting) {
          // Check again in next tick
          setTimeout(checkState, 50);
        } else {
          clearTimeout(timeoutId);
          resolve(false);
        }
      };
      
      checkState();
    });
  }

  private async createOfferWithRetry(maxRetries: number = 3, initialDelay: number = 100): Promise<void> {
    console.log(`Starting offer creation with retry mechanism (max ${maxRetries} attempts)`);
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Offer creation attempt ${attempt + 1}/${maxRetries}`);
        console.log(`Current state - PC exists: ${!!this.pc}, isSender: ${this.isSender}, signalingState: ${this.pc?.signalingState}, receiverJoined: ${this.receiverJoined}, webrtcInitiated: ${this.webrtcInitiated}`);
        
        if (!this.pc) {
          console.warn('PeerConnection not initialized');
          if (attempt === maxRetries - 1) {
            this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
          }
          continue;
        }
        
        if (!this.isSender) {
          console.warn('Not in sender mode');
          return; // Not an error, just not applicable
        }

        if (!this.receiverJoined) {
          console.warn('Receiver has not joined yet');
          return;
        }
        
        if (this.isDisconnecting) {
          console.log('Connection is disconnecting, aborting offer creation');
          return;
        }

        // Wait for stable state with timeout
        const isStable = await this.waitForStableState(3000);
        if (!isStable) {
          console.warn(`Signaling state not stable on attempt ${attempt + 1}`);
          if (attempt < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            console.error('Failed to achieve stable state after all attempts');
            this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
            return;
          }
        }

        // Create and send offer
        console.log('Creating offer...');
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        
        this.sendMessage({
          type: 'offer',
          data: offer,
          roomId: this.roomId
        });
        
        console.log('Offer created and sent successfully');
        return; // Success
        
      } catch (error) {
        console.error(`Error on offer creation attempt ${attempt + 1}:`, error);
        
        if (attempt === maxRetries - 1) {
          console.error('All offer creation attempts failed');
          this.safeCallback('onConnectionStateChange', WebRTCConnectionState.Failed);
        } else {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  // Signaling Message Handling
  private async handleSignalingMessage(message: WebRTCMessage): Promise<void> {
    if (this.isDisconnecting) {
      console.warn('Disconnecting, ignoring signaling message:', message.type);
      return;
    }

    try {
      switch (message.type) {
        case 'offer':
          if (!this.isSender && this.pc) {
            console.log('Received offer, setting remote description and creating answer...');
            await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.sendMessage({ type: 'answer', data: answer, roomId: this.roomId });
          }
          break;

        case 'answer':
          if (this.isSender && this.pc && this.pc.signalingState === 'have-local-offer') {
            console.log('Received answer, setting remote description...');
            await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
          }
          break;

        case 'ice-candidate':
          if (message.data && this.pc && this.webrtcInitiated) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(message.data));
            } catch (e) {
              console.warn('Error adding ICE candidate:', e);
            }
          }
          break;

        case 'receiver-joined':
          if (this.isSender) {
            console.log('Receiver joined the room via signaling.');
            this.receiverJoined = true;
            this.safeCallback('onReceiverJoined');
            
            // Now initialize the WebRTC connection process
            this.initializeWebRTCConnection();
          }
          break;

        case 'receiver-ready':
          if (this.isSender) {
            console.log('Receiver is ready for file transfer.');
            this.safeCallback('onReceiverJoined');
          }
          break;
        
        case 'file-chunk-ack':
          if (this.isSender) {
            this.handleChunkAck(message.data.fileId, message.data.chunkIndex);
          }
          break;

        case 'file-transfer-cancel':
          this.handleTransferCancellation(message.data.fileId);
          break;
      }
    } catch (error) {
      console.error('Error processing WebRTC signaling message:', message.type, error);
    }
  }

  async createOffer(): Promise<void> {
    console.log('Direct createOffer called - delegating to retry mechanism');
    if (this.receiverJoined) {
      await this.createOfferWithRetry();
    } else {
      console.log('Cannot create offer: receiver has not joined yet');
    }
  }

  // Data Channel Message Handling
  private handleDataChannelMessage(message: WebRTCMessage): void {
    switch (message.type) {
      case 'file-info':
        this.handleFileInfo(message.data);
        break;
      case 'file-complete':
        this.handleFileComplete(message.data);
        break;
      case 'file-transfer-cancel':
        this.handleTransferCancellation(message.data.fileId);
        break;
      case 'file-chunk-ack':
        if (this.isSender) {
          this.handleChunkAck(message.data.fileId, message.data.chunkIndex);
        }
        break;
    }
  }

  private handleFileInfo(fileInfo: FileTransferInfo): void {
    console.log('Receiver: Receiving file info:', fileInfo);
    
    // Validate file info
    if (!fileInfo.id || !fileInfo.name || fileInfo.size <= 0 || fileInfo.chunks <= 0) {
      console.error('Invalid file info received:', fileInfo);
      return;
    }

    if (this.fileTransfers.has(fileInfo.id)) {
      console.warn(`File info for ${fileInfo.id} already exists. Overwriting.`);
    }

    this.fileTransfers.set(fileInfo.id, { 
      ...fileInfo, 
      status: FileTransferStatus.InProgress, 
      receivedBytes: 0 
    });
    this.receivedChunks.set(fileInfo.id, new Array(fileInfo.chunks));
    
    this.safeCallback('onProgressUpdate', 0, fileInfo.id);
  }

  private handleBinaryChunk(data: ArrayBuffer): void {
    if (data.byteLength < 12) {
      console.error('Received malformed binary chunk: too short for header.');
      return;
    }

    const headerView = new DataView(data, 0, 12);
    const fileIdHash = headerView.getUint32(0);
    const chunkIndex = headerView.getUint16(4);
    const totalChunks = headerView.getUint16(6);
    const payloadSize = headerView.getUint32(8);

    if (12 + payloadSize > data.byteLength) {
      console.error('Chunk payload size exceeds available data');
      return;
    }

    const chunkData = data.slice(12, 12 + payloadSize);

    // Find fileId by hash
    let fileId: string | undefined;
    for (const [id] of this.fileTransfers.entries()) {
      if (this.simpleHash(id) === fileIdHash) {
        fileId = id;
        break;
      }
    }

    if (!fileId) {
      console.warn(`Received chunk for unknown file hash: ${fileIdHash}`);
      return;
    }

    const fileTransferState = this.fileTransfers.get(fileId);
    if (!fileTransferState || 
        fileTransferState.status === FileTransferStatus.Cancelled || 
        fileTransferState.status === FileTransferStatus.Completed || 
        fileTransferState.status === FileTransferStatus.Failed) {
      console.warn(`Received chunk for file ${fileId} with status ${fileTransferState?.status}`);
      return;
    }

    const chunks = this.receivedChunks.get(fileId);
    if (!chunks) {
      console.error('Missing chunk array for fileId:', fileId);
      this.safeCallback('onTransferError', fileId, 'Internal error: Missing chunk array.');
      this.cleanupTransferState(fileId);
      return;
    }

    if (chunkIndex < 0 || chunkIndex >= totalChunks || chunkIndex >= chunks.length) {
      console.error(`Invalid chunk index ${chunkIndex} for file ${fileId}`);
      this.safeCallback('onTransferError', fileId, `Invalid chunk index ${chunkIndex}.`);
      return;
    }

    if (chunks[chunkIndex] !== undefined) {
      console.warn(`Duplicate chunk received for ${fileId}, index ${chunkIndex}`);
    } else {
      chunks[chunkIndex] = chunkData;
      fileTransferState.receivedBytes += chunkData.byteLength;
    }
    
    this.sendChunkAck(fileId, chunkIndex);

    const receivedCount = chunks.filter(c => c !== undefined).length;
    const progress = Math.min(99.5, (fileTransferState.receivedBytes / fileTransferState.size) * 100);

    this.safeCallback('onProgressUpdate', progress, fileId);

    if (receivedCount === totalChunks) {
      console.log('All binary chunks received, assembling file...');
      this.assembleFile(fileId);
    }
  }

  private sendChunkAck(fileId: string, chunkIndex: number): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify({
          type: 'file-chunk-ack',
          data: { fileId, chunkIndex }
        }));
      } catch (e) {
        console.error('Failed to send chunk ACK:', e);
      }
    }
  }

  private handleChunkAck(fileId: string, chunkIndex: number): void {
    const fileQueue = this.sentChunksQueue.get(fileId);
    if (!fileQueue) return;

    const chunkToRemove = fileQueue.findIndex(q => q.chunkIndex === chunkIndex);
    if (chunkToRemove !== -1) {
      fileQueue.splice(chunkToRemove, 1);
    }
  }

  private handleFileComplete(data: { fileId: string }): void {
    console.log('File transfer complete signal received:', data.fileId);
    const fileState = this.fileTransfers.get(data.fileId);
    if (fileState && fileState.status === FileTransferStatus.InProgress) {
      setTimeout(() => this.assembleFile(data.fileId), 100);
    }
  }

  private assembleFile(fileId: string): void {
    const chunks = this.receivedChunks.get(fileId);
    const fileInfo = this.fileTransfers.get(fileId);

    if (!chunks || !fileInfo) {
      console.error('Cannot assemble file, missing data for fileId:', fileId);
      this.safeCallback('onTransferError', fileId, 'File assembly failed: Missing internal data.');
      this.cleanupTransferState(fileId);
      return;
    }

    const receivedCount = chunks.filter(c => c !== undefined).length;
    if (receivedCount !== fileInfo.chunks) {
      const missingIndexes = chunks.map((c, i) => c === undefined ? i : -1).filter(i => i !== -1);
      console.error(`Missing ${fileInfo.chunks - receivedCount} chunks for ${fileId}. Missing: ${missingIndexes.join(',')}`);
      fileInfo.status = FileTransferStatus.Failed;
      this.safeCallback('onTransferError', fileId, `File assembly failed: Missing ${fileInfo.chunks - receivedCount} chunks.`);
      this.cleanupTransferState(fileId);
      return;
    }

    const totalSize = chunks.reduce((size, chunk) => size + (chunk?.byteLength || 0), 0);
    
    if (Math.abs(totalSize - fileInfo.size) > 1024) {
      console.warn(`Size mismatch for ${fileId}: expected ${fileInfo.size}, got ${totalSize}`);
    }

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
    
    fileInfo.status = FileTransferStatus.Completed;
    this.safeCallback('onProgressUpdate', 100, fileId);
    this.safeCallback('onFileReceived', {
      name: fileInfo.name,
      size: fileInfo.size,
      data: combinedBuffer
    });

    this.cleanupTransferState(fileId);
  }

  // Sender File Transfer Logic
  sendFile(file: File): string {
    if (!this.dataChannelReady || !this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not ready for file transfer');
      this.safeCallback('onTransferError', 'N/A', 'Data channel not open. Cannot send file.');
      return '';
    }

    // Validate file
    if (!file || file.size === 0) {
      console.error('Invalid file provided');
      this.safeCallback('onTransferError', 'N/A', 'Invalid file provided.');
      return '';
    }

    const fileId = this.generateFileId();
    const chunkSize = this.config.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);

    console.log(`Starting file transfer: ${file.name} (${file.size} bytes, ${totalChunks} chunks) with ID: ${fileId}`);

    const fileInfo: FileTransferInfo = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      chunks: totalChunks
    };

    this.fileTransfers.set(fileId, { 
      ...fileInfo, 
      status: FileTransferStatus.InProgress, 
      receivedBytes: 0 
    });
    this.sentChunksQueue.set(fileId, []);

    try {
      this.dataChannel.send(JSON.stringify({ type: 'file-info', data: fileInfo }));
    } catch (e) {
      console.error('Failed to send file-info:', e);
      this.safeCallback('onTransferError', fileId, 'Failed to send file info to receiver.');
      this.cleanupTransferState(fileId, FileTransferStatus.Failed);
      return '';
    }

    this.startFileSending(file, fileId, chunkSize, totalChunks);
    return fileId;
  }

  private generateFileId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  private async startFileSending(file: File, fileId: string, chunkSize: number, totalChunks: number): Promise<void> {
    let chunkIndex = 0;
    let sentBytes = 0;

    const sendNextChunk = async (): Promise<void> => {
      const fileState = this.fileTransfers.get(fileId);
      if (!fileState || fileState.status === FileTransferStatus.Cancelled) {
        console.log(`File transfer ${fileId} cancelled, stopping transmission.`);
        return;
      }

      if (chunkIndex >= totalChunks) {
        console.log(`All chunks for ${fileId} enqueued. Monitoring ACKs.`);
        this.monitorChunkAcks(fileId, file.size);
        return;
      }

      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        console.error('Data channel closed during chunk sending');
        this.safeCallback('onTransferError', fileId, 'Data channel closed during transfer.');
        this.cleanupTransferState(fileId, FileTransferStatus.Failed);
        return;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const slice = file.slice(start, end);

      try {
        const buffer = await this.readFileSlice(slice);
        const payload = this.createChunkPayload(fileId, chunkIndex, totalChunks, buffer);

        this.sentChunksQueue.get(fileId)?.push({ 
          data: payload, 
          sentTime: Date.now(), 
          retries: 0, 
          chunkIndex 
        });

        this.dataChannel.send(payload);
        sentBytes += buffer.byteLength;
        chunkIndex++;

        const progress = (sentBytes / file.size) * 100;
        this.safeCallback('onProgressUpdate', progress, fileId);

        // Flow control
        if (this.dataChannel.bufferedAmount < this.config.chunkSize * 2) {
          setTimeout(sendNextChunk, 0);
        } else {
          this.dataChannel.bufferedAmountLowThreshold = this.config.chunkSize * 2;
          this.dataChannel.onbufferedamountlow = () => {
            this.dataChannel!.onbufferedamountlow = null;
            setTimeout(sendNextChunk, 0);
          };
        }
      } catch (error) {
        console.error(`Error sending chunk ${chunkIndex}:`, error);
        this.safeCallback('onTransferError', fileId, `Failed to send chunk ${chunkIndex}.`);
        this.cleanupTransferState(fileId, FileTransferStatus.Failed);
      }
    };

    await sendNextChunk();
  }

  private readFileSlice(slice: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(slice);
    });
  }

  private createChunkPayload(fileId: string, chunkIndex: number, totalChunks: number, buffer: ArrayBuffer): ArrayBuffer {
    const payload = new Uint8Array(12 + buffer.byteLength);
    const header = new DataView(payload.buffer);
    
    header.setUint32(0, this.simpleHash(fileId));
    header.setUint16(4, chunkIndex);
    header.setUint16(6, totalChunks);
    header.setUint32(8, buffer.byteLength);
    
    payload.set(new Uint8Array(buffer), 12);
    return payload.buffer;
  }

  private monitorChunkAcks(fileId: string, totalFileSize: number): void {
    if (this.chunkMonitorIntervals.has(fileId)) {
      clearInterval(this.chunkMonitorIntervals.get(fileId)!);
    }

    const queue = this.sentChunksQueue.get(fileId);
    if (!queue) {
      console.warn(`No queue found for fileId ${fileId} to monitor ACKs.`);
      return;
    }

    const interval = setInterval(() => {
      const fileState = this.fileTransfers.get(fileId);
      if (!fileState || fileState.status === FileTransferStatus.Cancelled) {
        console.log(`Monitoring for ${fileId} stopped as transfer was cancelled.`);
        clearInterval(interval);
        this.chunkMonitorIntervals.delete(fileId);
        return;
      }

      const now = Date.now();
      const chunksToResend: ArrayBuffer[] = [];

      // Check for timed-out chunks
      for (let i = queue.length - 1; i >= 0; i--) {
        const chunkMeta = queue[i];
        if (now - chunkMeta.sentTime > this.config.chunkAckTimeout) {
          if (chunkMeta.retries < this.config.maxChunkRetries) {
            console.warn(`Chunk ${chunkMeta.chunkIndex} for ${fileId} timed out. Retry ${chunkMeta.retries + 1}/${this.config.maxChunkRetries}`);
            chunkMeta.retries++;
            chunkMeta.sentTime = now;
            chunksToResend.push(chunkMeta.data);
          } else {
            console.error(`Chunk ${chunkMeta.chunkIndex} for ${fileId} failed after ${this.config.maxChunkRetries} retries.`);
            clearInterval(interval);
            this.chunkMonitorIntervals.delete(fileId);
            this.safeCallback('onTransferError', fileId, `Chunk ${chunkMeta.chunkIndex} could not be delivered.`);
            this.cleanupTransferState(fileId, FileTransferStatus.Failed);
            return;
          }
        }
      }

      // Resend timed-out chunks
      for (const data of chunksToResend) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          try {
            this.dataChannel.send(data);
          } catch (e) {
            console.error('Error re-sending chunk:', e);
            this.safeCallback('onTransferError', fileId, 'Failed to re-send chunk.');
            this.cleanupTransferState(fileId, FileTransferStatus.Failed);
            clearInterval(interval);
            this.chunkMonitorIntervals.delete(fileId);
            return;
          }
        } else {
          console.warn('Data channel not open for re-sending chunks.');
          this.safeCallback('onTransferError', fileId, 'Data channel closed during retransmission.');
          this.cleanupTransferState(fileId, FileTransferStatus.Failed);
          clearInterval(interval);
          this.chunkMonitorIntervals.delete(fileId);
          return;
        }
      }

      // Check if all chunks are acknowledged
      if (queue.length === 0) {
        clearInterval(interval);
        this.chunkMonitorIntervals.delete(fileId);
        console.log(`All chunks for file ${fileId} acknowledged. Sending completion signal.`);
        
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          try {
            this.dataChannel.send(JSON.stringify({ type: 'file-complete', data: { fileId } }));
          } catch (e) {
            console.error('Failed to send file-complete signal:', e);
          }
        }
        
        const fileState = this.fileTransfers.get(fileId);
        if (fileState) {
          fileState.status = FileTransferStatus.Completed;
        }
        this.safeCallback('onProgressUpdate', 100, fileId);
        console.log('File transfer completed for:', fileId);
        this.cleanupTransferState(fileId);
      }
    }, 1000);
    
    this.chunkMonitorIntervals.set(fileId, interval);
  }

  // Cancellation
  cancelFileTransfer(fileId: string): void {
    console.log(`Cancelling file transfer: ${fileId}`);
    const fileState = this.fileTransfers.get(fileId);
    if (fileState && (fileState.status === FileTransferStatus.InProgress || fileState.status === FileTransferStatus.Pending)) {
      fileState.status = FileTransferStatus.Cancelled;
      this.safeCallback('onTransferError', fileId, 'Transfer cancelled by user.');
      
      // Notify peer
      this.sendMessage({ type: 'file-transfer-cancel', data: { fileId }, roomId: this.roomId });
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        try {
          this.dataChannel.send(JSON.stringify({ type: 'file-transfer-cancel', data: { fileId } }));
        } catch (e) {
          console.error('Failed to send cancellation signal:', e);
        }
      }
    }
    this.cleanupTransferState(fileId, FileTransferStatus.Cancelled);
  }

  private handleTransferCancellation(fileId: string): void {
    console.log(`Received cancellation signal for file: ${fileId}`);
    const fileState = this.fileTransfers.get(fileId);
    if (fileState && fileState.status !== FileTransferStatus.Completed && fileState.status !== FileTransferStatus.Failed) {
      fileState.status = FileTransferStatus.Cancelled;
      this.safeCallback('onTransferError', fileId, 'Transfer cancelled by peer.');
    }
    this.cleanupTransferState(fileId, FileTransferStatus.Cancelled);
  }

  // Utility & Cleanup
  private sendMessage(message: WebRTCMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isDisconnecting) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (e) {
        console.error('Failed to send WebSocket message:', e);
      }
    } else {
      console.warn('WebSocket not ready, message not sent:', message.type);
    }
  }

  private cleanupTransferState(fileId: string, status: FileTransferStatus = FileTransferStatus.Completed): void {
    console.log(`Cleaning up transfer state for fileId: ${fileId} with status: ${status}`);
    this.receivedChunks.delete(fileId);
    this.fileTransfers.delete(fileId);
    this.sentChunksQueue.delete(fileId);
    
    if (this.chunkMonitorIntervals.has(fileId)) {
      clearInterval(this.chunkMonitorIntervals.get(fileId)!);
      this.chunkMonitorIntervals.delete(fileId);
    }
  }
  
  private cleanupFileTransfers(status: FileTransferStatus, reason?: string): void {
    console.log(`Cleaning up all active file transfers due to ${status} state.`);
    this.fileTransfers.forEach((info, fileId) => {
      if (info.status === FileTransferStatus.InProgress || info.status === FileTransferStatus.Pending) {
        info.status = status;
        this.safeCallback('onTransferError', fileId, reason || `Transfer failed due to connection error.`);
        this.cleanupTransferState(fileId, status);
      }
    });
  }

  private cleanupWebSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Normal closure');
      }
      this.ws = null;
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private safeCallback<K extends keyof WebRTCServiceCallbacks>(
    callbackName: K,
    ...args: Parameters<NonNullable<WebRTCServiceCallbacks[K]>>
  ): void {
    try {
      const callback = this.callbacks[callbackName];
      if (callback) {
        (callback as any)(...args);
      }
    } catch (error) {
      console.error(`Error in callback ${callbackName}:`, error);
    }
  }

  // Public getters for state information
  getConnectionState(): WebRTCConnectionState {
    if (!this.pc) return WebRTCConnectionState.Closed;
    
    const stateMap: { [key: string]: WebRTCConnectionState } = {
      'new': WebRTCConnectionState.Connecting,
      'checking': WebRTCConnectionState.Connecting,
      'connected': WebRTCConnectionState.Connected,
      'completed': WebRTCConnectionState.Connected,
      'disconnected': WebRTCConnectionState.Disconnected,
      'failed': WebRTCConnectionState.Failed,
      'closed': WebRTCConnectionState.Closed,
    };
    
    return stateMap[this.pc.connectionState] || WebRTCConnectionState.Disconnected;
  }

  isDataChannelReady(): boolean {
    return this.dataChannelReady;
  }

  getActiveTransfers(): string[] {
    const activeTransfers: string[] = [];
    this.fileTransfers.forEach((info, fileId) => {
      if (info.status === FileTransferStatus.InProgress || info.status === FileTransferStatus.Pending) {
        activeTransfers.push(fileId);
      }
    });
    return activeTransfers;
  }

  getTransferStatus(fileId: string): FileTransferStatus | undefined {
    return this.fileTransfers.get(fileId)?.status;
  }

  isReceiverConnected(): boolean {
    return this.receiverJoined;
  }

  isWebRTCInitiated(): boolean {
    return this.webrtcInitiated;
  }

  disconnect(): void {
    console.log('Disconnecting WebRTC service: Cleaning up all resources.');
    this.isDisconnecting = true;
    
    // Clear timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.clearConnectionTimeout();

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    this.dataChannelReady = false;

    // Close peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.cleanupWebSocket();

    // Clear all file transfer states
    this.receivedChunks.clear();
    this.fileTransfers.clear();
    this.sentChunksQueue.clear();
    
    // Clear all intervals
    this.chunkMonitorIntervals.forEach(intervalId => clearInterval(intervalId));
    this.chunkMonitorIntervals.clear();

    this.reconnectAttempts = 0;
    this.callbacks = {};
    this.roomId = '';
    this.pendingReceiverJoined = false;
    this.receiverJoined = false;
    this.webrtcInitiated = false;
    this.isDisconnecting = false;
  }
}