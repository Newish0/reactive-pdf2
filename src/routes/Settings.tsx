import { useAppSettings } from "@atoms/appsettings";
import PageContainer from "@components/PageContainer";
import SectionContainer from "@components/SectionContainer";
import SettingsOption from "@components/SettingsOption";
import { setGlobalTheme } from "@util/appearance";
import { useEffect } from "react";
import { Select, useTheme } from "react-daisyui";
import { TbPalette } from "react-icons/tb";

const AVAILABLE_THEMES = ["light", "dark", "emerald", "night", "business", "cyberpunk"];

export default function Settings() {
    const [appSettings, setAppSettings] = useAppSettings();

    return (
        <PageContainer title="Settings">
            <SectionContainer className="p-4">
                <SettingsOption
                    title="Theme"
                    description="Change the appearance of the application."
                    icon={<TbPalette />}
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

    const handleThemeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = evt.target.value;
        if (!newTheme) return;

        setGlobalTheme(newTheme);
        setTheme(newTheme);
        setAppSettings({ ...appSettings, theme: newTheme });
    };

    return (
        <Select className="w-52 float-right" onChange={handleThemeChange} value={appSettings.theme}>
            {AVAILABLE_THEMES.map((t, i) => (
                <Select.Option value={t} key={`theme_${t}_#${i}`}>
                    {t}
                </Select.Option>
            ))}
        </Select>
    );
}
