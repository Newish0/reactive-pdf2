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
import { useContext, useEffect, useState } from "react";
import GridContainer from "./GridContainer";
import GridItem from "./GridItem";
import { Badge, Indicator, Stack, Tooltip } from "react-daisyui";
import { twMerge } from "tailwind-merge";
import GridDNDContext from "./GridDNDContext";

export interface DNDItem {
    id: string;
    content: React.ReactNode;
    title?: string;
    [key: string]: unknown;
}

interface GridDNDBoxProps {
    start?: React.ReactNode;
    end?: React.ReactNode;
    allowSelection?: boolean;
    spacing: number;
    showFullTitle: boolean;
    gridSize: number;
}

// Define the main component that includes the DND context and the sortable context
const GridDNDBox = ({
    start: startElement,
    end: endElement,
    allowSelection,
    spacing,
    showFullTitle,
    gridSize,
}: GridDNDBoxProps) => {
    const [items, setItems] = useContext(GridDNDContext);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Clear selections on "allowSelection" change
    useEffect(() => {
        setSelectedIds([]);
    }, [allowSelection]);

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
                <GridContainer spacing={spacing} gridSize={gridSize}>
                    {startElement}

                    {items.map((item) => (
                        <GridItem
                            key={item.id}
                            id={item.id}
                            selectable={allowSelection}
                            onSelectionChange={handleSelection}
                        >
                            <div className="flex flex-col align-middle">
                                {item.content}

                                {showFullTitle ? (
                                    <div
                                        style={{ width: `${gridSize}px` }}
                                        className="m-auto text-center"
                                    >
                                        {item.title}
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <Tooltip
                                            message={item.title ?? ""}
                                            position="bottom"
                                            className="z-10"
                                        >
                                            <div
                                                style={{ width: `${gridSize}px` }}
                                                className="text-center whitespace-nowrap overflow-ellipsis overflow-hidden"
                                            >
                                                {item.title}
                                            </div>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                        </GridItem>
                    ))}
                    {endElement}
                </GridContainer>
            </SortableContext>

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
                        <Stack style={{ width: `${gridSize}px` }}>
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
        </DndContext>
    );
};

GridDNDBox.defaultProps = {
    spacing: 8,
    gridSize: 160,
    showFullTitle: false,
};

export default GridDNDBox;