import React, { useMemo } from 'react';
import { GridConfig, ImageItem, GridType, DragItem } from '../types';

interface SidebarProps {
    config: GridConfig;
    setConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
    unplacedImages: ImageItem[];
    onAddImages: (files: FileList) => void;
    onRemoveUnplaced: (index: number) => void;
    onDragStart: (item: DragItem) => void;
    totalPlacedSize: number;
    isOpen: boolean;
    onClose: () => void;
    onAutoLayout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    config,
    setConfig,
    unplacedImages,
    onAddImages,
    onRemoveUnplaced,
    onDragStart,
    totalPlacedSize,
    isOpen,
    onClose,
    onAutoLayout
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddImages(e.target.files);
        }
    };

    const updateConfig = (key: keyof GridConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // Estimate PDF size based on image sizes and compression
    const estimatedSize = useMemo(() => {
        if (totalPlacedSize === 0) return '0 B';

        // Heuristic: Compression isn't linear. 
        // 100% ~ original size
        // 80% ~ 40-50% size typically for photos
        // 50% ~ 10-15% size
        // Formula: size * (0.05 + 0.95 * (quality/100)^2)
        const factor = 0.05 + 0.95 * Math.pow(config.compression / 100, 2);
        const bytes = totalPlacedSize * factor;

        if (bytes < 1024) return Math.round(bytes) + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }, [totalPlacedSize, config.compression]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-80 bg-surface dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 
                    flex flex-col shrink-0 h-full overflow-y-auto 
                    transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-slate-800 dark:text-white">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Add Images Section */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">add_photo_alternate</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Add Images</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag & drop or click</p>
                    </div>
                </div>

                {/* Configuration Options */}
                <div className="p-5 flex flex-col gap-8">
                    {/* Layout Grid */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Layout Grid</h3>
                            <span className="text-xs text-slate-500 font-mono">{config.layout}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(['1x1', '1x2', '2x1', '2x2', '3x3'] as GridType[]).map((type) => (
                                <label key={type} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="grid"
                                        className="peer sr-only"
                                        checked={config.layout === type}
                                        onChange={() => updateConfig('layout', type)}
                                    />
                                    <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                                        <span className="material-symbols-outlined text-[20px]">
                                            {type === '1x1' ? 'crop_portrait' :
                                                type === '1x2' ? 'grid_view' :
                                                    type === '2x1' ? 'splitscreen' :
                                                        type === '2x2' ? 'window' : 'view_module'}
                                        </span>
                                        <span className="text-sm font-medium">{type}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Spacing Slider */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cell Gap</h3>
                            <span className="text-xs text-slate-500 font-mono">{config.gap}px</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">space_bar</span>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={config.gap}
                                onChange={(e) => updateConfig('gap', Number(e.target.value))}
                                className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Margin Slider */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Page Margin</h3>
                            <span className="text-xs text-slate-500 font-mono">{config.margin}px</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">margin</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={config.margin}
                                onChange={(e) => updateConfig('margin', Number(e.target.value))}
                                className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Compression */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Compression (JPEG)</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">Est. {estimatedSize}</span>
                                <span className="text-xs text-slate-500 font-mono">{config.compression}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">photo_size_select_large</span>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={config.compression}
                                onChange={(e) => updateConfig('compression', Number(e.target.value))}
                                className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Orientation Toggle */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Orientation</h3>
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <button
                                onClick={() => updateConfig('orientation', 'portrait')}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold shadow-sm transition-colors ${config.orientation === 'portrait' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                Portrait
                            </button>
                            <button
                                onClick={() => updateConfig('orientation', 'landscape')}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold shadow-sm transition-colors ${config.orientation === 'landscape' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                Landscape
                            </button>
                        </div>
                    </div>
                </div>

                {/* Holding Area (Mini Gallery) */}
                <div className="mt-auto p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Unplaced Images</h4>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onAutoLayout}
                                className="text-[10px] font-bold text-primary hover:text-primary-dark uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={unplacedImages.length === 0 && totalPlacedSize === 0}
                                title="Automatically place all images"
                            >
                                Auto Fill
                            </button>
                            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">{unplacedImages.length}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 min-h-[70px]">
                        {unplacedImages.map((img, index) => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                        type: 'unplaced',
                                        index: index,
                                        id: img.id
                                    }));
                                    e.dataTransfer.effectAllowed = 'move';
                                    onDragStart({ type: 'unplaced', index, id: img.id });
                                }}
                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative group cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                            >
                                <img className="w-full h-full object-cover" src={img.src} alt={img.alt || 'Unplaced'} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveUnplaced(index);
                                    }}
                                    className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        ))}
                        {unplacedImages.length === 0 && (
                            <div className="w-full h-16 flex items-center justify-center text-xs text-slate-400 italic">
                                Empty
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};
