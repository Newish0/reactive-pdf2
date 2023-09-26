// import * as pdfjsLib from "pdfjs-dist";
// import {
//     GetViewportParameters,
//     PDFPageProxy,
//     TextItem,
//     TextMarkedContent,
// } from "pdfjs-dist/types/src/display/api";

// import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
// import { PDFDocument } from "pdf-lib";
// import { IndexOutOfBoundsError, PDFNotReadyError } from "./errors";
// import { hashArrayBuffer } from "@util/hash";

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// export default class BetterPDF {
//     private file: File;
//     private hash: string;

//     private pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;

//     /** Always the source of truth */
//     private pdfDoc: PDFDocument | null;

//     /** For efficiently remapping page numbers without needing reload. */
//     private pageNumberMap: number[];

//     public static async open(file: File) {
//         const bPdf = new BetterPDF(file);
//         await bPdf.load();
//         return bPdf;
//     }

//     private constructor(file: File) {
//         this.file = file;
//         this.pdfJsDoc = null;
//         this.pdfDoc = null;
//         this.pageNumberMap = [];
//         this.hash = "";
//     }

//     /**
//      * Load file into buffer
//      */
//     private async load() {
//         const fileData = await this.file.arrayBuffer();
//         this.hash = await hashArrayBuffer(fileData);
//         await this.syncInternalDoc(new Uint8Array(fileData));
//     }

//     /**
//      * Generates the two types of PDF doc from buffer
//      * @param data
//      */
//     private async syncInternalDoc(data?: ArrayBuffer) {
//         if (!this.pdfDoc && !data)
//             throw new Error(
//                 "No internal data. Please provide data or wait until instance is ready."
//             );

//         if (!data && this.pdfDoc) data = await this.pdfDoc?.save();

//         if (!data) throw new Error("Failed to sync internal docs.");

//         // Load from copies
//         this.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
//         this.pdfDoc = await PDFDocument.load(new Uint8Array(data));

//         const indices = await this.pdfDoc.getPageIndices();
//         this.pageNumberMap = indices;
//     }

//     public isReady() {
//         return (this.pdfJsDoc && this.pdfDoc && true) || false;
//     }

//     public getHash() {
//         return this.hash;
//     }

//     public async renderPdfAsHtml({ scale = 1.0 } = {}) {
//         if (!this.isReady()) throw new PDFNotReadyError();

//         const pdf: pdfjsLib.PDFDocumentProxy = this.pdfJsDoc!;

//         const pagesElements: React.ReactElement<HTMLSpanElement>[][] = [];

//         for (let i = 1; i <= pdf.numPages; i++) {
//             const page: PDFPageProxy = await pdf.getPage(i);
//             const content = await page.getTextContent();
//             const viewport = page.getViewport({ scale });

//             const pageElements: React.ReactElement<HTMLSpanElement>[] = [];

//             // console.log(page.commonObjs, await page.getOperatorList());

//             content.items.forEach((item, j) => {
//                 if (Object.hasOwn(item, "type")) {
//                     item = item as TextMarkedContent;
//                 } else {
//                     item = item as TextItem;

//                     const { fontName, dir } = item;

//                     const transform = pdfjsLib.Util.transform(
//                         pdfjsLib.Util.transform(viewport.transform, item.transform),
//                         [1, 0, 0, -1, 0, 0] // Flip Y-axis
//                     );

//                     // Extract font size and style
//                     const fontSize = item.height * viewport.transform[0];

//                     pageElements.push(
//                         <span
//                             style={{
//                                 position: "absolute",
//                                 direction: dir === "ltr" ? "ltr" : "rtl",
//                                 left: `${transform[4]}px`,
//                                 top: `${transform[5]}px`,
//                                 fontSize: `${fontSize}px`,
//                                 fontFamily: fontName, // FIXME: see https://github.com/mozilla/pdf.js/issues/7914
//                             }}
//                             key={`pdf-text-${i}-${j}`}
//                         >
//                             {item.str}
//                         </span>
//                     );
//                 }
//             });

//             pagesElements.push(pageElements);
//         }

//         console.log(pagesElements);

//         return pagesElements;
//     }

//     /**
//      * Get the thumbnail of the given page.
//      *
//      * @param page Number corresponding to the page. Uses 0 indexing.
//      * @returns The thumbnail image in base64 or null if unsuccessful
//      */
//     public async getThumbnail(page: number) {
//         if (!this.isReady()) throw new PDFNotReadyError();

//         if (page > this.pageNumberMap.length) throw new IndexOutOfBoundsError(page);

//         if (page < 0) throw new IndexOutOfBoundsError(page);

//         const actualPage = this.pageNumberMap[page];

//         const pdfPage = await this.pdfJsDoc!.getPage(actualPage + 1);

//         const thumbnail = await BetterPDF.renderPage(pdfPage, { scale: 0.25 });

//         return thumbnail;
//     }

//     /**
//      * Get the thumbnail of all page.
//      *
//      * @returns An array of thumbnail images in base64 or null if unsuccessful for each page
//      */
//     public async getThumbnails() {
//         return await Promise.all(
//             new Array(this.pageNumberMap.length).map((e, i) => this.getThumbnail(i))
//         );
//     }

//     /**
//      * Create a image representation of the provided page in PDF.
//      *
//      * @param page Number corresponding to the page. Uses 0 indexing.
//      * @returns A Promise that resolves to the data URI of the page as an image, or null if context cannot be obtained.
//      */
//     public async renderPage(page: number) {
//         if (!this.isReady()) throw new PDFNotReadyError();

//         if (page > this.pageNumberMap.length) throw new IndexOutOfBoundsError(page);

//         if (page < 0) throw new IndexOutOfBoundsError(page);

//         const actualPage = this.pageNumberMap[page];

//         const pdfPage = await this.pdfJsDoc!.getPage(actualPage + 1);

//         return await BetterPDF.renderPage(pdfPage);
//     }

//     /**
//      * Create a image representation of the PDF page.
//      *
//      * @param page - The PDF page proxy object.
//      * @param [params] - Parameters for obtaining the viewport. Default is { scale: 1 }.
//      * @returns A Promise that resolves to the data URI of the page as an image, or null if context cannot be obtained.
//      */
//     private static async renderPage(
//         page: PDFPageProxy,
//         params: GetViewportParameters = { scale: 1 }
//     ) {
//         const viewport = page.getViewport(params);
//         const outputScale = window.devicePixelRatio || 1;

//         const tmpCanvas = Object.assign(document.createElement("canvas"), {
//             width: Math.floor(viewport.width * outputScale),
//             height: Math.floor(viewport.height * outputScale),
//             style: {
//                 width: Math.floor(viewport.width) + "px",
//                 height: Math.floor(viewport.height) + "px",
//             },
//         });

//         const context = tmpCanvas.getContext("2d");
//         if (!context) return null;

//         const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

//         const renderContext = {
//             canvasContext: context,
//             transform,
//             viewport,
//         };
//         await page.render(renderContext).promise;

//         return tmpCanvas.toDataURL();
//     }

//     /**
//      * Swap page A with page B and page B with page A.
//      * @param pageA a page number in 0 indexing
//      * @param pageB a page number in 0 indexing
//      */
//     public swapPage(pageA: number, pageB: number) {
//         if (pageA > this.pageNumberMap.length || pageB > this.pageNumberMap.length)
//             throw new IndexOutOfBoundsError(Math.max(pageA, pageB));

//         if (pageA < 0 || pageB < 0) throw new IndexOutOfBoundsError(Math.min(pageA, pageB));

//         const tmp = this.pageNumberMap[pageA];
//         this.pageNumberMap[pageA] = this.pageNumberMap[pageB];
//         this.pageNumberMap[pageB] = tmp;
//     }
// }

import * as pdfjsLib from "pdfjs-dist";
import { GetViewportParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { hashArrayBuffer } from "@util/hash";
import { PDFNotReadyError } from "./errors";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ProxyPage {
    thumbnail: string | null;
    reference: {
        hash: string;
        file: File;
        page: number; // zeros indexing
    };
}

export default class BetterPDF {
    private file: File;
    private hash: string;

    private pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;

    public static async open(file: File) {
        const bPdf = new BetterPDF(file);
        await bPdf.load();
        return bPdf;
    }

    private constructor(file: File) {
        this.file = file;
        this.pdfJsDoc = null;
        this.hash = "";
    }

    public async toProxyPages() {
        if (!this.pdfJsDoc) throw new PDFNotReadyError();

        const n = this.pdfJsDoc.numPages;

        const proxyPages: ProxyPage[] = [];

        for (let i = 1; i <= n; i++) {
            const page = await this.pdfJsDoc.getPage(i);

            const thumbnail = await BetterPDF.renderPage(page, { scale: 0.25 });

            proxyPages.push({
                thumbnail,
                reference: {
                    file: this.file,
                    hash: this.hash,
                    page: i,
                },
            });
        }

        return proxyPages;
    }

    public getHash() {
        return this.hash;
    }

    /**
     * Load file into buffer
     */
    private async load() {
        const fileData = await this.file.arrayBuffer();
        this.hash = await hashArrayBuffer(fileData);
        this.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileData) }).promise;
    }

    /**
     * Create a image representation of the PDF page.
     *
     * @param page - The PDF page proxy object.
     * @param [params] - Parameters for obtaining the viewport. Default is { scale: 1 }.
     * @returns A Promise that resolves to the data URI of the page as an image, or null if context cannot be obtained.
     */
    private static async renderPage(
        page: PDFPageProxy,
        params: GetViewportParameters = { scale: 1 }
    ) {
        const viewport = page.getViewport(params);
        const outputScale = window.devicePixelRatio || 1;

        const tmpCanvas = Object.assign(document.createElement("canvas"), {
            width: Math.floor(viewport.width * outputScale),
            height: Math.floor(viewport.height * outputScale),
            style: {
                width: Math.floor(viewport.width) + "px",
                height: Math.floor(viewport.height) + "px",
            },
        });

        const context = tmpCanvas.getContext("2d", { willReadFrequently: true });
        if (!context) return null;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
            canvasContext: context,
            transform,
            viewport,
        };
        await page.render(renderContext).promise;

        return tmpCanvas.toDataURL();
    }
}
