/**
 * Get the hash of an array buffer
 * @param arrayBuffer
 * @returns the hash of the buffer
 */
export async function hashArrayBuffer(
    arrayBuffer: ArrayBuffer,
    algorithm: AlgorithmIdentifier = "SHA-256"
): Promise<string> {
    // Import the subtle crypto functions
    const subtle = window.crypto.subtle;

    // Calculate the SHA-256 hash
    const hashBuffer = await subtle.digest(algorithm, arrayBuffer);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}
