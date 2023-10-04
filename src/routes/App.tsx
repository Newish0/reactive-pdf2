import GridDNDBox, { DNDItem } from "@components/dndgrid/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import GridDNDContext from "@components/dndgrid/GridDNDContext";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { useEffect, useState } from "react";

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

    const [pages, setPages] = useState<ProxyPage[]>([]);

    const [items, setItems] = useState<DNDItem[]>([]);

    const [ctrlBarVals, setCtrlBarVals] = useState<ControlsBarSettings>({
        gridScale: 160,
        selectActive: false,
    });

    const [exportFileName, setExportFileName] = useState<string>("reactive-pdf-export.pdf");

    const selectedItems = items.filter((item) => item.selected);

    useEffect(() => {
        setItems(pages.map((p) => proxyPageToDNDItem(p)));
    }, [pages]);

    const handleAddFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);
            if (appSettings.preferAnimation) {
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

            <FileDrop onDrop={handleAddFiles} indicateDragOver={true}>
                <SectionContainer className="flex-shrink h-full overflow-x-hidden overflow-y-auto scrollbar">
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
                                    ></PseudoPageInput>
                                </div>
                            }
                        ></GridDNDBox>
                    </GridDNDContext.Provider>
                </SectionContainer>
            </FileDrop>

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
