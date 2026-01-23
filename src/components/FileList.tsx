import { Button } from '@/components/ui/button';
import { Send, Trash2, FileText, CheckCircle, Inbox } from 'lucide-react';

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
        <div className="flex flex-col gap-3 bg-white overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Selected Files ({files.length})
                </h3>
                {canSend && hasFilesToSend && (
                    <Button
                        onClick={onSendAll}
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-200 touch-manipulation h-8 text-xs sm:text-sm"
                    >
                        <Send className="w-3 h-3 mr-1.5" />
                        Send All
                    </Button>
                )}
            </div>

            <div className="grid gap-1 flex-1 overflow-y-auto">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm sm:text-base">No files selected</p>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">Drag and drop files or click to browse</p>
                    </div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file.id}
                            className="group relative bg-slate-50 border border-slate-200 rounded p-1 sm:p-1.5 transition-all hover:bg-slate-100 hover:border-blue-200"
                        >
                            <div className="flex items-center justify-between gap-1.5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-medium text-slate-900 truncate text-xs max-w-[140px] sm:max-w-[220px] md:max-w-md" title={file.name}>
                                            {file.name}
                                        </p>
                                        <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
                                            {formatBytes(file.size)}
                                        </span>
                                        {file.status === 'sent' && (
                                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 flex-shrink-0">
                                                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                                Sent
                                            </span>
                                        )}
                                        {file.status !== 'ready' && file.status !== 'sent' && (
                                            <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
                                                • {file.speed} • {file.eta}
                                            </span>
                                        )}
                                    </div>

                                    {file.status !== 'ready' && (
                                        <div className="relative h-0.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
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
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 touch-manipulation flex-shrink-0 h-5 w-5"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileList;
