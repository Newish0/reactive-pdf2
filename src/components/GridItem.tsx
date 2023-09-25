import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function GridItem({
    id,
    children,
    style,
}: {
    id: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id,
    });
    const gridStyle = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={gridStyle} {...attributes} {...listeners}>
            {children}
        </div>
    );
}
