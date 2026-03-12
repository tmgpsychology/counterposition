import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { z } from "zod";

const shareStore = new Map<string, { b: string; c: string }>();

function generateId(): string {
  return crypto.randomBytes(4).toString("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/share", (req, res) => {
    const { b, c } = req.body;
    if (!b || !c || typeof b !== "string" || typeof c !== "string") {
      return res.status(400).json({ error: "Invalid data" });
    }
    const id = generateId();
    shareStore.set(id, { b, c });
    res.json({ id });
  });

  app.get("/api/share/:id", (req, res) => {
    const data = shareStore.get(req.params.id);
    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(data);
  });

  const counterpositionBody = z.object({
    belief: z.string().min(1),
    counterArgument: z.string().min(1),
    grade: z.string().min(1),
    summary: z.string().min(1),
    metrics: z.record(z.any()),
  });

  const weighItUpBody = z.object({
    decision: z.string().min(1),
    pros: z.array(z.object({ label: z.string(), weight: z.number() })),
    cons: z.array(z.object({ label: z.string(), weight: z.number() })),
    proPercent: z.number().int().min(0).max(100),
    conPercent: z.number().int().min(0).max(100),
  });

  const unthreadBody = z.object({
    question: z.string().min(1),
    chain: z.array(z.any()),
    tradeCost: z.string(),
    tradeGain: z.string(),
    alternatives: z.record(z.any()),
  });

  app.post("/api/exercises/counterposition", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const parsed = counterpositionBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    try {
      const exercise = await storage.createCounterpositionExercise({
        userId: req.user!.id,
        ...parsed.data,
      });
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.post("/api/exercises/weighitup", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const parsed = weighItUpBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    try {
      const exercise = await storage.createWeighItUpExercise({
        userId: req.user!.id,
        ...parsed.data,
      });
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.post("/api/exercises/unthread", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const parsed = unthreadBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    try {
      const exercise = await storage.createUnthreadExercise({
        userId: req.user!.id,
        ...parsed.data,
      });
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.get("/api/exercises", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user!.id;
      const [counterpositions, weighItUps, unthreads] = await Promise.all([
        storage.getUserCounterpositionExercises(userId),
        storage.getUserWeighItUpExercises(userId),
        storage.getUserUnthreadExercises(userId),
      ]);

      const all = [
        ...counterpositions.map(e => ({ ...e, type: "counterposition" as const })),
        ...weighItUps.map(e => ({ ...e, type: "weighitup" as const })),
        ...unthreads.map(e => ({ ...e, type: "unthread" as const })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/counterposition/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const exercise = await storage.getCounterpositionExercise(req.params.id);
      if (!exercise || exercise.userId !== req.user!.id) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.get("/api/exercises/weighitup/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const exercise = await storage.getWeighItUpExercise(req.params.id);
      if (!exercise || exercise.userId !== req.user!.id) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.get("/api/exercises/unthread/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const exercise = await storage.getUnthreadExercise(req.params.id);
      if (!exercise || exercise.userId !== req.user!.id) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.get("/sitemap.xml", (_req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://counterposition.replit.app</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://counterposition.replit.app/weigh-it-up</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  });

  app.get("/robots.txt", (_req, res) => {
    const robots = `User-agent: *
Allow: /

Sitemap: https://counterposition.replit.app/sitemap.xml`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
  });

  return httpServer;
}
