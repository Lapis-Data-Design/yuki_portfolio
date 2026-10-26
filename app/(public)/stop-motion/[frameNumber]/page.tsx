import type { Metadata } from "next";
import { FrameDetailRoute } from "@/app/_components/frame-detail";
import { findFrameByNumber, getFramesByDiscipline } from "@/lib/frames";
import { frameLinkName, frameNumberParams } from "@/lib/frame-display";

export async function generateStaticParams() {
    return frameNumberParams(await getFramesByDiscipline("stop_motion"));
}

export async function generateMetadata({ params }: PageProps<"/stop-motion/[frameNumber]">): Promise<Metadata> {
    const found = await findFrameByNumber("stop_motion", (await params).frameNumber);
    return found ? { title: frameLinkName(found.frame) } : {};
}

export default function StopMotionDetailPage({ params }: PageProps<"/stop-motion/[frameNumber]">) {
    return <FrameDetailRoute discipline="stop_motion" params={params} mediaClassName="aspect-video" />
}