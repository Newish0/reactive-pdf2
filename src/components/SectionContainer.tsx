import React from "react";
import { twMerge } from "tailwind-merge";

export default function SectionContainer(
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) {
    return (
        <div
            {...props}
            className={twMerge("rounded-box p-8 bg-base-200", props.className ?? "")}
        ></div>
    );
}
