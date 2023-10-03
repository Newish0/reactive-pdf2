import React from "react";
import ReactDOM from "react-dom/client";
import Root from "@routes/Root.tsx";

import "./index.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import ErrorPage from "@routes/ErrorPage";
import App from "@routes/App";
import Settings from "@routes/Settings";


const router = createHashRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "app/",
                element: <App />,
            },
            {
                path: "settings/",
                element: <Settings />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
