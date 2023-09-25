export default function GridContainer({ children }: React.PropsWithChildren) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "8px",
            }}
        >
            {/* {items.map((item) => (
                <GridItem key={item.id} id={item.id}>
                    <div className="p-4 text-center">{item.content}</div>
                </GridItem>
            ))} */}

            {children}

            {/* <div className="p-4 text-center">CANNOT MOVE</div> */}
        </div>
    );
}
