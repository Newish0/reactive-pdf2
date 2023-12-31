import { TbZoomIn, TbZoomOut } from "react-icons/tb";

import { Button, Range } from "react-daisyui";
import { useContext } from "react";
import ControlsBarContext from "./ControlsBarContext";

export interface ControlsBarProps {
    gridScale: {
        min: number;
        max: number;
    };
    onDeleteSelected?: () => void;
    onScaleChange?: (newScale: number) => void;
}

export default function ControlsBar({
    gridScale,
    onDeleteSelected,
    onScaleChange,
}: ControlsBarProps) {
    const [controls, setControls] = useContext(ControlsBarContext);

    const handleScaleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newGridScale = parseFloat(evt.target.value);
        setControls((oldControls) => ({ ...oldControls, gridScale: newGridScale }));
        if (onScaleChange) onScaleChange(newGridScale);
    };

    const handleSelectActive = (active: boolean) => {
        setControls((oldControls) => ({ ...oldControls, selectActive: active }));
    };

    return (
        <>
            <div className="w-1/2 flex align-middle gap-4">
                <TbZoomOut className="text-2xl" />
                <Range
                    size="sm"
                    min={gridScale.min}
                    max={gridScale.max}
                    value={controls.gridScale}
                    onChange={handleScaleChange}
                />
                <TbZoomIn className="text-2xl" />
            </div>

            <div>
                {controls.selectActive ? (
                    <>
                        {onDeleteSelected && (
                            <Button color="ghost" onClick={onDeleteSelected}>
                                <span className="text-primary">Delete Selected</span>
                            </Button>
                        )}

                        <Button color="ghost" onClick={() => handleSelectActive(false)}>
                            <b className="text-primary">Done</b>
                        </Button>
                    </>
                ) : (
                    <Button color="ghost" onClick={() => handleSelectActive(true)}>
                        <span className="text-primary">Select</span>
                    </Button>
                )}
            </div>
        </>
    );
}
