import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { dbRelations } from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { relations: dbRelations });
