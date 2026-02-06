import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { GridCell } from './components/GridCell';
import { GridConfig, ImageItem, DragItem } from './types';
import { INITIAL_PLACED_IMAGES, INITIAL_UNPLACED_IMAGES } from './constants';
import jsPDF from 'jspdf';

const App: React.FC = () => {
    // State
    const [config, setConfig] = useState<GridConfig>({
        layout: '2x2',
        gap: 16,
        margin: 24,
        compression: 80,
        orientation: 'portrait'
    });

    const [unplacedImages, setUnplacedImages] = useState<ImageItem[]>(INITIAL_UNPLACED_IMAGES);
    const [placedImages, setPlacedImages] = useState<Record<number, ImageItem>>(INITIAL_PLACED_IMAGES);
    const [draggingItem, setDraggingItem] = useState<DragItem | null>(null);
    const [manualPageCount, setManualPageCount] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    // Grid Calculation
    const getGridDimensions = () => {
        switch (config.layout) {
            case '1x1': return { rows: 1, cols: 1 };
            case '1x2': return { rows: 2, cols: 1 }; // Stacked vertically
            case '2x1': return { rows: 1, cols: 2 }; // Side-by-side
            case '2x2': return { rows: 2, cols: 2 };
            case '3x3': return { rows: 3, cols: 3 };
            default: return { rows: 2, cols: 2 };
        }
    };

    const { rows, cols } = getGridDimensions();
    const cellsPerPage = rows * cols;

    // Calculate total pages needed based on placed images
    const totalPages = useMemo(() => {
        const maxIndex = Math.max(...Object.keys(placedImages).map(Number), -1);
        const requiredPages = Math.ceil((maxIndex + 1) / cellsPerPage);
        return Math.max(manualPageCount, requiredPages, 1);
    }, [placedImages, cellsPerPage, manualPageCount]);

    // Calculate total size of placed images for estimation
    const totalPlacedSize = useMemo(() => {
        return (Object.values(placedImages) as ImageItem[]).reduce((acc, img) => acc + (img.size || 0), 0);
    }, [placedImages]);

    // Handlers
    const handleAddImages = (files: FileList) => {
        const newImages: ImageItem[] = Array.from(files).map((file, i) => ({
            id: `new_${Date.now()}_${i}`,
            src: URL.createObjectURL(file),
            alt: file.name,
            size: file.size // Store file size
        }));
        setUnplacedImages(prev => [...prev, ...newImages]);
    };

    const handleDragStart = (item: DragItem) => {
        setDraggingItem(item);
    };

    const handleCellDrop = (targetIndex: number, data: DragItem) => {
        const sourceIndex = data.index;
        const sourceType = data.type;

        // Clone states
        const newPlaced = { ...placedImages };
        const newUnplaced = [...unplacedImages];

        if (sourceType === 'unplaced') {
            // Move from unplaced to cell
            const imageToMove = unplacedImages[sourceIndex];
            if (!imageToMove) return;

            // If target cell has image, swap it out to unplaced
            if (newPlaced[targetIndex]) {
                newUnplaced.push(newPlaced[targetIndex]);
            }

            // Remove from unplaced
            newUnplaced.splice(sourceIndex, 1);

            // Place in grid
            newPlaced[targetIndex] = imageToMove;
        } else if (sourceType === 'cell') {
            // Move from cell to cell (Swap)
            const sourceImage = newPlaced[sourceIndex];
            const targetImage = newPlaced[targetIndex];

            if (!sourceImage) return;

            newPlaced[targetIndex] = sourceImage;

            if (targetImage) {
                newPlaced[sourceIndex] = targetImage;
            } else {
                delete newPlaced[sourceIndex];
            }
        }

        setPlacedImages(newPlaced);
        setUnplacedImages(newUnplaced);
        setDraggingItem(null);
    };

    const handleRemoveFromCell = (index: number) => {
        const image = placedImages[index];
        if (image) {
            const newPlaced = { ...placedImages };
            delete newPlaced[index];
            setPlacedImages(newPlaced);
            setUnplacedImages(prev => [...prev, image]);
        }
    };

    const handleRemoveUnplaced = (index: number) => {
        setUnplacedImages(prev => {
            const newUnplaced = [...prev];
            newUnplaced.splice(index, 1);
            return newUnplaced;
        });
    };

    const handleReset = () => {
        if (confirm('Reset layout?')) {
            setPlacedImages({});
            setUnplacedImages([...INITIAL_UNPLACED_IMAGES]);
            setManualPageCount(1);
        }
    };

    const handleAutoLayout = () => {
        const allImages = [
            ...Object.entries(placedImages)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([_, img]) => img),
            ...unplacedImages
        ];

        if (allImages.length === 0) return;

        if (!confirm(`Auto layout ${allImages.length} images? This will rearrange everything.`)) return;

        const newPlaced: Record<number, ImageItem> = {};
        allImages.forEach((img, i) => {
            newPlaced[i] = img;
        });

        setPlacedImages(newPlaced);
        setUnplacedImages([]);
        setManualPageCount(1);
    };

    const handleDownloadPDF = async () => {
        try {
            // A4 size in mm
            const pageWidth = config.orientation === 'portrait' ? 210 : 297;
            const pageHeight = config.orientation === 'portrait' ? 297 : 210;

            const pdf = new jsPDF({
                orientation: config.orientation,
                unit: 'mm',
                format: 'a4'
            });

            let isFirstPage = true;

            // Loop through each page
            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                if (!isFirstPage) {
                    pdf.addPage();
                }
                isFirstPage = false;

                const startIndex = pageIndex * cellsPerPage;
                const endIndex = startIndex + cellsPerPage;

                // Calculate cell dimensions
                const cellWidth = pageWidth / cols;
                const cellHeight = pageHeight / rows;

                // Add images for this page
                for (let cellIndex = 0; cellIndex < cellsPerPage; cellIndex++) {
                    const globalIndex = startIndex + cellIndex;
                    const image = placedImages[globalIndex];

                    if (image) {
                        const row = Math.floor(cellIndex / cols);
                        const col = cellIndex % cols;
                        const x = col * cellWidth;
                        const y = row * cellHeight;

                        try {
                            // Add image to PDF
                            pdf.addImage(image.src, 'JPEG', x, y, cellWidth, cellHeight, undefined, 'FAST');
                        } catch (err) {
                            console.error('Failed to add image:', err);
                        }
                    }
                }
            }

            // Download the PDF
            pdf.save('grid-layout.pdf');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleAddPage = () => {
        setManualPageCount(prev => prev + 1);
    };

    const handleDeletePage = (pageIndex: number) => {
        if (totalPages <= 1) return;

        // Check if page has images
        const start = pageIndex * cellsPerPage;
        const end = start + cellsPerPage;
        const hasImages = Object.keys(placedImages).some(k => {
            const idx = Number(k);
            return idx >= start && idx < end;
        });

        if (hasImages && !confirm('This page contains images. Are you sure you want to delete it? Images will be moved to unplaced.')) {
            return;
        }

        const newPlaced = { ...placedImages };
        const restoredImages: ImageItem[] = [];

        // Remove images from this page
        for (let i = start; i < end; i++) {
            if (newPlaced[i]) {
                restoredImages.push(newPlaced[i]);
                delete newPlaced[i];
            }
        }

        // To "delete" the page visually and index-wise, we need to shift all subsequent images down by cellsPerPage
        const shiftedPlaced: Record<number, ImageItem> = {};
        Object.entries(newPlaced).forEach(([key, val]) => {
            const idx = Number(key);
            const image = val as ImageItem;
            if (idx < start) {
                shiftedPlaced[idx] = image;
            } else if (idx >= end) {
                shiftedPlaced[idx - cellsPerPage] = image;
            }
        });

        setPlacedImages(shiftedPlaced);
        setUnplacedImages(prev => [...prev, ...restoredImages]);
        setManualPageCount(prev => Math.max(1, prev - 1));
    };

    // Grid CSS class generator
    const getGridClass = () => {
        let cls = 'grid w-full h-full ';
        if (config.layout === '1x1') cls += 'grid-cols-1 grid-rows-1';
        else if (config.layout === '1x2') cls += 'grid-cols-1 grid-rows-2';
        else if (config.layout === '2x1') cls += 'grid-cols-2 grid-rows-1';
        else if (config.layout === '2x2') cls += 'grid-cols-2 grid-rows-2';
        else if (config.layout === '3x3') cls += 'grid-cols-3 grid-rows-3';
        return cls;
    };

    // Calculate grid cell styles
    const gridStyle = {
        gap: `${config.gap}px`,
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 bg-surface dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden w-8 h-8 -ml-1 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                        <h1 className="text-base lg:text-lg font-bold tracking-tight leading-tight">Grid Editor</h1>
                        <span className="hidden lg:inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">v2.1</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                    <button
                        onClick={handleAutoLayout}
                        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
                        title="Auto layout all images"
                    >
                        <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                        Auto Layout
                    </button>
                    <button
                        onClick={handleReset}
                        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                        Reset
                    </button>
                    <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 h-8 lg:h-9 px-3 lg:px-4 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-sm transition-all text-xs lg:text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-[18px] lg:text-[20px]">download</span>
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">PDF</span>
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden min-h-0 relative">
                <Sidebar
                    config={config}
                    setConfig={setConfig}
                    unplacedImages={unplacedImages}
                    onAddImages={handleAddImages}
                    onRemoveUnplaced={handleRemoveUnplaced}
                    onDragStart={handleDragStart}
                    totalPlacedSize={totalPlacedSize}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onAutoLayout={handleAutoLayout}
                />

                {/* Preview Area */}
                <main className="flex-1 bg-slate-100/50 dark:bg-[#1a1d21] relative overflow-auto flex flex-col items-center py-6 lg:py-10 px-3 lg:px-6 w-full">
                    {/* Status Bar */}
                    <div className="sticky top-0 z-20 mb-6 flex items-center gap-3 lg:gap-4 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-2 lg:px-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                        <span className="text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                            {totalPages} Page{totalPages > 1 ? 's' : ''}
                        </span>
                        <div className="w-px h-3 lg:h-4 bg-slate-300 dark:bg-slate-600"></div>
                        <span className="text-xs lg:text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                            {Object.keys(placedImages).length} Img
                        </span>
                    </div>

                    {/* Pages Loop */}
                    <div className="flex flex-col gap-6 lg:gap-10 pb-20 w-full items-center">
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="relative group/page max-w-full">
                                {/* Page Controls - Responsive positioning */}
                                <div className="absolute top-0 -left-10 lg:-left-16 w-8 lg:w-12 flex flex-col items-end py-2 opacity-100 xl:opacity-50 xl:group-hover/page:opacity-100 transition-opacity z-10">
                                    <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] lg:text-xs font-bold py-0.5 px-1.5 rounded mb-2">
                                        {pageIndex + 1}
                                    </div>
                                    <button
                                        onClick={() => handleDeletePage(pageIndex)}
                                        className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-red-500 shadow-sm hover:scale-110 transition-transform"
                                        title="Delete Page"
                                    >
                                        <span className="material-symbols-outlined text-[16px] lg:text-[18px]">delete</span>
                                    </button>
                                </div>

                                {/* A4 Page Container */}
                                <div
                                    className={`a4-page bg-white shadow-paper rounded-sm shrink-0 flex flex-col transition-all duration-300 ${config.orientation}`}
                                    style={{ padding: `${config.margin}px` }}
                                >
                                    {/* The Grid */}
                                    <div
                                        className={getGridClass()}
                                        style={gridStyle}
                                    >
                                        {Array.from({ length: cellsPerPage }).map((_, cellIndex) => {
                                            const globalIndex = pageIndex * cellsPerPage + cellIndex;
                                            return (
                                                <GridCell
                                                    key={`cell-${globalIndex}`}
                                                    index={globalIndex}
                                                    image={placedImages[globalIndex]}
                                                    onRemove={() => handleRemoveFromCell(globalIndex)}
                                                    onDrop={(data) => handleCellDrop(globalIndex, data)}
                                                    onDragStart={() => handleDragStart({ type: 'cell', index: globalIndex, id: placedImages[globalIndex]?.id || '' })}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div className="page-footer mt-auto pt-4 flex justify-between items-end text-[10px] text-slate-400 font-mono">
                                        <span>Grid Editor</span>
                                        <span>{pageIndex + 1}/{totalPages}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Page Button */}
                        <button
                            onClick={handleAddPage}
                            className="flex flex-col items-center justify-center gap-2 w-full max-w-[595px] h-24 lg:h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="font-semibold text-xs lg:text-sm">Add New Page</span>
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default App;