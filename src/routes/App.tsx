import GridDNDBox from "@components/GridDNDBox";

export default function App() {
    return (
        <div>
            <h1>App</h1>
            <GridDNDBox
                items={[
                    {
                        id: "1",
                        content: (
                            <img
                            className="p-2 w-full aspect-auto h-full object-contain"    
                            src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                            />
                        ),
                    },
                    {
                        id: "2",
                        content: (
                            <img
                            className="p-2 w-full aspect-auto h-full object-contain"    
                            src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                            />
                        ),
                    },
                    {
                        id: "3",
                        content: (
                            <img
                            className="p-2 w-full aspect-auto h-full object-contain"    
                            src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                            />
                        ),
                    },
                    {
                        id: "4",
                        content: (
                            <img
                            className="p-2 w-full aspect-auto h-full object-contain"    
                            src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                            />
                        ),
                    },
                    {
                        id: "5",
                        content: (
                            <img
                            className="p-2 w-full aspect-auto h-full object-contain"    
                            src={`https://picsum.photos/seed/${crypto.randomUUID()}/200/300`}
                            />
                        ),
                    },
                ]}
            ></GridDNDBox>
        </div>
    );
}
