export default function GridContainer({ children }: React.PropsWithChildren) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "8px",
            }}
        >
            {children}
        </div>
    );
}
