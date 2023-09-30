// export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onload = (e: ProgressEvent<FileReader>) => {
//             console.log(e.target?.result);
//             if (e.target?.result && e.target.result instanceof ArrayBuffer) {
//                 resolve(e.target.result);
//             } else {
//                 reject(new Error("Error reading file as ArrayBuffer"));
//             }
//         };

//         reader.onerror = () => {
//             reject(reader.error);
//         };

//         reader.readAsDataURL(file);
//     });
// }

export function copyArrayBuffer(source: ArrayBuffer) {
    const destination = new ArrayBuffer(source.byteLength);
    new Uint8Array(destination).set(new Uint8Array(source));
    return destination;
}
