import { notFound } from "next/navigation";

import { getExercises } from "@/data/exercises";
import { getWorkoutById } from "@/data/workouts";

import { WorkoutForm } from "../new/workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const [exercises, workout] = await Promise.all([
    getExercises(),
    getWorkoutById(workoutId),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit workout
        </h1>
        <p className="text-sm text-muted-foreground">
          Update this workout&apos;s exercises and sets.
        </p>
      </div>

      <div className="mt-6">
        <WorkoutForm exercises={exercises} workout={workout} />
      </div>
    </div>
  );
}
