import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Trash2, FileText, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface FileData {
    id: string;
    name: string;
    size: number;
    progress: number;
    speed: string;
    eta: string;
    status: 'ready' | 'uploading' | 'sent' | 'error';
    file: File;
}

interface FileListProps {
    files: FileData[];
    onRemove: (id: string) => void;
    onSendAll: () => void;
    canSend: boolean;
}

const FileList = ({ files, onRemove, onSendAll, canSend }: FileListProps) => {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const hasFilesToSend = files.some(f => f.status === 'ready');

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    Selected Files ({files.length})
                </h3>
                {canSend && hasFilesToSend && (
                    <Button
                        onClick={onSendAll}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200 touch-manipulation"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send All
                    </Button>
                )}
            </div>

            <div className="grid gap-3">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="group relative bg-white border border-slate-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-blue-200"
                    >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-medium text-slate-900 truncate text-sm sm:text-base max-w-[120px] sm:max-w-[200px] md:max-w-md" title={file.name}>
                                        {file.name}
                                    </p>
                                    {file.status === 'sent' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Sent
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-2 sm:mb-3 break-words">
                                    {formatBytes(file.size)}
                                    {file.status !== 'ready' && (
                                        <span className="mx-2 whitespace-nowrap">• {file.speed} • {file.eta}</span>
                                    )}
                                </p>

                                {file.status !== 'ready' && (
                                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full transition-all duration-300 ${file.status === 'error' ? 'bg-red-500' :
                                                    file.status === 'sent' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {file.status === 'ready' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(file.id)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 touch-manipulation flex-shrink-0"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
