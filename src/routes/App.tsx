import GridDNDBox, { DNDItem } from "@components/dndgrid/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import GridDNDContext from "@components/dndgrid/GridDNDContext";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { useState } from "react";
import { Button, Input, Join } from "react-daisyui";
import { downloadPDF } from "@util/download";
import ControlsBarContext, { ControlsBarSettings } from "@components/ControlsBarContext";
import ControlsBar from "@components/ControlsBar";
import { proxyPageToDNDItem } from "@util/convert";
import PageContainer from "@components/PageContainer";
import { useAppSettings } from "@atoms/appsettings";
import SectionContainer from "@components/SectionContainer";
import FileDrop from "@components/FileDrop";

export default function App() {
    const [appSettings] = useAppSettings();

    const [items, setItems] = useState<DNDItem[]>([]);

    const [ctrlBarVals, setCtrlBarVals] = useState<ControlsBarSettings>({
        gridScale: 160,
        selectActive: false,
    });

    const [exportFileName, setExportFileName] = useState<string>("reactive-pdf-export.pdf");

    const selectedItems = items.filter((item) => item.selected);

    const handleAddFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);

            // Add items as we get them if prefer animation, else add all when finish.
            if (appSettings.preferAnimation) {
                await bPdf.toProxyPages(0.75, (page) => {
                    setItems((oldItems) => [...oldItems, proxyPageToDNDItem(page)]);
                });
            } else {
                const newItems = (await bPdf.toProxyPages(0.75)).map((p) => proxyPageToDNDItem(p));
                setItems((oldItems) => [...oldItems, ...newItems]);
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

    const handleDeleteSelected = () => {
        setItems((items) => {
            selectedItems.forEach((selectedItem) => {
                const index = items.findIndex((item) => item === selectedItem);
                items.splice(index, 1);
            });
            return items;
        });

        setCtrlBarVals((oldVals) => ({ ...oldVals, selectActive: false }));
    };

    return (
        <PageContainer title="Reactive PDF">
            <SectionContainer className="flex justify-between items-center">
                <ControlsBarContext.Provider value={[ctrlBarVals, setCtrlBarVals]}>
                    <ControlsBar
                        gridScale={{
                            min: appSettings.gridScale.min,
                            max: appSettings.gridScale.max,
                        }}
                        onDeleteSelected={selectedItems.length ? handleDeleteSelected : undefined}
                    />
                </ControlsBarContext.Provider>
            </SectionContainer>

            <section className="flex-shrink h-max-full overflow-x-hidden overflow-y-auto scrollbar">
                <FileDrop onDrop={handleAddFiles} indicateDragOver={true}>
                    <SectionContainer>
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
                                            accept="application/pdf, image/png, image/jpg, image/jpeg, image/avif, image/webp"
                                            multiple={true}
                                        ></PseudoPageInput>
                                    </div>
                                }
                            ></GridDNDBox>
                        </GridDNDContext.Provider>
                    </SectionContainer>
                </FileDrop>
            </section>

            <SectionContainer>
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
            </SectionContainer>
        </PageContainer>
    );
}
