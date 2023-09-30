import { Dispatch, SetStateAction, createContext } from "react";

export type ControlsBarSettings = {
    gridScale: number;
    selectActive: boolean;
};

type ControlsBarContextType = [
    controlSettings: ControlsBarSettings,
    setControlSettings: Dispatch<SetStateAction<ControlsBarSettings>>
];

const ControlsBarContext = createContext<ControlsBarContextType>([
    { gridScale: 0, selectActive: false },
    () => {},
]);

export default ControlsBarContext;
