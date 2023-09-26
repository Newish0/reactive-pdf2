interface GridContainerProps extends React.PropsWithChildren {
    spacing: number;
}

export default function GridContainer({ children, spacing }: GridContainerProps) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: `${spacing}px`,
            }}
        >
            {children}
        </div>
    );
}

GridContainer.defaultProps = {
    spacing: 8,
};
