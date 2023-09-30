import GridDNDBox, { DNDItem } from "@components/dndgrid/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import GridDNDContext from "@components/dndgrid/GridDNDContext";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { useEffect, useState } from "react";

import { Button, Divider, Input, Join } from "react-daisyui";

import { downloadPDF } from "@util/download";
import ControlsBarContext, { ControlsBarSettings } from "@components/ControlsBarContext";
import ControlsBar from "@components/ControlsBar";
import { proxyPageToDNDItem } from "@util/convert";

const MIN_SCALE = 100;
const MAX_SCALE = 1000;

// TODO: User settings
const preferAnimation = true;

export default function App() {
    const [pages, setPages] = useState<ProxyPage[]>([]);

    const [items, setItems] = useState<DNDItem[]>([]);

    const [ctrlBarVals, setCtrlBarVals] = useState<ControlsBarSettings>({
        gridScale: 160,
        selectActive: false,
    });

    const [exportFileName, setExportFileName] = useState<string>("reactive-pdf-export.pdf");

    useEffect(() => {
        setItems(pages.map((p) => proxyPageToDNDItem(p)));
    }, [pages]);

    const handleAddFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);
            if (preferAnimation) {
                setPages([
                    ...pages,
                    ...(await bPdf.toProxyPages(0.75, (curPage) =>
                        setPages((pages) => [...pages, curPage])
                    )),
                ]);
            } else {
                setPages([...pages, ...(await bPdf.toProxyPages(0.75))]);
            }
        }
    };

    const handleExportFileName = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setExportFileName(evt.target.value);
    };

    const handleExportPdf = async (onlySelected: boolean = false) => {
        const pages = items
            .filter((item) => !onlySelected || item.selected)
            .map((item) => item.page) as ProxyPage[];

        const mergedPdf = await BetterPDF.pagesToPDF(...pages);

        downloadPDF(await mergedPdf.save(), exportFileName);
    };

    return (
        <section className="px-6 py-8 h-screen w-max-screen">
            <div className="flex flex-col space-y-4 h-full">
                <div className="prose prose-sm md:prose-base">
                    <h1>Reactive PDF</h1>
                </div>

                <Divider></Divider>

                <ControlsBarContext.Provider value={[ctrlBarVals, setCtrlBarVals]}>
                    <ControlsBar
                        gridScale={{
                            min: MIN_SCALE,
                            max: MAX_SCALE,
                        }}
                    />
                </ControlsBarContext.Provider>

                <div className="rounded-box p-8 bg-base-200 flex-shrink h-full overflow-x-hidden overflow-y-auto scrollbar">
                    <GridDNDContext.Provider value={[items, setItems]}>
                        <GridDNDBox
                            spacing={24}
                            gridSize={ctrlBarVals.gridScale}
                            showFullTitle={false}
                            allowSelection={ctrlBarVals.selectActive}
                            end={
                                <div className="p-4 m-auto h-full">
                                    <PseudoPageInput
                                        onChange={handleAddFiles}
                                        accept="application/pdf"
                                    ></PseudoPageInput>
                                </div>
                            }
                        ></GridDNDBox>
                    </GridDNDContext.Provider>
                </div>

                <div className="rounded-box p-8 bg-base-200">
                    <Join className="w-full">
                        <Input
                            className="join-item w-full"
                            type="text"
                            color="neutral"
                            placeholder="export.pdf"
                            value={exportFileName}
                            onChange={handleExportFileName}
                        />

                        {ctrlBarVals.selectActive ? (
                            <>
                                <Button
                                    color="primary"
                                    className="join-item"
                                    onClick={() => handleExportPdf(false)}
                                >
                                    Export
                                </Button>
                                <Button
                                    color="accent"
                                    className="join-item"
                                    onClick={() => handleExportPdf(true)}
                                >
                                    Export Selected
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="primary"
                                className="join-item"
                                onClick={() => handleExportPdf(false)}
                            >
                                Export
                            </Button>
                        )}
                    </Join>
                </div>
            </div>
        </section>
    );
}
