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
                relative border-2 border-dashed rounded-xl p-8 lg:p-12 
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

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[40px] lg:text-[48px]">
                        add_photo_alternate
                    </span>
                </div>

                <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        点击上传图片
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        或拖拽图片到此处
                    </p>
                </div>

                {imageCount > 0 && (
                    <div className="mt-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        已选择 {imageCount} 张图片
                    </div>
                )}
            </div>
        </div>
    );
};
