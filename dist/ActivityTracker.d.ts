/**
 * ActivityTracker - Tracks agent activity and thinking states
 *
 * Monitors and records all agent activities including thinking processes,
 * equipment changes, and task processing
 */
import type { AgentActivity, ActivityType, ThinkingState, AgentSnapshot, EquipmentSlot } from './types';
import type { OriginCore, Task, TaskResult } from '@superinstance/starter-agent';
export interface ActivityTrackerConfig {
    maxActivitiesStored: number;
    thinkingTimeoutMs: number;
    trackThoughtProcess: boolean;
}
export declare class ActivityTracker {
    private activities;
    private thinkingStates;
    private agentSnapshots;
    private config;
    private subscribers;
    constructor(config?: Partial<ActivityTrackerConfig>);
    /**
     * Register an agent for tracking
     */
    registerAgent(agent: OriginCore): void;
    /**
     * Unregister an agent from tracking
     */
    unregisterAgent(agentId: string): void;
    /**
     * Start tracking a thinking process
     */
    startThinking(agentId: string, thought: string): void;
    /**
     * Add a thought step to the thinking process
     */
    addThoughtStep(agentId: string, description: string, confidence?: number): void;
    /**
     * End the thinking process
     */
    endThinking(agentId: string, conclusion?: string): void;
    /**
     * Track task processing start
     */
    startTaskProcessing(agentId: string, task: Task): void;
    /**
     * Track task processing completion
     */
    endTaskProcessing(agentId: string, result: TaskResult): void;
    /**
     * Track equipment changes
     */
    trackEquipmentChange(agentId: string, equipmentName: string, slot: EquipmentSlot, action: 'equip' | 'unequip'): void;
    /**
     * Track communication between agents
     */
    trackCommunication(fromAgentId: string, toAgentId: string, messageType: string, payloadSummary?: string): void;
    /**
     * Track optimization events
     */
    trackOptimization(agentId: string, details: Record<string, unknown>): void;
    /**
     * Track errors
     */
    trackError(agentId: string, error: Error, context?: Record<string, unknown>): void;
    /**
     * Get current thinking state for an agent
     */
    getThinkingState(agentId: string): ThinkingState | undefined;
    /**
     * Get all current thinking states
     */
    getAllThinkingStates(): Map<string, ThinkingState>;
    /**
     * Get activities with optional filtering
     */
    getActivities(filter?: {
        agentId?: string;
        type?: ActivityType;
        since?: number;
        limit?: number;
    }): AgentActivity[];
    /**
     * Get agent snapshot
     */
    getAgentSnapshot(agentId: string): AgentSnapshot | undefined;
    /**
     * Get all agent snapshots
     */
    getAllAgentSnapshots(): Map<string, AgentSnapshot>;
    /**
     * Update agent snapshot
     */
    updateAgentSnapshot(agent: OriginCore): void;
    /**
     * Subscribe to activity updates
     */
    subscribe(callback: (activity: AgentActivity) => void): () => void;
    /**
     * Clear all stored data
     */
    clear(): void;
    /**
     * Get statistics
     */
    getStats(): {
        totalActivities: number;
        agentsTracked: number;
        currentlyThinking: number;
        activitiesByType: Record<ActivityType, number>;
    };
    private recordActivity;
    private createAgentSnapshot;
}
export default ActivityTracker;
//# sourceMappingURL=ActivityTracker.d.ts.map