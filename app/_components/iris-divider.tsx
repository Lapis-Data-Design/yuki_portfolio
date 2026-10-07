export function IrisDivider({ className= "" }: {className?: string }) {
    return (
        <div role="separator" className="{`relative h-px w-full bg-text-primary/15 ${className}`}">
            <span 
                aria-hidden
                className="absolute left-1/2 -top-[11px] size-[22px] -translate-x-1/2 rounded-full border-[1.5px] border-accent-primary border-b-transparent border-l-transparent bg-background"
            />
        </div>
    );
}