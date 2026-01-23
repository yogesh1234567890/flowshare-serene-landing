import { Card, CardContent } from '@/components/ui/card';
import { Activity, Lock, Server } from 'lucide-react';

interface ConnectionStatusDisplayProps {
    connectionState: string;
    isDataChannelOpen: boolean;
    isWebSocketConnected: boolean;
    className?: string;
}

const ConnectionStatusDisplay = ({
    connectionState,
    isDataChannelOpen,
    isWebSocketConnected,
    className = ""
}: ConnectionStatusDisplayProps) => {
    return (
        <Card className={`border-none shadow-sm bg-white/50 backdrop-blur-sm ${className}`}>
            <CardContent className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {/* WebSocket Status */}
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${isWebSocketConnected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Server className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">Signaling Server</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-xs font-semibold truncate ${isWebSocketConnected ? 'text-green-700' : 'text-slate-600'
                                    }`}>
                                    {isWebSocketConnected ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Peer Connection Status */}
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${connectionState === 'connected' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">P2P Connection</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${connectionState === 'connected' ? 'bg-blue-500' :
                                        connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-xs font-semibold truncate ${connectionState === 'connected' ? 'text-blue-700' : 'text-slate-600'
                                    }`}>
                                    {connectionState === 'connected' ? 'Established' :
                                        connectionState === 'connecting' ? 'Connecting...' : 'Waiting'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secure Channel Status */}
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${isDataChannelOpen ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">End-to-End Encryption</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDataChannelOpen ? 'bg-purple-500' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-xs font-semibold truncate ${isDataChannelOpen ? 'text-purple-700' : 'text-slate-600'
                                    }`}>
                                    {isDataChannelOpen ? 'Secure & Ready' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ConnectionStatusDisplay;
