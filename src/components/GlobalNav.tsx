import { TbApps, TbLayoutSidebarLeftExpand, TbSettings } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export default function GlobalNav({ children }: React.PropsWithChildren) {
    return (
        <div className="drawer drawer-end lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <div className="m-0">{children}</div>

                <label
                    htmlFor="my-drawer-2"
                    className="btn btn-primary btn-square absolute right-0 top-0 m-6 drawer-button lg:hidden"
                >
                    <TbLayoutSidebarLeftExpand className="text-2xl" />
                </label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <SideMenu />
            </div>
        </div>
    );
}

function SideMenu() {
    return (
        <ul className="menu bg-base-200 min-h-full text-base-content gap-1">
            <li>
                <NavLink
                    className={({ isActive, isPending }) =>
                        twMerge(
                            "tooltip tooltip-bottom aspect-square flex align-middle",
                            isActive ? "active" : isPending ? "pending" : ""
                        )
                    }
                    data-tip="App"
                    to="/app"
                >
                    <TbApps className="text-2xl" />
                </NavLink>
            </li>
            <li>
                <NavLink
                    className={({ isActive, isPending }) =>
                        twMerge(
                            "tooltip tooltip-bottom aspect-square flex align-middle",
                            isActive ? "active" : isPending ? "pending" : ""
                        )
                    }
                    data-tip="Setting"
                    to="/settings"
                >
                    <TbSettings className="text-2xl" />
                </NavLink>
            </li>
        </ul>
    );
}
