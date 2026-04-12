/**
 * RealTimeMonitor - WebSocket-based real-time updates for the dashboard
 *
 * Provides real-time streaming of agent activities, cell updates,
 * and system state changes to connected clients
 */
import type { DashboardState, AgentActivity } from './types';
import { ActivityTracker } from './ActivityTracker';
import { CellVisualizer } from './CellVisualizer';
import type { OriginCore } from '@superinstance/starter-agent';
export interface RealTimeMonitorConfig {
    port: number;
    heartbeatIntervalMs: number;
    connectionTimeoutMs: number;
    maxConnections: number;
}
export declare class RealTimeMonitor {
    private wss;
    private config;
    private connections;
    private activityTracker;
    private cellVisualizer;
    private agents;
    private updateInterval;
    private heartbeatInterval;
    constructor(activityTracker: ActivityTracker, cellVisualizer: CellVisualizer, config?: Partial<RealTimeMonitorConfig>);
    /**
     * Start the WebSocket server
     */
    start(): Promise<void>;
    /**
     * Stop the WebSocket server
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
     * Broadcast agent activity
     */
    broadcastActivity(activity: AgentActivity): void;
    /**
     * Broadcast cell update
     */
    broadcastCellUpdate(cellId: string, update: unknown): void;
    /**
     * Get current state
     */
    getCurrentState(): DashboardState;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get connection statistics
     */
    getStats(): {
        totalConnections: number;
        activeConnections: number;
        totalSubscriptions: number;
        messagesPerSecond: number;
    };
    private handleConnection;
    private handleMessage;
    private handleSubscription;
    private handleUnsubscription;
    private handlePlaybackControl;
    private broadcast;
    private sendToClient;
    private broadcastStateUpdate;
    private performHeartbeat;
    private filterByActivity;
    private filterByCell;
}
export default RealTimeMonitor;
//# sourceMappingURL=RealTimeMonitor.d.ts.map