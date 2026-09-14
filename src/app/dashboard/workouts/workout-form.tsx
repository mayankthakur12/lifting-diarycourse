"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type SetDraft = { weight: string; reps: string };
type ExerciseDraft = { name: string; muscleGroup: string; sets: SetDraft[] };

export type WorkoutFormValues = {
  name: string;
  date: string;
  time: string;
  durationMinutes: string;
  exercises: ExerciseDraft[];
};

function emptySet(): SetDraft {
  return { weight: "", reps: "" };
}

function emptyExercise(): ExerciseDraft {
  return { name: "", muscleGroup: "", sets: [emptySet()] };
}

export function WorkoutForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues: WorkoutFormValues;
  submitLabel: string;
}) {
  const [exercises, setExercises] = useState<ExerciseDraft[]>(
    defaultValues.exercises.length > 0
      ? defaultValues.exercises
      : [emptyExercise()],
  );

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === index ? { ...exercise, ...patch } : exercise,
      ),
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<SetDraft>,
  ) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex ? { ...set, ...patch } : set,
              ),
            }
          : exercise,
      ),
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, emptySet()] }
          : exercise,
      ),
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
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

  return (
    <form action={action} className="flex flex-col gap-6">
      <input
        type="hidden"
        name="exercisesJson"
        value={JSON.stringify(exercises)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Workout details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues.name}
              placeholder="Workout"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={0}
              defaultValue={defaultValues.durationMinutes}
              placeholder="60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultValues.date}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="time">Start time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue={defaultValues.time}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Exercise {exerciseIndex + 1}</CardTitle>
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeExercise(exerciseIndex)}
                  aria-label="Remove exercise"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`exercise-${exerciseIndex}-name`}>
                    Exercise name
                  </Label>
                  <Input
                    id={`exercise-${exerciseIndex}-name`}
                    value={exercise.name}
                    onChange={(e) =>
                      updateExercise(exerciseIndex, { name: e.target.value })
                    }
                    placeholder="Bench press"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`exercise-${exerciseIndex}-muscle-group`}>
                    Muscle group
                  </Label>
                  <Input
                    id={`exercise-${exerciseIndex}-muscle-group`}
                    value={exercise.muscleGroup}
                    onChange={(e) =>
                      updateExercise(exerciseIndex, {
                        muscleGroup: e.target.value,
                      })
                    }
                    placeholder="Chest"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-end gap-2">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label
                        htmlFor={`exercise-${exerciseIndex}-set-${setIndex}-weight`}
                      >
                        Set {setIndex + 1} weight (kg)
                      </Label>
                      <Input
                        id={`exercise-${exerciseIndex}-set-${setIndex}-weight`}
                        type="number"
                        min={0}
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(exerciseIndex, setIndex, {
                            weight: e.target.value,
                          })
                        }
                        placeholder="Bodyweight"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label
                        htmlFor={`exercise-${exerciseIndex}-set-${setIndex}-reps`}
                      >
                        Reps
                      </Label>
                      <Input
                        id={`exercise-${exerciseIndex}-set-${setIndex}-reps`}
                        type="number"
                        min={0}
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exerciseIndex, setIndex, {
                            reps: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {exercise.sets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        aria-label="Remove set"
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
                  className="self-start"
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
          onClick={addExercise}
          className="self-start"
        >
          <Plus className="size-4" />
          Add exercise
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
