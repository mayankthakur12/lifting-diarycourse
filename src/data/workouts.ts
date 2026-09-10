import { auth } from "@clerk/nextjs/server";
import { endOfDay, startOfDay } from "date-fns";

import { db } from "@/db";

export type LoggedSet = {
  weight: string;
  reps: number;
};

export type LoggedExercise = {
  name: string;
  sets: LoggedSet[];
};

export type LoggedWorkout = {
  id: string;
  name: string;
  focus: string | null;
  startedAt: string;
  durationMinutes: number | null;
  totalVolumeKg: number;
  exercises: LoggedExercise[];
};

/**
 * Returns the current user's workouts that were started on the given calendar
 * day, with their exercises and sets. Ownership is always derived from the
 * Clerk session — never from the caller.
 */
export async function getWorkoutsForDate(date: Date): Promise<LoggedWorkout[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const rows = await db.query.workouts.findMany({
    where: {
      userId,
      startedAt: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
    orderBy: { startedAt: "asc" },
    with: {
      exercises: {
        orderBy: { order: "asc" },
        with: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  return rows.map((workout) => {
    const loggedExercises = workout.exercises.filter(
      (we): we is typeof we & { exercise: NonNullable<typeof we.exercise> } =>
        we.exercise !== null,
    );

    const muscleGroups = Array.from(
      new Set(
        loggedExercises
          .map((we) => we.exercise.muscleGroup)
          .filter((group): group is string => Boolean(group)),
      ),
    );

    let totalVolumeKg = 0;
    const exercises: LoggedExercise[] = loggedExercises.map((we) => ({
      name: we.exercise.name,
      sets: we.sets.map((set) => {
        const reps = set.reps ?? 0;
        const weight = set.weight;
        if (weight !== null) {
          totalVolumeKg += Number(weight) * reps;
        }
        return {
          weight: weight === null ? "Bodyweight" : `${Number(weight)} kg`,
          reps,
        };
      }),
    }));

    return {
      id: workout.id,
      name: workout.name ?? "Workout",
      focus: muscleGroups.length > 0 ? muscleGroups.join(" · ") : null,
      startedAt: workout.startedAt.toISOString(),
      durationMinutes: workout.completedAt
        ? Math.max(
            0,
            Math.round(
              (workout.completedAt.getTime() - workout.startedAt.getTime()) /
                60000,
            ),
          )
        : null,
      totalVolumeKg,
      exercises,
    };
  });
}
