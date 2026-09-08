"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type LoggedSet = {
  weight: string;
  reps: number;
};

type LoggedExercise = {
  name: string;
  sets: LoggedSet[];
};

type LoggedWorkout = {
  id: string;
  name: string;
  focus: string;
  startedAt: string;
  durationLabel: string;
  totalVolumeLabel: string;
  exercises: LoggedExercise[];
};

// Placeholder data — no fetching wired up yet, UI only.
const PLACEHOLDER_WORKOUTS: LoggedWorkout[] = [
  {
    id: "1",
    name: "Push Day",
    focus: "Chest · Shoulders · Triceps",
    startedAt: "07:15",
    durationLabel: "1h 05m",
    totalVolumeLabel: "8,420 kg",
    exercises: [
      {
        name: "Barbell Bench Press",
        sets: [
          { weight: "60 kg", reps: 10 },
          { weight: "80 kg", reps: 8 },
          { weight: "90 kg", reps: 6 },
          { weight: "90 kg", reps: 5 },
        ],
      },
      {
        name: "Seated Dumbbell Shoulder Press",
        sets: [
          { weight: "22 kg", reps: 12 },
          { weight: "24 kg", reps: 10 },
          { weight: "24 kg", reps: 9 },
        ],
      },
      {
        name: "Cable Triceps Pushdown",
        sets: [
          { weight: "25 kg", reps: 15 },
          { weight: "30 kg", reps: 12 },
          { weight: "30 kg", reps: 12 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Evening Conditioning",
    focus: "Core · Cardio",
    startedAt: "18:40",
    durationLabel: "32m",
    totalVolumeLabel: "1,150 kg",
    exercises: [
      {
        name: "Hanging Leg Raise",
        sets: [
          { weight: "Bodyweight", reps: 15 },
          { weight: "Bodyweight", reps: 12 },
          { weight: "Bodyweight", reps: 12 },
        ],
      },
      {
        name: "Weighted Plank",
        sets: [
          { weight: "10 kg", reps: 1 },
          { weight: "10 kg", reps: 1 },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workouts = PLACEHOLDER_WORKOUTS;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Workouts logged on {format(date, "do MMM yyyy")}
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-start gap-2 font-normal sm:w-56"
              />
            }
          >
            <CalendarIcon className="size-4" />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(next) => {
                if (next) {
                  setDate(next);
                  setOpen(false);
                }
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
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
          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{workout.name}</CardTitle>
                  <Badge variant="secondary">{workout.focus}</Badge>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {workout.startedAt} · {workout.durationLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="size-3.5" />
                    {workout.totalVolumeLabel} total volume
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
          ))}
        </div>
      )}
    </div>
  );
}
