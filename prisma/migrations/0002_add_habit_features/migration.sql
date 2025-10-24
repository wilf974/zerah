-- AddColumn Habit.isArchived, category, tags, frequency, targetDays
ALTER TABLE "Habit" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Habit" ADD COLUMN "category" TEXT;
ALTER TABLE "Habit" ADD COLUMN "tags" TEXT;
ALTER TABLE "Habit" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE "Habit" ADD COLUMN "targetDays" INTEGER NOT NULL DEFAULT 7;
