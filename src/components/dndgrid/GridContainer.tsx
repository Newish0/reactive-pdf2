interface GridContainerProps extends React.PropsWithChildren {
    spacing: number;
    gridSize: number;
}

export default function GridContainer({ children, spacing, gridSize }: GridContainerProps) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
                gap: `${spacing}px`,
            }}
        >
            {children}
        </div>
    );
}

GridContainer.defaultProps = {
    spacing: 8,
    gridSize: 160,
};
