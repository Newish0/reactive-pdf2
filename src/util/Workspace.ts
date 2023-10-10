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
 * A workspace contains the basic data and functions for a instance of the PDF rearranging app.
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

    /** Contains all workspaces */
    private static store = new Map<string, Workspace>();

    /** ID of the current workspace */
    private id: string;

    /**
     * Returns the workspace of the specified ID. Used for instantiating a `Workspace`.
     * @param id the id of the specified workspace
     * @returns a workspace instance
     */
    public static async get(id: string) {
        let ws = Workspace.store.get(id);

        if (ws) return ws;

        ws = new Workspace(id);
        Workspace.store.set(id, ws);
        return ws;
    }

    /**
     * Restore all workspaces stored in DB. This function must be run at the start of the app
     * (called at the bottom of the file).
     * @returns
     */
    public static async restore() {
        const wsIndex = await localforage.getItem<string[]>(Workspace.DB_KEY.workspaceIndex());

        if (!wsIndex) return;

        for (const wsId of wsIndex) {
            await Workspace.get(wsId);
        }
    }

    /**
     * Check if a file is in use by the workspaces.
     * @param hash the hash of the file
     * @param exclude list of id of the workspaces to exclude
     * @returns true if in use else false
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

    /**
     * Get a list of hashes of the files used by this workspace.
     * @returns
     */
    private async getFileHashList() {
        const fileIndex = await localforage.getItem<string[]>(
            Workspace.DB_KEY.workspaceFilesIndex(this.id)
        );

        return fileIndex ?? [];
    }

    /**
     * Update the file hash list of this workspace.
     * @param fileHashList
     */
    private async setFileHashList(fileHashList: string[]) {
        await localforage.setItem<string[]>(
            Workspace.DB_KEY.workspaceFilesIndex(this.id),
            fileHashList
        );
    }

    /**
     * Get a file from DB.
     */
    private async getFile(hash: string) {
        if (!(await this.getFileHashList()).includes(hash)) return null;

        return await localforage.getItem<File>(Workspace.DB_KEY.file(hash));
    }

    /**
     * Delete a file from DB.
     * @param hash hash of the file
     * @returns the deleted file
     */
    private async deleteFile(hash: string) {
        const fileHashList = await this.getFileHashList();

        if (!fileHashList.includes(hash)) return null;

        const file = await localforage.getItem<File>(Workspace.DB_KEY.file(hash));

        // Only actually delete the file if it's not in use by all other workspaces.
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

    /**
     * Stores a file to DB.
     * @param file file to store
     * @param hash optional: the hash of the file
     * @returns The newly added file
     */
    private async addFile(file: File, hash?: string) {
        const fileHashList = await this.getFileHashList();

        if (!hash) hash = await hashArrayBuffer(await file.arrayBuffer());

        // Skip storing the file if already in DB.
        if (fileHashList.includes(hash))
            return await localforage.getItem<File>(Workspace.DB_KEY.file(hash));

        // Update file hash list with the hash of the new file
        fileHashList.push(hash);
        await this.setFileHashList(fileHashList);

        return await localforage.setItem<File>(Workspace.DB_KEY.file(hash), file);
    }

    /**
     * Get the list of items from DB
     * @returns List of ExtendedDNDItem as a promise
     */
    public async getItems(): Promise<ExtendedDNDItem[]> {
        const fileHashList = await this.getFileHashList();

        const dndItems: ExtendedDNDItem[] = [];

        const minItems = await localforage.getItem<MinimalDNDItem[]>(
            Workspace.DB_KEY.workspaceItems(this.id)
        );

        if (!minItems) return dndItems;

        // Get the proxy pages of the stored files
        const proxyPagesMap = new Map<string, ProxyPage[]>();
        for (const hash of fileHashList) {
            const file = await this.getFile(hash);
            if (!file) continue;
            proxyPagesMap.set(hash, await (await BetterPDF.open(file)).toProxyPages(0.75));
        }

        // Expand all MinimalDNDItem to ExtendedDNDItem
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

    /**
     * Store a list of ExtendedDNDItem to DB
     * @returns
     */
    public async setItems(items: ExtendedDNDItem[]) {
        const fileHashList = await this.getFileHashList();

        const itemFileHashObj: Record<string, boolean> = {};

        const minItems: MinimalDNDItem[] = [];

        // Convert all ExtendedDNDItem to MinimalDNDItem
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

    /**
     * Updates the info of this workspace.
     * @param info
     * @returns
     */
    public async setInfo(info: WorkspaceInfo) {
        return await localforage.setItem<WorkspaceInfo>(
            Workspace.DB_KEY.workspaceInfo(this.id),
            info
        );
    }

    /**
     * Returns the info of this workspace.
     * @returns
     */
    public async getInfo() {
        return await localforage.getItem<WorkspaceInfo>(Workspace.DB_KEY.workspaceInfo(this.id));
    }
}

// Load workspaces from DB at the stare of the app.
Workspace.restore();
