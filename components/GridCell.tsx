import React from 'react';
import { ImageItem } from '../types';

interface GridCellProps {
    index: number;
    image?: ImageItem;
    onRemove: () => void;
    onDrop: (data: any) => void;
    onDragStart: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({ index, image, onRemove, onDrop, onDragStart }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('bg-primary/10');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-primary/10');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-primary/10');
        const dataStr = e.dataTransfer.getData('application/json');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                onDrop(data);
            } catch (err) {
                console.error('Failed to parse drop data', err);
            }
        }
    };

    if (image) {
        return (
            <div
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({
                        type: 'cell',
                        index: index,
                        id: image.id
                    }));
                    onDragStart();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative group w-full h-full rounded-md overflow-hidden bg-slate-50 border border-slate-100 shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/50 transition-all"
            >
                <img
                    className="w-full h-full object-contain pointer-events-none" // pointer-events-none prevents img drag ghosting sometimes interfering with parent div drag
                    src={image.src}
                    alt={image.alt || `Cell ${index}`}
                />
                
                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-white hover:scale-105 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:bg-white hover:scale-105 transition-all">
                        <span className="material-symbols-outlined text-[18px]">crop_rotate</span>
                    </button>
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[90%]">
                    {image.alt || 'image.jpg'}
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="grid-cell-dashed w-full h-full rounded-md flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer group"
        >
            <span className="material-symbols-outlined text-[32px] mb-2 group-hover:scale-110 transition-transform">add</span>
            <span className="text-xs font-medium">Drop image here</span>
        </div>
    );
};