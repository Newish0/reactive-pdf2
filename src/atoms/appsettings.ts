// Import necessary modules
import { clamp } from "@util/math";
import { atom, useAtom } from "jotai";

type AppSettings = {
    theme: string;
    preferAnimation: boolean;
    gridScale: {
        min: number;
        max: number;
        current: number;
    };
};

const GRID_MIN = Math.max(100, Math.round(window.innerWidth * 0.05));
const GRID_MAX = Math.min(600, Math.round(window.innerWidth * 0.66));

const getInitialAppSettings = () => {
    // Retrieve app settings from local storage or use default values
    const settingsJSON = localStorage.getItem("appSettings");
    const settings: AppSettings = settingsJSON
        ? JSON.parse(settingsJSON)
        : {
              // Default settings go here
              theme: "night",
              preferAnimation: false,
              gridScale: {
                  min: GRID_MIN,
                  max: GRID_MAX,
                  current: (GRID_MAX - GRID_MIN) / 2,
              },
          };

    return settings;
};

/**
 * This atom is to be used/accessed using  useAppSettings
 */
const appSettingsAtom = atom<AppSettings>(getInitialAppSettings());

export const useAppSettings = () => {
    const [appSettings, setAppSettings] = useAtom(appSettingsAtom);

    // Custom setter function that updates both atom and localStorage
    const setAppSettingsWithLocalStorage = (newSettings: AppSettings) => {
        // Clamp current grid scale
        newSettings.gridScale.current = clamp(
            newSettings.gridScale.current,
            newSettings.gridScale.min,
            newSettings.gridScale.max
        );

        setAppSettings(newSettings);
        localStorage.setItem("appSettings", JSON.stringify(newSettings));
    };

    return [appSettings, setAppSettingsWithLocalStorage] as const;
};
