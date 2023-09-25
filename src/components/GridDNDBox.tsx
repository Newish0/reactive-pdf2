import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import GridContainer from "./GridContainer";
import GridItem from "./GridItem";

interface DNDItem {
    id: string;
    content: React.ReactNode;
    [key: string]: unknown;
}

interface GridDNDBoxProps {
    items: DNDItem[];
    start?: React.ReactNode;
    end?: React.ReactNode;
}

// Define the main component that includes the DND context and the sortable context
const GridDNDBox = ({
    items: providedItems,
    start: startElement,
    end: endElement,
}: GridDNDBoxProps) => {
    const [items, setItems] = useState(providedItems);
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <GridContainer>
                    {startElement}

                    {items.map((item) => (
                        <GridItem key={item.id} id={item.id}>
                            {item.content}
                        </GridItem>
                    ))}

                    {endElement}
                </GridContainer>
            </SortableContext>

            <DragOverlay adjustScale={true}>
                {items.find((item) => item.id === activeId)?.content}
            </DragOverlay>
        </DndContext>
    );
};

export default GridDNDBox;
