"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ExerciseOption } from "@/data/exercises";
import type { EditableWorkout } from "@/data/workouts";

import { createWorkoutAction } from "./actions";
import { updateWorkoutAction } from "../[workoutId]/actions";

type SetDraft = {
  weight: string;
  reps: string;
};

type ExerciseDraft = {
  exerciseId: string;
  sets: SetDraft[];
};

function emptySet(): SetDraft {
  return { weight: "", reps: "" };
}

function emptyExercise(): ExerciseDraft {
  return { exerciseId: "", sets: [emptySet()] };
}

function draftsFromWorkout(workout: EditableWorkout): ExerciseDraft[] {
  return workout.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: exercise.sets.map((set) => ({
      weight: set.weight === null ? "" : String(set.weight),
      reps: set.reps === null ? "" : String(set.reps),
    })),
  }));
}

export function WorkoutForm({
  exercises,
  workout,
}: {
  exercises: ExerciseOption[];
  workout?: EditableWorkout;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(workout?.name ?? "");
  const [startedAt, setStartedAt] = useState(() =>
    format(workout?.startedAt ?? new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const [exerciseDrafts, setExerciseDrafts] = useState<ExerciseDraft[]>(() =>
    workout ? draftsFromWorkout(workout) : [emptyExercise()],
  );

  function updateExercise(index: number, next: Partial<ExerciseDraft>) {
    setExerciseDrafts((prev) =>
      prev.map((exercise, i) =>
        i === index ? { ...exercise, ...next } : exercise,
      ),
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    next: Partial<SetDraft>,
  ) {
    setExerciseDrafts((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, ...next } : set,
              ),
            }
          : exercise,
      ),
    );
  }

  function addExercise() {
    setExerciseDrafts((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExerciseDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exerciseIndex: number) {
    setExerciseDrafts((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, emptySet()] }
          : exercise,
      ),
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExerciseDrafts((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, j) => j !== setIndex),
            }
          : exercise,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const exercisesInput = exerciseDrafts.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((set) => ({
            weight: set.weight === "" ? null : Number(set.weight),
            reps: set.reps === "" ? null : Number(set.reps),
          })),
        }));

        if (workout) {
          await updateWorkoutAction({
            workoutId: workout.id,
            name,
            startedAt: new Date(startedAt),
            exercises: exercisesInput,
          });
        } else {
          await createWorkoutAction({
            name,
            startedAt: new Date(startedAt),
            exercises: exercisesInput,
          });
        }
        router.push(
          `/dashboard?date=${format(new Date(startedAt), "yyyy-MM-dd")}`,
        );
      } catch {
        setError(
          workout
            ? "Something went wrong updating this workout. Try again."
            : "Something went wrong creating this workout. Try again.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="workout-name">Name</Label>
            <Input
              id="workout-name"
              placeholder="Push day"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="workout-started-at">Date &amp; time</Label>
            <Input
              id="workout-started-at"
              type="datetime-local"
              value={startedAt}
              onChange={(event) => setStartedAt(event.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {exerciseDrafts.map((exercise, exerciseIndex) => (
        <Card key={exerciseIndex}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Exercise {exerciseIndex + 1}
            </CardTitle>
            {exerciseDrafts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExercise(exerciseIndex)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Exercise</Label>
              <Select
                value={exercise.exerciseId}
                onValueChange={(value) =>
                  updateExercise(exerciseIndex, { exerciseId: value ?? "" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-end gap-3">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>
                      Set {setIndex + 1} weight (kg)
                    </Label>
                    <Input
                      id={`weight-${exerciseIndex}-${setIndex}`}
                      type="number"
                      step="0.5"
                      min="0"
                      value={set.weight}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, {
                          weight: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>
                      Reps
                    </Label>
                    <Input
                      id={`reps-${exerciseIndex}-${setIndex}`}
                      type="number"
                      min="0"
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, {
                          reps: event.target.value,
                        })
                      }
                    />
                  </div>
                  {exercise.sets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => addSet(exerciseIndex)}
              >
                <Plus className="size-3.5" />
                Add set
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit gap-1.5"
        onClick={addExercise}
      >
        <Plus className="size-3.5" />
        Add exercise
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : workout
              ? "Update workout"
              : "Save workout"}
        </Button>
      </div>
    </form>
  );
}
