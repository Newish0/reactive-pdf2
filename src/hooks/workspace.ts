import { useEffect, useState } from "react";

import Workspace from "@util/Workspace";
import { ExtendedDNDItem } from "@type/workspace";

/**
 * A workspace contains the basic data and functions for a instance of the PDF rearranging app.
 */
export function useWorkspace(id: string) {
    const [ready, setReady] = useState(false);
    const [items, setItems] = useState<ExtendedDNDItem[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string>("New workspace");
    const [exportFileName, setExportFileName] = useState<string>("reactive-pdf-export.pdf");

    // Grab items from DB
    useEffect(() => {
        (async () => {
            try {
                const workspace = await Workspace.get(id);
                const items = await workspace.getItems();
                console.log("GOT ITEMS", items);
                setItems(items);
                setReady(true);
            } catch (error) {
                console.error(error);
                return;
            }
        })();
    }, [id]);

    // Sync changes to DB
    useEffect(() => {
        (async () => {
            if (!ready) return;
            try {
                const workspace = await Workspace.get(id);
                console.log("SAVE ITEMS", items);
                workspace.setItems(items);
            } catch (error) {
                console.error("Failed to save items due to: \n", error);
            }
        })();
    }, [items, id, ready]);

    return {
        items,
        setItems,
        workspaceName,
        setWorkspaceName,
        exportFileName,
        setExportFileName,
        ready,
    } as const;
}
