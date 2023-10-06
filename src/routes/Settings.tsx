import { useAppSettings } from "@atoms/appsettings";
import PageContainer from "@components/PageContainer";
import SectionContainer from "@components/SectionContainer";
import SettingsOption, { SettingsOptionPosition } from "@components/SettingsOption";
import ThemeItem from "@components/ThemeItem";
import { setGlobalTheme } from "@util/appearance";
import { useEffect, useState } from "react";
import { Input, Toggle, useTheme } from "react-daisyui";
import { TbEaseInOutControlPoints, TbPalette, TbZoomInArea } from "react-icons/tb";

const AVAILABLE_THEMES = ["light", "dark", "emerald", "night", "business", "cyberpunk"];

export default function Settings() {
    return (
        <PageContainer title="Settings">
            <SectionContainer className="p-4">
                <SettingsOption
                    title="Theme"
                    description="Change the appearance of the application."
                    icon={<TbPalette />}
                    position={SettingsOptionPosition.Bottom}
                >
                    <ThemeSettingControl />
                </SettingsOption>
            </SectionContainer>

            <SectionContainer className="p-4">
                <SettingsOption
                    title="Prefer Animation"
                    description="Make the app slicker at the cost of performance."
                    icon={<TbEaseInOutControlPoints />}
                    position={SettingsOptionPosition.Right}
                >
                    <PreferAnimationControl />
                </SettingsOption>
            </SectionContainer>

            <SectionContainer className="p-4">
                <SettingsOption
                    title="Zoom Scale"
                    description="Set the max and min zoom of your thumbnails."
                    icon={<TbZoomInArea />}
                    position={SettingsOptionPosition.Right}
                >
                    <GridScaleControl />
                </SettingsOption>
            </SectionContainer>
        </PageContainer>
    );
}

function ThemeSettingControl() {
    const [appSettings, setAppSettings] = useAppSettings();

    const { setTheme } = useTheme(appSettings.theme);

    useEffect(() => setTheme(appSettings.theme), [appSettings.theme, setTheme]);

    const handleThemeChange = (newTheme: string) => {
        setGlobalTheme(newTheme);
        setTheme(newTheme);
        setAppSettings({ ...appSettings, theme: newTheme });
    };

    return (
        <div className="flex flex-wrap gap-4">
            {AVAILABLE_THEMES.map((t, i) => (
                <ThemeItem
                    key={`theme_${t}_#${i}`}
                    theme={t}
                    selected={t === appSettings.theme}
                    onClick={handleThemeChange}
                ></ThemeItem>
            ))}
        </div>
    );
}

function PreferAnimationControl() {
    const [appSettings, setAppSettings] = useAppSettings();

    const handleToggle = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setAppSettings({ ...appSettings, preferAnimation: evt.target.checked });
    };

    return (
        <div className="float-right">
            <Toggle checked={appSettings.preferAnimation} onChange={handleToggle} color="primary" />
        </div>
    );
}

function GridScaleControl() {
    const [appSettings, setAppSettings] = useAppSettings();

    const [error, setError] = useState({
        min: false,
        max: false,
    });

    const [tmpScale, setTmpScale] = useState<{ min: number | string; max: number | string }>({
        ...appSettings.gridScale,
    });

    const handleSetMin = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setTmpScale((scale) => ({ ...scale, min: evt.target.value }));

        const newVal = Number(evt.target.value);

        if (isNaN(newVal) || newVal <= 0) {
            setError((err) => ({ ...err, min: true }));
            return;
        }

        setError((err) => ({ ...err, min: false }));
        setAppSettings({ ...appSettings, gridScale: { ...appSettings.gridScale, min: newVal } });
    };

    const handleSetMax = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setTmpScale((scale) => ({ ...scale, max: evt.target.value }));

        const newVal = Number(evt.target.value);

        if (isNaN(newVal) || newVal <= 0) {
            setError((err) => ({ ...err, max: true }));
            return;
        }

        setError((err) => ({ ...err, max: false }));
        setAppSettings({ ...appSettings, gridScale: { ...appSettings.gridScale, max: newVal } });
    };

    return (
        <div className="flex gap-4 justify-end max-sm:flex-col">
            <div className="flex w-32 component-preview items-center justify-center gap-2 font-sans">
                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Min</span>
                        {error.min && <span className="label-text-alt text-error">Invalid</span>}
                    </label>
                    <Input
                        size="sm"
                        value={tmpScale.min}
                        onChange={handleSetMin}
                        color={error.min ? "error" : "neutral"}
                    />
                </div>
            </div>

            <div className="flex w-32 component-preview items-center justify-center gap-2 font-sans">
                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Max</span>
                        {error.max && <span className="label-text-alt text-error">Invalid</span>}
                    </label>
                    <Input
                        size="sm"
                        value={tmpScale.max}
                        onChange={handleSetMax}
                        color={error.max ? "error" : "neutral"}
                    />
                </div>
            </div>
        </div>
    );
}
