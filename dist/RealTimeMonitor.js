"use strict";
/**
 * RealTimeMonitor - WebSocket-based real-time updates for the dashboard
 *
 * Provides real-time streaming of agent activities, cell updates,
 * and system state changes to connected clients
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeMonitor = void 0;
const ws_1 = __importDefault(require("ws"));
const uuid_1 = require("uuid");
const DEFAULT_RT_CONFIG = {
    port: 3002,
    heartbeatIntervalMs: 30000,
    connectionTimeoutMs: 60000,
    maxConnections: 100,
};
class RealTimeMonitor {
    wss = null;
    config;
    connections = new Map();
    activityTracker;
    cellVisualizer;
    agents = new Map();
    updateInterval = null;
    heartbeatInterval = null;
    constructor(activityTracker, cellVisualizer, config = {}) {
        this.config = { ...DEFAULT_RT_CONFIG, ...config };
        this.activityTracker = activityTracker;
        this.cellVisualizer = cellVisualizer;
    }
    /**
     * Start the WebSocket server
     */
    start() {
        return new Promise((resolve, reject) => {
            try {
                this.wss = new ws_1.default.Server({ port: this.config.port });
                this.wss.on('connection', (socket, request) => {
                    this.handleConnection(socket, request);
                });
                this.wss.on('error', (error) => {
                    console.error('WebSocket server error:', error);
                    reject(error);
                });
                this.wss.on('listening', () => {
                    console.log(`Real-time monitor started on port ${this.config.port}`);
                    // Start heartbeat interval
                    this.heartbeatInterval = setInterval(() => {
                        this.performHeartbeat();
                    }, this.config.heartbeatIntervalMs);
                    // Start update interval
                    this.updateInterval = setInterval(() => {
                        this.broadcastStateUpdate();
                    }, 100); // 10 FPS
                    resolve();
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Stop the WebSocket server
     */
    stop() {
        return new Promise((resolve) => {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            if (this.wss) {
                this.wss.close(() => {
                    console.log('Real-time monitor stopped');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Register an agent for monitoring
     */
    registerAgent(agent) {
        this.agents.set(agent.id, agent);
        this.activityTracker.registerAgent(agent);
        this.broadcast({
            type: 'agent_update',
            payload: {
                action: 'registered',
                agentId: agent.id,
                state: agent.getState(),
            },
        });
    }
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId) {
        this.agents.delete(agentId);
        this.activityTracker.unregisterAgent(agentId);
        this.broadcast({
            type: 'agent_update',
            payload: {
                action: 'unregistered',
                agentId,
            },
        });
    }
    /**
     * Broadcast agent activity
     */
    broadcastActivity(activity) {
        this.broadcast({
            type: 'activity_update',
            payload: activity,
        }, this.filterByActivity.bind(this, activity));
    }
    /**
     * Broadcast cell update
     */
    broadcastCellUpdate(cellId, update) {
        this.broadcast({
            type: 'cell_update',
            payload: {
                cellId,
                update,
                timestamp: Date.now(),
            },
        }, this.filterByCell.bind(this, cellId));
    }
    /**
     * Get current state
     */
    getCurrentState() {
        const agents = this.activityTracker.getAllAgentSnapshots();
        const cells = this.cellVisualizer.getAllCells();
        const activities = this.activityTracker.getActivities();
        return {
            agents,
            cells,
            activities,
            provenance: new Map(), // Populated on demand
            timestamp: Date.now(),
        };
    }
    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.connections.size;
    }
    /**
     * Get connection statistics
     */
    getStats() {
        let activeConnections = 0;
        let totalSubscriptions = 0;
        this.connections.forEach(conn => {
            if (conn.isAlive)
                activeConnections++;
            totalSubscriptions += conn.subscriptions.size;
        });
        return {
            totalConnections: this.connections.size,
            activeConnections,
            totalSubscriptions,
            messagesPerSecond: 0, // Would need to track this
        };
    }
    // Private methods
    handleConnection(socket, _request) {
        if (this.connections.size >= this.config.maxConnections) {
            socket.close(1013, 'Maximum connections reached');
            return;
        }
        const clientId = (0, uuid_1.v4)();
        const connection = {
            id: clientId,
            socket,
            subscriptions: new Map(),
            lastActivity: Date.now(),
            isAlive: true,
        };
        this.connections.set(clientId, connection);
        console.log(`Client connected: ${clientId}`);
        // Send initial state
        this.sendToClient(clientId, {
            type: 'state_sync',
            payload: this.getCurrentState(),
        });
        socket.on('message', (data) => {
            this.handleMessage(clientId, data);
        });
        socket.on('close', () => {
            this.connections.delete(clientId);
            console.log(`Client disconnected: ${clientId}`);
        });
        socket.on('pong', () => {
            const conn = this.connections.get(clientId);
            if (conn) {
                conn.isAlive = true;
                conn.lastActivity = Date.now();
            }
        });
        socket.on('error', (error) => {
            console.error(`Client ${clientId} error:`, error);
        });
    }
    handleMessage(clientId, data) {
        const connection = this.connections.get(clientId);
        if (!connection)
            return;
        connection.lastActivity = Date.now();
        try {
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case 'subscription':
                    this.handleSubscription(clientId, message.payload);
                    break;
                case 'unsubscription':
                    this.handleUnsubscription(clientId, message.payload);
                    break;
                case 'playback_control':
                    this.handlePlaybackControl(clientId, message.payload);
                    break;
                default:
                    console.warn(`Unknown message type: ${message.type}`);
            }
        }
        catch (error) {
            console.error(`Failed to parse message from ${clientId}:`, error);
        }
    }
    handleSubscription(clientId, filter) {
        const connection = this.connections.get(clientId);
        if (!connection)
            return;
        const subscriptionId = (0, uuid_1.v4)();
        const subscription = {
            id: subscriptionId,
            clientId,
            filters: filter,
        };
        connection.subscriptions.set(subscriptionId, subscription);
        this.sendToClient(clientId, {
            type: 'subscription',
            payload: { subscriptionId, confirmed: true },
        });
    }
    handleUnsubscription(clientId, payload) {
        const connection = this.connections.get(clientId);
        if (!connection)
            return;
        connection.subscriptions.delete(payload.subscriptionId);
        this.sendToClient(clientId, {
            type: 'unsubscription',
            payload: { subscriptionId: payload.subscriptionId, confirmed: true },
        });
    }
    handlePlaybackControl(clientId, payload) {
        // Handle playback control messages
        this.sendToClient(clientId, {
            type: 'playback_control',
            payload: { ...payload, timestamp: Date.now() },
        });
    }
    broadcast(message, filter) {
        const fullMessage = {
            ...message,
            timestamp: Date.now(),
        };
        const messageStr = JSON.stringify(fullMessage);
        this.connections.forEach((connection) => {
            if (connection.socket.readyState === ws_1.default.OPEN) {
                if (!filter || filter(connection)) {
                    connection.socket.send(messageStr);
                }
            }
        });
    }
    sendToClient(clientId, message) {
        const connection = this.connections.get(clientId);
        if (!connection || connection.socket.readyState !== ws_1.default.OPEN)
            return;
        const fullMessage = {
            ...message,
            timestamp: Date.now(),
        };
        connection.socket.send(JSON.stringify(fullMessage));
    }
    broadcastStateUpdate() {
        // Only broadcast if there are active connections
        if (this.connections.size === 0)
            return;
        const state = this.getCurrentState();
        this.broadcast({
            type: 'state_sync',
            payload: state,
        });
    }
    performHeartbeat() {
        const now = Date.now();
        this.connections.forEach((connection, clientId) => {
            if (!connection.isAlive || now - connection.lastActivity > this.config.connectionTimeoutMs) {
                connection.socket.terminate();
                this.connections.delete(clientId);
                return;
            }
            connection.isAlive = false;
            connection.socket.ping();
        });
    }
    filterByActivity(activity, connection) {
        if (connection.subscriptions.size === 0)
            return true;
        for (const subscription of connection.subscriptions.values()) {
            const { filters } = subscription;
            if (filters.agentIds && !filters.agentIds.includes(activity.agentId))
                continue;
            if (filters.activityTypes && !filters.activityTypes.includes(activity.type))
                continue;
            if (filters.zones && activity.zone && !filters.zones.includes(activity.zone))
                continue;
            return true;
        }
        return false;
    }
    filterByCell(cellId, connection) {
        if (connection.subscriptions.size === 0)
            return true;
        for (const subscription of connection.subscriptions.values()) {
            const { filters } = subscription;
            if (filters.cellIds && filters.cellIds.includes(cellId))
                return true;
        }
        return false;
    }
}
exports.RealTimeMonitor = RealTimeMonitor;
exports.default = RealTimeMonitor;
//# sourceMappingURL=RealTimeMonitor.js.map