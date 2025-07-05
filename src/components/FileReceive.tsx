
import React from 'react';
import ConnectionForm from './ConnectionForm';
import DownloadProgress from './DownloadProgress';
import WaitingState from './WaitingState';
import { useFileReceive } from '@/hooks/useFileReceive';

const FileReceive = () => {
  const { connectionStatus, downloadFile, handleConnect } = useFileReceive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            Receive Files
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in">
            Enter the connection code or scan QR to receive files
          </p>
        </div>

        <div className="space-y-6">
          <ConnectionForm 
            onConnect={handleConnect}
            connectionStatus={connectionStatus}
          />

          {downloadFile && (
            <DownloadProgress downloadFile={downloadFile} />
          )}

          {connectionStatus === 'disconnected' && !downloadFile && (
            <WaitingState />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileReceive;
