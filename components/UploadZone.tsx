import React from 'react';

interface UploadZoneProps {
    onFilesSelected: (files: FileList) => void;
    imageCount: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, imageCount }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative border-2 border-dashed rounded-xl p-4 lg:p-6 
                cursor-pointer transition-all duration-200
                ${isDragging
                    ? 'border-primary bg-primary/5 scale-[0.98]'
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[32px] lg:text-[36px]">
                        add_photo_alternate
                    </span>
                </div>

                <div>
                    <h3 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                        点击上传图片
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        或拖拽图片到此处
                    </p>
                </div>

                {imageCount > 0 && (
                    <div className="mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        已选择 {imageCount} 张图片
                    </div>
                )}
            </div>
        </div>
    );
};
