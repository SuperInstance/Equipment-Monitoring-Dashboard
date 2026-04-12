"use strict";
/**
 * ActivityTracker - Tracks agent activity and thinking states
 *
 * Monitors and records all agent activities including thinking processes,
 * equipment changes, and task processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
const types_1 = require("./types");
const DEFAULT_CONFIG = {
    maxActivitiesStored: 1000,
    thinkingTimeoutMs: 30000,
    trackThoughtProcess: true,
};
class ActivityTracker {
    activities = [];
    thinkingStates = new Map();
    agentSnapshots = new Map();
    config;
    subscribers = new Set();
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Register an agent for tracking
     */
    registerAgent(agent) {
        const snapshot = this.createAgentSnapshot(agent);
        this.agentSnapshots.set(agent.id, snapshot);
        this.recordActivity({
            agentId: agent.id,
            type: 'idle',
            description: 'Agent registered for monitoring',
            details: { state: agent.getState() },
        });
    }
    /**
     * Unregister an agent from tracking
     */
    unregisterAgent(agentId) {
        this.agentSnapshots.delete(agentId);
        this.thinkingStates.delete(agentId);
        this.recordActivity({
            agentId,
            type: 'idle',
            description: 'Agent unregistered from monitoring',
            details: {},
        });
    }
    /**
     * Start tracking a thinking process
     */
    startThinking(agentId, thought) {
        const thinkingState = {
            isThinking: true,
            currentThought: thought,
            thoughtProcess: [{
                    step: 1,
                    description: thought,
                    timestamp: Date.now(),
                }],
            startedAt: Date.now(),
        };
        this.thinkingStates.set(agentId, thinkingState);
        this.recordActivity({
            agentId,
            type: 'thinking',
            description: `Started thinking: ${thought.substring(0, 100)}...`,
            details: { thought, step: 1 },
        });
    }
    /**
     * Add a thought step to the thinking process
     */
    addThoughtStep(agentId, description, confidence) {
        const state = this.thinkingStates.get(agentId);
        if (!state || !state.isThinking)
            return;
        const step = {
            step: state.thoughtProcess.length + 1,
            description,
            timestamp: Date.now(),
            confidence,
        };
        state.thoughtProcess.push(step);
        state.currentThought = description;
        if (this.config.trackThoughtProcess) {
            this.recordActivity({
                agentId,
                type: 'thinking',
                description: `Thought step ${step.step}: ${description.substring(0, 80)}...`,
                details: { step: step.step, description, confidence },
                confidence,
                zone: confidence !== undefined ? (0, types_1.getConfidenceZone)(confidence) : undefined,
            });
        }
    }
    /**
     * End the thinking process
     */
    endThinking(agentId, conclusion) {
        const state = this.thinkingStates.get(agentId);
        if (!state)
            return;
        state.isThinking = false;
        state.currentThought = conclusion;
        const duration = Date.now() - (state.startedAt || 0);
        this.recordActivity({
            agentId,
            type: 'thinking',
            description: `Finished thinking after ${duration}ms`,
            details: {
                conclusion,
                duration,
                totalSteps: state.thoughtProcess.length,
            },
        });
    }
    /**
     * Track task processing start
     */
    startTaskProcessing(agentId, task) {
        this.recordActivity({
            agentId,
            type: 'processing',
            description: `Processing task: ${task.type}`,
            details: {
                taskId: task.id,
                taskType: task.type,
                query: task.query,
                stakes: task.stakes,
                urgency: task.urgencyMs,
            },
        });
    }
    /**
     * Track task processing completion
     */
    endTaskProcessing(agentId, result) {
        this.recordActivity({
            agentId,
            type: 'processing',
            description: `Task completed with confidence: ${result.confidence.toFixed(3)}`,
            details: {
                taskId: result.taskId,
                confidence: result.confidence,
                zone: result.zone,
                processingTime: result.processingTimeMs,
                equipmentUsed: result.equipmentUsed,
                calledTeacher: result.calledTeacher,
            },
            confidence: result.confidence,
            zone: result.zone,
        });
    }
    /**
     * Track equipment changes
     */
    trackEquipmentChange(agentId, equipmentName, slot, action) {
        this.recordActivity({
            agentId,
            type: action === 'equip' ? 'equipping' : 'unequipping',
            description: `${action === 'equip' ? 'Equipped' : 'Unequipped'} ${equipmentName} in ${slot} slot`,
            details: { equipmentName, slot, action },
        });
    }
    /**
     * Track communication between agents
     */
    trackCommunication(fromAgentId, toAgentId, messageType, payloadSummary) {
        this.recordActivity({
            agentId: fromAgentId,
            type: 'communicating',
            description: `Sent ${messageType} to agent ${toAgentId}`,
            details: { toAgentId, messageType, payloadSummary },
        });
    }
    /**
     * Track optimization events
     */
    trackOptimization(agentId, details) {
        this.recordActivity({
            agentId,
            type: 'optimizing',
            description: 'Agent performed self-optimization',
            details,
        });
    }
    /**
     * Track errors
     */
    trackError(agentId, error, context) {
        this.recordActivity({
            agentId,
            type: 'error',
            description: `Error: ${error.message}`,
            details: {
                error: error.message,
                stack: error.stack,
                ...context,
            },
        });
    }
    /**
     * Get current thinking state for an agent
     */
    getThinkingState(agentId) {
        return this.thinkingStates.get(agentId);
    }
    /**
     * Get all current thinking states
     */
    getAllThinkingStates() {
        return new Map(this.thinkingStates);
    }
    /**
     * Get activities with optional filtering
     */
    getActivities(filter) {
        let filtered = [...this.activities];
        if (filter) {
            if (filter.agentId) {
                filtered = filtered.filter(a => a.agentId === filter.agentId);
            }
            if (filter.type) {
                filtered = filtered.filter(a => a.type === filter.type);
            }
            if (filter.since) {
                filtered = filtered.filter(a => a.timestamp >= filter.since);
            }
        }
        if (filter?.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        return filtered;
    }
    /**
     * Get agent snapshot
     */
    getAgentSnapshot(agentId) {
        return this.agentSnapshots.get(agentId);
    }
    /**
     * Get all agent snapshots
     */
    getAllAgentSnapshots() {
        return new Map(this.agentSnapshots);
    }
    /**
     * Update agent snapshot
     */
    updateAgentSnapshot(agent) {
        const snapshot = this.createAgentSnapshot(agent);
        const existing = this.agentSnapshots.get(agent.id);
        if (existing) {
            const thinkingState = this.thinkingStates.get(agent.id);
            snapshot.thinking = thinkingState || existing.thinking;
            snapshot.currentActivity = existing.currentActivity;
        }
        this.agentSnapshots.set(agent.id, snapshot);
    }
    /**
     * Subscribe to activity updates
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    /**
     * Clear all stored data
     */
    clear() {
        this.activities = [];
        this.thinkingStates.clear();
        this.agentSnapshots.clear();
    }
    /**
     * Get statistics
     */
    getStats() {
        const activitiesByType = this.activities.reduce((acc, activity) => {
            acc[activity.type] = (acc[activity.type] || 0) + 1;
            return acc;
        }, {});
        let currentlyThinking = 0;
        this.thinkingStates.forEach(state => {
            if (state.isThinking)
                currentlyThinking++;
        });
        return {
            totalActivities: this.activities.length,
            agentsTracked: this.agentSnapshots.size,
            currentlyThinking,
            activitiesByType,
        };
    }
    // Private methods
    recordActivity(activity) {
        const fullActivity = {
            ...activity,
            timestamp: Date.now(),
        };
        this.activities.push(fullActivity);
        // Trim activities if needed
        if (this.activities.length > this.config.maxActivitiesStored) {
            this.activities = this.activities.slice(-this.config.maxActivitiesStored);
        }
        // Update agent snapshot with current activity
        const snapshot = this.agentSnapshots.get(activity.agentId);
        if (snapshot) {
            snapshot.currentActivity = fullActivity;
            snapshot.lastUpdate = Date.now();
        }
        // Notify subscribers
        this.subscribers.forEach(callback => {
            try {
                callback(fullActivity);
            }
            catch (e) {
                console.error('Activity subscriber error:', e);
            }
        });
    }
    createAgentSnapshot(agent) {
        const state = agent.getState();
        const thinkingState = this.thinkingStates.get(agent.id);
        return {
            id: agent.id,
            state,
            currentActivity: {
                agentId: agent.id,
                timestamp: Date.now(),
                type: 'idle',
                description: 'Agent initialized',
                details: {},
            },
            thinking: thinkingState || {
                isThinking: false,
                thoughtProcess: [],
            },
            equippedSlots: Array.from(agent.equipment.keys()),
            cellAssignments: [],
            confidence: state.confidence,
            zone: (0, types_1.getConfidenceZone)(state.confidence),
            lastUpdate: Date.now(),
        };
    }
}
exports.ActivityTracker = ActivityTracker;
exports.default = ActivityTracker;
//# sourceMappingURL=ActivityTracker.js.map