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
import { Badge, Indicator, Stack } from "react-daisyui";
import { twMerge } from "tailwind-merge";

interface DNDItem {
    id: string;
    content: React.ReactNode;
    [key: string]: unknown;
}

interface GridDNDBoxProps {
    items: DNDItem[];
    start?: React.ReactNode;
    end?: React.ReactNode;
    allowSelection?: boolean;
}

// Define the main component that includes the DND context and the sortable context
const GridDNDBox = ({
    items: providedItems,
    start: startElement,
    end: endElement,
    allowSelection,
}: GridDNDBoxProps) => {
    const [items, setItems] = useState(providedItems);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setItems((items) => {
                const tmpOldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const isMoveRight = newIndex > tmpOldIndex;

                const moveActive = () => {
                    // move active
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    items = arrayMove(items, oldIndex, newIndex);
                };

                const moveSelected = () => {
                    // Move all selected elements to immediately after active
                    for (const selectedId of selectedIds) {
                        const selectedIndex = items.findIndex((item) => item.id === selectedId);
                        items = arrayMove(items, selectedIndex, newIndex);
                    }
                };

                if (isMoveRight) {
                    moveActive();
                    moveSelected();
                } else {
                    moveSelected();
                    moveActive();
                }

                return items;
            });
        }

        setActiveId(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleSelection = (id: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedIds([...selectedIds, id]);
        } else {
            const index = selectedIds.findIndex((curId) => curId === id);
            if (index !== -1) selectedIds.splice(index, 1);
            setSelectedIds([...selectedIds]);
        }
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: allowSelection ? 1 : 0,
            },
        }),
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
                        <GridItem
                            key={item.id}
                            id={item.id}
                            selectable={allowSelection}
                            onSelectionChange={handleSelection}
                        >
                            {item.content}
                        </GridItem>
                    ))}
                    {endElement}
                </GridContainer>
            </SortableContext>

            {/* TODO: When selecting multiple, this shall be a stack of all items with # indicator */}
            <DragOverlay adjustScale={true}>
                {selectedIds.length > 1 ? (
                    <Indicator>
                        <Badge
                            color="primary"
                            className={twMerge(Indicator.Item.className(), "z-10")}
                        >
                            {selectedIds.length}
                        </Badge>

                        {/* Active item always on top */}
                        <Stack>
                            {items.find((item) => item.id === activeId)?.content}
                            {...items
                                .filter(({ id }) => selectedIds.includes(id) && id !== activeId)
                                .map(({ content }) => content)}
                        </Stack>
                    </Indicator>
                ) : (
                    items.find((item) => item.id === activeId)?.content
                )}
            </DragOverlay>

            {selectedIds.join(", ")}
        </DndContext>
    );
};

export default GridDNDBox;
