/**
 * Get a copy of the given array buffer.
 * @param source
 * @returns a copy of the given array buffer.
 */
export function copyArrayBuffer(source: ArrayBuffer) {
    const destination = new ArrayBuffer(source.byteLength);
    new Uint8Array(destination).set(new Uint8Array(source));
    return destination;
}

type FilePickerOptions = {
    multiple?: boolean;
    accept?: string;
};

/**
 * Programmatically trigger the file picker window (by clicking an invisible `input` element).
 * @returns A list of files picked by the user
 */
export function openFilePicker({
    multiple = false,
    accept = "*",
}: FilePickerOptions = {}): Promise<FileList> {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = accept;
    input.click();

    return new Promise<FileList>((resolve, reject) => {
        input.onchange = (evt) => {
            const files = (evt.target as HTMLInputElement)?.files;

            if (files) resolve(files);
            else reject("No files selected");
        };
    });
}
