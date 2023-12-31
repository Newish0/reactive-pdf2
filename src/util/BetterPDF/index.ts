import * as pdfjsLib from "pdfjs-dist";
import { GetViewportParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { hashArrayBuffer } from "@util/hash";
import { PDFNotReadyError, UnsupportedFileError } from "./errors";
import { PDFDocument, PDFImage } from "pdf-lib";
import { copyArrayBuffer } from "@util/io";
import { convertImageFileToJPG } from "@util/convert";

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

type RenderImageType = "image/png" | "image/jpg" | "image/webp";

/**
 * An abstraction on pdfjs & pdf-lib to help with loading, displaying, and manipulating PDF.
 */
export default class BetterPDF {
    /** A list of mime type that are supported */
    public static SUPPORTED_FORMATS = [
        "application/pdf",
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
        "image/avif",
    ] as const;

    private static DEFAULT_PDF_SIZE = {
        width: 612, // 8.5 * 72
        height: 792, // 11 * 72
    } as const;

    private file: File;
    private hash: string;

    private pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;

    private pdfLibDoc: PDFDocument | null;

    /**
     * Creates an instance of Better PDF from a file.
     * @param file a PDF file or an supported image (see `BetterPDF.SUPPORTED_FORMATS`).
     * @returns
     */
    public static async open(file: File) {
        const bPdf = new BetterPDF(file);
        await bPdf.load();
        return bPdf;
    }

    /**
     * **NOTE**: Should only be used within this class. Other instantiation of BetterPDF
     *       shall be done through `open()`.
     * @param file
     */
    private constructor(file: File) {
        this.file = file;
        this.pdfJsDoc = null;
        this.pdfLibDoc = null;
        this.hash = "";
    }

    /**
     * Get all pages on this PDF as ProxyPages
     * @param scale The scale to render the thumbnail at
     * @param progressCallback Callback for i.e. updating the progress UI
     * @returns
     */
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

    /**
     * Returns the specified page as an image.
     * @param pageNumber The target page
     * @param scale The resolution/scale of the image
     * @param type The desired format of the return image
     * @returns Base64 URI of the image
     */
    public async pageToImage(pageNumber: number, scale = 2, type: RenderImageType = "image/webp") {
        if (!this.pdfJsDoc) throw new PDFNotReadyError();
        const page = await this.pdfJsDoc.getPage(pageNumber);
        return await BetterPDF.renderPage(page, { scale }, type);
    }

    /**
     * Returns the hash of the file that created this PDF.
     * @returns
     */
    public getHash() {
        return this.hash;
    }

    /**
     * Check if a file can be opened by BetterPDF.
     * @param file
     * @returns
     */
    private static isSupportFile(file: File): boolean {
        const { type } = file;
        return (BetterPDF.SUPPORTED_FORMATS as unknown as string[]).includes(type);
    }

    /**
     * *Assume **valid** input*
     * @param file A web image file
     * @return PDFDocument with a width of BetterPDF.DEFAULT_PDF_SIZE.width and maximum possible height containing the image
     */
    private static async createPdfFromImage(file: File) {
        const pdfDoc = await PDFDocument.create();

        const page = pdfDoc.addPage();

        const imageBytes = copyArrayBuffer(await file.arrayBuffer());

        let image: PDFImage | null = null;
        if (file.type === "image/png") {
            image = await pdfDoc.embedPng(imageBytes);
        } else if (file.type === "image/jpg" || file.type === "image/jpeg") {
            image = await pdfDoc.embedJpg(imageBytes);
        } else {
            image = await pdfDoc.embedJpg(await convertImageFileToJPG(file));
        }

        const aspectRatio = image.width / image.height;

        const width = BetterPDF.DEFAULT_PDF_SIZE.width;
        const height = BetterPDF.DEFAULT_PDF_SIZE.width / aspectRatio;

        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
        });

        page.setSize(width, height);

        return pdfDoc;
    }

    /**
     * Load file into buffer
     */
    private async load() {
        if (!BetterPDF.isSupportFile(this.file))
            throw new UnsupportedFileError(this.file, BetterPDF.SUPPORTED_FORMATS);

        // Load as image if not pdf
        if (this.file.type !== "application/pdf") {
            this.pdfLibDoc = await BetterPDF.createPdfFromImage(this.file);
            const fileData = await this.pdfLibDoc.save();
            this.hash = await hashArrayBuffer(fileData);
            this.pdfJsDoc = await pdfjsLib.getDocument({
                data: new Uint8Array(copyArrayBuffer(fileData)),
            }).promise;
            return;
        }

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
        params: GetViewportParameters = { scale: 1 },
        type: RenderImageType = "image/png"
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

        return tmpCanvas.toDataURL(type);
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
