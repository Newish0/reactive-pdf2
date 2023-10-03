import { Theme } from "react-daisyui";
import { twMerge } from "tailwind-merge";

interface ThemeItemProps {
    theme: string;
    selected: boolean;
    onClick?: (theme: string) => void;
}

export default function ThemeItem({ theme, selected, onClick: handleClick }: ThemeItemProps) {
    return (
        <Theme
            role="button"
            aria-label="Theme select"
            aria-pressed="true"
            tabIndex={0}
            dataTheme={theme}
            onClick={() => {
                if (handleClick) handleClick(theme);
            }}
            className={twMerge(
                "border border-base-content/20 hover:border-base-content/40 outline-base-content overflow-hidden rounded-md",
                selected ? "outline outline-2 outline-primary" : ""
            )}
        >
            <div className="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                <div className="grid grid-cols-5 grid-rows-3">
                    <div className="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
                    <div className="bg-base-300 col-start-1 row-start-3"></div>
                    <div className="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
                        <div className="font-bold">{theme}</div>
                        <div className="flex flex-wrap gap-1">
                            <div className="bg-primary flex aspect-square w-5 items-center justify-center rounded-box lg:w-6">
                                <div className="text-primary-content text-sm font-bold">A</div>
                            </div>
                            <div className="bg-secondary flex aspect-square w-5 items-center justify-center rounded-box lg:w-6">
                                <div className="text-primary-content text-sm font-bold">A</div>
                            </div>
                            <div className="bg-accent flex aspect-square w-5 items-center justify-center rounded-box lg:w-6">
                                <div className="text-primary-content text-sm font-bold">A</div>
                            </div>
                            <div className="bg-neutral flex aspect-square w-5 items-center justify-center rounded-box lg:w-6">
                                <div className="text-primary-content text-sm font-bold">A</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Theme>
    );
}

ThemeItem.defaultProps = {
    selected: false,
};