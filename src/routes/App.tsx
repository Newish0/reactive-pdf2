import GridDNDBox from "@components/GridDNDBox";
import PseudoPageInput from "@components/PseudoPageInput";

export default function App() {
    return (
        <section className="px-6 py-8">
            <div className="">
                <div className="prose prose-sm md:prose-base">
                    <h1>Reactive PDF</h1>
                </div>

                <div className="rounded p-4 bg-base-200">
                    <GridDNDBox
                        items={[
                            {
                                id: "1",
                                content: (
                                    <img
                                        className="p-2 m-auto w-32 aspect-auto h-full object-contain"
                                        src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                                    />
                                ),
                            },
                            {
                                id: "2",
                                content: (
                                    <img
                                        className="p-2 m-auto w-32 aspect-auto h-full object-contain"
                                        src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                                    />
                                ),
                            },
                            {
                                id: "3",
                                content: (
                                    <img
                                        className="p-2 m-auto w-32 aspect-auto h-full object-contain"
                                        src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                                    />
                                ),
                            },
                            {
                                id: "4",
                                content: (
                                    <img
                                        className="p-2 m-auto w-32 aspect-auto h-full object-contain"
                                        src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                                    />
                                ),
                            },
                            {
                                id: "5",
                                content: (
                                    <img
                                        className="p-2 m-auto w-32 aspect-auto h-full object-contain"
                                        src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                                    />
                                ),
                            },
                        ]}
                        end={
                            <div className="p-4 m-auto">
                                <PseudoPageInput
                                    onChange={function (files: FileList | null): void {
                                        console.log(files);
                                    }}
                                ></PseudoPageInput>
                            </div>
                        }
                    ></GridDNDBox>
                </div>
            </div>
        </section>
    );
}
