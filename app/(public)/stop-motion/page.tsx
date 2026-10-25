import type { Metadata } from "next";
import { DisciplineHeading } from "@/app/_components/discipline-heading";
import { ReelStrip } from "@/app/_components/reel-strip";
import { getFramesByDiscipline } from "@/lib/frames";

export const metaData: Metadata = {
    title: "Stop motion",
};

export default async function StopMotionPage() {
    const clips = await getFramesByDiscipline("stop_motion");

    return (
        <>
            <DisciplineHeading title="Stop motion" count={clips.length} />

            {clips.length === 0 ? (
                <p>No stop motion yet.</p>
            ) : (
                <ReelStrip frames={clips} label="Stop motion" className="mt-10" />
            )}
        </>
    );
}