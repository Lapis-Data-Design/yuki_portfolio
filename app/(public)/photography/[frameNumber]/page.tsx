import type { Metadata } from "next";
import { FrameDetailRoute } from "@/app/_components/frame-detail";
import { findFrameByNumber, getFramesByDiscipline } from "@/lib/frames";
import { frameLinkName, frameNumberParams } from "@/lib/frame-display";

export async function generateStaticParams() {
   return frameNumberParams(await getFramesByDiscipline("photo"));
}

export async function generateMetadata({ params }: PageProps<"/photography/[frameNumber]">): Promise<Metadata> {
    const found = await findFrameByNumber("photo", (await params).frameNumber);
    return found ? { title: frameLinkName(found.frame) } : {};
}

export default function PhotoPage({ params }: PageProps<"/photography/[frameNumber]">) {
    return <FrameDetailRoute discipline="photo" params={params} mediaClassName="aspect-[3/2]"/>;
}