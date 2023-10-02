import { Menu } from "react-daisyui";
import { TbFileX, TbPhotoDown } from "react-icons/tb";

interface GridItemMenuProps {
    onDelete?: () => void;
    onExportPageAsImage?: () => void;
}

export default function GridItemMenu({
    onDelete: handleDelete,
    onExportPageAsImage: handleExportPageAsImage,
}: GridItemMenuProps) {
    return (
        <Menu>
            <Menu.Item onClickCapture={handleDelete}>
                <span>
                    <TbFileX /> Delete
                </span>
            </Menu.Item>
            <Menu.Item onClickCapture={handleExportPageAsImage}>
                <span>
                    <TbPhotoDown /> Export page as image
                </span>
            </Menu.Item>
        </Menu>
    );
}
