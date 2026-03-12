import {
  type User, type InsertUser,
  type CounterpositionExercise, type InsertCounterpositionExercise,
  type WeighItUpExercise, type InsertWeighItUpExercise,
  type UnthreadExercise, type InsertUnthreadExercise,
  users, counterpositionExercises, weighItUpExercises, unthreadExercises,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createCounterpositionExercise(exercise: InsertCounterpositionExercise): Promise<CounterpositionExercise>;
  getCounterpositionExercise(id: string): Promise<CounterpositionExercise | undefined>;
  getUserCounterpositionExercises(userId: string): Promise<CounterpositionExercise[]>;

  createWeighItUpExercise(exercise: InsertWeighItUpExercise): Promise<WeighItUpExercise>;
  getWeighItUpExercise(id: string): Promise<WeighItUpExercise | undefined>;
  getUserWeighItUpExercises(userId: string): Promise<WeighItUpExercise[]>;

  createUnthreadExercise(exercise: InsertUnthreadExercise): Promise<UnthreadExercise>;
  getUnthreadExercise(id: string): Promise<UnthreadExercise | undefined>;
  getUserUnthreadExercises(userId: string): Promise<UnthreadExercise[]>;
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

  async createCounterpositionExercise(exercise: InsertCounterpositionExercise): Promise<CounterpositionExercise> {
    const [result] = await db.insert(counterpositionExercises).values(exercise).returning();
    return result;
  }

  async getCounterpositionExercise(id: string): Promise<CounterpositionExercise | undefined> {
    const [result] = await db.select().from(counterpositionExercises).where(eq(counterpositionExercises.id, id));
    return result;
  }

  async getUserCounterpositionExercises(userId: string): Promise<CounterpositionExercise[]> {
    return db.select().from(counterpositionExercises).where(eq(counterpositionExercises.userId, userId)).orderBy(desc(counterpositionExercises.createdAt));
  }

  async createWeighItUpExercise(exercise: InsertWeighItUpExercise): Promise<WeighItUpExercise> {
    const [result] = await db.insert(weighItUpExercises).values(exercise).returning();
    return result;
  }

  async getWeighItUpExercise(id: string): Promise<WeighItUpExercise | undefined> {
    const [result] = await db.select().from(weighItUpExercises).where(eq(weighItUpExercises.id, id));
    return result;
  }

  async getUserWeighItUpExercises(userId: string): Promise<WeighItUpExercise[]> {
    return db.select().from(weighItUpExercises).where(eq(weighItUpExercises.userId, userId)).orderBy(desc(weighItUpExercises.createdAt));
  }

  async createUnthreadExercise(exercise: InsertUnthreadExercise): Promise<UnthreadExercise> {
    const [result] = await db.insert(unthreadExercises).values(exercise).returning();
    return result;
  }

  async getUnthreadExercise(id: string): Promise<UnthreadExercise | undefined> {
    const [result] = await db.select().from(unthreadExercises).where(eq(unthreadExercises.id, id));
    return result;
  }

  async getUserUnthreadExercises(userId: string): Promise<UnthreadExercise[]> {
    return db.select().from(unthreadExercises).where(eq(unthreadExercises.userId, userId)).orderBy(desc(unthreadExercises.createdAt));
  }
}

export const storage = new DatabaseStorage();
