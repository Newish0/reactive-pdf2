import { Divider } from "react-daisyui";

export enum SettingsOptionPosition {
    Right,
    Bottom,
}

interface SettingsOptionProps extends React.PropsWithChildren {
    title: string;
    description?: string;
    icon: React.ReactElement;
    position: SettingsOptionPosition;
}

export default function SettingsOption({
    children,
    title,
    icon,
    description,
    position,
}: SettingsOptionProps) {
    return (
        <div>
            <div className="flex flex-row items-center gap-4">
                <div className="text-2xl">{icon}</div>

                <div className="prose prose-sm">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>

                {position === SettingsOptionPosition.Right && (
                    <div className="flex-grow">{children}</div>
                )}
            </div>

            {position === SettingsOptionPosition.Bottom && (
                <>
                    <Divider />
                    <div className="flex-grow px-4">{children}</div>
                </>
            )}
        </div>
    );
}

SettingsOption.defaultProps = {
    position: SettingsOptionPosition.Right,
};
