
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
      toast({
        title: "📂 Processing...",
        description: "Checking for folders and zipping content. This may take a moment.",
      });

      try {
        const processedFiles = await FolderService.processEntries(e.dataTransfer.items);
        if (processedFiles.length > 0) {
          onFilesAdded(processedFiles);
          toast({
            title: "✅ Ready",
            description: `${processedFiles.length} file(s) prepared for transfer.`,
          });
        }
      } catch (err) {
        console.error("Error processing dropped items:", err);
        toast({
          title: "❌ Error",
          description: "Failed to process files or folders.",
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
    <Card className={`transition-all duration-200 ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed'}`}>
      <CardContent
        className="p-4 sm:p-6 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 px-2">
              {isProcessing ? 'Processing...' : (isDragOver ? 'Drop files or folders here' : 'Drag & drop files or folders')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 px-2">
              {isProcessing ? 'Zipping directories...' : 'or click to browse your files'}
            </p>

            <Button onClick={openFileDialog} className="mx-auto h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation" disabled={isProcessing}>
              <File className="w-4 h-4 mr-1 sm:mr-2" />
              Choose Files
            </Button>
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
