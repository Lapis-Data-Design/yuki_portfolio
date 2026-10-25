import type { Metadata } from "next";
import { FrameDetailRoute } from "@/app/_components/frame-detail";
import { findFrameByNumber, getFramesByDiscipline } from "@/lib/frames";
import { frameLinkName, frameNumberParams } from "@/lib/frame-display";

export async function generateStaticParams() {
    return frameNumberParams(await getFramesByDiscipline("video"));
}

export async function generateMetadata({ params }: PageProps<"/video/[frameNumber]">): Promise<Metadata> {
    const found = await findFrameByNumber("video", (await params).frameNumber);
    return found ? { title: frameLinkName(found.frame)} : {};
}

export default function VideoDetailPage({ params }: PageProps<"/video/[frameNumber]">) {
    return <FrameDetailRoute discipline="video" params={params} mediaClassName="aspect-video" />;
}
