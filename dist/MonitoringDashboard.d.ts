/**
 * MonitoringDashboard - Main equipment class for agent monitoring
 *
 * Provides real-time visualization of agent activity, thinking processes,
 * cell states, and provenance chains in the SuperInstance ecosystem
 */
import type { Equipment, EquipmentSlot, OriginCore, Tile, CostMetrics, BenefitMetrics, TriggerThresholds, EquipmentDescription } from '@superinstance/starter-agent';
import { ActivityTracker } from './ActivityTracker';
import { CellVisualizer } from './CellVisualizer';
import type { DashboardState, DashboardMetrics, HistoricalEntry, DashboardConfig } from './types';
export interface MonitoringDashboardConfig extends Partial<DashboardConfig> {
    enablePlayback: boolean;
    enableWebSocket: boolean;
    enableHttpServer: boolean;
    autoStart: boolean;
}
/**
 * MonitoringDashboard Equipment
 *
 * Equips agents with real-time monitoring capabilities, providing:
 * - Live visualization of agent thinking and activity
 * - Cell-by-cell state display with confidence zones
 * - Provenance chain visualization
 * - Historical playback of agent decisions
 * - Equipment status monitoring
 */
export declare class MonitoringDashboard implements Equipment {
    readonly name = "MonitoringDashboard";
    readonly slot: EquipmentSlot;
    readonly version = "1.0.0";
    readonly description = "Real-time visualization equipment for monitoring agent activity, thinking, and cell states";
    readonly cost: CostMetrics;
    readonly benefit: BenefitMetrics;
    readonly triggerThresholds: TriggerThresholds;
    private config;
    private activityTracker;
    private cellVisualizer;
    private realTimeMonitor;
    private dashboardServer;
    private agents;
    private isRunning;
    private originalProcessTask;
    constructor(config?: Partial<MonitoringDashboardConfig>);
    /**
     * Equip the dashboard to an agent
     */
    equip(agent: OriginCore): Promise<void>;
    /**
     * Unequip the dashboard from an agent
     */
    unequip(agent: OriginCore): Promise<void>;
    /**
     * Start the monitoring dashboard
     */
    start(): Promise<void>;
    /**
     * Stop the monitoring dashboard
     */
    stop(): Promise<void>;
    /**
     * Get current dashboard state
     */
    getState(): DashboardState;
    /**
     * Get dashboard metrics
     */
    getMetrics(): DashboardMetrics;
    /**
     * Get historical entries for playback
     */
    getHistory(from?: number, to?: number): HistoricalEntry[];
    /**
     * Get activity tracker for direct access
     */
    getActivityTracker(): ActivityTracker;
    /**
     * Get cell visualizer for direct access
     */
    getCellVisualizer(): CellVisualizer;
    /**
     * Check if dashboard is running
     */
    isActive(): boolean;
    /**
     * Describe the equipment
     */
    describe(): EquipmentDescription;
    /**
     * Convert to tile for composition
     */
    asTile(): Tile;
    private wrapAgentMethods;
    private restoreAgentMethods;
}
export default MonitoringDashboard;
//# sourceMappingURL=MonitoringDashboard.d.ts.map