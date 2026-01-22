export interface ImageItem {
    id: string;
    src: string;
    alt?: string;
    size?: number; // Size in bytes
}

export type GridType = '1x1' | '1x2' | '2x2' | '3x3';
export type Orientation = 'portrait' | 'landscape';

export interface GridConfig {
    layout: GridType;
    gap: number; // px
    margin: number; // px
    compression: number; // %
    orientation: Orientation;
}

export interface DragItem {
    type: 'unplaced' | 'cell';
    index: number; // Index in unplaced array OR cell index
    id: string;
}
