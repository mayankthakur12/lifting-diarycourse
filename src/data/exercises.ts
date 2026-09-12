import { db } from "@/db";

export type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: string | null;
};

/**
 * Returns every exercise available to pick from when building a workout.
 * The exercise catalog is shared across users, so no user scoping applies.
 */
export async function getExercises(): Promise<ExerciseOption[]> {
  const rows = await db.query.exercises.findMany({
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscleGroup,
  }));
}
