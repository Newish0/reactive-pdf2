// Import necessary components from dnd-kit
import {
    DndContext,
    closestCorners,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

// Define a grid item component
const GridItem = ({
    id,
    children,
    style,
}: {
    id: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => {
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
};

// Define the grid container component
const GridContainer = ({ items }: { items: { id: string; content: string }[] }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "8px",
            }}
        >
            {items.map((item) => (
                <GridItem key={item.id} id={item.id}>
                    <div className="p-4 text-center">{item.content}</div>
                </GridItem>
            ))}

            <div className="p-4 text-center">CANNOT MOVE</div>
        </div>
    );
};

// Define the main component that includes the DND context and the sortable context
const GridDNDBox = () => {
    const [items, setItems] = useState([
        { id: "1", content: "Item 1" },
        { id: "2", content: "Item 2" },
        { id: "3", content: "Item 3" },
        { id: "4", content: "Item 4" },
        { id: "5", content: "Item 5" },
    ]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 0,
            },
        })
    );

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <GridContainer items={items} />
            </SortableContext>

            <DragOverlay adjustScale={true}>ASD</DragOverlay>
        </DndContext>
    );
};

export default GridDNDBox;
