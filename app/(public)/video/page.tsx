import type { Metadata } from "next";
import { DisciplineHeading } from "@/app/_components/discipline-heading";
import { ReelStrip } from "@/app/_components/reel-strip";
import { getFramesByDiscipline } from "@/lib/frames";

export const metadata: Metadata = {
    title: "Video",
};

export default async function VideoPage() {
    const videos = await getFramesByDiscipline("video");

    return (
        <>
            <DisciplineHeading title="Video" count={videos.length} />

            {videos.length === 0 ? (
                <p className="mt-10 max-w-[60ch]">No videos yet.</p>
            ) : (
                <ReelStrip frames={videos} label="Videos" className="mt-10" />
            )}
        </>
    );
}