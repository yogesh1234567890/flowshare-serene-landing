
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File } from 'lucide-react';
import { FolderService } from '@/services/folderService';
import { toast } from '@/hooks/use-toast';

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const FileDropZone = ({ onFilesAdded }: FileDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Check if we have items to process (folders check)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsProcessing(true);
      // Processing status can be shown in UI if needed

      try {
        const processedFiles = await FolderService.processEntries(e.dataTransfer.items);
        if (processedFiles.length > 0) {
          onFilesAdded(processedFiles);
          // Files are visible in file list - no toast needed
        }
      } catch (err) {
        console.error("Error processing dropped items:", err);
        toast({
          title: "Processing Error",
          description: "Failed to process files. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    } else if (e.dataTransfer.files.length > 0) {
      // Fallback for simple file drop if items API not supported
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  }, [onFilesAdded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={`transition-all duration-200 h-full flex flex-col ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-slate-200'}`}>
      <CardContent
        className="p-4 sm:p-6 text-center flex flex-col justify-center min-h-[300px] sm:min-h-[400px]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
            }`}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500"></div>
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 px-2">
              {isProcessing ? 'Processing...' : (isDragOver ? 'Drop files or folders here' : 'Drag & drop files or folders')}
            </h3>
            <p className="text-sm sm:text-base text-slate-500 px-2">
              {isProcessing ? 'Zipping directories...' : 'or click to browse your files'}
            </p>

            <div className="pt-2">
              <Button 
                onClick={openFileDialog} 
                className="mx-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base touch-manipulation bg-blue-600 hover:bg-blue-700" 
                disabled={isProcessing}
              >
                <File className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default FileDropZone;
