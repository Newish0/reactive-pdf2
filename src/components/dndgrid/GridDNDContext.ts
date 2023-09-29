import { Dispatch, SetStateAction, createContext } from "react";
import { DNDItem } from "./GridDNDBox";

type GridDNDContextType = [items: DNDItem[], setItems: Dispatch<SetStateAction<DNDItem[]>>];

const GridDNDContext = createContext<GridDNDContextType>([[], () => {}]);

export default GridDNDContext;
