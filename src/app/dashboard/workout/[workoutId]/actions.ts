"use server";

import { z } from "zod";

import { updateWorkout } from "@/data/workouts";

const editWorkoutSetInput = z.object({
  weight: z.number().nonnegative().nullable(),
  reps: z.number().int().nonnegative().nullable(),
});

const editWorkoutExerciseInput = z.object({
  exerciseId: z.uuid(),
  sets: z.array(editWorkoutSetInput).min(1),
});

const updateWorkoutInput = z.object({
  workoutId: z.uuid(),
  name: z.string().min(1),
  startedAt: z.coerce.date(),
  exercises: z.array(editWorkoutExerciseInput).min(1),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutInput>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const data = updateWorkoutInput.parse(input);
  const workout = await updateWorkout(data.workoutId, data);
  if (!workout) {
    throw new Error("Unable to update workout");
  }
  return workout;
}
