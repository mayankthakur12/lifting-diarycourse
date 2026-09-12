import { getExercises } from "@/data/exercises";

import { WorkoutForm } from "./workout-form";

export default async function NewWorkoutPage() {
  const exercises = await getExercises();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New workout</h1>
        <p className="text-sm text-muted-foreground">
          Log a workout with its exercises and sets.
        </p>
      </div>

      <div className="mt-6">
        <WorkoutForm exercises={exercises} />
      </div>
    </div>
  );
}
