import { format, isValid, parseISO } from "date-fns";
import { Clock, Dumbbell } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getWorkoutsForDate } from "@/data/workouts";

import { DatePicker } from "./date-picker";

const volumeFormatter = new Intl.NumberFormat("en-US");

function formatDuration(minutes: number | null): string | null {
  if (minutes === null) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}m`;
}

function resolveDate(value: string | string[] | undefined): Date {
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const date = resolveDate(params.date);
  const workouts = await getWorkoutsForDate(date);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Workouts logged on {format(date, "do MMM yyyy")}
          </p>
        </div>

        <DatePicker date={date} />
      </div>

      <Separator className="my-6" />

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <Dumbbell className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No workouts logged</p>
            <p className="text-sm text-muted-foreground">
              Nothing was recorded on {format(date, "do MMM yyyy")}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout) => {
            const durationLabel = formatDuration(workout.durationMinutes);
            return (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{workout.name}</CardTitle>
                    {workout.focus && (
                      <Badge variant="secondary">{workout.focus}</Badge>
                    )}
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-4 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {format(parseISO(workout.startedAt), "HH:mm")}
                      {durationLabel ? ` · ${durationLabel}` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="size-3.5" />
                      {volumeFormatter.format(
                        Math.round(workout.totalVolumeKg),
                      )}{" "}
                      kg total volume
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {workout.exercises.map((exercise, index) => (
                    <div key={exercise.name} className="flex flex-col gap-2">
                      {index > 0 && <Separator />}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{exercise.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {exercise.sets.length} sets
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exercise.sets.map((set, setIndex) => (
                          <Badge
                            key={setIndex}
                            variant="outline"
                            className="font-normal tabular-nums"
                          >
                            {set.weight} × {set.reps}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
