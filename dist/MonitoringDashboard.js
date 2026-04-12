"use strict";
/**
 * MonitoringDashboard - Main equipment class for agent monitoring
 *
 * Provides real-time visualization of agent activity, thinking processes,
 * cell states, and provenance chains in the SuperInstance ecosystem
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringDashboard = void 0;
const ActivityTracker_1 = require("./ActivityTracker");
const CellVisualizer_1 = require("./CellVisualizer");
const RealTimeMonitor_1 = require("./RealTimeMonitor");
const DashboardServer_1 = require("./DashboardServer");
const types_1 = require("./types");
const DEFAULT_MONITORING_CONFIG = {
    ...types_1.DEFAULT_DASHBOARD_CONFIG,
    enablePlayback: true,
    enableWebSocket: true,
    enableHttpServer: true,
    autoStart: true,
};
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
class MonitoringDashboard {
    name = 'MonitoringDashboard';
    slot = 'MONITORING';
    version = '1.0.0';
    description = 'Real-time visualization equipment for monitoring agent activity, thinking, and cell states';
    cost = {
        memoryBytes: 50 * 1024 * 1024, // 50MB
        cpuPercent: 2,
        latencyMs: 5,
        costPerUse: 0.0001,
    };
    benefit = {
        accuracyBoost: 0,
        speedMultiplier: 1.0,
        confidenceBoost: 0.05,
        capabilityGain: ['visualization', 'debugging', 'auditing', 'observability'],
    };
    triggerThresholds = {
        equipWhen: [
            { metric: 'debug', operator: '==', value: 1 },
        ],
        unequipWhen: [
            { metric: 'memory', operator: '>', value: 80 },
        ],
        callTeacher: { low: 0.3, high: 0.95 },
    };
    config;
    activityTracker;
    cellVisualizer;
    realTimeMonitor;
    dashboardServer = null;
    agents = new Map();
    isRunning = false;
    originalProcessTask = null;
    constructor(config = {}) {
        this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
        this.activityTracker = new ActivityTracker_1.ActivityTracker({
            maxActivitiesStored: this.config.maxActivitiesStored,
        });
        this.cellVisualizer = new CellVisualizer_1.CellVisualizer();
        this.realTimeMonitor = new RealTimeMonitor_1.RealTimeMonitor(this.activityTracker, this.cellVisualizer, { port: this.config.port + 1 });
    }
    /**
     * Equip the dashboard to an agent
     */
    async equip(agent) {
        // Register agent for monitoring
        this.agents.set(agent.id, agent);
        // Wrap processTask to track activities
        this.wrapAgentMethods(agent);
        // Start servers if not running and autoStart is enabled
        if (!this.isRunning && this.config.autoStart) {
            await this.start();
        }
        // Register with real-time monitor
        this.realTimeMonitor.registerAgent(agent);
        // Track equipment change
        this.activityTracker.trackEquipmentChange(agent.id, this.name, this.slot, 'equip');
    }
    /**
     * Unequip the dashboard from an agent
     */
    async unequip(agent) {
        // Unregister agent
        this.agents.delete(agent.id);
        // Restore original methods
        this.restoreAgentMethods(agent);
        // Unregister from real-time monitor
        this.realTimeMonitor.unregisterAgent(agent.id);
        // Track equipment change
        this.activityTracker.trackEquipmentChange(agent.id, this.name, this.slot, 'unequip');
        // Stop servers if no more agents
        if (this.agents.size === 0 && this.isRunning) {
            await this.stop();
        }
    }
    /**
     * Start the monitoring dashboard
     */
    async start() {
        if (this.isRunning)
            return;
        // Start real-time monitor
        if (this.config.enableWebSocket) {
            await this.realTimeMonitor.start();
        }
        // Start HTTP server
        if (this.config.enableHttpServer) {
            const serverOptions = {
                port: this.config.port,
                host: this.config.host,
                enablePlayback: this.config.enablePlayback,
            };
            this.dashboardServer = new DashboardServer_1.DashboardServer(this.activityTracker, this.cellVisualizer, this.realTimeMonitor, serverOptions);
            await this.dashboardServer.start();
        }
        this.isRunning = true;
        console.log(`Monitoring Dashboard started on port ${this.config.port}`);
    }
    /**
     * Stop the monitoring dashboard
     */
    async stop() {
        if (!this.isRunning)
            return;
        // Stop HTTP server
        if (this.dashboardServer) {
            await this.dashboardServer.stop();
            this.dashboardServer = null;
        }
        // Stop real-time monitor
        if (this.config.enableWebSocket) {
            await this.realTimeMonitor.stop();
        }
        this.isRunning = false;
        console.log('Monitoring Dashboard stopped');
    }
    /**
     * Get current dashboard state
     */
    getState() {
        return {
            agents: this.activityTracker.getAllAgentSnapshots(),
            cells: this.cellVisualizer.getAllCells(),
            activities: this.activityTracker.getActivities(),
            provenance: new Map(),
            timestamp: Date.now(),
        };
    }
    /**
     * Get dashboard metrics
     */
    getMetrics() {
        if (this.dashboardServer) {
            return this.dashboardServer.getMetrics();
        }
        // Return basic metrics if server is not running
        const snapshots = this.activityTracker.getAllAgentSnapshots();
        return {
            totalAgents: snapshots.size,
            activeAgents: 0,
            totalCells: 0,
            confidenceDistribution: [],
            equipmentUsage: new Map(),
            averageProcessingTime: 0,
            throughputPerMinute: 0,
        };
    }
    /**
     * Get historical entries for playback
     */
    getHistory(from, to) {
        if (this.dashboardServer) {
            return this.dashboardServer.getHistory(from, to);
        }
        return [];
    }
    /**
     * Get activity tracker for direct access
     */
    getActivityTracker() {
        return this.activityTracker;
    }
    /**
     * Get cell visualizer for direct access
     */
    getCellVisualizer() {
        return this.cellVisualizer;
    }
    /**
     * Check if dashboard is running
     */
    isActive() {
        return this.isRunning;
    }
    /**
     * Describe the equipment
     */
    describe() {
        return {
            name: this.name,
            slot: this.slot,
            purpose: 'Provides real-time visualization and monitoring of agent activity, thinking processes, and cell states',
            whenToUse: [
                'Debugging agent behavior',
                'Auditing decision-making processes',
                'Monitoring system health',
                'Analyzing provenance chains',
                'Real-time observability during development',
            ],
            whenToRemove: [
                'Production deployment without monitoring needs',
                'Memory-constrained environments',
                'High-throughput scenarios where overhead matters',
            ],
            dependencies: [],
            conflicts: [],
        };
    }
    /**
     * Convert to tile for composition
     */
    asTile() {
        return {
            inputType: { type: 'primitive', name: 'DashboardQuery' },
            outputType: { type: 'composite', name: 'DashboardResult' },
            compute: (input) => {
                const query = input;
                switch (query.type) {
                    case 'state':
                        return this.getState();
                    case 'metrics':
                        return this.getMetrics();
                    case 'history':
                        const params = query.params;
                        return this.getHistory(params?.from, params?.to);
                    default:
                        return { error: 'Unknown query type' };
                }
            },
            confidence: () => 1.0,
            trace: (input) => {
                const query = input;
                return `MonitoringDashboard.query(${query.type})`;
            },
        };
    }
    // Private methods
    wrapAgentMethods(agent) {
        // Store reference to original processTask if we can access it
        // Note: This is a simplified approach - in production, we'd use a more robust method
        // Track state changes periodically
        const updateInterval = setInterval(() => {
            if (this.agents.has(agent.id)) {
                this.activityTracker.updateAgentSnapshot(agent);
            }
            else {
                clearInterval(updateInterval);
            }
        }, this.config.updateIntervalMs);
    }
    restoreAgentMethods(_agent) {
        // Restore original methods if needed
        this.originalProcessTask = null;
    }
}
exports.MonitoringDashboard = MonitoringDashboard;
exports.default = MonitoringDashboard;
//# sourceMappingURL=MonitoringDashboard.js.map