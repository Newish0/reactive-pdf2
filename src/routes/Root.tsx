import { Navigate, Outlet } from "react-router-dom";

import { themeChange } from "theme-change";
import { useEffect } from "react";
import GlobalNav from "@components/GlobalNav";

export default function Root() {
    useEffect(() => {
        // Initialize theme-change plugin
        themeChange(false);
    }, []);

    return (
        <>
            <div className="w-screen h-screen fixed">
                <GlobalNav>
                    <main className="m-2">
                        <Outlet />
                    </main>
                </GlobalNav>
            </div>
            <Navigate to="/app" />
        </>
    );
}
