import { Divider } from "react-daisyui";

interface PageContainerProps extends React.PropsWithChildren {
    title: string;
}

export default function PageContainer({ children, title }: PageContainerProps) {
    return (
        <section className="px-6 py-8 h-screen">
            <div className="flex flex-col space-y-4 h-full">
                <div className="prose prose-sm md:prose-base">
                    <h1>{title}</h1>
                </div>

                <Divider></Divider>

                {children}
            </div>
        </section>
    );
}
