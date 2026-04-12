/**
 * CellVisualizer - Cell state visualization for the monitoring dashboard
 *
 * Provides real-time visualization of cell states, confidence zones,
 * and agent assignments within the tile grid
 */
import type { CellVisualization, ConfidenceZone, VisualizationTheme, ProvenanceVisualization } from './types';
import type { Cell, ProvenanceChain, TileGrid } from '@superinstance/starter-agent';
export interface CellVisualizerConfig {
    theme: VisualizationTheme;
    showConfidenceOverlay: boolean;
    showAgentLabels: boolean;
    animateTransitions: boolean;
}
export declare class CellVisualizer {
    private cells;
    private grid;
    private config;
    private subscribers;
    private provenanceCache;
    constructor(config?: Partial<CellVisualizerConfig>);
    /**
     * Initialize visualizer with a tile grid
     */
    initialize(grid: TileGrid): void;
    /**
     * Update a single cell
     */
    updateCell(cellId: string, cell: Cell): void;
    /**
     * Update multiple cells
     */
    updateCells(cells: Map<string, Cell>): void;
    /**
     * Get cell visualization
     */
    getCell(cellId: string): CellVisualization | undefined;
    /**
     * Get all cell visualizations
     */
    getAllCells(): Map<string, CellVisualization>;
    /**
     * Get cells by confidence zone
     */
    getCellsByZone(zone: ConfidenceZone): CellVisualization[];
    /**
     * Get cells by agent
     */
    getCellsByAgent(agentId: string): CellVisualization[];
    /**
     * Get confidence zone statistics
     */
    getZoneStatistics(): Map<ConfidenceZone, {
        count: number;
        percentage: number;
    }>;
    /**
     * Visualize provenance chain for a cell
     */
    visualizeProvenance(cellId: string, provenance: ProvenanceChain): ProvenanceVisualization;
    /**
     * Get provenance visualization
     */
    getProvenance(cellId: string): ProvenanceVisualization | undefined;
    /**
     * Generate ASCII representation of the grid
     */
    toASCII(): string;
    /**
     * Generate HTML representation
     */
    toHTML(): string;
    /**
     * Generate JSON representation for API
     */
    toJSON(): {
        dimensions: [number, number];
        cells: Record<string, CellVisualization>;
        statistics: Record<ConfidenceZone, {
            count: number;
            percentage: number;
        }>;
    };
    /**
     * Subscribe to cell updates
     */
    subscribe(callback: (cells: Map<string, CellVisualization>) => void): () => void;
    /**
     * Clear all cells
     */
    clear(): void;
    /**
     * Update theme
     */
    setTheme(theme: Partial<VisualizationTheme>): void;
    private createCellVisualization;
    private cellToVisualization;
    private getZoneChar;
    private getZoneColor;
    private notifySubscribers;
}
export default CellVisualizer;
//# sourceMappingURL=CellVisualizer.d.ts.map