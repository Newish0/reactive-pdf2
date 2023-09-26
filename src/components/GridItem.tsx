import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox, Indicator } from "react-daisyui";

interface GridItemProps {
    id: string;
    children: React.ReactNode;
    style?: React.CSSProperties;

    selectable?: boolean;
    onSelectionChange?: (id: string, isSelected: boolean) => void;
}

export default function GridItem({
    id,
    children,
    selectable,
    onSelectionChange: handleSelectionChange,
    style,
}: GridItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id,
    });
    const gridStyle = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            className="flex justify-center"
            ref={setNodeRef}
            style={gridStyle}
            {...attributes}
            {...listeners}
        >
            {selectable ? (
                <Indicator>
                    <Indicator.Item horizontal="start">
                        <Checkbox
                            color="primary"
                            className="backdrop-blur-sm backdrop-brightness-75"
                            onChange={(evt) => {
                                if (handleSelectionChange)
                                    handleSelectionChange(id, evt.target.checked);
                            }}
                        />
                    </Indicator.Item>

                    {children}
                </Indicator>
            ) : (
                children
            )}
        </div>
    );
}
