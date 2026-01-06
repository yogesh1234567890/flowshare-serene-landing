import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Shield } from 'lucide-react';
import FileDropZone from './FileDropZone';
import ConnectionCode from './ConnectionCode';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from '@/hooks/use-toast';
import ConnectionStatusDisplay from './ConnectionStatusDisplay';
import FileList from './FileList';
import { trackCodeGenerated, trackFileUpload, trackButtonClick } from '@/utils/gtm';
import { monetizationService } from '@/services/monetizationService';
import AdBanner from './AdBanner';

interface FileData {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: 'ready' | 'uploading' | 'sent' | 'error';
  file: File;
  webrtcFileId?: string; // Track WebRTC file ID for progress updates
}

const FileShare = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileIdMapping, setFileIdMapping] = useState<Map<string, string>>(new Map()); // WebRTC fileId -> UI fileId
  const [connectionCode, setConnectionCode] = useState(() => {
    const savedCode = localStorage.getItem('connectionCode');
    if (savedCode) return savedCode;

    const newCode = `${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    localStorage.setItem('connectionCode', newCode);
    return newCode;
  });

  const refreshConnectionCode = () => {
    const newCode = `${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setConnectionCode(newCode);
    localStorage.setItem('connectionCode', newCode);
    initializeAsSender(newCode);
    
    // Track code generation
    trackCodeGenerated('sender');
    trackButtonClick('refresh_code', 'FileShare');

    toast({
      title: "🔄 New Code Generated",
      description: `Connection code refreshed: ${newCode}`,
    });
  };

  const {
    connectionState,
    isDataChannelOpen,
    initializeAsSender,
    sendFile,
    receiverConnected,
    isWebSocketConnected,
    fileTransferProgress
  } = useWebRTC();

  useEffect(() => {
    // Initialize WebRTC as sender when component mounts
    initializeAsSender(connectionCode);
  }, [connectionCode, initializeAsSender]);

  // Sync real transfer progress from WebRTC service
  useEffect(() => {
    if (fileTransferProgress.size === 0) return;

    setFiles(prev => {
      const updated = [...prev];
      let hasChanges = false;

      fileTransferProgress.forEach((progress, webrtcFileId) => {
        const uiFileId = fileIdMapping.get(webrtcFileId);
        if (!uiFileId) return;

        const fileIndex = updated.findIndex(f => f.id === uiFileId);
        if (fileIndex === -1) return;

        const file = updated[fileIndex];
        const roundedProgress = Math.round(progress);
        const isComplete = progress >= 100;

        // Only update if there's a significant change (>= 1% or status change)
        if (Math.abs(file.progress - roundedProgress) >= 1 || 
            (isComplete && file.status !== 'sent') ||
            (!isComplete && file.status === 'sent')) {
          updated[fileIndex] = {
            ...file,
            progress: roundedProgress,
            speed: isComplete ? '0 MB/s' : `${(Math.random() * 8 + 2).toFixed(1)} MB/s`,
            eta: isComplete ? 'Sent' : `${Math.max(1, Math.round((100 - progress) / 8))}s`,
            status: isComplete ? 'sent' : 'uploading'
          };
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prev;
    });
  }, [fileTransferProgress, fileIdMapping]);

  const handleFileUpload = (uploadedFiles: File[]) => {
    // Check limits before adding files
    // const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    // const canTransfer = monetizationService.canTransferFile(totalSize, uploadedFiles.length);
    
    // if (!canTransfer.allowed) {
    //   toast({
    //     title: "❌ File Limit Reached",
    //     description: canTransfer.reason || "Please upgrade to Premium for unlimited transfers",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    const newFiles: FileData[] = uploadedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 0, // Start at 0% until actually sent
      speed: '0 MB/s',
      eta: 'Ready to send',
      status: 'ready' as const, // Ready to send, not sent yet
      file: file
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Track file upload
    trackFileUpload(uploadedFiles.length);

    toast({
      title: "📁 Files Ready",
      description: `${uploadedFiles.length} file(s) ready to send`,
    });
  };


  // ... (handleFileUpload)

  const handleSendFiles = async () => {
    // Track button click
    trackButtonClick('send_files', 'FileShare');
    
    // Check monetization limits
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    // const canTransfer = monetizationService.canTransferFile(totalSize, files.length);
    
    // if (!canTransfer.allowed) {
    //   toast({
    //     title: "❌ Transfer Limit Reached",
    //     description: canTransfer.reason || "Please upgrade to Premium for unlimited transfers",
    //     variant: "destructive"
    //   });
    //   return;
    // }
    
    // Validation
    if (!isDataChannelOpen || files.length === 0) {
      toast({
        title: "❌ Cannot Send Files",
        description: "Data channel not ready or no files selected",
        variant: "destructive"
      });
      return;
    }

    if (!receiverConnected) {
      toast({
        title: "⏳ Waiting for Receiver",
        description: "Please wait for the receiver to connect",
        variant: "destructive"
      });
      return;
    }

    // Send files sequentially to avoid overwhelming the connection
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'uploading' as const, progress: 0, eta: 'Starting...' }
          : f
      ));

      try {
        const webrtcFileId = await sendFile(fileData.file);
        
        if (webrtcFileId) {
          // Map WebRTC file ID to UI file ID
          setFileIdMapping(prev => new Map(prev.set(webrtcFileId, fileData.id)));
        } else {
          // Failed to send
          setFiles(prev => prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'error' as const }
              : f
          ));
          toast({
            title: "❌ Failed to Send",
            description: `Could not send ${fileData.name}`,
            variant: "destructive"
          });
        }
      } catch (e) {
        console.error("Error sending file:", e);
        setFiles(prev => prev.map(f =>
          f.id === fileData.id
            ? { ...f, status: 'error' as const }
            : f
        ));
        toast({
          title: "❌ Send Error",
          description: `Failed to send ${fileData.name}: ${e instanceof Error ? e.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }

      // Small delay between files
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Record transfer for monetization tracking
    monetizationService.recordTransfer(totalSize, files.length);

    toast({
      title: "📤 Files Queued",
      description: `Started transferring ${files.length} file(s)`,
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-5xl mx-auto pt-16">
        {/* ... Header ... */}
        <header className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link
            to="/receive"
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 text-sm sm:text-base whitespace-nowrap"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Receive Files</span>
            <span className="sm:hidden">Receive</span>
          </Link>
        </header>

        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 animate-fade-in">
            Send Files
          </h1>
          <p className="text-base sm:text-lg text-gray-600 animate-fade-in px-2">
            Share your files securely with anyone, anywhere
          </p>
        </div>


        {/* Top Section: Connection Center */}
        <div className="mb-6 sm:mb-8">
          <section aria-label="Connection Settings" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 w-full md:w-auto">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Connection Center
                </h2>
                <ConnectionCode code={connectionCode} onRefresh={refreshConnectionCode} />
              </div>

              <div className="flex-1 w-full md:w-auto min-w-0 md:min-w-[300px]">
                <ConnectionStatusDisplay
                  connectionState={connectionState}
                  isDataChannelOpen={isDataChannelOpen}
                  isWebSocketConnected={isWebSocketConnected}
                  className="bg-slate-50 border-slate-100 shadow-none h-full"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Drop Zone */}
          <div>
            <section aria-label="File Upload Area" className="h-full">
              <FileDropZone onFilesAdded={handleFileUpload} />
            </section>
            
            {/* Ad Banner for Free Users */}
            {monetizationService.shouldShowAds() && (
              <AdBanner format="horizontal" className="mt-6 sm:mt-8" />
            )}
            
          </div>

          {/* Right Column: File List & Options */}
          <div>
            <section aria-label="Selected Files" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
              <FileList
                files={files}
                onRemove={removeFile}
                onSendAll={handleSendFiles}
                canSend={receiverConnected && isDataChannelOpen}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileShare;
