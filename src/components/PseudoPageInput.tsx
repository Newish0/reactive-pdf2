import { TbPlus } from "react-icons/tb";

interface PseudoPageInputProps {
    type: "Letter";
    onChange?: (files: FileList | null) => void;
}

export default function PseudoPageInput({ onChange, type }: PseudoPageInputProps) {
    const changeHandler = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(evt.target.files);
    };

    if (type === "Letter") {
        return (
            <div className="group border-2 border-dashed border-primary aspect-85-110 w-full h-full flex justify-center items-center hover:border-primary-focus hover:scale-105 transition-all ">
                <input
                    className="w-full h-full opacity-0 cursor-pointer"
                    type="file"
                    onChange={changeHandler}
                />
                <TbPlus className="absolute text-2xl text-primary group-hover:text-primary-focus group-hover:scale-125 transition-all " />
            </div>
        );
    }
}

PseudoPageInput.defaultProps = {
    type: "Letter",
};
