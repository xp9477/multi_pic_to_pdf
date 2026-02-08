import React, { useState, useMemo } from 'react';
import { UploadZone } from './components/UploadZone';
import { GridCell } from './components/GridCell';
import { GridConfig, ImageItem, DragItem, GridType } from './types';
import jsPDF from 'jspdf';

const App: React.FC = () => {
    // Simplified state
    const [layout, setLayout] = useState<GridType>('2x2');

    // Fixed values (previously configurable)
    const GAP = 8;
    const MARGIN = 16;
    const ORIENTATION = 'portrait';

    const [allImages, setAllImages] = useState<ImageItem[]>([]);
    const [draggingItem, setDraggingItem] = useState<DragItem | null>(null);

    // Grid Calculation
    const getGridDimensions = () => {
        switch (layout) {
            case '1x1': return { rows: 1, cols: 1 };
            case '1x2': return { rows: 2, cols: 1 };
            case '2x1': return { rows: 1, cols: 2 };
            case '2x2': return { rows: 2, cols: 2 };
            case '3x3': return { rows: 3, cols: 3 };
            default: return { rows: 2, cols: 2 };
        }
    };

    const { rows, cols } = getGridDimensions();
    const cellsPerPage = rows * cols;
    const totalPages = Math.max(1, Math.ceil(allImages.length / cellsPerPage));

    // Handlers
    const handleAddImages = (files: FileList) => {
        const newImages: ImageItem[] = [];
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img: ImageItem = {
                    id: `${Date.now()}-${Math.random()}`,
                    src: e.target?.result as string,
                    alt: file.name,
                    size: file.size
                };
                setAllImages(prev => [...prev, img]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setAllImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        if (confirm('确定要清空所有图片吗？')) {
            setAllImages([]);
        }
    };

    const handleDragStart = (item: DragItem) => {
        setDraggingItem(item);
    };

    const handleCellDrop = (targetIndex: number, data: any) => {
        if (data.type === 'cell' && data.index !== targetIndex) {
            // Swap images
            setAllImages(prev => {
                const newImages = [...prev];
                const temp = newImages[data.index];
                newImages[data.index] = newImages[targetIndex];
                newImages[targetIndex] = temp;
                return newImages;
            });
        }
    };

    const handleDownloadPDF = async () => {
        if (allImages.length === 0) {
            alert('请先上传图片');
            return;
        }

        try {
            const pageWidth = 210;
            const pageHeight = 297;

            const pdf = new jsPDF({
                orientation: ORIENTATION,
                unit: 'mm',
                format: 'a4'
            });

            let isFirstPage = true;

            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                if (!isFirstPage) {
                    pdf.addPage();
                }
                isFirstPage = false;

                const cellWidth = pageWidth / cols;
                const cellHeight = pageHeight / rows;

                for (let cellIndex = 0; cellIndex < cellsPerPage; cellIndex++) {
                    const globalIndex = pageIndex * cellsPerPage + cellIndex;
                    const image = allImages[globalIndex];

                    if (image) {
                        const row = Math.floor(cellIndex / cols);
                        const col = cellIndex % cols;
                        const x = col * cellWidth;
                        const y = row * cellHeight;

                        try {
                            pdf.addImage(image.src, 'JPEG', x, y, cellWidth, cellHeight, undefined, 'FAST');
                        } catch (err) {
                            console.error('Failed to add image:', err);
                        }
                    }
                }
            }

            pdf.save('grid-layout.pdf');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('生成PDF失败，请重试');
        }
    };

    // Grid CSS class
    const getGridClass = () => {
        let cls = 'grid w-full h-full ';
        if (layout === '1x1') cls += 'grid-cols-1 grid-rows-1';
        else if (layout === '1x2') cls += 'grid-cols-1 grid-rows-2';
        else if (layout === '2x1') cls += 'grid-cols-2 grid-rows-1';
        else if (layout === '2x2') cls += 'grid-cols-2 grid-rows-2';
        else if (layout === '3x3') cls += 'grid-cols-3 grid-rows-3';
        return cls;
    };

    const gridStyle = {
        gap: `${GAP}px`,
    };

    return (
        <div className="flex flex-col h-screen p-4 lg:p-8 gap-4 lg:gap-6 bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[24px]">picture_as_pdf</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold">图片转PDF</h1>
                </div>
                {allImages.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                    >
                        清空全部
                    </button>
                )}
            </div>

            {/* Upload Zone */}
            <UploadZone
                onFilesSelected={handleAddImages}
                imageCount={allImages.length}
            />

            {/* Layout Selector */}
            {allImages.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        布局:
                    </span>
                    {(['1x1', '1x2', '2x1', '2x2', '3x3'] as GridType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setLayout(type)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${layout === type
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {type.replace('x', '×')}
                        </button>
                    ))}
                </div>
            )}

            {/* Preview Area */}
            {allImages.length > 0 && (
                <div className="flex-1 overflow-auto bg-white dark:bg-slate-800 rounded-xl p-4 lg:p-6">
                    <div className="flex flex-col gap-6 items-center">
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="relative">
                                <div className="absolute -top-3 -left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                                    第 {pageIndex + 1} 页
                                </div>
                                <div
                                    className="a4-page bg-white shadow-lg rounded-sm"
                                    style={{ padding: `${MARGIN}px` }}
                                >
                                    <div className={getGridClass()} style={gridStyle}>
                                        {Array.from({ length: cellsPerPage }).map((_, cellIndex) => {
                                            const globalIndex = pageIndex * cellsPerPage + cellIndex;
                                            const image = allImages[globalIndex];
                                            return (
                                                <GridCell
                                                    key={`cell-${globalIndex}`}
                                                    index={globalIndex}
                                                    image={image}
                                                    onRemove={() => handleRemoveImage(globalIndex)}
                                                    onDrop={(data) => handleCellDrop(globalIndex, data)}
                                                    onDragStart={() => handleDragStart({ type: 'cell', index: globalIndex, id: image?.id || '' })}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Download Button */}
            {allImages.length > 0 && (
                <button
                    onClick={handleDownloadPDF}
                    className="w-full lg:w-auto lg:self-center px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                    <span className="material-symbols-outlined text-[28px]">download</span>
                    下载 PDF ({totalPages} 页, {allImages.length} 张图片)
                </button>
            )}
        </div>
    );
};

export default App;