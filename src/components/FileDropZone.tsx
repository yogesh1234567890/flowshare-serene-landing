
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File } from 'lucide-react';

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const FileDropZone = ({ onFilesAdded }: FileDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesAdded(files);
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
        className="p-6 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}>
            <Upload className="w-6 h-6" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isDragOver ? 'Drop files here' : 'Drag & drop files'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              or click to browse your files
            </p>
            
            <Button onClick={openFileDialog} className="mx-auto h-8 px-3 text-sm">
              <File className="w-4 h-4 mr-1" />
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
