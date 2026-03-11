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
