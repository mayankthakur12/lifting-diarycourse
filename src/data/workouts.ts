import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { endOfDay, startOfDay } from "date-fns";

import { db } from "@/db";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";

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

export type WorkoutSetInput = {
  weight: number | null;
  reps: number;
};

export type WorkoutExerciseInput = {
  name: string;
  muscleGroup: string | null;
  sets: WorkoutSetInput[];
};

export type WorkoutInput = {
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: WorkoutExerciseInput[];
};

export type EditableWorkout = {
  id: string;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: {
    name: string;
    muscleGroup: string | null;
    sets: { weight: number | null; reps: number }[];
  }[];
};

async function findOrCreateExerciseId(
  name: string,
  muscleGroup: string | null,
): Promise<string> {
  const existing = await db.query.exercises.findFirst({ where: { name } });
  if (existing) return existing.id;

  const [created] = await db
    .insert(exercises)
    .values({ name, muscleGroup })
    .returning();
  return created.id;
}

async function replaceWorkoutExercises(
  workoutId: string,
  exerciseInputs: WorkoutExerciseInput[],
) {
  for (const [index, exerciseInput] of exerciseInputs.entries()) {
    const exerciseId = await findOrCreateExerciseId(
      exerciseInput.name,
      exerciseInput.muscleGroup,
    );

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({ workoutId, exerciseId, order: index })
      .returning();

    if (exerciseInput.sets.length > 0) {
      await db.insert(sets).values(
        exerciseInput.sets.map((set, setIndex) => ({
          workoutExerciseId: workoutExercise.id,
          setNumber: setIndex + 1,
          weight: set.weight === null ? null : String(set.weight),
          reps: set.reps,
        })),
      );
    }
  }
}

/**
 * Creates a workout for the current user, along with any exercises and sets
 * provided. Ownership is always derived from the Clerk session — never from
 * the caller.
 */
export async function createWorkout(input: WorkoutInput): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
    })
    .returning();

  await replaceWorkoutExercises(workout.id, input.exercises);

  return workout.id;
}

/**
 * Returns a single workout owned by the current user, with its exercises and
 * sets, for editing. Ownership is always derived from the Clerk session —
 * never from the caller.
 */
export async function getWorkoutById(
  id: string,
): Promise<EditableWorkout | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const workout = await db.query.workouts.findFirst({
    where: { id, userId },
    with: {
      exercises: {
        orderBy: { order: "asc" },
        with: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });
  if (!workout) return null;

  const loggedExercises = workout.exercises.filter(
    (we): we is typeof we & { exercise: NonNullable<typeof we.exercise> } =>
      we.exercise !== null,
  );

  return {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    exercises: loggedExercises.map((we) => ({
      name: we.exercise.name,
      muscleGroup: we.exercise.muscleGroup,
      sets: we.sets.map((set) => ({
        weight: set.weight === null ? null : Number(set.weight),
        reps: set.reps ?? 0,
      })),
    })),
  };
}

/**
 * Replaces a workout's exercises and sets with the given input. Ownership is
 * always derived from the Clerk session — never from the caller.
 */
export async function updateWorkout(
  id: string,
  input: WorkoutInput,
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const [updated] = await db
    .update(workouts)
    .set({
      name: input.name,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      updatedAt: new Date(),
    })
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
    .returning({ id: workouts.id });
  if (!updated) return;

  await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
  await replaceWorkoutExercises(id, input.exercises);
}

/**
 * Deletes a workout owned by the current user. Ownership is always derived
 * from the Clerk session — never from the caller.
 */
export async function deleteWorkout(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
}
