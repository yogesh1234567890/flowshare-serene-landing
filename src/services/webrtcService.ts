
export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'connection-code' | 'file-info' | 'file-chunk';
  data: any;
  roomId: string;
}

export class WebRTCService {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private roomId: string = '';
  private isSender: boolean = false;
  
  private onConnectionStateChange?: (state: string) => void;
  private onDataChannelOpen?: () => void;
  private onFileReceived?: (file: { name: string; size: number; data: ArrayBuffer }) => void;
  private onProgressUpdate?: (progress: number) => void;

  constructor() {
    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.pc = new RTCPeerConnection(configuration);

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.sendMessage({
          type: 'ice-candidate',
          data: event.candidate,
          roomId: this.roomId
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc && this.onConnectionStateChange) {
        this.onConnectionStateChange(this.pc.connectionState);
      }
    };

    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannel(channel);
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
      if (this.onDataChannelOpen) {
        this.onDataChannelOpen();
      }
    };

    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'file-info') {
          // Handle file info
          console.log('Receiving file:', message.data);
        } else if (message.type === 'file-chunk') {
          // Handle file chunk
          if (this.onFileReceived) {
            this.onFileReceived(message.data);
          }
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }

  connectAsReceiver(connectionCode: string, callbacks: {
    onConnectionStateChange: (state: string) => void;
    onDataChannelOpen: () => void;
    onFileReceived: (file: { name: string; size: number; data: ArrayBuffer }) => void;
  }) {
    this.roomId = connectionCode;
    this.isSender = false;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onDataChannelOpen = callbacks.onDataChannelOpen;
    this.onFileReceived = callbacks.onFileReceived;

    this.connectWebSocket();
  }

  connectAsSender(connectionCode: string, callbacks: {
    onConnectionStateChange: (state: string) => void;
    onDataChannelOpen: () => void;
    onProgressUpdate: (progress: number) => void;
  }) {
    this.roomId = connectionCode;
    this.isSender = true;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onDataChannelOpen = callbacks.onDataChannelOpen;
    this.onProgressUpdate = callbacks.onProgressUpdate;

    // Create data channel for sender
    if (this.pc) {
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true
      });
      this.setupDataChannel(this.dataChannel);
    }

    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.ws = new WebSocket(`ws://localhost:8000/ws/${this.roomId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected to room:', this.roomId);
    };

    this.ws.onmessage = async (event) => {
      try {
        const message: WebRTCMessage = JSON.parse(event.data);
        await this.handleMessage(message);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private async handleMessage(message: WebRTCMessage) {
    if (!this.pc) return;

    switch (message.type) {
      case 'offer':
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
        await this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
        break;

      case 'ice-candidate':
        await this.pc.addIceCandidate(new RTCIceCandidate(message.data));
        break;
    }
  }

  async createOffer() {
    if (!this.pc) return;

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.sendMessage({
      type: 'offer',
      data: offer,
      roomId: this.roomId
    });
  }

  sendFile(file: File) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not ready');
      return;
    }

    // Send file info first
    const fileInfo = {
      type: 'file-info',
      data: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

    this.dataChannel.send(JSON.stringify(fileInfo));

    // Send file in chunks
    const chunkSize = 16384; // 16KB chunks
    const reader = new FileReader();
    let offset = 0;

    const sendChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = () => {
      if (this.dataChannel && reader.result) {
        const chunk = {
          type: 'file-chunk',
          data: {
            chunk: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
            offset: offset,
            total: file.size
          }
        };

        this.dataChannel.send(JSON.stringify(chunk));
        offset += chunkSize;

        if (this.onProgressUpdate) {
          this.onProgressUpdate((offset / file.size) * 100);
        }

        if (offset < file.size) {
          sendChunk();
        }
      }
    };

    sendChunk();
  }

  private sendMessage(message: WebRTCMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.pc) {
      this.pc.close();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}
