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

  private handleBinaryChunk(data: ArrayBuffer) {
    const headerView = new DataView(data, 0, 12);
    const fileId = headerView.getUint32(0).toString();
    const chunkIndex = headerView.getUint16(4);
    const totalChunks = headerView.getUint16(6);
    const payloadSize = headerView.getUint32(8);

    const chunkData = data.slice(12, 12 + payloadSize);
    const chunks = this.receivedChunks.get(fileId);

    if (!chunks) {
      console.error('Unknown fileId:', fileId);
      return;
    }

    chunks[chunkIndex] = chunkData;

    const received = chunks.filter(c => c).length;
    let receivedBytes = 0;
    
    // Calculate actual bytes received for accurate progress
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i]) {
        receivedBytes += chunks[i].byteLength;
      }
    }
    
    const fileInfo = this.fileTransfers.get(fileId);
    const progress = fileInfo ? Math.min(99.5, (receivedBytes / fileInfo.size) * 100) : (received / totalChunks) * 100;
    
    console.log(`Binary chunk ${chunkIndex}/${totalChunks} received for ${fileId} (${progress.toFixed(1)}%)`);
    
    if (this.onProgressUpdate) this.onProgressUpdate(progress, fileId);

    if (received === totalChunks) {
      console.log('All binary chunks received, assembling file...');
      this.assembleFile(fileId);
    }
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
    channel.binaryType = 'arraybuffer'; // 👈 Set binary mode

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          this.handleDataChannelMessage(message);
        } catch (error) {
          console.error('Error parsing JSON message:', error);
        }
      } else {
        this.handleBinaryChunk(event.data); // 👈 Handle binary chunks
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
    const fileInfo = this.fileTransfers.get(fileId);
    
    if (!chunks || !fileInfo) {
      console.error('Received chunk for unknown file:', fileId);
      return;
    }

    // Convert number array back to ArrayBuffer
    const arrayBuffer = new Uint8Array(chunk.data).buffer;
    chunks[chunk.chunkIndex] = arrayBuffer;

    // Calculate progress based on received bytes for accuracy
    const receivedChunks = chunks.filter(c => c !== undefined).length;
    let receivedBytes = 0;
    
    // Calculate actual bytes received
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i]) {
        receivedBytes += chunks[i].byteLength;
      }
    }
    
    const progress = Math.min(99, (receivedBytes / fileInfo.size) * 100); // Cap at 99% until file is complete
    
    console.log(`File ${fileId} progress: ${progress.toFixed(1)}% (${receivedChunks}/${chunk.totalChunks} chunks, ${(receivedBytes / 1024 / 1024).toFixed(1)}MB/${(fileInfo.size / 1024 / 1024).toFixed(1)}MB)`);
    
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
      console.error('Cannot assemble file, missing data for fileId:', fileId);
      return;
    }

    // Verify all chunks are present
    const missingChunks = chunks.findIndex(chunk => chunk === undefined);
    if (missingChunks !== -1) {
      console.error(`Missing chunk at index ${missingChunks}, cannot assemble file ${fileId}`);
      return;
    }

    console.log('Assembling file:', fileInfo.name, 'with', chunks.length, 'chunks');

    // Combine all chunks efficiently for large files
    const totalSize = chunks.reduce((size, chunk) => size + chunk.byteLength, 0);
    
    // Verify expected size
    if (Math.abs(totalSize - fileInfo.size) > 1024) { // Allow small variance for headers
      console.error(`Size mismatch for ${fileId}: expected ${fileInfo.size}, got ${totalSize}`);
    }

    const combinedBuffer = new ArrayBuffer(totalSize);
    const combinedView = new Uint8Array(combinedBuffer);
    
    let offset = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk) {
        combinedView.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
    }

    console.log('File assembled successfully:', fileInfo.name, `(${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
    
    // CRITICAL: Set progress to 100% BEFORE triggering file received
    if (this.onProgressUpdate) {
      this.onProgressUpdate(100, fileId);
    }
    
    // Trigger file download
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
    
    console.log('File transfer completed and cleaned up for:', fileId);
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

    // Create data channel for sender with enhanced configuration for large files
    if (this.pc) {
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 5
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
          if (this.pc.signalingState === 'have-local-offer') {
            console.log('Received answer, setting remote description...');
            await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
          } else {
            console.warn(
              'Skipping setRemoteDescription(answer).',
              'Expected state: have-local-offer, but current state is:',
              this.pc.signalingState
            );
          }
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

  sendFile(file: File): string {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not ready for file transfer');
      return '';
    }

    const fileId = Math.floor(Math.random() * 1000000000).toString();
    const chunkSize = 128 * 1024; // 1MB chunks for faster transfer
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

    this.dataChannel.send(JSON.stringify({ type: 'file-info', data: fileInfo }));

    let chunkIndex = 0;
    let sentBytes = 0;
    const readChunk = () => {
      if (chunkIndex >= totalChunks) {
        console.log('All chunks sent, sending completion signal...');
        this.dataChannel!.send(JSON.stringify({ type: 'file-complete', data: { fileId } }));
        // Final progress update to 100% for sender
        if (this.onProgressUpdate) {
          this.onProgressUpdate(100, fileId);
        }
        console.log('File transfer completed for sender:', fileId);
        return;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const slice = file.slice(start, end);
      const reader = new FileReader();

      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const payload = new Uint8Array(12 + buffer.byteLength);
        const header = new DataView(payload.buffer);
        header.setUint32(0, parseInt(fileId));      // fileId hash
        header.setUint16(4, chunkIndex);            // chunk index
        header.setUint16(6, totalChunks);           // total chunks
        header.setUint32(8, buffer.byteLength);     // payload size

        payload.set(new Uint8Array(buffer), 12);

        this.dataChannel!.send(payload.buffer);
        sentBytes += buffer.byteLength;
        chunkIndex++;

        // Update sender progress - don't cap at 95%
        const progress = (sentBytes / file.size) * 100;
        if (this.onProgressUpdate) {
          this.onProgressUpdate(progress, fileId);
        }
        if (this.dataChannel!.bufferedAmount < 2_000_000) { 
          const delay = file.size > 50 * 1024 * 1024 ? 2 : 5; 
          setTimeout(readChunk, delay);
        } else {
          this.dataChannel!.onbufferedamountlow = () => {
            this.dataChannel!.onbufferedamountlow = null;
            setTimeout(readChunk, 2);
          };
          this.dataChannel!.bufferedAmountLowThreshold = 512 * 1024; // 512KB threshold
        }
      };

      reader.readAsArrayBuffer(slice);
    };

    readChunk();
    return fileId;
  }


  private sendFileChunks(file: File, fileId: string, chunkSize: number, totalChunks: number) {
    let chunkIndex = 0;
    let sentBytes = 0;
    const startTime = Date.now();
    
    const sendNextChunk = () => {
      if (chunkIndex >= totalChunks) {
        // File transfer complete - only update progress to 100% when truly done
        console.log('All chunks sent, sending completion signal');
        this.dataChannel!.send(JSON.stringify({
          type: 'file-complete',
          data: { fileId }
        }));
        
        // Final progress update to 100%
        if (this.onProgressUpdate) {
          this.onProgressUpdate(100, fileId);
        }
        
        console.log('File transfer completed:', file.name);
        return;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const reader = new FileReader();
      reader.onload = () => {
        if (this.dataChannel && reader.result && this.dataChannel.readyState === 'open') {
          const chunkData = {
            type: 'file-chunk',
            data: {
              fileId,
              chunkIndex,
              totalChunks,
              data: Array.from(new Uint8Array(reader.result as ArrayBuffer))
            }
          };

          try {
            this.dataChannel.send(JSON.stringify(chunkData));
            sentBytes += chunk.size;
            
            console.log(`Sent chunk ${chunkIndex + 1}/${totalChunks} for ${file.name} (${((sentBytes / file.size) * 100).toFixed(1)}%)`);
            
            // More accurate progress calculation based on bytes sent
            const progress = Math.min(95, (sentBytes / file.size) * 100); // Cap at 95% until completion signal
            if (this.onProgressUpdate) {
              this.onProgressUpdate(progress, fileId);
            }

            chunkIndex++;
            
            // Adaptive delay based on file size - faster for large files with 1MB chunks
            const delay = file.size > 50 * 1024 * 1024 ? 5 : 15; // 5ms for files >50MB, 15ms otherwise
            setTimeout(sendNextChunk, delay);
          } catch (error) {
            console.error('Error sending chunk:', error);
            // Retry after a longer delay
            setTimeout(sendNextChunk, 100);
          }
        } else {
          console.error('Data channel not ready, retrying...');
          setTimeout(sendNextChunk, 100);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file chunk:', error);
        // Retry the same chunk
        setTimeout(sendNextChunk, 100);
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
