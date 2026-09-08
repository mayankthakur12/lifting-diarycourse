import { defineRelations } from "drizzle-orm";
import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  muscleGroup: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid().defaultRandom().primaryKey(),
  userId: text().notNull(),
  name: text(),
  startedAt: timestamp().defaultNow().notNull(),
  completedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid().defaultRandom().primaryKey(),
  workoutId: uuid()
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: uuid()
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
});

export const sets = pgTable("sets", {
  id: uuid().defaultRandom().primaryKey(),
  workoutExerciseId: uuid()
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer().notNull(),
  weight: numeric(),
  reps: integer(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const schema = { exercises, workouts, workoutExercises, sets };

export const dbRelations = defineRelations(schema, (r) => ({
  exercises: {
    workoutExercises: r.many.workoutExercises(),
  },
  workouts: {
    exercises: r.many.workoutExercises(),
  },
  workoutExercises: {
    workout: r.one.workouts({
      from: r.workoutExercises.workoutId,
      to: r.workouts.id,
    }),
    exercise: r.one.exercises({
      from: r.workoutExercises.exerciseId,
      to: r.exercises.id,
    }),
    sets: r.many.sets(),
  },
  sets: {
    workoutExercise: r.one.workoutExercises({
      from: r.sets.workoutExerciseId,
      to: r.workoutExercises.id,
    }),
  },
}));
