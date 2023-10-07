import { ReactElement } from "react";
import { Menu } from "react-daisyui";
import { TbFileX } from "react-icons/tb";

interface GridItemMenuProps {
    onDelete?: () => void;
    additionalItems?:
        | ReactElement<typeof Menu | typeof Menu.Item>
        | Array<ReactElement<typeof Menu | typeof Menu.Item>>;
}

export default function GridItemMenu({
    onDelete: handleDelete,
    additionalItems,
}: GridItemMenuProps) {
    return (
        <Menu>
            <Menu.Item onClickCapture={handleDelete}>
                <span>
                    <TbFileX /> Delete
                </span>
            </Menu.Item>

            {additionalItems}
        </Menu>
    );
}
