import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const counterpositionExercises = pgTable("counterposition_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  belief: text("belief").notNull(),
  counterArgument: text("counter_argument").notNull(),
  grade: text("grade").notNull(),
  summary: text("summary").notNull(),
  metrics: jsonb("metric_grades").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCounterpositionSchema = createInsertSchema(counterpositionExercises).omit({
  id: true,
  createdAt: true,
});

export type InsertCounterpositionExercise = z.infer<typeof insertCounterpositionSchema>;
export type CounterpositionExercise = typeof counterpositionExercises.$inferSelect;

export const weighItUpExercises = pgTable("weigh_it_up_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  decision: text("topic").notNull(),
  pros: jsonb("pros").notNull(),
  cons: jsonb("cons").notNull(),
  proPercent: integer("pro_percent").notNull(),
  conPercent: integer("con_percent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWeighItUpSchema = createInsertSchema(weighItUpExercises).omit({
  id: true,
  createdAt: true,
});

export type InsertWeighItUpExercise = z.infer<typeof insertWeighItUpSchema>;
export type WeighItUpExercise = typeof weighItUpExercises.$inferSelect;

export const unthreadExercises = pgTable("unthread_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  question: text("question").notNull(),
  chain: jsonb("chain").notNull(),
  tradeCost: text("trade_cost").notNull(),
  tradeGain: text("trade_gain").notNull(),
  alternatives: jsonb("alternatives").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUnthreadSchema = createInsertSchema(unthreadExercises).omit({
  id: true,
  createdAt: true,
});

export type InsertUnthreadExercise = z.infer<typeof insertUnthreadSchema>;
export type UnthreadExercise = typeof unthreadExercises.$inferSelect;
