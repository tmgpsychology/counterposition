import {
  type User, type InsertUser, users,
  type CounterpositionExercise, type InsertCounterposition, counterpositionExercises,
  type WeighItUpExercise, type InsertWeighItUp, weighItUpExercises,
  type UnthreadExercise, type InsertUnthread, unthreadExercises,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  saveCounterposition(data: InsertCounterposition): Promise<CounterpositionExercise>;
  saveWeighItUp(data: InsertWeighItUp): Promise<WeighItUpExercise>;
  saveUnthread(data: InsertUnthread): Promise<UnthreadExercise>;

  getUserExercises(userId: string): Promise<{
    counterpositions: CounterpositionExercise[];
    weighItUps: WeighItUpExercise[];
    unthreads: UnthreadExercise[];
  }>;

  getCounterposition(id: string): Promise<CounterpositionExercise | undefined>;
  getWeighItUp(id: string): Promise<WeighItUpExercise | undefined>;
  getUnthread(id: string): Promise<UnthreadExercise | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async saveCounterposition(data: InsertCounterposition): Promise<CounterpositionExercise> {
    const [exercise] = await db.insert(counterpositionExercises).values(data).returning();
    return exercise;
  }

  async saveWeighItUp(data: InsertWeighItUp): Promise<WeighItUpExercise> {
    const [exercise] = await db.insert(weighItUpExercises).values(data).returning();
    return exercise;
  }

  async saveUnthread(data: InsertUnthread): Promise<UnthreadExercise> {
    const [exercise] = await db.insert(unthreadExercises).values(data).returning();
    return exercise;
  }

  async getUserExercises(userId: string) {
    const [counterpositions, weighItUps, unthreads] = await Promise.all([
      db.select().from(counterpositionExercises)
        .where(eq(counterpositionExercises.userId, userId))
        .orderBy(desc(counterpositionExercises.createdAt)),
      db.select().from(weighItUpExercises)
        .where(eq(weighItUpExercises.userId, userId))
        .orderBy(desc(weighItUpExercises.createdAt)),
      db.select().from(unthreadExercises)
        .where(eq(unthreadExercises.userId, userId))
        .orderBy(desc(unthreadExercises.createdAt)),
    ]);
    return { counterpositions, weighItUps, unthreads };
  }

  async getCounterposition(id: string): Promise<CounterpositionExercise | undefined> {
    const [exercise] = await db.select().from(counterpositionExercises)
      .where(eq(counterpositionExercises.id, id));
    return exercise;
  }

  async getWeighItUp(id: string): Promise<WeighItUpExercise | undefined> {
    const [exercise] = await db.select().from(weighItUpExercises)
      .where(eq(weighItUpExercises.id, id));
    return exercise;
  }

  async getUnthread(id: string): Promise<UnthreadExercise | undefined> {
    const [exercise] = await db.select().from(unthreadExercises)
      .where(eq(unthreadExercises.id, id));
    return exercise;
  }
}

export const storage = new DatabaseStorage();
