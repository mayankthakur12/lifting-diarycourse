"use server";

import { z } from "zod";

import { createWorkout } from "@/data/workouts";

const newWorkoutSetInput = z.object({
  weight: z.number().nonnegative().nullable(),
  reps: z.number().int().nonnegative().nullable(),
});

const newWorkoutExerciseInput = z.object({
  exerciseId: z.uuid(),
  sets: z.array(newWorkoutSetInput).min(1),
});

const createWorkoutInput = z.object({
  name: z.string().min(1),
  startedAt: z.coerce.date(),
  exercises: z.array(newWorkoutExerciseInput).min(1),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutInput>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const data = createWorkoutInput.parse(input);
  const workout = await createWorkout(data);
  if (!workout) {
    throw new Error("Unable to create workout");
  }
  return workout;
}
