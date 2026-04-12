"use strict";
/**
 * Types for Equipment-Monitoring-Dashboard
 *
 * Real-time visualization types for agent monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DASHBOARD_CONFIG = exports.DEFAULT_THEME = exports.getConfidenceZone = void 0;
var starter_agent_1 = require("@superinstance/starter-agent");
Object.defineProperty(exports, "getConfidenceZone", { enumerable: true, get: function () { return starter_agent_1.getConfidenceZone; } });
exports.DEFAULT_THEME = {
    colors: {
        green: '#22c55e',
        yellow: '#eab308',
        red: '#ef4444',
        background: '#0f172a',
        text: '#f8fafc',
        accent: '#3b82f6',
    },
    cellSize: 40,
    animationDuration: 300,
    showGridLines: true,
};
exports.DEFAULT_DASHBOARD_CONFIG = {
    port: 3001,
    host: 'localhost',
    updateIntervalMs: 100,
    maxActivitiesStored: 1000,
    enablePlayback: true,
    playbackMaxEntries: 10000,
};
//# sourceMappingURL=types.js.map