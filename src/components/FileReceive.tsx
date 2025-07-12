
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Zap, Shield, Users } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import DownloadProgress from './DownloadProgress';
import WaitingState from './WaitingState';
import { useFileReceive } from '@/hooks/useFileReceive';

const FileReceive = () => {
  const {
    connectionStatus,
    connectionState,
    downloadFiles,
    handleConnect,
    isWebSocketConnected
  } = useFileReceive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Send Files
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl mb-6 shadow-lg">
            <Download className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in">
            Receive Files
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up">
            Enter the connection code from the sender to receive files securely via peer-to-peer technology
          </p>
        </div>

        {/* Connection Status & Downloads */}
        {connectionStatus === 'connected' && downloadFiles && downloadFiles.length > 0 ? (
          /* Downloads Active State */
          <div className="space-y-8">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  Receiving Files ({downloadFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {downloadFiles.map((downloadFile) => (
                  <DownloadProgress
                    key={downloadFile.id}
                    downloadFile={downloadFile}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Connection Form State */
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Users className="w-6 h-6" />
                  Enter Connection Code
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ConnectionForm
                  onConnect={handleConnect}
                  connectionStatus={connectionStatus}
                  connectionState={connectionState}
                  isWebSocketConnected={isWebSocketConnected}
                />
              </CardContent>
            </Card>

            {connectionStatus === 'disconnected' && !downloadFiles && (
              <div className="mt-8">
                <WaitingState />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileReceive;
