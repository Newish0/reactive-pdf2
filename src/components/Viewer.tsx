import BetterPDF from "@util/BetterPDF";
import { useState } from "react";

export function Viewer() {
    const [bPdf, setBPdf] = useState<BetterPDF>();
    const [bPdfNode, setBPdfNode] = useState<React.ReactNode>();

    console.log("Rerender:", bPdf);

    return (
        <div>
            <h1>VIEWER</h1>
            <input
                type="file"
                onChange={(evt) => {
                    const files = evt.target.files;

                    console.log(files);

                    if (!files) return;

                    const bPdf = new BetterPDF(files[0]);

                    setBPdf(bPdf);
                }}
            />

            <button
                className="btn btn-primary"
                onClick={async () => {
                    const jsxs = await bPdf?.renderPdfAsHtml();

                    if (jsxs?.length) {
                        setBPdfNode(<>{...jsxs[0]}</>);
                    }
                }}
            >
                Render
            </button>

            <div className="relative bg-neutral-500">{bPdfNode}</div>
        </div>
    );
}
