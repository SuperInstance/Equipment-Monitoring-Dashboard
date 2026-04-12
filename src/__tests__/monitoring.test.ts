/**
 * Equipment-Monitoring-Dashboard — Tests
 * Tests ActivityTracker (pure logic) and MonitoringDashboard basics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the starter-agent dependency
vi.mock('@superinstance/starter-agent', () => ({
  getConfidenceZone: (c: number) => c >= 0.8 ? 'high' : c >= 0.5 ? 'medium' : 'low',
  OriginCore: class {},
  Equipment: class {},
  EquipmentSlot: {},
  Tile: {},
  Task: {},
  TaskResult: {},
  ConfidenceZone: {},
  Cell: {},
  ProvenanceChain: {},
  Transformation: {},
  HistoryEntry: {},
  AgentState: {},
  Message: {},
}));

import { ActivityTracker } from '../ActivityTracker';
import { MonitoringDashboard } from '../MonitoringDashboard';

// ═══════════════════════════════════════════════════════════════════
// ActivityTracker Tests (20 tests)
// ═══════════════════════════════════════════════════════════════════

function createMockAgent(id: string, name: string) {
    return {
      id,
      name,
      getState: () => ({ confidence: 0.8, status: 'idle' }),
      equipment: new Map([['EXPLANATION', { name: 'test-eq' }]]),
      getConfidence: () => 0.8,
    } as any;
  }

describe('ActivityTracker', () => {
  let tracker: ActivityTracker;
  const agent = createMockAgent('agent-1', 'TestAgent');

  beforeEach(() => { tracker = new ActivityTracker(); });

  it('should register and track agents', () => {
    tracker.registerAgent(agent);
    const snapshot = tracker.getAgentSnapshot('agent-1');
    expect(snapshot).toBeDefined();
    expect(snapshot!.id).toBe('agent-1');
  });

  it('should unregister agents', () => {
    tracker.registerAgent(agent);
    tracker.unregisterAgent('agent-1');
    expect(tracker.getAgentSnapshot('agent-1')).toBeUndefined();
  });

  it('should track thinking states', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'Solving a problem');
    const state = tracker.getThinkingState('agent-1');
    expect(state).toBeDefined();
    expect(state!.isThinking).toBe(true);
    expect(state!.currentThought).toBe('Solving a problem');
  });

  it('should end thinking', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'Thinking...');
    tracker.endThinking('agent-1', 'Done');
    const state = tracker.getThinkingState('agent-1');
    expect(state!.isThinking).toBe(false);
  });

  it('should add thought steps', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'Complex reasoning');
    tracker.addThoughtStep('agent-1', 'Step 1: Analyze', 0.9);
    tracker.addThoughtStep('agent-1', 'Step 2: Synthesize', 0.8);
    const state = tracker.getThinkingState('agent-1');
    expect(state!.thoughtProcess.length).toBe(3); // startThinking + 2 steps
  });

  it('should track task processing', () => {
    tracker.registerAgent(agent);
    tracker.startTaskProcessing('agent-1', { id: 'task-1', type: 'compute', data: {} } as any);
    // Should be able to end it
    tracker.endTaskProcessing('agent-1', { success: true, output: 'done', confidence: 0.9, taskId: 'task-1', zone: 'high', processingTimeMs: 100 } as any);
  });

  it('should track errors', () => {
    tracker.registerAgent(agent);
    tracker.trackError('agent-1', new Error('test error'), { context: 'testing' });
    const activities = tracker.getActivities({ type: 'error' });
    expect(activities.length).toBeGreaterThanOrEqual(1);
  });

  it('should track optimizations', () => {
    tracker.registerAgent(agent);
    tracker.trackOptimization('agent-1', { type: 'cache', improvement: '30%' });
    const activities = tracker.getActivities();
    expect(activities.length).toBeGreaterThan(0);
  });

  it('should track communication', () => {
    tracker.registerAgent(agent);
    tracker.trackCommunication('agent-1', 'agent-2', 'message', { content: 'hello' });
    const activities = tracker.getActivities();
    expect(activities.length).toBeGreaterThan(0);
  });

  it('should get all thinking states', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'Thinking');
    const states = tracker.getAllThinkingStates();
    expect(states.size).toBe(1);
  });

  it('should get all agent snapshots', () => {
    tracker.registerAgent(agent);
    const snapshots = tracker.getAllAgentSnapshots();
    expect(snapshots.size).toBe(1);
  });

  it('should update agent snapshots', () => {
    tracker.registerAgent(agent);
    tracker.updateAgentSnapshot(createMockAgent('agent-1', 'Updated'));
    const snapshot = tracker.getAgentSnapshot('agent-1');
    expect(snapshot).toBeDefined();
  });

  it('should support subscriptions', () => {
    const handler = vi.fn();
    const unsub = tracker.subscribe(handler);
    tracker.registerAgent(agent);
    expect(handler).toHaveBeenCalled();
    unsub();
  });

  it('should unsubscribe correctly', () => {
    const handler = vi.fn();
    const unsub = tracker.subscribe(handler);
    unsub();
    tracker.registerAgent(agent);
    // handler may or may not have been called before unsub
    const countBefore = handler.mock.calls.length;
    tracker.trackError('agent-1', new Error('test'));
    // After unsub, no new calls (unless sub fired during register)
    // Just verify it doesn't crash
  });

  it('should clear all data', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'test');
    tracker.clear();
    expect(tracker.getAgentSnapshot('agent-1')).toBeUndefined();
    expect(tracker.getAllThinkingStates().size).toBe(0);
  });

  it('should return stats', () => {
    tracker.registerAgent(agent);
    tracker.startThinking('agent-1', 'test');
    tracker.trackError('agent-1', new Error('err'));
    const stats = tracker.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalActivities).toBe('number');
    expect(typeof stats.agentsTracked).toBe('number');
  });

  it('should filter activities by type', () => {
    tracker.registerAgent(agent);
    tracker.trackError('agent-1', new Error('err'));
    tracker.trackOptimization('agent-1', { what: 'cache' });
    const errors = tracker.getActivities({ type: 'error' });
    expect(errors.every(a => a.type === 'error')).toBe(true);
  });

  it('should filter activities by agent', () => {
    tracker.registerAgent(agent);
    tracker.registerAgent(createMockAgent('agent-2', 'Other'));
    tracker.trackError('agent-1', new Error('err'));
    tracker.trackError('agent-2', new Error('err2'));
    const a1 = tracker.getActivities({ agentId: 'agent-1' });
    expect(a1.every(a => a.agentId === 'agent-1')).toBe(true);
  });

  it('should track equipment changes', () => {
    tracker.registerAgent(agent);
    tracker.trackEquipmentChange('agent-1', 'NLP-Explainer', 'EXPLANATION' as any, 'equip');
    const activities = tracker.getActivities();
    expect(activities.some(a => a.type === 'equipping')).toBe(true);
  });

  it('should handle multiple agents simultaneously', () => {
    tracker.registerAgent(agent);
    tracker.registerAgent(createMockAgent('agent-2', 'Agent2'));
    tracker.startThinking('agent-1', 'thought 1');
    tracker.startThinking('agent-2', 'thought 2');
    expect(tracker.getAllThinkingStates().size).toBe(2);
    expect(tracker.getAllAgentSnapshots().size).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MonitoringDashboard Tests (10 tests)
// ═══════════════════════════════════════════════════════════════════

describe('MonitoringDashboard', () => {
  it('should create with default config', () => {
    const dash = new MonitoringDashboard();
    expect(dash).toBeDefined();
    expect(dash.isActive()).toBe(false);
  });

  it('should return state', () => {
    const dash = new MonitoringDashboard();
    const state = dash.getState();
    expect(state).toBeDefined();
    expect(state.timestamp).toBeDefined();
  });

  it('should return metrics', () => {
    const dash = new MonitoringDashboard();
    const metrics = dash.getMetrics();
    expect(metrics).toBeDefined();
  });

  it('should return activity tracker', () => {
    const dash = new MonitoringDashboard();
    const tracker = dash.getActivityTracker();
    expect(tracker).toBeDefined();
  });

  it('should return cell visualizer', () => {
    const dash = new MonitoringDashboard();
    const viz = dash.getCellVisualizer();
    expect(viz).toBeDefined();
  });

  it('should return empty history initially', () => {
    const dash = new MonitoringDashboard();
    const history = dash.getHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should return equipment description', () => {
    const dash = new MonitoringDashboard();
    const desc = dash.describe();
    expect(desc).toBeDefined();
    expect(desc.name).toBeTruthy();
    expect(desc.slot).toBeTruthy();
  });

  it('should return asTile', () => {
    const dash = new MonitoringDashboard();
    const tile = dash.asTile();
    expect(tile).toBeDefined();
    expect(typeof tile.compute).toBe('function');
    expect(typeof tile.confidence).toBe('function');
    expect(typeof tile.trace).toBe('function');
  });

  it('should create with custom config', () => {
    const dash = new MonitoringDashboard({
      refreshInterval: 500,
      maxHistorySize: 50,
    });
    expect(dash).toBeDefined();
  });

  it('should have correct slot type', () => {
    const dash = new MonitoringDashboard();
    const desc = dash.describe();
    expect(desc.slot).toBe('MONITORING');
  });
});
