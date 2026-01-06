/**
 * Google Tag Manager Service
 * Handles all GTM events and data layer pushes
 */

// GTM Container ID - Get from environment variable
export const GTM_ID = import.meta.env.VITE_GTM_ID || '';

// Initialize GTM (called after page load)
export const initGTM = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  
  // GTM is loaded via script in index.html, just ensure dataLayer is ready
  // The actual GTM script injection happens in index.html
};

// Push event to data layer
export const pushToDataLayer = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    return;
  }

  window.dataLayer.push({
    event: eventName,
    ...eventData
  });
};

// Page view tracking
export const trackPageView = (pagePath: string, pageTitle: string) => {
  pushToDataLayer('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href
  });
};

// File transfer events
export const trackFileSend = (fileInfo: {
  fileName: string;
  fileSize: number;
  fileType: string;
  isEncrypted?: boolean;
  chunkCount: number;
}) => {
  pushToDataLayer('file_send', {
    file_name: fileInfo.fileName,
    file_size: fileInfo.fileSize,
    file_type: fileInfo.fileType,
    is_encrypted: fileInfo.isEncrypted || false,
    chunk_count: fileInfo.chunkCount,
    file_size_mb: Math.round(fileInfo.fileSize / (1024 * 1024) * 100) / 100
  });
};

export const trackFileReceive = (fileInfo: {
  fileName: string;
  fileSize: number;
  fileType: string;
  isEncrypted?: boolean;
  transferTime?: number;
}) => {
  pushToDataLayer('file_receive', {
    file_name: fileInfo.fileName,
    file_size: fileInfo.fileSize,
    file_type: fileInfo.fileType,
    is_encrypted: fileInfo.isEncrypted || false,
    transfer_time_seconds: fileInfo.transferTime,
    file_size_mb: Math.round(fileInfo.fileSize / (1024 * 1024) * 100) / 100
  });
};

export const trackFileTransferComplete = (fileInfo: {
  fileName: string;
  fileSize: number;
  transferTime: number;
  isEncrypted?: boolean;
  success: boolean;
}) => {
  pushToDataLayer('file_transfer_complete', {
    file_name: fileInfo.fileName,
    file_size: fileInfo.fileSize,
    transfer_time_seconds: fileInfo.transferTime,
    is_encrypted: fileInfo.isEncrypted || false,
    success: fileInfo.success,
    transfer_speed_mbps: fileInfo.success 
      ? Math.round((fileInfo.fileSize / (1024 * 1024)) / (fileInfo.transferTime / 1000) * 100) / 100
      : 0,
    file_size_mb: Math.round(fileInfo.fileSize / (1024 * 1024) * 100) / 100
  });
};

// Connection events
export const trackConnectionEstablished = (connectionType: 'sender' | 'receiver') => {
  pushToDataLayer('connection_established', {
    connection_type: connectionType,
    timestamp: new Date().toISOString()
  });
};

export const trackConnectionFailed = (connectionType: 'sender' | 'receiver', error?: string) => {
  pushToDataLayer('connection_failed', {
    connection_type: connectionType,
    error_message: error,
    timestamp: new Date().toISOString()
  });
};

// Encryption events
export const trackEncryptionEnabled = () => {
  pushToDataLayer('encryption_enabled', {
    timestamp: new Date().toISOString()
  });
};

export const trackDecryptionSuccess = (fileId: string) => {
  pushToDataLayer('decryption_success', {
    file_id: fileId,
    timestamp: new Date().toISOString()
  });
};

export const trackDecryptionFailed = (fileId: string, reason?: string) => {
  pushToDataLayer('decryption_failed', {
    file_id: fileId,
    reason: reason || 'incorrect_password',
    timestamp: new Date().toISOString()
  });
};

// User interaction events
export const trackButtonClick = (buttonName: string, location: string) => {
  pushToDataLayer('button_click', {
    button_name: buttonName,
    location: location,
    timestamp: new Date().toISOString()
  });
};

export const trackFileUpload = (fileCount: number) => {
  pushToDataLayer('file_upload', {
    file_count: fileCount,
    timestamp: new Date().toISOString()
  });
};

export const trackCodeGenerated = (codeType: 'sender' | 'receiver') => {
  pushToDataLayer('code_generated', {
    code_type: codeType,
    timestamp: new Date().toISOString()
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, errorLocation: string) => {
  pushToDataLayer('error', {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation,
    timestamp: new Date().toISOString()
  });
};

// Performance tracking
export const trackPerformance = (metricName: string, value: number, unit: string = 'ms') => {
  pushToDataLayer('performance', {
    metric_name: metricName,
    metric_value: value,
    metric_unit: unit,
    timestamp: new Date().toISOString()
  });
};

// Custom event for any other tracking needs
export const trackCustomEvent = (eventName: string, eventData?: Record<string, any>) => {
  pushToDataLayer(eventName, {
    ...eventData,
    timestamp: new Date().toISOString()
  });
};

// Type declaration for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

