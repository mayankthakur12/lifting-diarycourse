import { format, isValid, parseISO } from "date-fns";

import { Separator } from "@/components/ui/separator";

import { createWorkoutAction } from "../actions";
import { WorkoutForm } from "../workout-form";

function resolveDate(value: string | string[] | undefined): Date {
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

export default async function NewWorkoutPage({
  searchParams,
}: PageProps<"/dashboard/workouts/new">) {
  const params = await searchParams;
  const date = resolveDate(params.date);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Log workout</h1>
        <p className="text-sm text-muted-foreground">
          Recording a workout for {format(date, "do MMM yyyy")}
        </p>
      </div>

      <Separator className="my-6" />

      <WorkoutForm
        action={createWorkoutAction}
        submitLabel="Save workout"
        defaultValues={{
          name: "",
          date: format(date, "yyyy-MM-dd"),
          time: format(new Date(), "HH:mm"),
          durationMinutes: "",
          exercises: [],
        }}
      />
    </div>
  );
}
