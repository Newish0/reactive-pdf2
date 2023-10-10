import { useEffect, useState } from "react";

import Workspace from "@util/Workspace";
import { ExtendedDNDItem } from "@type/workspace";

/**
 * A React hook that simplifies the usage of a `Workspace`.
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

                const info = await workspace.getInfo();
                if (info?.exportFileName) setExportFileName(info.exportFileName);
                if (info?.name) setWorkspaceName(info.name);

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
                workspace.setItems(items);
                workspace.setInfo({
                    exportFileName,
                    name: workspaceName,
                });
            } catch (error) {
                console.error("Failed to save items due to: \n", error);
            }
        })();
    }, [items, id, ready, exportFileName, workspaceName]);

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
