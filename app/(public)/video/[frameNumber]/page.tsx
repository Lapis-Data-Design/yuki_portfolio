import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Frame } from "@/app/_components/frame";
import { FrameDetail, FrameDetailShell } from "@/app/_components/frame-detail";
import { findFrameByNumber, getFramesByDiscipline } from "@/lib/frames";
import {
    frameAlt,
    frameLabel,
    frameLinkName,
    frameNumberParams,
    frameSrc,
    placeholderTone,
} from "@/lib/frame-display";

const STAGE_ASPECT = "aspect-video";

export async function generateStaticParams() {
    return frameNumberParams(await getFramesByDiscipline("video"));
}

export async function generateMetadata({ params }: PageProps<"/video/[frameNumber]">): Promise<Metadata> {
    const found = await findFrameByNumber("video", (await params).frameNumber);
    return found ? { title: frameLinkName(found.frame)} : {};
}

export default function VideoDetailPage({ params }: PageProps<"/video/[frameNumber]">) {
    return (
        <FrameDetailShell discipline="video" mediaClassName={STAGE_ASPECT}>
            <VideoDetail params={params} />
        </FrameDetailShell>
    );
}

async function VideoDetail({ params }: Pick<PageProps<"/video/[frameNumber]">, "params">) {
    const found = await findFrameByNumber("video", (await params).frameNumber);
    if (!found) notFound();

    const { frame } = found;

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