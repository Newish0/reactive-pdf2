import BetterPDF from "@util/BetterPDF";
import { atom } from "jotai";

export const pdfAtom = atom<BetterPDF | null>(null);
