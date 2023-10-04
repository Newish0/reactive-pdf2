import React, { useState, DragEvent } from "react";
import { TbFilePlus } from "react-icons/tb";
import { twMerge } from "tailwind-merge";

interface FileDropProps extends React.PropsWithChildren {
    onDrop: (files: FileList) => void;
    indicateDragOver: boolean;
}

const FileDrop: React.FC<FileDropProps> = ({ onDrop, indicateDragOver, children }) => {
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const { files } = e.dataTransfer;
        onDrop(files);
    };

    return (
        <div
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div>{children}</div>

            {indicateDragOver && (
                <div
                    className={twMerge(
                        "absolute w-full h-full left-0 top-0 rounded-box pointer-events-none z-20 transition-all flex items-center justify-center opacity-0",
                        dragging
                            ? "opacity-1 border border-primary backdrop-blur-sm backdrop-brightness-75"
                            : "border-transparent"
                    )}
                >
                    <div className="prose prose-sm text-center animate-bounce text-primary-content">
                        <h2 className="flex items-center gap-2">
                            Drop to add file <TbFilePlus className="inline text-2xl" />
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
};

FileDrop.defaultProps = {
    indicateDragOver: true,
};

export default FileDrop;
