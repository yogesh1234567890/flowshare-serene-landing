
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-blue-600 mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Direct peer-to-peer transfer with no server delays</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-green-600 mb-2">Bank-Grade Security</h3>
              <p className="text-sm text-muted-foreground">End-to-end encryption protects your files</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-purple-600 mb-2">Completely Private</h3>
              <p className="text-sm text-muted-foreground">No files stored on our servers</p>
            </Card>
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

          {/* How It Works Guide */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">How to Receive Files</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Get the Code</h3>
                <p className="text-muted-foreground">Ask the sender for their connection code</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Enter & Connect</h3>
                <p className="text-muted-foreground">Input the code and establish secure connection</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Receive Files</h3>
                <p className="text-muted-foreground">Files transfer directly to your device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileReceive;
