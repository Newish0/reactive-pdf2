import GridDNDBox from "@components/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";
import BetterPDF, { ProxyPage } from "@util/BetterPDF";
import { useState } from "react";

export default function App() {
    const [pages, setPages] = useState<ProxyPage[]>([]);

    const handleAddFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const f of files) {
            const bPdf = await BetterPDF.open(f);
            setPages([...pages, ...(await bPdf.toProxyPages())]);
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
        };
    };

    return (
        <section className="px-6 py-8">
            <div className="">
                <div className="prose prose-sm md:prose-base">
                    <h1>Reactive PDF</h1>
                </div>

                <div className="rounded-box p-8 my-4 bg-base-200">
                    <GridDNDBox
                        spacing={24}
                        gridSize={160}
                        showFullTitle={false}
                        items={pages.map((p) => proxyPageToDNDItem(p))}
                        end={
                            <div className="p-4 m-auto h-full">
                                <PseudoPageInput
                                    onChange={handleAddFiles}
                                    accept="application/pdf"
                                ></PseudoPageInput>
                            </div>
                        }
                        allowSelection={true}
                    ></GridDNDBox>
                </div>
            </div>
        </section>
    );
}
