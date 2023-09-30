import { DNDItem } from "@components/dndgrid/GridDNDBox";
import { ProxyPage } from "./BetterPDF";

export const proxyPageToDNDItem = (page: ProxyPage): DNDItem => {
    return {
        id: `${page.reference.hash}-${page.reference.page}`,
        title: `${page.reference.file.name} ⋅ ${page.reference.page}`,
        content: (
            <img
                className="object-contain border border-neutral rounded-md"
                src={page.thumbnail ?? ""}
            />
        ),
        selected: false,
        page,
    };
};
