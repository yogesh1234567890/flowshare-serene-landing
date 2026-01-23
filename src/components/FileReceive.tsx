
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import DownloadProgress from './DownloadProgress';
import ConnectionStatusDisplay from './ConnectionStatusDisplay';
import { useFileReceive } from '@/hooks/useFileReceive';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trackButtonClick } from '@/utils/gtm';

const FileReceive = () => {
  const {
    connectionStatus,
    connectionState,
    downloadFiles,
    handleConnect,
    isWebSocketConnected,
    incomingFile,
    acceptIncomingFile
  } = useFileReceive();



  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link
            to="/share"
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 text-sm sm:text-base whitespace-nowrap"
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Send Files</span>
            <span className="sm:hidden">Send</span>
          </Link>
        </div>
        <div className="text-center mb-4 sm:mb-6 lg:mb-8 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl mb-4 sm:mb-6 shadow-lg">
            <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-2 sm:mb-4 animate-fade-in">
            Receive Files
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up">
            Enter the connection code from the sender to receive files securely via peer-to-peer technology
          </p>
        </div>

        {/* Connection Status & Downloads */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          {/* Connection Status Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <div className="mb-6">
              <ConnectionStatusDisplay
                connectionState={connectionState}
                isDataChannelOpen={connectionStatus === 'connected'} // Approximate for now, as hook abstracts this
                isWebSocketConnected={isWebSocketConnected}
                className="bg-slate-50 border-slate-100 shadow-none"
              />
            </div>

            {connectionStatus !== 'connected' && (
              <div className="w-full max-w-md mx-auto">
                <ConnectionForm
                  onConnect={handleConnect}
                  connectionStatus={connectionStatus}
                />
              </div>
            )}
          </div>

          {/* Downloads Section */}
          {downloadFiles && downloadFiles.length > 0 && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500 flex-shrink-0" />
                Downloads
              </h2>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {downloadFiles.map((downloadFile) => (
                    <DownloadProgress
                      key={downloadFile.id}
                      downloadFile={downloadFile}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Incoming File Dialog */}
        <AlertDialog open={!!incomingFile}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-lg mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Incoming File Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col gap-3 sm:gap-4 py-2 sm:py-4">
                  <div className="flex items-center gap-3 sm:gap-4 bg-muted p-3 sm:p-4 rounded-lg">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                      <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate" title={incomingFile?.name}>
                        {incomingFile?.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{incomingFile ? formatBytes(incomingFile.size) : ''}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground px-1">
                    Do you want to accept this file? For large files, we recommend saving directly to disk.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel 
                onClick={() => {
                  trackButtonClick('reject_file', 'FileReceive');
                  window.location.reload();
                }}
                className="w-full sm:w-auto touch-manipulation"
              >
                Reject
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  trackButtonClick('accept_file', 'FileReceive');
                  acceptIncomingFile();
                }}
                className="w-full sm:w-auto touch-manipulation"
              >
                Accept & Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default FileReceive;
