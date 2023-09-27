import GridDNDBox, { DNDItem } from "@components/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import { arrayMove } from "@dnd-kit/sortable";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { useState } from "react";

import { Button, Divider, Range } from "react-daisyui";
import { TbZoomIn, TbZoomOut } from "react-icons/tb";

const MIN_SCALE = 100;
const MAX_SCALE = 600;
const STEP_SIZE = 10;

export default function App() {
    const [gridScale, setGridScale] = useState(160);
    const [pages, setPages] = useState<ProxyPage[]>([]);

    const [selectActive, setSelectActive] = useState(false);

    const handleAddFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);
            setPages([...pages, ...(await bPdf.toProxyPages(0.75))]);
        }
    };

    const proxyPageToDNDItem = (page: ProxyPage) => {
        return {
            id: `${page.reference.hash}-${page.reference.page}`,
            title: `${page.reference.file.name} ⋅ ${page.reference.page}`,
            content: (
                <img
                    className="object-contain border border-neutral rounded-md"
                    src={page.thumbnail ?? ""}
                />
            ),
        } as DNDItem;
    };

    const handleScaleChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseInt(evt.target.value);
        setGridScale(newScale);
    };

    const handleDNDItemsChange = (oldIndex: number, newIndex: number) => {
        setPages((pages) => arrayMove(pages, oldIndex, newIndex));
    };

    const Controls = () => {
        return (
            <div className="bg-base-200 p-4 rounded-box flex justify-between items-center">
                <div className="w-1/2 flex align-middle gap-4">
                    <TbZoomOut className="text-2xl" />
                    <Range
                        size="sm"
                        min={MIN_SCALE}
                        max={MAX_SCALE}
                        value={gridScale}
                        onChange={handleScaleChange}
                    />
                    <TbZoomIn className="text-2xl" />
                </div>

                <div>
                    {selectActive ? (
                        <Button color="ghost" onClick={() => setSelectActive(false)}>
                            <b className="text-primary">Done</b>
                        </Button>
                    ) : (
                        <Button color="ghost" onClick={() => setSelectActive(true)}>
                            <span className="text-primary">Select</span>
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="px-6 py-8 h-screen">
            <div className="flex flex-col h-full">
                <div className="prose prose-sm md:prose-base">
                    <h1>Reactive PDF</h1>
                </div>

                <Divider></Divider>

                <Controls />

                <div className="rounded-box p-8 my-4 bg-base-200 overflow-y-auto">
                    <GridDNDBox
                        spacing={24}
                        gridSize={gridScale}
                        showFullTitle={false}
                        allowSelection={selectActive}
                        items={pages.map((p) => proxyPageToDNDItem(p))}
                        onMove={handleDNDItemsChange}
                        end={
                            <div className="p-4 m-auto h-full">
                                <PseudoPageInput
                                    onChange={handleAddFiles}
                                    accept="application/pdf"
                                ></PseudoPageInput>
                            </div>
                        }
                    ></GridDNDBox>
                </div>
            </div>
        </section>
    );
}
