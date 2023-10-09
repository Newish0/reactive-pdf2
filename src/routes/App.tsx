import GridDNDBox, { DNDItem } from "@components/dndgrid/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import GridDNDContext from "@components/dndgrid/GridDNDContext";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { Dispatch, SetStateAction, useState } from "react";
import { Button, Input, Join, Menu } from "react-daisyui";
import { downloadPDF, downloadBytes } from "@util/download";
import ControlsBarContext, { ControlsBarSettings } from "@components/ControlsBarContext";
import ControlsBar from "@components/ControlsBar";
import {
    base64ToArrayBuffer,
    extractBinFromBase64,
    proxyPageToExtendedDNDItem,
} from "@util/convert";
import PageContainer from "@components/PageContainer";
import { useAppSettings } from "@atoms/appsettings";
import SectionContainer from "@components/SectionContainer";
import FileDrop from "@components/FileDrop";
import { TbFilePlus, TbPhotoDown } from "react-icons/tb";
import { openFilePicker } from "@util/io";
import { useWorkspace } from "@hooks/workspace";

export default function App() {
    const [appSettings, setAppSettings] = useAppSettings();

    const { items, setItems, exportFileName, setExportFileName } = useWorkspace("tmp-workspace");

    const [ctrlBarVals, setCtrlBarVals] = useState<ControlsBarSettings>({
        gridScale: appSettings.gridScale.current,
        selectActive: false,
    });

    const selectedItems = items.filter((item) => item.selected);

    const handleAddFiles = async (files: FileList | null, atIndex?: number) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);

            // Add items as we get them if prefer animation, else add all when finish.
            if (appSettings.preferAnimation) {
                await bPdf.toProxyPages(0.75, (page, pageNumber) => {
                    setItems((oldItems) => {
                        const index =
                            atIndex !== undefined ? atIndex + pageNumber - 1 : oldItems.length;
                        return oldItems.toSpliced(index, 0, proxyPageToExtendedDNDItem(page));
                    });
                });
            } else {
                const newItems = (await bPdf.toProxyPages(0.75)).map((p) =>
                    proxyPageToExtendedDNDItem(p)
                );
                setItems((oldItems) => {
                    return [
                        ...oldItems.slice(0, atIndex ?? oldItems.length),
                        ...newItems,
                        ...oldItems.slice(atIndex ?? oldItems.length, oldItems.length),
                    ];
                });
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

    // Save grid scale to app settings on change.
    const handleGridScaleChange = (newScale: number) => {
        appSettings.gridScale.current = newScale;
        setAppSettings({ ...appSettings });
    };

    // Add context menu to items
    items.forEach((item) => {
        const handleExportItemAsImage = async (item: DNDItem) => {
            const extension = "webp";
            const type = "image/webp";
            const proxyPage = item.page as ProxyPage;
            const b64Img = await proxyPage.reference.betterPdf.pageToImage(
                proxyPage.reference.page,
                5
            );

            if (!b64Img) return;

            downloadBytes(
                base64ToArrayBuffer(extractBinFromBase64(b64Img)),
                type,
                `${proxyPage.reference.file.name} - ${proxyPage.reference.page}.${extension}`
            );
        };

        const handleInsertPageHere = async (item: DNDItem) => {
            try {
                const fileList = await openFilePicker();
                handleAddFiles(fileList, items.findIndex((someItem) => someItem === item) + 1);
            } catch (error) {
                console.error(error);
            }
        };

        item.additionalMenuItems = (
            <>
                <Menu.Item onClickCapture={() => handleInsertPageHere(item)}>
                    <span>
                        <TbFilePlus /> Insert page here
                    </span>
                </Menu.Item>

                <Menu.Item onClickCapture={() => handleExportItemAsImage(item)}>
                    <span>
                        <TbPhotoDown /> Export page as image
                    </span>
                </Menu.Item>
            </>
        );
    });

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
                        onScaleChange={handleGridScaleChange}
                    />
                </ControlsBarContext.Provider>
            </SectionContainer>

            <section className="flex-shrink h-max-full overflow-x-hidden overflow-y-auto scrollbar">
                <FileDrop onDrop={handleAddFiles} indicateDragOver={true}>
                    <SectionContainer>
                        <GridDNDContext.Provider
                            value={[items, setItems as Dispatch<SetStateAction<DNDItem[]>>]}
                        >
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
