
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import DownloadProgress from './DownloadProgress';
import WaitingState from './WaitingState';
import { useFileReceive } from '@/hooks/useFileReceive';

const FileReceive = () => {
  const { connectionStatus, connectionState, downloadFile, handleConnect } = useFileReceive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link 
            to="/share"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Send Files
          </Link>
        </div>

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
            connectionState={connectionState}
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
