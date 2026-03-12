import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";

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

  app.post("/api/exercises/counterposition", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { belief, counterArgument, grade, summary, metricGrades } = req.body;
      if (!belief || !counterArgument || !grade || !summary || !metricGrades) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const exercise = await storage.saveCounterposition({
        userId: req.user!.id,
        belief,
        counterArgument,
        grade,
        summary,
        metricGrades,
      });
      res.json(exercise);
    } catch (err) {
      console.error("Failed to save counterposition:", err);
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.post("/api/exercises/weigh-it-up", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { topic, pros, cons, proPercent, conPercent } = req.body;
      if (!topic || !pros || !cons || proPercent === undefined || conPercent === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const exercise = await storage.saveWeighItUp({
        userId: req.user!.id,
        topic,
        pros,
        cons,
        proPercent,
        conPercent,
      });
      res.json(exercise);
    } catch (err) {
      console.error("Failed to save weigh-it-up:", err);
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.post("/api/exercises/unthread", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { question, chain, tradeCost, tradeGain, alternatives } = req.body;
      if (!question || !chain || !tradeCost || !tradeGain || !alternatives) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const exercise = await storage.saveUnthread({
        userId: req.user!.id,
        question,
        chain,
        tradeCost,
        tradeGain,
        alternatives,
      });
      res.json(exercise);
    } catch (err) {
      console.error("Failed to save unthread:", err);
      res.status(500).json({ message: "Failed to save exercise" });
    }
  });

  app.get("/api/exercises", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const exercises = await storage.getUserExercises(req.user!.id);
      res.json(exercises);
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/counterposition/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const exercise = await storage.getCounterposition(req.params.id);
      if (!exercise || exercise.userId !== req.user!.id) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.get("/api/exercises/weigh-it-up/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const exercise = await storage.getWeighItUp(req.params.id);
      if (!exercise || exercise.userId !== req.user!.id) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(exercise);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.get("/api/exercises/unthread/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const exercise = await storage.getUnthread(req.params.id);
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
