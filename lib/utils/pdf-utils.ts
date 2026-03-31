/**
 * PDF Processing Utilities
 */

/**
 * Converts a Blob object to a Base64 encoded string.
 * This is useful for passing PDF data from the client to Server Actions.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove the prefix "data:application/pdf;base64,"
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Dynamically generates a PDF Blob using @react-pdf/renderer.
 * Must be used in client-side components.
 */
export async function generatePDFBlob(component: React.ReactElement): Promise<Blob> {
    // We use dynamic import to avoid bundling react-pdf on the server
    const { pdf } = await import('@react-pdf/renderer');
    return await pdf(component).toBlob();
}
