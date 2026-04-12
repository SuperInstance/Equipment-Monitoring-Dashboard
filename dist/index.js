"use strict";
/**
 * Equipment-Monitoring-Dashboard
 *
 * Real-time visualization equipment for monitoring agent activity,
 * thinking processes, and cell states in the SuperInstance ecosystem
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfidenceZone = exports.DEFAULT_DASHBOARD_CONFIG = exports.DEFAULT_THEME = exports.DashboardServer = exports.RealTimeMonitor = exports.CellVisualizer = exports.ActivityTracker = exports.MonitoringDashboard = void 0;
exports.createMonitoringDashboard = createMonitoringDashboard;
// Main equipment class
var MonitoringDashboard_1 = require("./MonitoringDashboard");
Object.defineProperty(exports, "MonitoringDashboard", { enumerable: true, get: function () { return MonitoringDashboard_1.MonitoringDashboard; } });
// Core components
var ActivityTracker_1 = require("./ActivityTracker");
Object.defineProperty(exports, "ActivityTracker", { enumerable: true, get: function () { return ActivityTracker_1.ActivityTracker; } });
var CellVisualizer_1 = require("./CellVisualizer");
Object.defineProperty(exports, "CellVisualizer", { enumerable: true, get: function () { return CellVisualizer_1.CellVisualizer; } });
var RealTimeMonitor_1 = require("./RealTimeMonitor");
Object.defineProperty(exports, "RealTimeMonitor", { enumerable: true, get: function () { return RealTimeMonitor_1.RealTimeMonitor; } });
var DashboardServer_1 = require("./DashboardServer");
Object.defineProperty(exports, "DashboardServer", { enumerable: true, get: function () { return DashboardServer_1.DashboardServer; } });
var types_1 = require("./types");
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return types_1.DEFAULT_THEME; } });
Object.defineProperty(exports, "DEFAULT_DASHBOARD_CONFIG", { enumerable: true, get: function () { return types_1.DEFAULT_DASHBOARD_CONFIG; } });
Object.defineProperty(exports, "getConfidenceZone", { enumerable: true, get: function () { return types_1.getConfidenceZone; } });
/**
 * Quick setup function to create and start a monitoring dashboard
 */
async function createMonitoringDashboard(config) {
    const dashboard = new MonitoringDashboard(config);
    await dashboard.start();
    return dashboard;
}
/**
 * Default export
 */
exports.default = MonitoringDashboard;
//# sourceMappingURL=index.js.map