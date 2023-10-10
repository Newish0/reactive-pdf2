import { ExtendedDNDItem } from "@type/workspace";
import { ProxyPage } from "./BetterPDF";

/**
 * Converts a ProxyPage to an ExtendedDNDItem
 * @param page
 * @returns
 */
export const proxyPageToExtendedDNDItem = (page: ProxyPage): ExtendedDNDItem => {
    return {
        id: `${page.reference.hash}-${page.reference.page}`,
        title: `${page.reference.file.name} ⋅ ${page.reference.page}`,
        content: (
            <img className="object-contain border border-neutral" src={page.thumbnail ?? ""} />
        ),
        selected: false,
        page,
    };
};

/**
 * Converts any browser supported image to a JPG.
 * @param file An image file
 * @param quality Quality of the JPG
 * @returns
 */
export function convertImageFileToJPG(file: File, quality = 0.9) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            if (reader.result instanceof ArrayBuffer) {
                                resolve(reader.result);
                            } else {
                                reject(new Error("Failed to convert image to ArrayBuffer."));
                            }
                        };
                        reader.readAsArrayBuffer(blob);
                    } else {
                        reject(new Error("Failed to convert image to ArrayBuffer."));
                    }
                },
                "image/jpeg",
                quality
            );

            URL.revokeObjectURL(url); // Clean up the object URL
        };

        image.src = url;

        image.onerror = () => {
            reject(new Error("Failed to load the image."));
        };
    });
}

/**
 * Extracts the binary part of the base64 URI of an image.
 * (i.e. the part after `data:image/png;base64,`)
 * @param base64URI
 * @returns The base64 string after `data:image/png;base64,`
 */
export function extractBinFromBase64(base64URI: string): string {
    return base64URI.split(",").at(-1)?.trim() ?? "";
}

/**
 * Converts base64 URI to an array buffer
 * @param base64
 * @returns
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
