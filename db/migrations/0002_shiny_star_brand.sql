ALTER TABLE "frames" ADD COLUMN "is_hero" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "frames_discipline_frame_number_unique" ON "frames" USING btree ("discipline","frame_number");--> statement-breakpoint
CREATE UNIQUE INDEX "only_one_hero_frame" ON "frames" USING btree ("is_hero") WHERE "frames"."is_hero" = true;