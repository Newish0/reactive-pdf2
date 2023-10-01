import { ReactElement, useEffect, useState } from "react";
import { Menu } from "react-daisyui";
import { twMerge } from "tailwind-merge";

interface ContextMenuProps extends React.PropsWithChildren {
    menuItems?:
        | ReactElement<typeof Menu | typeof Menu.Item>
        | Array<ReactElement<typeof Menu | typeof Menu.Item>>;

    show: boolean;
    highlightSource: boolean;
}

export default function ContextMenu({
    children,
    menuItems,
    show,
    highlightSource,
}: ContextMenuProps) {
    const [contextMenuOpen, setContextMenuOpen] = useState(show);

    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setContextMenuOpen(show);
    }, [show]);

    useEffect(() => {
        if (contextMenuOpen) {
            // Add an event listener to detect clicks outside the context menu
            document.addEventListener("click", handleContextMenuClose);
            document.addEventListener("auxclick", handleContextMenuClose);
        } else {
            // Remove the event listener when the context menu is closed
            document.removeEventListener("click", handleContextMenuClose);
            document.removeEventListener("auxclick", handleContextMenuClose);
        }

        // Clean up the event listener when the component is unmounted
        return () => {
            document.removeEventListener("click", handleContextMenuClose);
            document.removeEventListener("auxclick", handleContextMenuClose);
        };
    }, [contextMenuOpen]);

    const handleContextMenu = (evt?: React.MouseEvent<HTMLDivElement>) => {
        evt?.preventDefault();
        evt?.stopPropagation();

        if (evt) {
            setAnchorPoint({
                x: evt.clientX,
                y: evt.clientY,
            });
        }

        setContextMenuOpen(true);
    };

    const handleContextMenuClose = () => {
        setContextMenuOpen(false);
    };

    return (
        <>
            <div
                onContextMenu={handleContextMenu}
                className={twMerge(highlightSource && contextMenuOpen ? "animate-pulse" : "")}
            >
                {children}
            </div>

            {contextMenuOpen && (
                <div
                    className="absolute bg-base-200 rounded-box w-56 z-30 transition-opacity"
                    style={{ top: `${anchorPoint.y}px`, left: `${anchorPoint.x}px` }}
                >
                    {menuItems}
                </div>
            )}
        </>
    );
}

ContextMenu.defaultProps = {
    show: false,
    highlightSource: false,
};
