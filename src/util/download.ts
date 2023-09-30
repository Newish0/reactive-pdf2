function downloadBytes(bytes: ArrayBuffer, type: string, fileName: string) {
    const blob = new Blob([bytes], { type });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

export function downloadPDF(pdfBytes: ArrayBuffer, fileName = "output.pdf") {
    downloadBytes(pdfBytes, "application/pdf", fileName);
}
