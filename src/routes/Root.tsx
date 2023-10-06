import { Navigate, Outlet } from "react-router-dom";

import { themeChange } from "theme-change";
import { useEffect } from "react";
import GlobalNav from "@components/GlobalNav";
import { useAppSettings } from "@atoms/appsettings";
import { setGlobalTheme } from "@util/appearance";

export default function Root() {
    const [appSettings] = useAppSettings();

    useEffect(() => {
        // Initialize theme-change plugin
        themeChange(false);

        // APply default theme
        setGlobalTheme(appSettings.theme);
    }, [appSettings.theme]);

    return (
        <>
            <div className="w-screen h-screen fixed">
                <GlobalNav>
                    <main>
                        <Outlet />
                    </main>
                </GlobalNav>
            </div>
            <Navigate to="/app" />
        </>
    );
}
