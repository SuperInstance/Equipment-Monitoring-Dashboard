/**
 * DashboardServer - HTTP/WebSocket server for the monitoring dashboard
 *
 * Serves the dashboard UI and provides WebSocket connectivity for real-time updates
 */
import type { DashboardConfig, HistoricalEntry, PlaybackState, DashboardMetrics } from './types';
import { ActivityTracker } from './ActivityTracker';
import { CellVisualizer } from './CellVisualizer';
import { RealTimeMonitor } from './RealTimeMonitor';
import type { OriginCore } from '@superinstance/starter-agent';
export interface DashboardServerOptions extends Partial<DashboardConfig> {
    enableCors: boolean;
    serveStatic: boolean;
    staticPath?: string;
}
export declare class DashboardServer {
    private app;
    private httpServer;
    private wss;
    private config;
    private activityTracker;
    private cellVisualizer;
    private realTimeMonitor;
    private agents;
    private history;
    private playbackState;
    private historyInterval;
    constructor(activityTracker: ActivityTracker, cellVisualizer: CellVisualizer, realTimeMonitor: RealTimeMonitor, options?: Partial<DashboardServerOptions>);
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Stop the server
     */
    stop(): Promise<void>;
    /**
     * Register an agent for monitoring
     */
    registerAgent(agent: OriginCore): void;
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId: string): void;
    /**
     * Get current metrics
     */
    getMetrics(): DashboardMetrics;
    /**
     * Get playback state
     */
    getPlaybackState(): PlaybackState;
    /**
     * Control playback
     */
    controlPlayback(action: 'play' | 'pause' | 'stop' | 'step' | 'speed', value?: number): void;
    /**
     * Get historical entries
     */
    getHistory(from?: number, to?: number): HistoricalEntry[];
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    private handleWebSocketMessage;
    private getCurrentState;
    private serializeState;
    private getEquipmentStatus;
    private calculateAverageProcessingTime;
    private startHistoryRecording;
    private recordHistory;
    private getDashboardHTML;
}
export default DashboardServer;
//# sourceMappingURL=DashboardServer.d.ts.map