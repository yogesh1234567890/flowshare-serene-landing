import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Globe, Shield, Activity, Lock, Server } from 'lucide-react';

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* WebSocket Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`p-2 rounded-full ${isWebSocketConnected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Server className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Signaling Server</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-sm font-semibold ${isWebSocketConnected ? 'text-green-700' : 'text-slate-600'
                                    }`}>
                                    {isWebSocketConnected ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Peer Connection Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`p-2 rounded-full ${connectionState === 'connected' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">P2P Connection</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-blue-500' :
                                        connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-sm font-semibold ${connectionState === 'connected' ? 'text-blue-700' : 'text-slate-600'
                                    }`}>
                                    {connectionState === 'connected' ? 'Established' :
                                        connectionState === 'connecting' ? 'Connecting...' : 'Waiting'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secure Channel Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`p-2 rounded-full ${isDataChannelOpen ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Lock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">End-to-End Encryption</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isDataChannelOpen ? 'bg-purple-500' : 'bg-slate-300'
                                    }`} />
                                <p className={`text-sm font-semibold ${isDataChannelOpen ? 'text-purple-700' : 'text-slate-600'
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
