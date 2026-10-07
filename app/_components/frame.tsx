import Image from "next/image";

export type FrameTone = "accent-primary" | "accent-secondary" | "accent-tertiary" | "accent-soft";

type FrameProps = {
    label: string;
    src?: string;
    alt?: string;
    tone?: FrameTone;
    sizes?: string;
    priority?: boolean;
    className?: string;
};

export function Frame({
    label,
    src,
    alt = "",
    tone = "accent-primary",
    sizes = "100vw",
    priority = false,
    className = "",
}: FrameProps) {
    return (
        <figure className={`relative overflow-hidden rounded-[2px] ${className}`}>
            {src ? (
                <Image 
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover"
                />
            ) : (
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(150deg, var(--theme-${tone}), var(--theme-background) 75%)`,
                    }}
                />
            )}
            <figcaption className="absolute bottom-2.5 right-3 font-mono text-[11px text-text-primary">
                {label}
            </figcaption>
        </figure>
    );
}