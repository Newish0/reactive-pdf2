import { DNDItem } from "@components/dndgrid/GridDNDBox";
import { ProxyPage } from "./BetterPDF";

export const proxyPageToDNDItem = (page: ProxyPage): DNDItem => {
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
