export class IndexOutOfBoundsError extends Error {
    constructor(index: number) {
        super(`Index ${index} is out of bounds`);
        this.name = "IndexOutOfBoundsError";
    }
}


export class PDFNotReadyError extends Error {
    constructor() {
        super("PDF is not ready. Loading is in progress.");
        this.name = "PDFNotReadyError";
    }
}


export class LengthMismatchError extends Error {
    constructor(expectedLength: number, actualLength: number) {
        super(`Length mismatch. Expected ${expectedLength}, but got ${actualLength}.`);
        this.name = "LengthMismatchError";
    }
}