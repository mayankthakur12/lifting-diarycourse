import { format } from "date-fns";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getWorkoutById } from "@/data/workouts";

import { deleteWorkoutAction, updateWorkoutAction } from "../../actions";
import { WorkoutForm } from "../../workout-form";

export default async function EditWorkoutPage({
  params,
}: PageProps<"/dashboard/workouts/[id]/edit">) {
  const { id } = await params;
  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  const redirectDate = format(workout.startedAt, "yyyy-MM-dd");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit workout
          </h1>
          <p className="text-sm text-muted-foreground">
            Editing workout logged on {format(workout.startedAt, "do MMM yyyy")}
          </p>
        </div>

        <form action={deleteWorkoutAction.bind(null, workout.id, redirectDate)}>
          <Button type="submit" variant="destructive">
            Delete workout
          </Button>
        </form>
      </div>

      <Separator className="my-6" />

      <WorkoutForm
        action={updateWorkoutAction.bind(null, workout.id, redirectDate)}
        submitLabel="Save changes"
        defaultValues={{
          name: workout.name ?? "",
          date: redirectDate,
          time: format(workout.startedAt, "HH:mm"),
          durationMinutes: workout.completedAt
            ? String(
                Math.max(
                  0,
                  Math.round(
                    (workout.completedAt.getTime() -
                      workout.startedAt.getTime()) /
                      60000,
                  ),
                ),
              )
            : "",
          exercises: workout.exercises.map((exercise) => ({
            name: exercise.name,
            muscleGroup: exercise.muscleGroup ?? "",
            sets: exercise.sets.map((set) => ({
              weight: set.weight === null ? "" : String(set.weight),
              reps: String(set.reps),
            })),
          })),
        }}
      />
    </div>
  );
}
