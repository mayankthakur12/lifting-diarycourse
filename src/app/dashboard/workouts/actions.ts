"use server";

import { parse } from "date-fns";
import { redirect } from "next/navigation";

import {
  createWorkout,
  deleteWorkout,
  updateWorkout,
  type WorkoutExerciseInput,
  type WorkoutInput,
} from "@/data/workouts";

function parseExercises(raw: FormDataEntryValue | null): WorkoutExerciseInput[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (exercise): exercise is Record<string, unknown> =>
        typeof exercise === "object" &&
        exercise !== null &&
        typeof (exercise as Record<string, unknown>).name === "string" &&
        (exercise as Record<string, unknown>).name !== "",
    )
    .map((exercise) => {
      const rawSets = Array.isArray(exercise.sets) ? exercise.sets : [];
      return {
        name: (exercise.name as string).trim(),
        muscleGroup:
          typeof exercise.muscleGroup === "string" &&
          exercise.muscleGroup.trim() !== ""
            ? exercise.muscleGroup.trim()
            : null,
        sets: rawSets
          .filter(
            (set): set is Record<string, unknown> =>
              typeof set === "object" && set !== null,
          )
          .map((set) => {
            const reps = Number(set.reps);
            const weight = set.weight === "" || set.weight == null
              ? null
              : Number(set.weight);
            return {
              reps: Number.isFinite(reps) ? reps : 0,
              weight: weight !== null && Number.isFinite(weight) ? weight : null,
            };
          }),
      };
    });
}

function parseWorkoutInput(formData: FormData): WorkoutInput {
  const name = formData.get("name");
  const dateValue = String(formData.get("date") ?? "");
  const timeValue = String(formData.get("time") ?? "00:00");
  const durationMinutes = formData.get("durationMinutes");

  const startedAt = parse(
    `${dateValue} ${timeValue}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );

  const parsedDuration = Number(durationMinutes);
  const completedAt =
    durationMinutes && Number.isFinite(parsedDuration) && parsedDuration > 0
      ? new Date(startedAt.getTime() + parsedDuration * 60000)
      : null;

  return {
    name: typeof name === "string" && name.trim() !== "" ? name.trim() : null,
    startedAt,
    completedAt,
    exercises: parseExercises(formData.get("exercisesJson")),
  };
}

export async function createWorkoutAction(formData: FormData) {
  const input = parseWorkoutInput(formData);
  await createWorkout(input);

  redirect(`/dashboard?date=${formData.get("date")}`);
}

export async function updateWorkoutAction(
  workoutId: string,
  redirectDate: string,
  formData: FormData,
) {
  const input = parseWorkoutInput(formData);
  await updateWorkout(workoutId, input);

  redirect(`/dashboard?date=${redirectDate}`);
}

export async function deleteWorkoutAction(
  workoutId: string,
  redirectDate: string,
) {
  await deleteWorkout(workoutId);

  redirect(`/dashboard?date=${redirectDate}`);
}
