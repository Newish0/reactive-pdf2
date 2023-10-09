export function copyArrayBuffer(source: ArrayBuffer) {
    const destination = new ArrayBuffer(source.byteLength);
    new Uint8Array(destination).set(new Uint8Array(source));
    return destination;
}

export function openFilePicker(): Promise<FileList> {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.click();

    return new Promise<FileList>((resolve, reject) => {
        input.onchange = (evt) => {
            const files = (evt.target as HTMLInputElement)?.files;

            if (files) resolve(files);
            else reject("No files selected");
        };
    });
}
