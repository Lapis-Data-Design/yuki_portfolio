import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Frame } from "@/app/_components/frame";
import { FrameDetail, FrameDetailShell } from "@/app/_components/frame-detail";
import { findFrameByNumber, getFramesByDiscipline } from "@/lib/frames";
import {
    findFrameInSequence,
    frameAlt,
    frameHref,
    frameLabel,
    frameLinkName,
    frameNumberParams,
    framePositionLabel,
    frameSrc,
    placeholderTone,
} from "@/lib/frame-display";

const STAGE_ASPECT = "aspect-[3/2]";

export async function generateStaticParams() {
   return frameNumberParams(await getFramesByDiscipline("photo"));
}

export async function generateMetadata({ params }: PageProps<"/photography/[frameNumber]">): Promise<Metadata> {
    const found = await findFrameByNumber("photo", (await params).frameNumber);
    return found ? { title: frameLinkName(found.frame) } : {};
}

export default function PhotoPage({ params }: PageProps<"/photography/[frameNumber]">) {
    return (
        <FrameDetailShell discipline="photo" mediaClassName={STAGE_ASPECT}>
            <PhotoDetail params={params} />
        </FrameDetailShell>
    );
}

async function PhotoDetail({ params }: Pick<PageProps<"/photography/[frameNumber]">, "params">) {
    const found = await findFrameByNumber("photo", (await params).frameNumber);
    if (!found) notFound();

    const { frame, index, total, previous, next } = found;

    return (
        <FrameDetail found={found}>
            <Frame 
                label={frameLabel(frame)}
                tone={placeholderTone(frame.id)}
                src={frameSrc(frame)}
                alt={frameAlt(frame)}
                sizes="(min-width: 768px) 680px, 85vw"
                priority
                className={STAGE_ASPECT}
            />
        </FrameDetail>
    );
}
