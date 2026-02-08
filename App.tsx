import React, { useState, useMemo } from 'react';
import { UploadZone } from './components/UploadZone';
import { GridType, ImageItem } from './types';
import jsPDF from 'jspdf';

const App: React.FC = () => {
    // Simplified state
    const [layout, setLayout] = useState<GridType>('2x2');

    // Fixed values (previously configurable)
    const GAP = 8;
    const MARGIN = 16;
    const ORIENTATION = 'portrait';

    const [allImages, setAllImages] = useState<ImageItem[]>([]);

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



    const handleDownloadPDF = async () => {
        if (allImages.length === 0) {
            alert('请先上传图片');
            return;
        }

        try {
            const pageWidth = 210;
            const pageHeight = 297;

            // Convert px to mm (assuming 96 DPI)
            const pxToMm = (px: number) => px * 0.264583;
            const marginMm = pxToMm(MARGIN);
            const gapMm = pxToMm(GAP);

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

                // Calculate usable area (page - margins)
                const usableWidth = pageWidth - (marginMm * 2);
                const usableHeight = pageHeight - (marginMm * 2);

                // Calculate cell dimensions (including gaps)
                const totalGapWidth = (cols - 1) * gapMm;
                const totalGapHeight = (rows - 1) * gapMm;
                const cellWidth = (usableWidth - totalGapWidth) / cols;
                const cellHeight = (usableHeight - totalGapHeight) / rows;

                for (let cellIndex = 0; cellIndex < cellsPerPage; cellIndex++) {
                    const globalIndex = pageIndex * cellsPerPage + cellIndex;
                    const image = allImages[globalIndex];

                    if (image) {
                        const row = Math.floor(cellIndex / cols);
                        const col = cellIndex % cols;

                        // Position with margin and gap
                        const cellX = marginMm + (col * (cellWidth + gapMm));
                        const cellY = marginMm + (row * (cellHeight + gapMm));

                        try {
                            // Load image to get dimensions
                            const img = new Image();
                            img.src = image.src;
                            await new Promise((resolve) => {
                                img.onload = resolve;
                            });

                            // Calculate aspect ratio
                            const imgRatio = img.width / img.height;
                            const cellRatio = cellWidth / cellHeight;

                            let drawWidth = cellWidth;
                            let drawHeight = cellHeight;
                            let offsetX = 0;
                            let offsetY = 0;

                            // Fit image within cell while maintaining aspect ratio (object-contain)
                            if (imgRatio > cellRatio) {
                                // Image is wider - fit to width
                                drawHeight = cellWidth / imgRatio;
                                offsetY = (cellHeight - drawHeight) / 2;
                            } else {
                                // Image is taller - fit to height
                                drawWidth = cellHeight * imgRatio;
                                offsetX = (cellWidth - drawWidth) / 2;
                            }

                            pdf.addImage(
                                image.src,
                                'JPEG',
                                cellX + offsetX,
                                cellY + offsetY,
                                drawWidth,
                                drawHeight,
                                undefined,
                                'FAST'
                            );
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



    return (
        <div className="flex flex-col h-screen p-4 lg:p-8 gap-4 lg:gap-6 bg-slate-50 dark:bg-slate-900 pb-24 lg:pb-8">
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

            {/* Image List Preview */}
            {allImages.length > 0 && (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 lg:p-6 overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">已选图片 ({allImages.length})</h2>
                        <div className="text-sm text-slate-500">
                            共 {totalPages} 页 · {layout.replace('x', '×')} 布局
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {allImages.map((img, index) => (
                            <div key={img.id} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                                    <img
                                        src={img.src}
                                        alt={img.alt || `Image ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                </div>
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Download Button - Fixed at bottom on mobile */}
            {allImages.length > 0 && (
                <div className="fixed lg:relative bottom-0 left-0 right-0 p-4 lg:p-0 bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent border-t lg:border-t-0 border-slate-200 dark:border-slate-700 lg:self-center">
                    <button
                        onClick={handleDownloadPDF}
                        className="w-full lg:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[28px]">download</span>
                        下载 PDF ({totalPages} 页, {allImages.length} 张图片)
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;