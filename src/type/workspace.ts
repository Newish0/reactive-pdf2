import { DNDItem } from "@components/dndgrid/GridDNDBox";
import { ProxyPage } from "@util/BetterPDF";

export type ExtendedDNDItem = DNDItem & {
    page: ProxyPage;
};
