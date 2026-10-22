import { frameCountLabel } from "@/lib/frame-display";

type DisciplineHeadingProps = {
    title: string;
    count: number;
};

export function DisciplineHeading({ title, count }: DisciplineHeadingProps) {
    return (
        <header className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <h1 className="font-sans text-[clamp(2.25rem,6vw,3.25rem)] font-bold leading-none tracking-[-0.01em]">
                {title}
            </h1>
            <p className="font-mono text-[13px] text-text-primary">
                {frameCountLabel(count)}
            </p>
        </header>
    );
}