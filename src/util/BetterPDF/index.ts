import * as pdfjsLib from "pdfjs-dist";
import { GetViewportParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { hashArrayBuffer } from "@util/hash";
import { PDFNotReadyError } from "./errors";
import { PDFDocument } from "pdf-lib";
import { copyArrayBuffer } from "@util/io";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ProxyPage {
    thumbnail: string | null;
    reRenderThumbnail: (scale: number) => Promise<void>;
    reference: {
        hash: string;
        file: File;
        page: number; // zeros indexing
        betterPdf: BetterPDF;
    };
}

export default class BetterPDF {
    private file: File;
    private hash: string;

    private pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;

    private pdfLibDoc: PDFDocument | null;

    public static async open(file: File) {
        const bPdf = new BetterPDF(file);
        await bPdf.load();
        return bPdf;
    }

    private constructor(file: File) {
        this.file = file;
        this.pdfJsDoc = null;
        this.pdfLibDoc = null;
        this.hash = "";
    }

    public async toProxyPages(
        scale = 0.25,
        progressCallback?: (newPage: ProxyPage, current: number, total: number) => void
    ) {
        if (!this.pdfJsDoc) throw new PDFNotReadyError();

        const n = this.pdfJsDoc.numPages;

        const proxyPages: ProxyPage[] = [];

        for (let i = 1; i <= n; i++) {
            const page = await this.pdfJsDoc.getPage(i);

            const thumbnail = await BetterPDF.renderPage(page, { scale });

            const proxyPage = {
                thumbnail,
                async reRenderThumbnail(scale = 0.25) {
                    proxyPage.thumbnail = await BetterPDF.renderPage(page, { scale });
                },
                reference: {
                    file: this.file,
                    hash: this.hash,
                    page: i,
                    betterPdf: this,
                },
            };
            proxyPages.push(proxyPage);

            if (progressCallback) progressCallback(proxyPage, i, n);
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

        // Create copies of buffer b/c only one thing can use the same array buffer at a time
        this.pdfJsDoc = await pdfjsLib.getDocument({
            data: new Uint8Array(copyArrayBuffer(fileData)),
        }).promise;
        this.pdfLibDoc = await PDFDocument.load(new Uint8Array(copyArrayBuffer(fileData)));
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

    /**
     * Merge all given proxy pages into one pdf file.
     * @param pages
     * @returns
     */
    public static async pagesToPDF(...pages: ProxyPage[]): Promise<PDFDocument> {
        const pdfDoc = await PDFDocument.create();

        for (const page of pages) {
            const { betterPdf, page: pageNum } = page.reference;

            if (!betterPdf.pdfLibDoc) throw new PDFNotReadyError();

            const pdfPages = await pdfDoc.copyPages(betterPdf.pdfLibDoc, [pageNum - 1]);

            for (const pdfPage of pdfPages) pdfDoc.addPage(pdfPage);
        }

        return pdfDoc;
    }
}
