import { useAppSettings } from "@atoms/appsettings";
import PageContainer from "@components/PageContainer";
import SectionContainer from "@components/SectionContainer";
import SettingsOption, { SettingsOptionPosition } from "@components/SettingsOption";
import ThemeItem from "@components/ThemeItem";
import { setGlobalTheme } from "@util/appearance";
import { useEffect } from "react";
import { useTheme } from "react-daisyui";
import { TbPalette } from "react-icons/tb";

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
