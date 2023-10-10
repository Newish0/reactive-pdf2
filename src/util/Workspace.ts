import localforage from "localforage";
import { hashArrayBuffer } from "./hash";

import BetterPDF, { ProxyPage } from "./BetterPDF";
import { ExtendedDNDItem } from "@type/workspace";
import { proxyPageToExtendedDNDItem } from "./convert";

export type MinimalDNDItem = {
    selected: boolean;
    fileHash: string;
    pageNumber: number;
    dndIndex: number;
};

type WorkspaceInfo = {
    name: string;
    exportFileName: string;
};

/**
 * Represents a workspace (an instance of the app and its data).
 * Handles interacting to DB to allow persistency.
 */
export default class Workspace {
    /** Functions for getting DB keys */
    private static DB_KEY = {
        /** DB key for a file; shared across workspaces */
        file: (hash: string) => `_file-${hash}`,

        /**  DB key for list of all workspace ids */
        workspaceIndex: () => "_workspace/index",

        /** DB key for list of file hashes this workspace uses ;specific to each workspace */
        workspaceFilesIndex: (id: string) => `_workspace/${id}/files_index`,

        /** DB key for list of items this workspace uses ;specific to each workspace */
        workspaceItems: (id: string) => `_workspace/${id}/items`,

        /** DB key for info & user config of this workspace;specific to each workspace */
        workspaceInfo: (id: string) => `_workspace/${id}/info`,
    } as const;

    private static store = new Map<string, Workspace>();

    private id: string;

    public static async get(id: string) {
        let ws = Workspace.store.get(id);

        if (ws) return ws;

        ws = new Workspace(id);
        Workspace.store.set(id, ws);
        return ws;
    }

    public static async restore() {
        const wsIndex = await localforage.getItem<string[]>(Workspace.DB_KEY.workspaceIndex());

        if (!wsIndex) return;

        for (const wsId of wsIndex) {
            await Workspace.get(wsId);
        }
    }

    /**
     *
     * @param hash
     * @param exclude list of workspace ids
     * @returns
     */
    public static async fileIsInuse(hash: string, exclude?: string[]) {
        for (const [id, ws] of Workspace.store) {
            if (exclude?.includes(id)) continue;
            if ((await ws.getFileHashList()).includes(hash)) return true;
        }

        return false;
    }

    private constructor(id: string) {
        this.id = id;
    }

    private async getFileHashList() {
        const fileIndex = await localforage.getItem<string[]>(
            Workspace.DB_KEY.workspaceFilesIndex(this.id)
        );

        return fileIndex ?? [];
    }

    private async setFileHashList(fileHashList: string[]) {
        await localforage.setItem<string[]>(
            Workspace.DB_KEY.workspaceFilesIndex(this.id),
            fileHashList
        );
    }

    private async getFile(hash: string) {
        if (!(await this.getFileHashList()).includes(hash)) return null;

        return await localforage.getItem<File>(Workspace.DB_KEY.file(hash));
    }

    private async deleteFile(hash: string) {
        const fileHashList = await this.getFileHashList();

        if (!fileHashList.includes(hash)) return null;
        const file = await localforage.getItem<File>(Workspace.DB_KEY.file(hash));
        if (await Workspace.fileIsInuse(hash, [this.id])) {
            return file;
        } else {
            fileHashList.splice(
                fileHashList.findIndex((curHash) => curHash === hash),
                1
            );

            await this.setFileHashList(fileHashList);

            await localforage.removeItem(Workspace.DB_KEY.file(hash));
            return file;
        }
    }

    private async addFile(file: File, hash?: string) {
        const fileHashList = await this.getFileHashList();

        if (!hash) hash = await hashArrayBuffer(await file.arrayBuffer());
        if (fileHashList.includes(hash))
            return await localforage.getItem<File>(Workspace.DB_KEY.file(hash));

        fileHashList.push(hash);
        await this.setFileHashList(fileHashList);

        return await localforage.setItem<File>(Workspace.DB_KEY.file(hash), file);
    }

    public async getItems(): Promise<ExtendedDNDItem[]> {
        const fileHashList = await this.getFileHashList();

        const dndItems: ExtendedDNDItem[] = [];

        const minItems = await localforage.getItem<MinimalDNDItem[]>(
            Workspace.DB_KEY.workspaceItems(this.id)
        );

        if (!minItems) return dndItems;

        const proxyPagesMap = new Map<string, ProxyPage[]>();

        for (const hash of fileHashList) {
            const file = await this.getFile(hash);
            if (!file) continue;
            proxyPagesMap.set(hash, await (await BetterPDF.open(file)).toProxyPages(0.75));
        }

        for (const minItem of minItems) {
            const proxyPages = proxyPagesMap.get(minItem.fileHash);
            if (!proxyPages) throw new Error("Failed to restore workspace items");

            dndItems.push({
                ...proxyPageToExtendedDNDItem(proxyPages[minItem.pageNumber - 1]),
                selected: minItem.selected,
            });
        }

        return dndItems;
    }

    public async setItems(items: ExtendedDNDItem[]) {
        const fileHashList = await this.getFileHashList();

        const itemFileHashObj: Record<string, boolean> = {};

        const minItems: MinimalDNDItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            itemFileHashObj[item.page.reference.hash] = true;
            this.addFile(item.page.reference.file, item.page.reference.hash);

            const minItem: MinimalDNDItem = {
                dndIndex: i,
                fileHash: item.page.reference.hash,
                pageNumber: item.page.reference.page,
                selected: item.selected,
            };

            minItems.push(minItem);
        }

        // Save to DB
        await localforage.setItem<MinimalDNDItem[]>(
            Workspace.DB_KEY.workspaceItems(this.id),
            minItems
        );

        // Cleanup
        const inUseFileHashes = Object.keys(itemFileHashObj);
        for (const savedHash of fileHashList) {
            if (!inUseFileHashes.includes(savedHash)) this.deleteFile(savedHash);
        }
    }

    public async setInfo(info: WorkspaceInfo) {
        return await localforage.setItem<WorkspaceInfo>(
            Workspace.DB_KEY.workspaceInfo(this.id),
            info
        );
    }

    public async getInfo() {
        return await localforage.getItem<WorkspaceInfo>(Workspace.DB_KEY.workspaceInfo(this.id));
    }
}

Workspace.restore();
