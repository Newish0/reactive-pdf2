// Import necessary modules
import { atom, useAtom } from "jotai";

type AppSettings = {
    theme: string;
    preferAnimation: boolean;
    gridScale: {
        min: number;
        max: number;
    };
};

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
                  min: 100,
                  max: 600,
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
        setAppSettings(newSettings);
        localStorage.setItem("appSettings", JSON.stringify(newSettings));
    };

    return [appSettings, setAppSettingsWithLocalStorage] as const;
};
