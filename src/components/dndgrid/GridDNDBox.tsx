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
import { useKeysHeld } from "@hooks/input";
import ContextMenu from "@components/ContextMenu";
import GridItemMenu from "./GridItemMenu";

export interface DNDItem {
    id: string;
    content: React.ReactNode;
    selected: boolean;
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
    const [lastSelectedItemId, setLastSelectedItemId] = useState<string | null>(null);

    const keysHeld = useKeysHeld();

    // Reset last selected item for muli select on release held
    useEffect(() => {
        if (!keysHeld["Shift"]) setLastSelectedItemId(null);
    }, [keysHeld, setLastSelectedItemId]);

    // Reset selection on allowSelection change
    useEffect(() => {
        if (!allowSelection)
            setItems((items) => items.map((item) => ((item.selected = false), item)));
    }, [allowSelection, setItems]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setItems((items) => {
                // Get desired index before any operations
                const newIndex = items.findIndex((item) => item.id === over.id);

                // Move selected items
                items.forEach((item) => {
                    if (!item.selected || item.id === active.id) return;

                    // get latest item (can't use index from forEach due to move)
                    const index = items.findIndex((latestItem) => latestItem === item);

                    items = arrayMove(items, index, newIndex);
                });

                // Move active item
                const oldIndex = items.findIndex((item) => item.id === active.id);
                items = arrayMove(items, oldIndex, newIndex);

                return items;
            });
        }

        setActiveId(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleSelection = (id: string, isSelected: boolean) => {
        const itemIndex = items.findIndex((item) => item.id === id);
        if (itemIndex < 0) return;

        const item = items[itemIndex];

        item.selected = isSelected;

        // Select all items in between two selection if held shift
        if (keysHeld["Shift"]) {
            if (lastSelectedItemId) {
                const lastItemIndex = items.findIndex((item) => item.id === lastSelectedItemId);
                if (lastItemIndex > -1) {
                    const startIndex = Math.min(itemIndex, lastItemIndex);
                    const endIndex = Math.max(itemIndex, lastItemIndex);
                    for (let i = startIndex; i < endIndex && items[i]; i++) {
                        items[i].selected = isSelected;
                    }
                }
            } else {
                setLastSelectedItemId(id);
            }
        } else {
            setLastSelectedItemId(null);
        }

        setItems([...items]); // cause update
    };

    const handleDeleteItem = (itemToDelete: DNDItem) => {
        setItems((items) => {
            const index = items.findIndex((item) => item === itemToDelete);
            if (index > -1) items.splice(index, 1);
            return [...items];
        });
    };

    const handleExportItemAsImage = (item: DNDItem) => {
        console.log(item);
        // TODO: Change GridItemMenu to accept an object that allows user to extend functionalities.
        // i.e. the export page as image is be an function extended on this generalized dnd context menu
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

    const selectedItems = items.filter((item) => item.selected);

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
                        <ContextMenu
                            key={item.id}
                            menuItems={
                                <GridItemMenu
                                    onDelete={() => handleDeleteItem(item)}
                                    onExportPageAsImage={() => handleExportItemAsImage(item)}
                                />
                            }
                        >
                            <GridItem
                                id={item.id}
                                selected={item.selected}
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
                                            <Tooltip message={item.title ?? ""} position="bottom">
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
                        </ContextMenu>
                    ))}
                    {endElement}
                </GridContainer>
            </SortableContext>

            <DragOverlay adjustScale={true}>
                {selectedItems.length > 1 ? (
                    <Indicator>
                        <Badge
                            color="primary"
                            className={twMerge(Indicator.Item.className(), "z-10")}
                        >
                            {selectedItems.length}
                        </Badge>

                        {/* Active item always on top */}
                        <Stack style={{ width: `${gridSize}px` }}>
                            {items.find((item) => item.id === activeId)?.content}

                            {...selectedItems
                                .filter(({ id }) => id !== activeId)
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
