export async function hashArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
    // Import the subtle crypto functions
    const subtle = window.crypto.subtle;

    // Calculate the SHA-256 hash
    const hashBuffer = await subtle.digest("SHA-256", arrayBuffer);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}