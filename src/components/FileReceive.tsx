
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Zap, Shield, Users } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import DownloadProgress from './DownloadProgress';
import WaitingState from './WaitingState';
import Navbar from './Navbar';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl mb-6">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Receive Files
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter the connection code to receive files securely via peer-to-peer technology
            </p>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-semibold text-blue-600">Fast</span>
              </div>
              <p className="text-sm text-muted-foreground">Direct peer-to-peer download</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-semibold text-green-600">Secure</span>
              </div>
              <p className="text-sm text-muted-foreground">End-to-end encryption</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-purple-500 mr-2" />
                <span className="font-semibold text-purple-600">Private</span>
              </div>
              <p className="text-sm text-muted-foreground">No server storage</p>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Connection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Enter Connection Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConnectionForm 
                    onConnect={handleConnect}
                    connectionStatus={connectionStatus}
                    connectionState={connectionState}
                    isWebSocketConnected={isWebSocketConnected}
                  />
                </CardContent>
              </Card>

              {connectionStatus === 'disconnected' && !downloadFiles && (
                <WaitingState />
              )}
            </div>

            {/* Right Column - Downloads */}
            <div className="space-y-6">
              {downloadFiles && downloadFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileReceive;
