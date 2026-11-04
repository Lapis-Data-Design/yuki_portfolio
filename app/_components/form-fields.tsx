import type { InputHTMLAttributes } from "react";

const LABEL = "block font-serif text-sm text-text-primary mb-1";
const INPUT = "w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary";
const HINT = "mt-1 font-serif text-xs text-text-primary";
const MESSAGE = "font-serif text-sm text-text-primary border-l-2 pl-3";
const BUTTON = "border py-2 px-4 font-sans font-medium transition-colors";
const BUTTON_READY = "border-accent-primary bg-accent-primary text-background hover:border-accent-secondary hover:bg-accent-secondary disabled:opacity-60";
const BUTTON_WAITING = "border-text-primary/30 bg-transparent text-text-primary/60 cursor-not-allowed";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
    id: string;
    label: string;
    hint?: string;
    error?: string | null;
};

export function Field({ id, label, hint, error, ...input}: FieldProps) {
    const hintId = hint ? `${id}Hint` : undefined;
    const errorId = error ? `${id}Error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div>
            <label htmlFor={id} className={LABEL}>
                {label}
            </label>
            <input 
                {...input}
                id={id}
                className={INPUT}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
            />
            {hint && (
                <p id={hintId} className={HINT}>
                    {hint}
                </p>
            )}
            {error !== undefined && (
                <p
                    id={`${id}Error`}
                    aria-live="polite"
                    className={`mt-2 min-h-5 ${error ? `${MESSAGE} border-accent-primary` : ""}`} 
                >
                    {error ?? ""}
                </p>
            )}
        </div>
    );
}

export function FormResult({ state }: { state: { success: boolean; error: string | null } }) {
    return (
        <>
            {state.error && (
                <p className={`${MESSAGE} border-accent-primary`} role="alert">
                    {state.error}
                </p>
            )}
            <div role="status">
                {state.success && <p className={`${MESSAGE} border-accent-tertiary`}>Saved.</p>}
            </div>
        </>
    )
}

export function SubmitButton({
    ready,
    pending,
    label,
}: {
    ready: boolean;
    pending: boolean;
    label: string;
}) {
    return (
        <button
            type="submit"
            disabled={pending || !ready}
            className={`${BUTTON} ${ready ? BUTTON_READY : BUTTON_WAITING}`}
        >
            {pending ? "Saving..." : label}
        </button>
    )
}